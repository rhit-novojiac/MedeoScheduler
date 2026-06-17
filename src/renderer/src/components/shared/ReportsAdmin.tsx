import React, { useState } from 'react';
import { format, subMonths } from 'date-fns';
import { Calendar as CalendarIcon, FileDown, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';
import { supabase } from '../../lib/supabase';

const escapeCsvCell = (val: string | number) => {
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
};

export const ReportsAdmin = () => {
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: subMonths(new Date(), 1),
        to: new Date()
    });
    const [isExporting, setIsExporting] = useState(false);
    const [exportMessage, setExportMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleExport = async () => {
        if (!dateRange?.from || !dateRange?.to) {
            setExportMessage({ type: 'error', text: 'Please select both a start and end date.' });
            return;
        }

        setIsExporting(true);
        setExportMessage(null);

        const startStr = format(dateRange.from, 'yyyy-MM-dd');
        const endStr = format(dateRange.to, 'yyyy-MM-dd');

        try {
            // 1. Fetch Class Types
            const { data: classTypesData, error: ctErr } = await supabase
                .from('class_types')
                .select('id, name')
                .order('name', { ascending: true });
            if (ctErr) throw ctErr;

            // 2. Fetch Fencers
            const { data: fencersData, error: fErr } = await supabase
                .from('fencers')
                .select('id, first_name, last_name, usaf_id, last_membership_renewal')
                .order('last_name', { ascending: true })
                .order('first_name', { ascending: true });
            if (fErr) throw fErr;

            // 3. Fetch Class Sessions in Date Range
            const { data: sessionsData, error: sErr } = await supabase
                .from('class_sessions')
                .select(`
                    id,
                    class_type_id,
                    class_templates (
                        class_type_id
                    )
                `)
                .gte('date', startStr)
                .lte('date', endStr);
            if (sErr) throw sErr;

            const sessionIds = (sessionsData || []).map(s => s.id);
            let attendeesData: any[] = [];
            
            if (sessionIds.length > 0) {
                // 4. Fetch Attendances
                const { data: attData, error: aErr } = await supabase
                    .from('class_attendees')
                    .select('class_session_id, fencer_id, fraction')
                    .in('class_session_id', sessionIds);
                if (aErr) throw aErr;
                attendeesData = attData || [];
            }

            // Map class_session_id to class_type_id
            const sessionToTypeMap = new Map<string, string>();
            for (const s of sessionsData || []) {
                const ctId = s.class_type_id || s.class_templates?.class_type_id;
                if (ctId) {
                    sessionToTypeMap.set(s.id, ctId);
                }
            }

            // Aggregate attendance counts by fencer and class type
            const attendeeCounts = new Map<string, Map<string, number>>();
            for (const row of attendeesData) {
                const ctId = sessionToTypeMap.get(row.class_session_id);
                if (!ctId) continue;

                if (!attendeeCounts.has(row.fencer_id)) {
                    attendeeCounts.set(row.fencer_id, new Map<string, number>());
                }
                const fMap = attendeeCounts.get(row.fencer_id)!;
                const currentVal = fMap.get(ctId) || 0;
                fMap.set(ctId, currentVal + (row.fraction || 1.0));
            }

            const headers = ['First Name', 'Last Name', 'USAF ID'];
            for (const ct of classTypesData || []) {
                headers.push(ct.name);
            }
            headers.push('Member Status');

            const rows: string[][] = [headers.map(escapeCsvCell)];
            const exportDateObj = new Date(endStr);

            for (const fencer of fencersData || []) {
                if (!attendeeCounts.has(fencer.id)) continue;
                const counts = attendeeCounts.get(fencer.id)!;

                let isMember = 'No';
                if (fencer.last_membership_renewal) {
                    const renewalDate = new Date(fencer.last_membership_renewal);
                    const expiryDate = new Date(renewalDate);
                    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
                    if (exportDateObj <= expiryDate) {
                        isMember = 'Yes';
                    }
                }

                const row: (string | number)[] = [fencer.first_name, fencer.last_name, fencer.usaf_id || 0];
                for (const ct of classTypesData || []) {
                    const rawVal = counts.get(ct.id) || 0;
                    const roundedVal = Math.round(rawVal * 100) / 100;
                    row.push(roundedVal);
                }
                row.push(isMember);
                rows.push(row.map(escapeCsvCell));
            }

            if (rows.length === 1) {
                setExportMessage({ type: 'error', text: 'No attendance data found for the selected period.' });
                return;
            }

            const csvString = rows.map(r => r.join(',')).join('\n');
            const defaultFilename = `Medeo_Attendance_${startStr}_to_${endStr}.csv`;

            const result = await window.api.generateExportCsv(csvString, defaultFilename);
            if (result.success) {
                setExportMessage({ type: 'success', text: 'Export successful!' });
            } else {
                setExportMessage({ type: 'error', text: result.error || 'Failed to generate export.' });
            }
        } catch (err: unknown) {
            setExportMessage({ type: 'error', text: (err as Error).message || 'An unknown error occurred.' });
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="p-6 space-y-6 flex flex-col h-full overflow-y-auto">
            <div className="flex justify-between items-center shrink-0">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Reports & Exports</h2>
                    <p className="text-muted-foreground">Generate attendance reports for billing and analytics.</p>
                </div>
            </div>

            <div className="grid gap-6">
                <Card className="max-w-xl">
                    <CardHeader>
                        <CardTitle>Attendance Export (CSV)</CardTitle>
                        <CardDescription>
                            Generates a CSV file containing all fencers who attended classes in the specified date range,
                            aggregated by the number of classes taken per Class Type. This is optimized for import
                            into external billing systems.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Date Range</label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        id="date"
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !dateRange && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dateRange?.from ? (
                                            dateRange.to ? (
                                                <>
                                                    {format(dateRange.from, "LLL dd, y")} -{" "}
                                                    {format(dateRange.to, "LLL dd, y")}
                                                </>
                                            ) : (
                                                format(dateRange.from, "LLL dd, y")
                                            )
                                        ) : (
                                            <span>Pick a date range</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        initialFocus
                                        mode="range"
                                        defaultMonth={dateRange?.from}
                                        selected={dateRange}
                                        onSelect={setDateRange}
                                        numberOfMonths={2}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="pt-4  flex items-center gap-4">
                            <Button onClick={handleExport} disabled={isExporting || !dateRange?.from || !dateRange?.to}>
                                {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
                                Export to CSV
                            </Button>

                            {exportMessage && (
                                <span className={cn(
                                    "text-sm font-medium",
                                    exportMessage.type === 'error' ? "text-destructive" : "text-green-500"
                                )}>
                                    {exportMessage.text}
                                </span>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
