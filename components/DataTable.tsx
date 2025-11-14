import React, { useState, useRef, useEffect } from 'react';
import type { PatientRecord, PageView, PatientOutcome, PatientOutcomeStatus } from '../types';
import { getSmearResultStatus } from '../utils/date';
import { DatePicker } from './DatePicker';

declare var moment: any;

type SmearStatusFilter = 'all' | 'مثبت' | 'منفی' | 'در حال انتظار';

interface DataTableProps {
  data: PatientRecord[];
  view: PageView;
  onOutcomeUpdate: (tbId: string, outcome: PatientOutcome) => void;
  filters: { tbId: string; smearStatus: SmearStatusFilter };
  onFilterChange: (newFilters: Partial<{ tbId: string; smearStatus: SmearStatusFilter }>) => void;
  onResetFilters: () => void;
  resultCount: number;
  totalCount: number;
}


const getHeaderSuffix = (view: PageView) => {
    switch(view) {
        case 'firstHalf': return 'در شش ماهه اول';
        case 'secondHalf': return 'در شش ماهه دوم';
        case 'annual': return 'در کل سال';
    }
}

const thClasses = "px-2 py-3 font-semibold tracking-wider border-l dark:border-slate-600 transition-all duration-200 hover:shadow-lg hover:bg-slate-100 dark:hover:bg-slate-700 hover:-translate-y-1 hover:z-20";
const tdClasses = "relative px-2 py-2 whitespace-nowrap transition-all duration-150 hover:z-10";

