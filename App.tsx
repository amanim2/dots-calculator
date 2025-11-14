import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FileUpload } from './components/FileUpload';
import { PatientView } from './components/PatientView';
import { ThemeSwitcher } from './components/ThemeSwitcher';
import type { PatientInput } from './types';

declare var moment: any;

type UploadStep = 'first' | 'second' | 'complete';

const App: React.FC = () => {
  const [firstHalfData, setFirstHalfData] = useState<PatientInput[] | null>(null);
  const [secondHalfData, setSecondHalfData] = useState<PatientInput[] | null>(null);
  const [uploadStep, setUploadStep] = useState<UploadStep>('first');
  const [isLoading, setIsLoading] = useState(true);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('theme')) {
        return localStorage.getItem('theme') as 'light' | 'dark';
    }
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    return 'light';
  });

  const toggleTheme = useCallback(() => {
    setTheme(currentTheme => (currentTheme === 'light' ? 'dark' : 'light'));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const savedFirstHalf = sessionStorage.getItem('firstHalfPatientData');
        const savedSecondHalf = sessionStorage.getItem('secondHalfPatientData');
        
        if (savedFirstHalf) {
          const parsedFirstHalf = JSON.parse(savedFirstHalf);
          setFirstHalfData(parsedFirstHalf);
          
          if (savedSecondHalf) {
            setSecondHalfData(JSON.parse(savedSecondHalf));
            setUploadStep('complete');
          } else {
            setUploadStep('second');
          }
        } else {
          setUploadStep('first');
        }
      } catch (error) {
        console.error("Could not parse patient data from session storage.", error);
        // On error, reset to the initial state
        setFirstHalfData(null);
        setSecondHalfData(null);
        setUploadStep('first');
      }
      setIsLoading(false);
    }, 250);

    return () => clearTimeout(timer);
  }, []);


  useEffect(() => {
    if (typeof moment !== 'undefined') {
      moment.locale('fa');
    }
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);


  const handleFirstHalfDataLoaded = (data: PatientInput[]) => {
    setFirstHalfData(data);
    sessionStorage.setItem('firstHalfPatientData', JSON.stringify(data));
    setUploadStep('second');
  };

  const handleSecondHalfDataLoaded = (data: PatientInput[]) => {
    setSecondHalfData(data);
    sessionStorage.setItem('secondHalfPatientData', JSON.stringify(data));
    setUploadStep('complete');
  };
  
  const handleSkipSecondHalf = () => {
    setUploadStep('complete');
  };

  const handleReset = () => {
    setFirstHalfData(null);
    setSecondHalfData(null);
    setUploadStep('first');
    sessionStorage.removeItem('firstHalfPatientData');
    sessionStorage.removeItem('secondHalfPatientData');
    sessionStorage.removeItem('patientOutcomes');
  };
  
  const allPatientData = useMemo(() => {
    if (!firstHalfData) return null;

    const firstHalfWithBatch = firstHalfData.map(p => ({ ...p, dataBatch: 'firstHalf' as const }));
    const secondHalfWithBatch = secondHalfData ? secondHalfData.map(p => ({ ...p, dataBatch: 'secondHalf' as const })) : [];
    
    return [...firstHalfWithBatch, ...secondHalfWithBatch];
  }, [firstHalfData, secondHalfData]);


  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <svg className="animate-spin h-8 w-8 text-sky-600 dark:text-sky-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-slate-500 dark:text-slate-400">در حال بازیابی جلسه قبلی...</p>
          </div>
        </div>
      );
    }

    if (uploadStep === 'first' || !allPatientData) {
      return <FileUpload 
        onDataLoaded={handleFirstHalfDataLoaded} 
        title="مرحله ۱: بارگذاری فایل شش ماهه اول"
        description="لطفاً فایل CSV شامل اطلاعات بیمارانی که درمان خود را در شش ماهه اول سال شروع کرده‌اند، بارگذاری نمایید."
      />;
    }

    if (uploadStep === 'second') {
       return (
        <div className="space-y-6 max-w-2xl mx-auto">
          <div className="p-4 text-center bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-700">
            <h3 className="font-semibold text-green-800 dark:text-green-300">مرحله اول با موفقیت انجام شد</h3>
            <p className="text-sm text-green-700 dark:text-green-400">{firstHalfData?.length} بیمار از فایل اول بارگذاری شد.</p>
          </div>
          <FileUpload 
            onDataLoaded={handleSecondHalfDataLoaded}
            title="مرحله ۲ (اختیاری): بارگذاری بیماران جدید شش ماهه دوم"
            description="اگر بیماران جدیدی در شش ماهه دوم سال شناسایی شده‌اند، فایل CSV آن‌ها را در این قسمت بارگذاری کنید."
          />
          <div className="text-center">
             <button
              onClick={handleSkipSecondHalf}
              className="px-6 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-700 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            >
              ادامه با فایل فعلی و نمایش محاسبات
            </button>
          </div>
        </div>
      );
    }

    return <PatientView patientData={allPatientData} />;
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-6 pb-4 border-b border-slate-300 dark:border-slate-700">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-sky-700 dark:text-sky-400">برنامه محاسبه و کنترل داتس بیماران مسلول</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">ابزاری هوشمند برای مدیریت برنامه درمانی بیماران سل ریوی</p>
          </div>
          <div className="flex items-center gap-4">
            {uploadStep === 'complete' && !isLoading && (
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors duration-200 shadow-md"
              >
                بارگذاری مجموعه جدید
              </button>
            )}
            <ThemeSwitcher theme={theme} toggleTheme={toggleTheme} />
          </div>
        </header>

        <main>
          {renderContent()}
        </main>
      </div>
       <footer className="text-center mt-8 text-xs text-gray-400">
          <p>طراحی و توسعه توسط مهندس هوش مصنوعی</p>
      </footer>
    </div>
  );
};

export default App;