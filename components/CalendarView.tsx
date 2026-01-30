import React, { useState } from 'react';
import type { Vehicle, Reservation } from '../types';
import { UserIcon, MapPinIcon, ClockIcon, CalendarIcon } from './IconComponents';

interface CalendarViewProps {
  vehicle: Vehicle;
  reservations: Reservation[];
  onDatesSelect: (startDate: Date, endDate: Date) => void;
  onBack: () => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ 
    vehicle, 
    reservations, 
    onDatesSelect, 
    onBack,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isDateReserved = (date: Date) => {
    return reservations.some(reservation => {
      const resStart = new Date(reservation.startDate);
      resStart.setHours(0, 0, 0, 0);
      const resEnd = new Date(reservation.endDate);
      resEnd.setHours(0, 0, 0, 0);
      return date >= resStart && date <= resEnd;
    });
  };

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    if (clickedDate < today || isDateReserved(clickedDate)) return;

    if (!startDate || (startDate && endDate)) {
      setStartDate(clickedDate);
      setEndDate(null);
    } else if (startDate && !endDate) {
      if (clickedDate < startDate) {
        setEndDate(startDate);
        setStartDate(clickedDate);
      } else {
        let tempDate = new Date(startDate);
        while(tempDate <= clickedDate) {
            if(isDateReserved(tempDate)) {
                setStartDate(clickedDate);
                setEndDate(null);
                return;
            }
            tempDate.setDate(tempDate.getDate() + 1);
        }
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
      const isReserved = isDateReserved(date);
      const isSelectedStart = startDate && date.getTime() === startDate.getTime();
      const isSelectedEnd = endDate && date.getTime() === endDate.getTime();
      const isInRange = startDate && endDate && date > startDate && date < endDate;
      const isDisabled = isPast || isReserved;

      let cellClasses = 'w-10 h-10 flex items-center justify-center rounded-full transition-colors duration-200';
      if (isDisabled) {
        cellClasses += ' text-slate-400 dark:text-slate-600 line-through cursor-not-allowed';
      } else {
        cellClasses += ' cursor-pointer hover:bg-fyo-blue/20 dark:hover:bg-fyo-blue/30';
      }
      if (isSelectedStart || isSelectedEnd) {
        cellClasses += ' bg-fyo-blue text-white font-bold';
      } else if (isInRange) {
        cellClasses += ' bg-fyo-blue/10 dark:bg-fyo-blue/20 rounded-none';
      } else if(date.getTime() === today.getTime()){
        cellClasses += ' border-2 border-fyo-blue';
      }
      
      return (
        <div key={day} className={`flex justify-center items-center ${isInRange || isSelectedStart || isSelectedEnd ? 'bg-fyo-blue/10 dark:bg-fyo-blue/20' : ''} ${isSelectedStart ? 'rounded-l-full' : ''} ${isSelectedEnd ? 'rounded-r-full' : ''}`} >
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
  const sortedReservations = [...reservations].sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  
  const calculateDuration = (start: Date, end: Date) => {
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 p-8 rounded-xl shadow-2xl">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Seleccionar Fechas</h2>
      <p className="text-slate-600 dark:text-slate-300 mb-6">Para el vehículo: <span className="font-semibold text-fyo-blue dark:text-fyo-cyan">{vehicle.name}</span></p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
            <div className="bg-slate-50 dark:bg-slate-700/80 p-4 rounded-lg">
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
        </div>

        <div className="md:col-span-1">
            <div className="bg-slate-50 dark:bg-slate-700/80 p-6 rounded-lg">
                <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4">Tu Selección</h3>
                <div className="space-y-3 text-sm">
                    <div>
                        <span className="font-semibold text-slate-600 dark:text-slate-300">Desde:</span>
                        <p className={`mt-1 p-2 rounded-md ${startDate ? 'bg-fyo-blue/10 text-fyo-blue font-bold' : 'bg-slate-200 dark:bg-slate-600 text-slate-500 italic'}`}>
                            {startDate ? startDate.toLocaleDateString() : 'Seleccioná en el calendario'}
                        </p>
                    </div>
                    <div>
                        <span className="font-semibold text-slate-600 dark:text-slate-300">Hasta:</span>
                        <p className={`mt-1 p-2 rounded-md ${endDate ? 'bg-fyo-blue/10 text-fyo-blue font-bold' : 'bg-slate-200 dark:bg-slate-600 text-slate-500 italic'}`}>
                            {endDate ? endDate.toLocaleDateString() : 'Seleccioná en el calendario'}
                        </p>
                    </div>
                </div>
                 <button
                    onClick={() => startDate && endDate && onDatesSelect(startDate, endDate)}
                    disabled={!canConfirm}
                    className={`w-full mt-6 font-bold py-2.5 px-6 rounded-lg transition-all duration-300 transform ${canConfirm ? 'bg-fyo-blue hover:bg-opacity-90 text-white hover:scale-[1.02] active:scale-95' : 'bg-slate-300 dark:bg-slate-600 text-slate-500 cursor-not-allowed'}`}
                >
                  Confirmar Reserva
                </button>
            </div>
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Reservas Actuales para este Vehículo</h3>
        {sortedReservations.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {sortedReservations.map(res => {
              const duration = calculateDuration(res.startDate, res.endDate);
              return (
                <div key={res.id} className="bg-slate-50 dark:bg-slate-700/80 p-4 rounded-lg border border-slate-200 dark:border-slate-600">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center font-bold text-slate-800 dark:text-white">
                            <UserIcon className="w-5 h-5 mr-2 text-fyo-blue" />
                            <span>{res.details.name}</span>
                        </div>
                    </div>
                    <div className="border-t border-slate-200 dark:border-slate-600 my-3"></div>
                    <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                         <div className="flex items-center">
                            <CalendarIcon className="w-4 h-4 mr-2.5 text-slate-400 flex-shrink-0" />
                            <span className="font-semibold">{res.startDate.toLocaleDateString()} al {res.endDate.toLocaleDateString()}</span>
                         </div>
                         <div className="flex items-center">
                            <ClockIcon className="w-4 h-4 mr-2.5 text-slate-400 flex-shrink-0" />
                            <span>Duración: {duration} {duration > 1 ? 'días' : 'día'}</span>
                         </div>
                         <div className="flex items-center">
                            <MapPinIcon className="w-4 h-4 mr-2.5 text-slate-400 flex-shrink-0" />
                            <span>Destino: {res.details.destination}</span>
                         </div>
                    </div>
                </div>
              );
            })}
          </div>
        ) : (
            <div className="text-center py-10 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                 <p className="text-slate-500 dark:text-slate-400">Este vehículo está totalmente disponible.</p>
            </div>
        )}
      </div>
      
      <div className="flex justify-start items-center pt-6 mt-6 border-t border-slate-200 dark:border-slate-700">
        <button type="button" onClick={onBack} className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white">
          &larr; Volver al Formulario
        </button>
      </div>
    </div>
  );
};

export default CalendarView;