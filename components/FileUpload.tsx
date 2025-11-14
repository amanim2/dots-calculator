import React, { useState, useCallback } from 'react';
import type { PatientInput } from '../types';
import { OnboardingGuide } from './OnboardingGuide';

declare var Papa: any;

const SMEAR_RESULT_HEADERS = ["نتیجه اسمیر ماه دو", "نتیجه اسمیر پایان ماه دو", "نتیجه آزمایش اسمیر پایان ماه دو"];
const TB_ID_HEADER = "شماره سل";
const START_DATE_HEADERS = ["تاریخ شروع درمان", "تاريخ شروع درمان"]; // Handles both Persian 'ی' and Arabic 'ي'


interface FileUploadProps {
  onDataLoaded: (data: PatientInput[]) => void;
  title: string;
  description: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded, title, description }) => {
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<PatientInput[] | null>(null);
  const [fileName, setFileName] = useState<string>('');

  const handleDownloadTemplate = () => {
    const headers = ['شماره سل', 'تاریخ شروع درمان', 'نتیجه اسمیر ماه دو'];
    const sampleRow = ['101', '1403/01/15', 'منفی'];
    
    // Use semicolon as delimiter for better Excel compatibility in many regions
    const csvContent = [headers.join(';'), sampleRow.join(';')].join('\n');
    
    // Add BOM for UTF-8 to ensure Excel opens it correctly with Persian characters
    const csvWithBOM = '\uFEFF' + csvContent; 
    
    const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'dots_template.csv');
    document.body.appendChild(link);
    
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileParse = (file: File) => {
    setFileName(file.name);
    setError(null);
    setPreviewData(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: any) => {
        if (results.errors.length > 0) {
          setError(`خطا در پردازش فایل: ${results.errors[0].message}`);
          return;
        }

        const headers = results.meta.fields;
        const smearHeader = headers.find((h: string) => SMEAR_RESULT_HEADERS.includes(h.trim()));
        const startDateHeader = headers.find((h: string) => START_DATE_HEADERS.includes(h.trim()));

        if (!headers.includes(TB_ID_HEADER) || !startDateHeader || !smearHeader) {
          setError(`فایل معتبر نیست. ستون های الزامی یافت نشد. فایل باید شامل ستون های "${TB_ID_HEADER}"، یکی از ستون های "${START_DATE_HEADERS.join(' یا ')}" و یکی از ستون های "${SMEAR_RESULT_HEADERS.join(', ')}" باشد.`);
          return;
        }

        try {
            const data: PatientInput[] = results.data.map((row: any) => {
              if(!row[TB_ID_HEADER] || !row[startDateHeader]) return null;

              return {
                tbId: row[TB_ID_HEADER],
                treatmentStartDate: row[startDateHeader],
                smearResultMonth2: row[smearHeader] || '',
              };
            }).filter((item: PatientInput | null): item is PatientInput => item !== null);

            if(data.length === 0) {
                setError("هیچ بیمار معتبری در فایل یافت نشد. لطفاً از وجود اطلاعات در ستون های شماره سل و تاریخ شروع درمان اطمینان حاصل کنید.");
                return;
            }
            
            setPreviewData(data);
        } catch (e) {
            setError("خطای غیرمنتظره در پردازش اطلاعات بیماران. لطفا ساختار فایل را بررسی کنید.");
        }
      },
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileParse(file);
    }
  };
  
  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files?.[0];
    if (file && (file.type === "text/csv" || file.name.endsWith('.csv'))) {
        handleFileParse(file);
    } else {
        setError("لطفاً یک فایل با فرمت CSV انتخاب کنید.");
    }
  }, []);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
  };

  const handleConfirm = () => {
    if (previewData) {
      onDataLoaded(previewData);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg w-full max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-2 text-center text-sky-700 dark:text-sky-400">{title}</h2>
      <p className="text-sm text-center text-slate-500 dark:text-slate-400 mb-4">{description}</p>
      
      <OnboardingGuide />

      <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-700 text-center">
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
          برای اطمینان از فرمت صحیح، ابتدا فایل قالب را دانلود کرده و اطلاعات بیماران را در آن وارد نمایید.
        </p>
        <button
          onClick={handleDownloadTemplate}
          className="px-4 py-2 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 transition-colors shadow-sm inline-flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          دانلود فایل قالب نمونه (CSV)
        </button>
      </div>

      <div 
        onDrop={handleDrop} 
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center cursor-pointer hover:border-sky-500 dark:hover:border-sky-400 transition-colors"
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept=".csv"
          onChange={handleFileChange}
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <p className="text-slate-500 dark:text-slate-400">فایل CSV خود را اینجا بکشید و رها کنید یا برای انتخاب کلیک کنید</p>
        </label>
      </div>

      {fileName && !error && !previewData && <p className="mt-4 text-center text-slate-500">در حال پردازش فایل: {fileName}...</p>}
      
      {error && <p className="mt-4 text-center text-red-500 bg-red-100 dark:bg-red-900/30 p-3 rounded-lg">{error}</p>}
      
      {previewData && (
        <div className="mt-6 text-center bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
          <h3 className="font-semibold text-green-800 dark:text-green-300">فایل با موفقیت پردازش شد</h3>
          <p className="text-green-700 dark:text-green-400">{previewData.length} بیمار معتبر یافت شد.</p>
          <button
            onClick={handleConfirm}
            className="mt-4 px-6 py-2 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-700 transition-colors shadow-md"
          >
            تایید و ادامه
          </button>
        </div>
      )}
    </div>
  );
};