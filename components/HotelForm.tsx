
import React, { useState, useEffect } from 'react';
import type { HotelDetails, HotelPassenger, HotelRoom, ReservationDetails } from '../types';
import { UserIcon, TrashIcon, CalendarIcon, ClipboardListIcon, SpinnerIcon, CheckIcon, BuildingOffice2Icon } from './IconComponents';

interface HotelFormProps {
  vehicleReservationDates: { startDate: Date; endDate: Date };
  reservationDetails: ReservationDetails;
  onSubmit: (details: HotelDetails) => void;
  onBack: () => void;
  isSubmitting: boolean;
}

const HotelForm: React.FC<HotelFormProps> = ({ 
  vehicleReservationDates, 
  reservationDetails,
  onSubmit, 
  onBack, 
  isSubmitting 
}) => {
  const [needsHotel, setNeedsHotel] = useState<boolean | null>(null);
  
  // Inicializamos los pasajeros con los asistentes de la reserva de vehículo
  const [passengers, setPassengers] = useState<HotelPassenger[]>([]);
  const [rooms, setRooms] = useState<HotelRoom[]>([{ quantity: 1, type: 'single' }]);
  const [checkIn, setCheckIn] = useState(vehicleReservationDates.startDate);
  const [checkOut, setCheckOut] = useState(vehicleReservationDates.endDate);
  const [suggestions, setSuggestions] = useState('');
  const [accountingAccount, setAccountingAccount] = useState('');
  const [error, setError] = useState('');

  // Efecto para precargar pasajeros solo una vez al abrir el form
  useEffect(() => {
    if (reservationDetails.attendees && reservationDetails.attendees.length > 0) {
      setPassengers(reservationDetails.attendees.map(name => ({ name })));
    } else {
      setPassengers([{ name: reservationDetails.name }]);
    }
  }, [reservationDetails]);

  const toInputDate = (date: Date) => date.toISOString().split('T')[0];

  const handlePassengerChange = (index: number, value: string) => {
    const newPassengers = [...passengers];
    newPassengers[index].name = value;
    setPassengers(newPassengers);
  };

  const addPassenger = () => setPassengers([...passengers, { name: '' }]);
  const removePassenger = (index: number) => setPassengers(passengers.filter((_, i) => i !== index));

  const handleRoomChange = (index: number, field: keyof HotelRoom, value: string | number) => {
    const newRooms = [...rooms];
    if (field === 'quantity') {
      newRooms[index][field] = Math.max(1, Number(value));
    } else {
      newRooms[index][field] = value as 'single' | 'double';
    }
    setRooms(newRooms);
  };
  
  const addRoom = () => setRooms([...rooms, { quantity: 1, type: 'single' }]);
  const removeRoom = (index: number) => setRooms(rooms.filter((_, i) => i !== index));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (needsHotel === false) {
        onSubmit({ 
          required: false, 
          passengers: [], 
          rooms: [], 
          checkIn: vehicleReservationDates.startDate, 
          checkOut: vehicleReservationDates.endDate, 
          suggestions: '', 
          accountingAccount: '' 
        });
        return;
    }

    if (needsHotel && (passengers.some(p => !p.name.trim()) || rooms.some(r => r.quantity < 1))) {
        setError("Por favor, completá los nombres de todos los pasajeros.");
        return;
    }

    onSubmit({ required: true, passengers, rooms, checkIn, checkOut, suggestions, accountingAccount });
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
        <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Solicitud de Hotelería</h2>
            <p className="text-slate-600 dark:text-slate-300">¿Necesitás reservar alojamiento para este viaje?</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <button
            type="button"
            onClick={() => setNeedsHotel(true)}
            className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all duration-300 ${
              needsHotel === true 
                ? 'bg-fyo-blue/5 border-fyo-blue shadow-md' 
                : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 hover:border-fyo-blue/30'
            }`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${needsHotel === true ? 'bg-fyo-blue text-white' : 'bg-slate-100 dark:bg-slate-600 text-slate-400'}`}>
               <BuildingOffice2Icon className="w-6 h-6" />
            </div>
            <span className={`font-bold text-lg ${needsHotel === true ? 'text-fyo-blue' : 'text-slate-500'}`}>SÍ, necesito hotel</span>
          </button>

          <button
            type="button"
            onClick={() => setNeedsHotel(false)}
            className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all duration-300 ${
              needsHotel === false 
                ? 'bg-fyo-red/5 border-fyo-red shadow-md' 
                : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 hover:border-fyo-red/30'
            }`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${needsHotel === false ? 'bg-fyo-red text-white' : 'bg-slate-100 dark:bg-slate-600 text-slate-400'}`}>
               <CheckIcon className="w-6 h-6 rotate-45 scale-125" />
            </div>
            <span className={`font-bold text-lg ${needsHotel === false ? 'text-fyo-red' : 'text-slate-500'}`}>NO necesito hotel</span>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="bg-fyo-red/10 border border-fyo-red/20 text-fyo-red px-4 py-3 rounded-lg flex items-center gap-3">
              <span className="font-bold">⚠️</span>
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {needsHotel === true && (
            <div className="space-y-8 animate-fade-in border-t border-slate-100 dark:border-slate-700 pt-8">
                {/* Sección Fechas */}
                <div>
                    <h3 className="text-sm font-bold text-fyo-blue uppercase tracking-wider mb-4 flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4" /> Período de Estancia
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="block text-xs font-semibold text-slate-500">Check-in</label>
                            <input 
                              type="date" 
                              value={toInputDate(checkIn)} 
                              min={toInputDate(vehicleReservationDates.startDate)}
                              max={toInputDate(vehicleReservationDates.endDate)}
                              onChange={e => setCheckIn(new Date(e.target.value + 'T00:00:00'))} 
                              className="w-full p-2.5 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-fyo-blue outline-none"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="block text-xs font-semibold text-slate-500">Check-out</label>
                            <input 
                              type="date" 
                              value={toInputDate(checkOut)} 
                              min={toInputDate(checkIn)}
                              max={toInputDate(vehicleReservationDates.endDate)}
                              onChange={e => setCheckOut(new Date(e.target.value + 'T00:00:00'))} 
                              className="w-full p-2.5 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-fyo-blue outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Sección Pasajeros */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-bold text-fyo-blue uppercase tracking-wider flex items-center gap-2">
                            <UserIcon className="w-4 h-4" /> Pasajeros del Hotel
                        </h3>
                        <button type="button" onClick={addPassenger} className="text-xs font-bold text-fyo-cyan hover:underline">+ Agregar</button>
                    </div>
                    <div className="space-y-3">
                        {passengers.map((p, i) => (
                            <div key={i} className="flex items-center gap-2 group">
                                <div className="relative flex-grow">
                                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input 
                                      type="text" 
                                      placeholder="Nombre completo" 
                                      value={p.name} 
                                      onChange={e => handlePassengerChange(i, e.target.value)} 
                                      className="w-full pl-10 p-2 text-sm border border-slate-200 rounded-lg dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-fyo-blue outline-none"
                                    />
                                </div>
                                {passengers.length > 1 && (
                                    <button type="button" onClick={() => removePassenger(i)} className="p-2 text-slate-300 hover:text-fyo-red transition-colors">
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sección Habitaciones */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-bold text-fyo-blue uppercase tracking-wider flex items-center gap-2">
                                <BuildingOffice2Icon className="w-4 h-4" /> Habitaciones
                            </h3>
                            <button type="button" onClick={addRoom} className="text-xs font-bold text-fyo-cyan hover:underline">+ Agregar</button>
                        </div>
                        <div className="space-y-3">
                            {rooms.map((r, i) => (
                                <div key={i} className="flex items-center gap-2">
                                   <input 
                                     type="number" 
                                     value={r.quantity} 
                                     min="1" 
                                     onChange={e => handleRoomChange(i, 'quantity', e.target.value)} 
                                     className="w-16 p-2 text-sm border border-slate-200 rounded-lg dark:bg-slate-700 dark:border-slate-600" 
                                   />
                                   <select 
                                     value={r.type} 
                                     onChange={e => handleRoomChange(i, 'type', e.target.value)} 
                                     className="flex-grow p-2 text-sm border border-slate-200 rounded-lg dark:bg-slate-700 dark:border-slate-600"
                                   >
                                        <option value="single">Single</option>
                                        <option value="double">Doble</option>
                                   </select>
                                   {rooms.length > 1 && (
                                        <button type="button" onClick={() => removeRoom(i)} className="p-2 text-slate-300 hover:text-fyo-red">
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                   )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                         <h3 className="text-sm font-bold text-fyo-blue uppercase tracking-wider flex items-center gap-2">
                            <ClipboardListIcon className="w-4 h-4" /> Información Adicional
                        </h3>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Cuenta Contable</label>
                            <input 
                                type="text" 
                                value={accountingAccount} 
                                onChange={e => setAccountingAccount(e.target.value)} 
                                className="w-full p-2 text-sm border border-slate-200 rounded-lg dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-fyo-blue outline-none" 
                                placeholder="Centro de costo o código"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Sugerencias o Comentarios</label>
                            <textarea 
                                value={suggestions} 
                                onChange={e => setSuggestions(e.target.value)} 
                                rows={2} 
                                className="w-full p-2 text-sm border border-slate-200 rounded-lg dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-fyo-blue outline-none" 
                                placeholder="Ej: Cerca del puerto, con cochera..."
                            ></textarea>
                        </div>
                    </div>
                </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 border-t border-slate-100 dark:border-slate-700">
            <button 
              type="button" 
              onClick={onBack} 
              className="w-full sm:w-auto text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
            >
              &larr; Volver a Detalles
            </button>
            <button
              type="submit"
              disabled={needsHotel === null || isSubmitting}
              className={`w-full sm:w-auto flex items-center justify-center gap-2 font-bold py-3 px-10 rounded-lg shadow-md transition-all transform hover:-translate-y-0.5 active:translate-y-0 ${
                needsHotel === null 
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                  : 'bg-fyo-green hover:bg-fyo-green/90 text-white'
              }`}
            >
              {isSubmitting ? (
                <>
                  <SpinnerIcon className="w-5 h-5 animate-spin" />
                  <span>Confirmando...</span>
                </>
              ) : (
                <>
                    <CheckIcon className="w-5 h-5" />
                    <span>Confirmar Todo y Finalizar</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HotelForm;
