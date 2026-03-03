import React, { useState } from 'react';
import { format, subMonths } from 'date-fns';
import { Calendar as CalendarIcon, FileDown, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';

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
            const result = await window.api.generateExportCsv(startStr, endStr);
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
