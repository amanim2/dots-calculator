import React from 'react';

export const OnboardingGuide: React.FC = () => {
  return (
    <details className="mb-6 bg-sky-50 dark:bg-sky-900/30 p-4 rounded-lg border border-sky-200 dark:border-sky-700 transition-all duration-300 open:shadow-lg">
      <summary className="font-semibold cursor-pointer text-sky-800 dark:text-sky-300 list-none flex justify-between items-center">
        <span>
          <svg xmlns="http://www.w3.org/2000/svg" className="inline-block w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          راهنمای آماده‌سازی فایل ورودی
        </span>
        <span className="text-xs text-sky-600 dark:text-sky-400 transform transition-transform duration-300 detail-arrow">▼</span>
      </summary>
      <div className="mt-4 pt-3 border-t border-sky-200 dark:border-sky-700 text-sm text-slate-600 dark:text-slate-300 space-y-3">
        <p>
          برای پردازش صحیح اطلاعات، لطفاً فایل CSV خود را با کدینگ <strong>UTF-8</strong> ذخیره کرده و مطمئن شوید ستون‌های زیر در آن وجود دارند:
        </p>
        <ul className="list-none space-y-2 pr-2">
          <li className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 ml-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <strong>شماره سل</strong>
          </li>
          <li className="flex items-center">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 ml-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <strong>تاریخ شروع درمان</strong> <span className="text-xs text-slate-500 mr-2">(فرمت: 1403/01/15)</span>
          </li>
          <li className="flex items-center">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 ml-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <strong>نتیجه اسمیر ماه دو</strong>
          </li>
        </ul>
      </div>
      <style>{`
        details[open] .detail-arrow {
          transform: rotate(180deg);
        }
      `}</style>
    </details>
  );
};
