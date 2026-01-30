
import React, { useState } from 'react';
import type { Vehicle, ReservationDetails } from '../types';
import { UserIcon, MailIcon, MapPinIcon, UsersIcon, TrashIcon, CalendarIcon, CarIcon } from './IconComponents';
import { destinations } from '../data/destinations';

interface ReservationFormProps {
  vehicle: Vehicle;
  onSubmit: (details: ReservationDetails) => void;
  onBack: () => void;
  tripDates?: { startDate: Date; endDate: Date } | null;
}

const ReservationForm: React.FC<ReservationFormProps> = ({ vehicle, onSubmit, onBack, tripDates }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [destination, setDestination] = useState('');
  const [additionalAttendees, setAdditionalAttendees] = useState<string[]>([]);
  const [error, setError] = useState('');

  const totalAttendees = 1 + additionalAttendees.length;
  const isAtCapacity = totalAttendees >= vehicle.capacity;

  const handleAdditionalAttendeeChange = (index: number, value: string) => {
    const newAttendees = [...additionalAttendees];
    newAttendees[index] = value;
    setAdditionalAttendees(newAttendees);
  };

  const addAdditionalAttendee = () => {
    if (!isAtCapacity) {
      setAdditionalAttendees([...additionalAttendees, '']);
    }
  };

  const removeAdditionalAttendee = (index: number) => {
    setAdditionalAttendees(additionalAttendees.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !destination) {
      setError('Por favor, completá todos los campos obligatorios.');
      return;
    }
    if (totalAttendees > vehicle.capacity) {
        setError(`El número de asistentes supera la capacidad del vehículo (${vehicle.capacity}).`);
        return;
    }
    setError('');
    const allAttendees = [name.trim(), ...additionalAttendees.map(a => a.trim()).filter(Boolean)];
    onSubmit({ name, email, destination, attendees: allAttendees });
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {/* Mini Resumen del Contexto */}
      <div className="bg-fyo-blue/5 border border-fyo-blue/20 rounded-xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-white p-2 rounded-lg shadow-sm">
            <span className="text-2xl">{vehicle.type === 'pickup' ? '🛻' : '🚗'}</span>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Vehículo Seleccionado</p>
            <p className="font-bold text-fyo-blue">{vehicle.name} <span className="text-fyo-cyan">({vehicle.plate})</span></p>
          </div>
        </div>
        {tripDates && (
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-lg shadow-sm text-fyo-blue">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Período de Viaje</p>
              <p className="font-bold text-fyo-blue">
                {tripDates.startDate.toLocaleDateString()} - {tripDates.endDate.toLocaleDateString()}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Detalles del Viaje</h2>
          <p className="text-slate-600 dark:text-slate-300">Completá la información del conductor principal y los acompañantes.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-fyo-red/10 border border-fyo-red/20 text-fyo-red px-4 py-3 rounded-lg flex items-center gap-3" role="alert">
              <span className="font-bold">⚠️</span>
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label htmlFor="name" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Conductor Principal
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input 
                  type="text" 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-fyo-blue focus:border-transparent outline-none transition-all" 
                  placeholder="Nombre completo"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Email Corporativo
              </label>
               <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MailIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input 
                  type="email" 
                  id="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-fyo-blue focus:border-transparent outline-none transition-all" 
                  placeholder="usuario@fyo.com"
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-1">
            <label htmlFor="destination" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Destino</label>
            <div className="relative">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPinIcon className="h-5 w-5 text-slate-400" />
              </div>
              <input 
                type="text" 
                id="destination" 
                value={destination} 
                onChange={(e) => setDestination(e.target.value)} 
                required 
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-fyo-blue focus:border-transparent outline-none transition-all" 
                placeholder="Ciudad de destino"
                list="destinations-list"
              />
              <datalist id="destinations-list">
                  {destinations.map((dest) => (
                      <option key={dest} value={dest} />
                  ))}
              </datalist>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                Acompañantes <span className="text-slate-400 font-normal">({totalAttendees}/{vehicle.capacity})</span>
              </label>
              {!isAtCapacity && (
                <button
                  type="button"
                  onClick={addAdditionalAttendee}
                  className="text-sm font-bold text-fyo-cyan hover:text-fyo-blue transition-colors flex items-center gap-1"
                >
                  + Agregar Acompañante
                </button>
              )}
            </div>

            <div className="space-y-3">
              {additionalAttendees.length === 0 && (
                <p className="text-sm text-slate-400 italic py-2">Sin acompañantes adicionales.</p>
              )}
              {additionalAttendees.map((attendee, index) => (
                <div key={index} className="flex items-center gap-2 group animate-fade-in">
                  <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      value={attendee}
                      onChange={(e) => handleAdditionalAttendeeChange(index, e.target.value)}
                      placeholder={`Nombre del acompañante ${index + 1}`}
                      className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-fyo-blue outline-none transition-all"
                    />
                  </div>
                  <button 
                    type="button" 
                    onClick={() => removeAdditionalAttendee(index)} 
                    className="p-2 text-slate-300 hover:text-fyo-red hover:bg-fyo-red/5 rounded-full transition-all" 
                    aria-label="Eliminar asistente"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
            
            {isAtCapacity && (
              <p className="mt-3 text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-2 rounded border border-amber-200 dark:border-amber-800">
                Llegaste al límite de capacidad del vehículo ({vehicle.capacity} personas).
              </p>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 mt-4 border-t border-slate-100 dark:border-slate-700">
            <button 
              type="button" 
              onClick={onBack} 
              className="w-full sm:w-auto text-sm font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              &larr; Volver al Listado
            </button>
            <button 
              type="submit" 
              className="w-full sm:w-auto bg-fyo-blue hover:bg-fyo-blue/90 text-white font-bold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Continuar a Hotelería &rarr;
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReservationForm;
