import React from 'react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 left-4 p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full"
          aria-label="بستن راهنما"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <h2 className="text-2xl font-bold text-sky-700 dark:text-sky-400 mb-6 text-center">
          راهنمای محاسبات داتس
        </h2>

        <div className="space-y-6 text-slate-700 dark:text-slate-300 text-right leading-relaxed">
          <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
            <h3 className="font-bold text-lg mb-2 text-slate-800 dark:text-slate-200">
              ۱. تعداد روزهای نیازمند داتس
            </h3>
            <p>
              این عدد نشان‌دهنده تعداد کل روزهایی است که یک فاز درمانی بیمار (چه مرحله حمله‌ای و چه نگهدارنده) در بازه زمانی گزارش (مثلاً شش ماهه اول) قرار می‌گیرد.
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              <strong>مثال:</strong> اگر مرحله حمله‌ای بیمار از 1 فروردین تا 2 خرداد باشد و گزارش مربوط به شش ماهه اول باشد، تمام این 63 روز به عنوان "روزهای نیازمند" محاسبه می‌شوند.
            </p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
            <h3 className="font-bold text-lg mb-2 text-slate-800 dark:text-slate-200">
              ۲. تعداد روزهای دریافت داتس
            </h3>
            <p>
              این عدد، تعداد روزهای واقعی است که بیمار تحت نظارت مستقیم دارو دریافت کرده است. برای محاسبه آن، تعداد روزهای جمعه (به عنوان روز تعطیل رسمی و بدون درمان) از «تعداد روزهای نیازمند داتس» کسر می‌گردد.
            </p>
            <div className="mt-3 p-3 bg-sky-50 dark:bg-sky-900/40 border-r-4 border-sky-500 rounded">
                <p className="font-semibold text-sky-800 dark:text-sky-300">نکته هوشمند:</p>
                <p className="text-sm text-sky-700 dark:text-sky-400">
                    حذف روزهای جمعه باعث می‌شود درصد پوشش داتس به شکل واقعی و دقیق‌تری محاسبه شود، زیرا بیمار در این روزها تعهدی برای دریافت دارو نداشته است.
                </p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
            <h3 className="font-bold text-lg mb-2 text-slate-800 dark:text-slate-200">
              ۳. درصد پوشش داتس
            </h3>
            <p>
              این شاخص کلیدی، کارایی برنامه درمانی را نشان می‌دهد و از فرمول زیر به دست می‌آید:
            </p>
            <pre className="mt-2 p-3 bg-slate-100 dark:bg-slate-700 rounded-md text-center font-mono text-sm text-slate-800 dark:text-slate-200" dir="ltr">
              (تعداد روزهای دریافت داتس / تعداد روزهای نیازمند داتس) * 100
            </pre>
             <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              <strong>نکته:</strong> در صورتی که بیمار دچار پیامدی مانند فوت یا امتناع از درمان شود، محاسبات تا تاریخ وقوع آن پیامد انجام خواهد شد و مرحله نگهدارنده برای او صفر در نظر گرفته می‌شود.
            </p>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};