import React, { useState } from 'react';
import { DatePicker } from './DatePicker';

interface PointInTimeCalculatorProps {
    currentDate: string | null;
    onDateChange: (date: string) => void;
    onReset: () => void;
}

export const PointInTimeCalculator: React.FC<PointInTimeCalculatorProps> = ({ currentDate, onDateChange, onReset }) => {
    const [isPickerOpen, setIsPickerOpen] = useState(false);

    const handleDateSelect = (date: string) => {
        onDateChange(date);
        setIsPickerOpen(false);
    };

    return (
        <div className="relative flex flex-col items-start sm:items-center sm:flex-row gap-2 bg-slate-100 dark:bg-slate-900/50 p-2 rounded-lg">
            <label htmlFor="calc-date-btn" className="text-sm font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                محاسبه تا تاریخ:
            </label>
            <div className="relative w-full sm:w-auto">
                <button
                    id="calc-date-btn"
                    onClick={() => setIsPickerOpen(!isPickerOpen)}
                    className={`w-full sm:w-40 p-2 border rounded-md text-sm text-center transition-colors
                        ${currentDate 
                            ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/40 text-sky-800 dark:text-sky-300 font-semibold' 
                            : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                >
                    {currentDate || 'روز جاری (پیش‌فرض)'}
                </button>
                 {isPickerOpen && (
                    <DatePicker
                        initialDate={currentDate || undefined}
                        onSelectDate={handleDateSelect}
                        onClose={() => setIsPickerOpen(false)}
                    />
                )}
            </div>
            {currentDate && (
                 <button
                    onClick={onReset}
                    className="p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
                    aria-label="بازنشانی تاریخ به روز جاری"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 4l16 16" />
                    </svg>
                </button>
            )}
        </div>
    );
};
