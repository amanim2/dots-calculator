import React, { useState, useEffect, useMemo } from 'react';
import type { PatientInput, PageView, PatientOutcome } from '../types';
import { useCalculations } from '../hooks/useCalculations';
import { DataTable } from './DataTable';
import { HelpModal } from './HelpModal';
import { DownloadButton } from './DownloadButton';
import { PointInTimeCalculator } from './PointInTimeCalculator';
import { getSmearResultStatus } from '../utils/date'; // Import utility for filtering

interface PatientViewProps {
  patientData: (PatientInput & { dataBatch: 'firstHalf' | 'secondHalf' })[];
}

type SmearStatusFilter = 'all' | 'مثبت' | 'منفی' | 'در حال انتظار';

const pageTitles: Record<PageView, string> = {
    firstHalf: "گزارش داتس شش ماهه اول سال",
    secondHalf: "گزارش داتس شش ماهه دوم سال",
    annual: "گزارش داتس سالیانه"
};

export const PatientView: React.FC<PatientViewProps> = ({ patientData }) => {
  const [activePage, setActivePage] = useState<PageView>('firstHalf');
  const [calculationDate, setCalculationDate] = useState<string | null>(null);
  const [patientOutcomes, setPatientOutcomes] = useState<Record<string, PatientOutcome>>(() => {
    try {
      const savedOutcomes = sessionStorage.getItem('patientOutcomes');
      return savedOutcomes ? JSON.parse(savedOutcomes) : {};
    } catch (error) {
      console.error("Could not parse patient outcomes from session storage.", error);
      return {};
    }
  });
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [filters, setFilters] = useState<{ tbId: string; smearStatus: SmearStatusFilter }>({ tbId: '', smearStatus: 'all' });

  useEffect(() => {
    try {
      sessionStorage.setItem('patientOutcomes', JSON.stringify(patientOutcomes));
    } catch (error) {
      console.error("Could not save patient outcomes to session storage.", error);
    }
  }, [patientOutcomes]);
  
  const allCalculatedData = useCalculations(patientData, patientOutcomes, calculationDate);

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({ tbId: '', smearStatus: 'all' });
  };

  const filteredData = useMemo(() => {
    if (!allCalculatedData) return [];

    // First, filter by report type (first half vs. others) based on dataBatch
    const viewFilteredData = allCalculatedData.filter(patient => {
      if (activePage === 'firstHalf') {
        return patient.dataBatch === 'firstHalf';
      }
      return true; // For secondHalf and annual, show all patients
    });

    // Then, apply interactive filters on the pre-filtered data
    return viewFilteredData.filter(patient => {
        const tbIdMatch = !filters.tbId || patient.tbId.toLowerCase().includes(filters.tbId.toLowerCase().trim());

        if (filters.smearStatus === 'all') {
            return tbIdMatch;
        }

        const smearStatus = getSmearResultStatus(patient.smearResultMonth2);
        const hasOutcome = !!patient.finalOutcome;

        // When filtering for 'pending', only show those who are truly pending (no result AND no outcome).
        // For 'positive' or 'negative', we show them based on the smear result regardless of outcome.
        if (filters.smearStatus === 'در حال انتظار') {
            return tbIdMatch && smearStatus === 'در حال انتظار' && !hasOutcome;
        }
        
        return tbIdMatch && smearStatus === filters.smearStatus;
    });
  }, [allCalculatedData, filters, activePage]);

  const totalCountForView = useMemo(() => {
    if (!allCalculatedData) return 0;
    if (activePage === 'firstHalf') {
        return allCalculatedData.filter(p => p.dataBatch === 'firstHalf').length;
    }
    return allCalculatedData.length;
  }, [allCalculatedData, activePage]);

  const handleOutcomeUpdate = (tbId: string, outcome: PatientOutcome) => {
    setPatientOutcomes(prev => ({
      ...prev,
      [tbId]: outcome,
    }));
  };

  const renderContent = () => {
    if (!allCalculatedData.length) {
      return <p className="text-center py-8 text-slate-500">داده ای برای نمایش وجود ندارد.</p>;
    }
    return (
      <DataTable
        data={filteredData}
        view={activePage}
        onOutcomeUpdate={handleOutcomeUpdate}
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        resultCount={filteredData.length}
        totalCount={totalCountForView}
      />
    );
  };

  return (
    <>
      <HelpModal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} />
      <div className="bg-white dark:bg-slate-800/50 p-4 sm:p-6 rounded-xl shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <nav className="flex justify-center items-center bg-slate-100 dark:bg-slate-900/50 p-2 rounded-lg gap-x-2 w-full sm:w-auto">
              {(Object.keys(pageTitles) as PageView[]).map(page => (
                <button
                  key={page}
                  onClick={() => setActivePage(page)}
                  className={`px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 flex-grow sm:flex-grow-0 ${
                    activePage === page
                      ? 'bg-sky-600 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {pageTitles[page]}
                </button>
              ))}
            </nav>
            <PointInTimeCalculator 
                currentDate={calculationDate}
                onDateChange={setCalculationDate}
                onReset={() => setCalculationDate(null)}
            />
        </div>

        <div className="flex justify-between items-center gap-4 mb-4">
            <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300">{pageTitles[activePage]}</h2>
            <div className="flex items-center gap-2">
              <DownloadButton 
                data={filteredData}
                activeView={activePage}
                pageTitles={pageTitles}
              />
              <button 
                onClick={() => setIsHelpModalOpen(true)}
                className="p-1.5 bg-slate-200 dark:bg-slate-700 rounded-full text-slate-600 dark:text-slate-300 hover:bg-sky-100 dark:hover:bg-sky-900 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                aria-label="راهنمای محاسبات"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>
        </div>
        {renderContent()}
      </div>
    </>
  );
};