const FilterIcon = ({ isActive }: { isActive: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-colors ${isActive ? 'text-sky-500' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L16 11.414V16a1 1 0 01-.293.707l-2 2A1 1 0 0113 18v-6.586L4.293 6.707A1 1 0 014 6V4z" />
  </svg>
);

const smearOptions: { value: SmearStatusFilter; label: string }[] = [
  { value: 'all', label: 'همه' },
  { value: 'مثبت', label: 'مثبت' },
  { value: 'منفی', label: 'منفی' },
  { value: 'در حال انتظار', label: 'در حال انتظار' },
];

export const DataTable: React.FC<DataTableProps> = ({ data, view, onOutcomeUpdate, filters, onFilterChange, onResetFilters, resultCount, totalCount }) => {
  const headerSuffix = getHeaderSuffix(view);
  const [editingStates, setEditingStates] = useState<Record<string, { status: PatientOutcomeStatus | '', date: string }>>({});
  const [activeDatePicker, setActiveDatePicker] = useState<string | null>(null);
  const [activeFilterPopover, setActiveFilterPopover] = useState<string | null>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (tableContainerRef.current && !tableContainerRef.current.contains(event.target as Node)) {
            setActiveFilterPopover(null);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  const handleOutcomeDateSelect = (tbId: string, date: string) => {
    const currentPatient = data.find(p => p.tbId === tbId);
    const status = editingStates[tbId]?.status || currentPatient?.finalOutcome?.status;
    if (status) {
        onOutcomeUpdate(tbId, { status, date });
        setEditingStates(prev => ({
            ...prev,
            [tbId]: { status, date: date }
        }));
    }
    setActiveDatePicker(null);
  };

  return (
    <div ref={tableContainerRef} className="overflow-x-auto overflow-y-auto max-h-[60vh] border border-slate-200 dark:border-slate-700 rounded-lg shadow-inner relative">
      <table className="min-w-full text-sm text-center text-slate-600 dark:text-slate-300 divide-y divide-slate-200 dark:divide-slate-700 border-collapse table-fixed">
        <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0 z-30">
          <tr>
            <th rowSpan={2} className={`${thClasses} relative`}>ردیف</th>
            <th rowSpan={2} className={`${thClasses} relative`}>
                <div className="flex items-center justify-center gap-2 group">
                    <span>شماره سل</span>
                    <button 
                        onClick={(e) => { e.stopPropagation(); setActiveFilterPopover(activeFilterPopover === 'tbId' ? null : 'tbId'); }} 
                        className="p-1 -m-1 rounded-full" aria-label="فیلتر شماره سل"
                    >
                        <FilterIcon isActive={!!filters.tbId} />
                    </button>
                </div>
                {activeFilterPopover === 'tbId' && (
                    <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-20 bg-white dark:bg-slate-800 border dark:border-slate-600 rounded-lg shadow-xl p-3" onClick={(e) => e.stopPropagation()}>
                        <label htmlFor="tbId-filter-input" className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 text-right">
                            جستجو
                        </label>
                        <input id="tbId-filter-input" type="text" autoFocus placeholder="بخشی از شماره سل..." value={filters.tbId}
                            onChange={(e) => onFilterChange({ tbId: e.target.value })}
                            className="w-40 pr-2 py-1 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                        />
                    </div>
                )}
            </th>
            <th rowSpan={2} className={`${thClasses} relative`}>تاریخ شروع درمان</th>
            <th rowSpan={2} className={`${thClasses} w-40 relative`}>
                <div className="flex items-center justify-center gap-2 group">
                    <span>نتیجه اسمیر ماه دو</span>
                    <button 
                        onClick={(e) => { e.stopPropagation(); setActiveFilterPopover(activeFilterPopover === 'smear' ? null : 'smear'); }} 
                        className="p-1 -m-1 rounded-full" aria-label="فیلتر نتیجه اسمیر"
                    >
                        <FilterIcon isActive={filters.smearStatus !== 'all'} />
                    </button>
                </div>
                 {activeFilterPopover === 'smear' && (
                    <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-20 bg-white dark:bg-slate-800 border dark:border-slate-600 rounded-lg shadow-xl p-2" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col gap-1">
                            {smearOptions.map(option => (
                            <button
                                key={option.value}
                                onClick={() => { onFilterChange({ smearStatus: option.value }); setActiveFilterPopover(null); }}
                                className={`w-full text-right px-3 py-1.5 text-xs font-semibold rounded-md transition-colors duration-200 ${
                                filters.smearStatus === option.value
                                    ? 'bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300'
                                    : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                                }`}
                            >
                                {option.label}
                            </button>
                            ))}
                        </div>
                    </div>
                )}
            </th>
            <th colSpan={4} className={`${thClasses} border-b relative`}>مرحله حمله ای (اسمیر منفی/اسمیر مثبت)</th>
            <th colSpan={4} className={`${thClasses} border-b relative`}>مرحله نگهدارنده (اسمیر منفی، اسمیر مثبت)</th>
            <th colSpan={3} className={`${thClasses} border-b border-l-0 relative`}>خلاصه داتс {headerSuffix}</th>
          </tr>
          <tr>
            <th className={`${thClasses} whitespace-nowrap relative`}>تعداد روزهای نیازمند داتس {headerSuffix}</th>
            <th className={`${thClasses} whitespace-nowrap relative`}>تعداد روزهای دریافت داتس {headerSuffix}</th>
            <th className={`${thClasses} whitespace-nowrap relative`}>درصد پوشش داتس</th>
            <th className={`${thClasses} whitespace-nowrap relative`}>توضیحات</th>
            <th className={`${thClasses} whitespace-nowrap relative`}>تعداد روزهای نیازمند داتس {headerSuffix}</th>
            <th className={`${thClasses} whitespace-nowrap relative`}>تعداد روزهای دریافت داتس {headerSuffix}</th>
            <th className={`${thClasses} whitespace-nowrap relative`}>درصد پوشش داتس</th>
            <th className={`${thClasses} whitespace-nowrap relative`}>توضیحات</th>
            <th className={`${thClasses} whitespace-nowrap relative`}>کل روزهای نیازمند داتس {headerSuffix}</th>
            <th className={`${thClasses} whitespace-nowrap relative`}>کل روزهای دریافت داتس {headerSuffix}</th>
            <th className={`${thClasses} whitespace-nowrap border-l-0 relative`}>درصد پوشش داتس {headerSuffix}</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-slate-900/50 divide-y divide-slate-200 dark:divide-slate-700">
          {data.length === 0 ? (
            <tr>
              <td colSpan={15} className="text-center py-12 text-slate-500 dark:text-slate-400">
                <div className="flex flex-col items-center gap-3">
                  <svg className="w-12 h-12 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                  </svg>
                  <p className="font-semibold">هیچ بیماری با فیلترهای اعمال شده مطابقت ندارد.</p>
                  <p className="text-sm">برای مشاهده نتایج، فیلترها را در هدر جدول تغییر دهید.</p>
                </div>
              </td>
            </tr>
          ) : (
            data.map((patient, index) => {
            const periodData = patient[view];
            const smearStatus = getSmearResultStatus(patient.smearResultMonth2);
            const patientOutcome = patient.finalOutcome;
            
            let isFuturePending = false;
            let isPastDuePending = false;

            if (smearStatus === 'در حال انتظار' && patient.treatmentStartDate) {
                try {
                    const startDate = moment(patient.treatmentStartDate, 'jYYYY/jMM/jDD');
                    if (startDate.isValid()) {
                        const testDate = startDate.clone().add(2, 'jMonths');
                        const treatmentYear = startDate.jYear();
                        const cutoffDate = moment(`${treatmentYear}/06/31`, 'jYYYY/jMM/jDD');
                        const today = moment();

                        if (testDate.isAfter(cutoffDate)) {
                            isFuturePending = true;
                        } else if (testDate.isBefore(today)) {
                            isPastDuePending = true;
                        }
                    }
                } catch(e) {
                    console.error("Error parsing date for pending check:", e);
                }
            }
            
            const isContinuationPending = smearStatus === 'در حال انتظار' && !patientOutcome;
            const showControls = smearStatus === 'در حال انتظار' || !!patientOutcome;
            const isOutcomeSelected = !!(editingStates[patient.tbId]?.status || patientOutcome?.status);

            const smearStatusClass = patientOutcome
              ? ''
              : isPastDuePending
              ? 'align-middle'
              : isFuturePending
              ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 font-semibold'
              : smearStatus === 'مثبت'
              ? 'text-red-600 dark:text-red-400 font-semibold'
              : smearStatus === 'منفی'
              ? 'text-green-600 dark:text-green-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400';

            const continuationCellClass = periodData.continuationRequired === null ? 'bg-slate-50 dark:bg-slate-800 text-slate-500' : '';
            const outcomeRowClass = patientOutcome ? 'bg-orange-50 dark:bg-orange-900/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800/60';
            const cellBorderClass = 'border-l dark:border-slate-700';

            return (
              <tr key={index} className={`${outcomeRowClass} transition-colors duration-150`}>
                <td className={`${tdClasses} ${cellBorderClass}`}>{index + 1}</td>
                <td className={`${tdClasses} ${cellBorderClass}`}>{patient.tbId}</td>
                <td className={`${tdClasses} ${cellBorderClass}`}>{patient.treatmentStartDate}</td>
                <td className={`${tdClasses} py-1 ${smearStatusClass} ${cellBorderClass}`}>
                  {showControls ? (
                    <div className="relative flex flex-col gap-1 items-center">
                        <select 
                          className="w-full p-1 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-slate-700 dark:text-slate-300 text-xs"
                          aria-label="انتخاب وضعیت بیمار"
                          value={editingStates[patient.tbId]?.status ?? patientOutcome?.status ?? ''}
                          onChange={(e) => {
                              const newStatus = e.target.value as PatientOutcomeStatus | '';
                              const currentDate = editingStates[patient.tbId]?.date ?? patientOutcome?.date ?? '';
                              setEditingStates(prev => ({
                                  ...prev,
                                  [patient.tbId]: { date: currentDate, status: newStatus }
                              }));
                          }}
                        >
                          <option value="">
                             {patientOutcome ? patientOutcome.status : (patient.smearResultMonth2 || smearStatus)}
                          </option>
                          <option value="فوت">فوت</option>
                          <option value="امتناع از درمان">امتناع از درمان</option>
                          <option value="مهاجرت">مهاجرت</option>
                        </select>
                        <div className={`w-full ${isOutcomeSelected ? 'visible' : 'invisible'}`}>
                            <button
                                onClick={() => setActiveDatePicker(activeDatePicker === patient.tbId ? null : patient.tbId)}
                                className="w-full p-1 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-center text-xs font-mono hover:bg-slate-100 dark:hover:bg-slate-700"
                                disabled={!isOutcomeSelected}
                            >
                                {editingStates[patient.tbId]?.date ?? patientOutcome?.date ?? 'انتخاب تاریخ'}
                            </button>
                            {isOutcomeSelected && activeDatePicker === patient.tbId && (
                                <DatePicker
                                    initialDate={editingStates[patient.tbId]?.date ?? patientOutcome?.date}
                                    onSelectDate={(date) => handleOutcomeDateSelect(patient.tbId, date)}
                                    onClose={() => setActiveDatePicker(null)}
                                />
                            )}
                        </div>
                    </div>
                  ) : (
                    smearStatus
                  )}
                </td>
                
                <td className={`${tdClasses} ${cellBorderClass}`}>{periodData.intensiveRequired}</td>
                <td className={`${tdClasses} ${cellBorderClass}`}>{periodData.intensiveReceived}</td>
                <td className={`${tdClasses} font-mono ${cellBorderClass}`}>{periodData.intensiveCoverage}%</td>
                <td className={`${tdClasses} ${smearStatus === 'مثبت' && !patientOutcome ? 'text-red-600 dark:text-red-400 font-semibold' : ''} ${cellBorderClass}`}>
                  {smearStatus === 'مثبت' && !patientOutcome ? 'اسمیر مثبت' : ''}
                </td>

                <td className={`${tdClasses} ${continuationCellClass} ${cellBorderClass}`}>
                  {periodData.continuationRequired === null ? '-' : periodData.continuationRequired}
                </td>
                <td className={`${tdClasses} ${continuationCellClass} ${cellBorderClass}`}>
                  {periodData.continuationReceived === null ? '-' : periodData.continuationReceived}
                </td>
                <td className={`${tdClasses} font-mono ${continuationCellClass} ${cellBorderClass}`}>
                  {periodData.continuationReceived === null ? '-' : `${periodData.continuationCoverage}%`}
                </td>
                <td className={`${tdClasses} ${continuationCellClass} ${cellBorderClass}`}>
                  {isContinuationPending ? 'در حال انتظار' : ''}
                </td>

                <td className={`${tdClasses} font-semibold ${cellBorderClass}`}>{periodData.totalRequired}</td>
                <td className={`${tdClasses} font-semibold ${cellBorderClass}`}>{periodData.totalReceived}</td>
                <td className={`${tdClasses} font-semibold font-mono`}>{periodData.totalCoverage}%</td>
              </tr>
            );
          }))}
        </tbody>
        <tfoot className="bg-slate-50 dark:bg-slate-800/80 sticky bottom-0 z-20 backdrop-blur-sm">
            <tr>
                <td colSpan={15} className="px-4 py-2 text-sm border-t dark:border-slate-700">
                    <div className="flex justify-between items-center">
                        <div className="text-slate-500 dark:text-slate-400">
                            نمایش <span className="font-bold text-slate-700 dark:text-slate-200">{resultCount}</span> از <span className="font-bold text-slate-700 dark:text-slate-200">{totalCount}</span> بیمار
                        </div>
                        <button
                            onClick={onResetFilters}
                            disabled={filters.tbId === '' && filters.smearStatus === 'all'}
                            className="px-3 py-1 text-xs bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            پاک کردن همه فیلترها
                        </button>
                    </div>
                </td>
            </tr>
        </tfoot>
      </table>
    </div>
  );
};