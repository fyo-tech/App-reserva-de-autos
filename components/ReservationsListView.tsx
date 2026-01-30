
import React, { useState, useMemo } from 'react';
import type { Reservation, Vehicle } from '../types';
import { SearchIcon, ClipboardListIcon, CalendarIcon, UserIcon, MapPinIcon, UsersIcon, BuildingOffice2Icon, TrashIcon, SpinnerIcon } from './IconComponents';
import { supabase } from '../lib/supabaseClient';

interface ReservationsListViewProps {
  reservations: Reservation[];
  vehicles: Vehicle[];
}

const ReservationsListView: React.FC<ReservationsListViewProps> = ({ reservations, vehicles }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const getVehicleByReservation = (reservation: Reservation): Vehicle | undefined => {
    return vehicles.find(v => v.id === reservation.vehicleId);
  }

  const handleDelete = async (reservation: Reservation) => {
    if (!supabase) return;
    
    const confirmMessage = `¿Estás seguro que querés cancelar la reserva de ${reservation.details.name} para el ${reservation.vehicleName}? Esta acción es irreversible.`;
    if (!window.confirm(confirmMessage)) return;

    setDeletingId(reservation.id);
    try {
        const { error } = await supabase
            .from('reservations')
            .delete()
            .eq('id', reservation.id);

        if (error) throw error;
        // No necesitamos actualizar el estado local manualmente aquí, 
        // porque App.tsx está escuchando los cambios en tiempo real (DELETE event)
        // y actualizará la lista automáticamente.
    } catch (error) {
        console.error("Error al eliminar:", error);
        alert("Hubo un error al intentar cancelar la reserva.");
        setDeletingId(null);
    }
  };

  const sortedAndFilteredReservations = useMemo(() => {
    return reservations
      .filter(res => {
        if (searchTerm.trim() === '') return true;
        const lowerCaseSearch = searchTerm.toLowerCase();
        const vehicle = getVehicleByReservation(res);
        return (
          res.vehicleName.toLowerCase().includes(lowerCaseSearch) ||
          res.details.name.toLowerCase().includes(lowerCaseSearch) ||
          res.details.destination.toLowerCase().includes(lowerCaseSearch) ||
          vehicle?.plate.toLowerCase().includes(lowerCaseSearch)
        );
      })
      .sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
  }, [reservations, searchTerm, vehicles]);

  return (
    <div className="animate-fade-in space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Gestión de Reservas</h2>
        <p className="text-slate-600 dark:text-slate-300 text-lg">Consultá y gestioná todas las reservas de la flota.</p>
      </div>

      <div className="max-w-xl mx-auto">
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por vehículo, contacto, destino..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-full bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-fyo-blue focus:outline-none transition-all duration-200 shadow-sm"
          />
        </div>
      </div>

      {sortedAndFilteredReservations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedAndFilteredReservations.map(res => {
            const vehicle = getVehicleByReservation(res);
            const isDeleting = deletingId === res.id;

            return (
              <div key={res.id} className={`bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 flex flex-col gap-4 transition-opacity duration-300 ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="flex justify-between items-start">
                  <div className="overflow-hidden">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white truncate" title={res.vehicleName}>{res.vehicleName}</h3>
                    {vehicle && <p className="text-sm text-slate-500 dark:text-slate-400 font-mono">{vehicle.plate}</p>}
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    {res.hotelDetails?.required && (
                        <div className="flex items-center gap-1.5 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-semibold px-2 py-1 rounded-full" title="Solicitud de hotel activa">
                            <BuildingOffice2Icon className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Hotel</span>
                        </div>
                    )}
                    <button 
                        onClick={() => handleDelete(res)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                        title="Cancelar Reserva"
                        disabled={isDeleting}
                    >
                        {isDeleting ? <SpinnerIcon className="w-5 h-5 text-red-600" /> : <TrashIcon className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                
                <div className="border-t border-slate-200 dark:border-slate-700"></div>

                <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    <div>
                        <span className="font-semibold">{res.startDate.toLocaleDateString()}</span> al <span className="font-semibold">{res.endDate.toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <UserIcon className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    <span className="truncate" title={res.details.name}><strong>Contacto:</strong> {res.details.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPinIcon className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    <span className="truncate" title={res.details.destination}><strong>Destino:</strong> {res.details.destination}</span>
                  </div>
                   <div className="flex items-start gap-3">
                    <UsersIcon className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                    <div className="w-full overflow-hidden">
                        <strong>Asistentes ({res.details.attendees.length}):</strong>
                        <ul className="list-disc list-inside mt-1 text-xs text-slate-500">
                          {res.details.attendees.map((name, index) => (
                            <li key={index} className="truncate">{name}</li>
                          ))}
                        </ul>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <ClipboardListIcon className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-slate-700 dark:text-slate-200 mb-2">
            {searchTerm ? 'No se encontraron reservas' : 'No hay reservas registradas'}
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            {searchTerm ? 'Intentá con otros términos de búsqueda.' : 'Cuando se cree una reserva, aparecerá aquí.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ReservationsListView;
