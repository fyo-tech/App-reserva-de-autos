import React from 'react';
import { ChartBarIcon, CarIcon, ClipboardListIcon } from './IconComponents';

const FyoLogo: React.FC = () => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="FYO Logo"
  >
    {/* Rounded square background using fyo-cyan */}
    <rect width="100" height="100" rx="20" fill="#00A9E0" />
    
    {/* Text "FYO" */}
    <text
      x="50%"
      y="50%"
      dy=".3em"
      textAnchor="middle"
      fill="white"
      fontSize="45"
      fontWeight="bold"
      fontFamily="Poppins, sans-serif"
      letterSpacing="-2"
    >
      FYO
    </text>
  </svg>
);

interface HeaderProps {
  view: 'RESERVATION' | 'RESERVATIONS_LIST' | 'DASHBOARD';
  onViewChange: (view: 'RESERVATION' | 'RESERVATIONS_LIST' | 'DASHBOARD') => void;
}


const Header: React.FC<HeaderProps> = ({ view, onViewChange }) => {
  const navButtonClasses = "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300";
  const activeClasses = "bg-fyo-blue text-white shadow";
  const inactiveClasses = "bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700";

  return (
    <header className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm shadow-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
            <FyoLogo />
            <div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">Gestión de Vehículos Corporativos</h1>
            </div>
            </div>
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900/50 p-1 rounded-full">
                <button
                onClick={() => onViewChange('RESERVATION')}
                className={`${navButtonClasses} ${view === 'RESERVATION' ? activeClasses : inactiveClasses}`}
                aria-pressed={view === 'RESERVATION'}
                >
                <CarIcon className="w-5 h-5" />
                <span>Reservar</span>
                </button>
                <button
                onClick={() => onViewChange('RESERVATIONS_LIST')}
                className={`${navButtonClasses} ${view === 'RESERVATIONS_LIST' ? activeClasses : inactiveClasses}`}
                aria-pressed={view === 'RESERVATIONS_LIST'}
                >
                <ClipboardListIcon className="w-5 h-5" />
                <span>Reservas</span>
                </button>
                <button
                onClick={() => onViewChange('DASHBOARD')}
                className={`${navButtonClasses} ${view === 'DASHBOARD' ? activeClasses : inactiveClasses}`}
                aria-pressed={view === 'DASHBOARD'}
                >
                <ChartBarIcon className="w-5 h-5" />
                <span>Dashboard</span>
                </button>
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;