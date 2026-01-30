import React, { useState } from 'react';
import type { Reservation } from '../types';

interface DateSelectionViewProps {
  reservations: Reservation[];
  onDatesSubmit: (startDate: Date, endDate: Date) => void;
}

const DateSelectionView: React.FC<DateSelectionViewProps> = ({ 
    reservations,
    onDatesSubmit,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    if (clickedDate < today) return;

    if (!startDate || (startDate && endDate)) {
      setStartDate(clickedDate);
      setEndDate(null);
    } else if (startDate && !endDate) {
      if (clickedDate < startDate) {
        setEndDate(startDate);
        setStartDate(clickedDate);
      } else {
        setEndDate(clickedDate);
      }
    }
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const blanks = Array(firstDay).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return [...blanks, ...days].map((day, index) => {
      if (!day) return <div key={`blank-${index}`} className="w-10 h-10"></div>;
      
      const date = new Date(year, month, day);
      const isPast = date < today;
      const isSelectedStart = startDate && date.getTime() === startDate.getTime();
      const isSelectedEnd = endDate && date.getTime() === endDate.getTime();
      const isInRange = (startDate && endDate && date > startDate && date < endDate) ||
                        (startDate && !endDate && hoverDate && date > startDate && date <= hoverDate);

      let cellClasses = 'w-10 h-10 flex items-center justify-center rounded-full transition-colors duration-200';
      
      if (isPast) {
        cellClasses += ' text-slate-400 dark:text-slate-600 cursor-not-allowed';
      } else {
        cellClasses += ' cursor-pointer hover:bg-fyo-blue/20 dark:hover:bg-fyo-blue/30';
      }

      if (isSelectedStart || isSelectedEnd) {
        cellClasses += ' bg-fyo-blue text-white font-bold';
      } else if (isInRange) {
        cellClasses += ' bg-fyo-blue/10 dark:bg-fyo-blue/20 rounded-none';
      } else if(date.getTime() === today.getTime()){
        cellClasses += ' border-2 border-fyo-cyan';
      }
      
      return (
        <div 
            key={day} 
            className={`flex justify-center items-center 
                ${isInRange || isSelectedStart || isSelectedEnd ? 'bg-fyo-blue/10 dark:bg-fyo-blue/20' : ''} 
                ${isSelectedStart ? 'rounded-l-full' : ''} 
                ${isSelectedEnd || (startDate && !endDate && hoverDate && hoverDate.getTime() === date.getTime()) ? 'rounded-r-full' : ''}`}
            onMouseEnter={() => !isPast && setHoverDate(date)}
            onMouseLeave={() => setHoverDate(null)}
        >
            <div onClick={() => handleDateClick(day)} className={cellClasses}>
                {day}
            </div>
        </div>
        );
    });
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  
  const canConfirm = startDate && endDate;

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 p-8 rounded-xl shadow-2xl animate-fade-in border border-slate-200 dark:border-slate-700">
        <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">¿Cuándo querés viajar?</h2>
            <p className="text-slate-600 dark:text-slate-300 text-lg">Seleccioná el período de tu reserva para ver los vehículos disponibles.</p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-700/80 p-6 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600">&lt;</button>
              <div className="font-bold text-lg">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</div>
              <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600">&gt;</button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center font-semibold text-sm text-slate-500 dark:text-slate-400 mb-2">
              {daysOfWeek.map(day => <div key={day}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-sm">
              {renderCalendar()}
            </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
             <div className="bg-slate-50 dark:bg-slate-700/80 p-4 rounded-lg">
                <span className="font-semibold text-slate-600 dark:text-slate-300 text-sm">Desde:</span>
                <p className={`mt-1 text-center p-2 rounded-md ${startDate ? 'bg-fyo-blue/10 text-fyo-blue font-bold' : 'bg-slate-200 dark:bg-slate-600 text-slate-500 italic'}`}>
                    {startDate ? startDate.toLocaleDateString() : 'Seleccioná en el calendario'}
                </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-700/80 p-4 rounded-lg">
                <span className="font-semibold text-slate-600 dark:text-slate-300 text-sm">Hasta:</span>
                <p className={`mt-1 text-center p-2 rounded-md ${endDate ? 'bg-fyo-blue/10 text-fyo-blue font-bold' : 'bg-slate-200 dark:bg-slate-600 text-slate-500 italic'}`}>
                    {endDate ? endDate.toLocaleDateString() : 'Seleccioná en el calendario'}
                </p>
            </div>
        </div>

        <div className="mt-8">
             <button
                onClick={() => startDate && endDate && onDatesSubmit(startDate, endDate)}
                disabled={!canConfirm}
                className={`w-full font-bold py-3 px-6 rounded-lg transition-all duration-300 transform text-lg ${canConfirm ? 'bg-fyo-blue hover:bg-opacity-90 text-white hover:scale-[1.02] active:scale-95' : 'bg-slate-300 dark:bg-slate-600 text-slate-500 cursor-not-allowed'}`}
            >
              Buscar Vehículos Disponibles &rarr;
            </button>
        </div>
    </div>
  );
};

export default DateSelectionView;
