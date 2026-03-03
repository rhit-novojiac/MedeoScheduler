import React from 'react';
import { ClassTypesManager } from './ClassTypesManager';
import { ClassTemplatesManager } from './ClassTemplatesManager';

export const ClassesManagerAdmin = () => {
    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Classes & Schedule</h2>
                    <p className="text-muted-foreground">Manage your weekly templates and class pricing.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                {/* Left Column: Types & Templates */}
                <div className="space-y-6">
                    <ClassTypesManager />
                </div>

                {/* Right Column: Active Schedule Viewer (Coming Next) */}
                <div className="space-y-6">
                    <ClassTemplatesManager />
                </div>

            </div>
        </div>
    );
};
