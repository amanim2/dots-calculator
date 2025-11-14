import React, { useState, useMemo } from 'react';

declare var moment: any;

interface DatePickerProps {
  onSelectDate: (date: string) => void;
  onClose: () => void;
  initialDate?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({ onSelectDate, onClose, initialDate }) => {
  const initialMoment = useMemo(() => {
    return initialDate && moment(initialDate, 'jYYYY/jMM/jDD', true).isValid()
      ? moment(initialDate, 'jYYYY/jMM/jDD')
      : moment();
  }, [initialDate]);

  const [displayMonth, setDisplayMonth] = useState(initialMoment);

  // Fix: Changed type of 'day' from 'moment.Moment' to 'any' to resolve namespace error.
  const handleDateSelect = (day: any) => {
    onSelectDate(day.format('jYYYY/jMM/jDD'));
  };

  const startOfMonth = displayMonth.clone().startOf('jMonth');
  const endOfMonth = displayMonth.clone().endOf('jMonth');

  const days = [];
  let day = startOfMonth.clone();
  
  const startDayOfWeek = day.jDay(); // 0 for Saturday
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push(<div key={`prev-${i}`} className="p-1"></div>);
  }

  while (day.isSameOrBefore(endOfMonth)) {
    const currentDay = day.clone();
    const isToday = currentDay.isSame(moment(), 'day');
    const isSelected = initialDate ? moment(initialDate, 'jYYYY/jMM/jDD').isSame(currentDay, 'day') : false;

    days.push(
      <button
        key={day.format('jYYYY/jM/jD')}
        onClick={() => handleDateSelect(currentDay)}
        className={`w-8 h-8 flex items-center justify-center rounded-full text-xs transition-colors
          ${isSelected ? 'bg-sky-600 text-white font-bold' : ''}
          ${!isSelected && isToday ? 'text-sky-500 font-bold' : ''}
          ${!isSelected ? 'hover:bg-slate-200 dark:hover:bg-slate-700' : ''}
        `}
      >
        {currentDay.jDate()}
      </button>
    );
    day.add(1, 'day');
  }

  return (
    <div 
        className="absolute top-full mt-2 right-0 z-10 w-64 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg shadow-xl p-2"
        onClick={(e) => e.stopPropagation()}
    >
      <div className="flex justify-between items-center mb-2">
        {/* Previous month button (on the right for RTL) */}
        <button onClick={() => setDisplayMonth(displayMonth.clone().subtract(1, 'jMonth'))} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div className="font-semibold text-sm">{displayMonth.format('jMMMM jYYYY')}</div>
        {/* Next month button (on the left for RTL) */}
        <button onClick={() => setDisplayMonth(displayMonth.clone().add(1, 'jMonth'))} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-500 dark:text-slate-400 mb-1">
        <div>ش</div>
        <div>ی</div>
        <div>د</div>
        <div>س</div>
        <div>چ</div>
        <div>پ</div>
        <div>ج</div>
      </div>
      <div className="grid grid-cols-7 gap-1 place-items-center">
          {days}
      </div>
      <button onClick={onClose} className="w-full mt-2 text-xs text-center text-rose-500 hover:text-rose-700 p-1 rounded hover:bg-rose-100 dark:hover:bg-rose-900/20">بستن</button>
    </div>
  );
};