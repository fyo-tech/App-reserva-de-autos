
import React from 'react';
import type { Vehicle } from '../types';
import { UsersIcon, FuelIcon, StarIcon, CarIcon } from './IconComponents';

interface VehicleCardProps {
  vehicle: Vehicle;
  onReserve: (vehicle: Vehicle) => void;
}

const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, onReserve }) => {
  const typeLabel = vehicle.type === 'pickup' ? 'Camioneta' : 'Sedán';

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 ease-in-out flex flex-col border border-slate-200 dark:border-slate-700 hover:-translate-y-1 animate-fade-in">
      <div className="w-full h-32 flex items-center justify-center bg-slate-100 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-700">
         <span className="text-6xl">{vehicle.type === 'pickup' ? '🛻' : '🚗'}</span>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-slate-800 dark:text-white">{vehicle.name}</h3>
            <span className="bg-fyo-cyan text-white text-xs font-bold px-2.5 py-1 rounded-full capitalize">{typeLabel}</span>
        </div>

        <div className="flex items-center text-sm text-slate-600 dark:text-slate-300 space-x-4 mb-4">
          <div className="flex items-center">
            <UsersIcon className="w-5 h-5 mr-2 text-fyo-blue" />
            <span>{vehicle.capacity} Asientos</span>
          </div>
          <div className="flex items-center">
            <FuelIcon className="w-5 h-5 mr-2 text-fyo-blue" />
            <span>{vehicle.fuelType}</span>
          </div>
        </div>
        
        {vehicle.features && vehicle.features.length > 0 && (
            <div className="mb-4 space-y-2">
                {vehicle.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-sm text-green-600 dark:text-green-400">
                        <StarIcon className="w-5 h-5 mr-2" />
                        <span className="font-semibold">{feature}</span>
                    </div>
                ))}
            </div>
        )}

        <div className="mt-auto">
          <button
            onClick={() => onReserve(vehicle)}
            className="w-full flex items-center justify-center gap-2 bg-fyo-blue hover:bg-opacity-90 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-fyo-blue/50"
          >
            <CarIcon className="w-5 h-5" />
            <span>Reservar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;
