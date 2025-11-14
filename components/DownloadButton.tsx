import React, { useState, useEffect, useRef } from 'react';
import type { PatientRecord, PageView } from '../types';
import { exportToXlsx } from '../utils/csv';

interface DownloadButtonProps {
    data: PatientRecord[];
    activeView: PageView;
    pageTitles: Record<PageView, string>;
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({ data, activeView, pageTitles }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleDownloadCurrent = () => {
        const filename = `DOTS_Report_${activeView}.xlsx`;
        exportToXlsx(data, [activeView], filename, pageTitles);
        setIsDropdownOpen(false);
    };

    const handleDownloadAll = () => {
        const filename = `DOTS_Report_All.xlsx`;
        exportToXlsx(data, ['firstHalf', 'secondHalf', 'annual'], filename, pageTitles);
        setIsDropdownOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white text-sm font-semibold rounded-lg hover:bg-sky-700 transition-colors shadow-sm"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>دانلود گزارش</span>
                {/* FIX: Corrected typo in viewBox attribute from "0 0 24" 24" to "0 0 24 24" */}
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {isDropdownOpen && (
                <div className="absolute left-0 mt-2 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-20 overflow-hidden">
                    <ul className="text-sm text-slate-700 dark:text-slate-200">
                        <li>
                            <button
                                onClick={handleDownloadCurrent}
                                className="w-full text-right px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            >
                                دانلود گزارش فعلی ({pageTitles[activeView]})
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={handleDownloadAll}
                                className="w-full text-right px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            >
                                دانلود تمام گزارش‌ها (کامل)
                            </button>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
};
