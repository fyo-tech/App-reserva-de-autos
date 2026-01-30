
import React, { useMemo, useState, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { Reservation, Vehicle } from '../types';
import KpiCard from './KpiCard';
import HorizontalBarChart from './charts/HorizontalBarChart';
import VerticalBarChart from './charts/VerticalBarChart';
import PieChart from './charts/PieChart';
import { ClipboardListIcon, TrendingUpIcon, CalendarIcon, DownloadIcon, SpinnerIcon, BuildingOffice2Icon } from './IconComponents';

interface DashboardProps {
  reservations: Reservation[];
  vehicles: Vehicle[];
}

type FilterRange = '7days' | '30days' | 'thisMonth' | 'all';

const Dashboard: React.FC<DashboardProps> = ({ reservations, vehicles }) => {
    const [filterRange, setFilterRange] = useState<FilterRange>('all');
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    
    const dashboardRef = useRef<HTMLDivElement>(null);

    const { filteredReservations, periodDates } = useMemo(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        let periodStart: Date;
        let periodEnd: Date = new Date();
        periodEnd.setHours(23, 59, 59, 999);
    
        if (filterRange === 'all') {
            if (reservations.length === 0) return { filteredReservations: [], periodDates: { start: now, end: now } };
            const validDates = reservations.filter(r => r.startDate instanceof Date && !isNaN(r.startDate.getTime()));
            if (validDates.length === 0) return { filteredReservations: [], periodDates: { start: now, end: now } };
            
            periodStart = new Date(Math.min(...validDates.map(r => r.startDate.getTime())));
            periodEnd = new Date(Math.max(...validDates.map(r => r.endDate.getTime())));
            return { filteredReservations: reservations, periodDates: { start: periodStart, end: periodEnd } };
        }
    
        if (filterRange === '7days') {
            periodStart = new Date(now);
            periodStart.setDate(now.getDate() - 7);
        } else if (filterRange === '30days') {
            periodStart = new Date(now);
            periodStart.setDate(now.getDate() - 30);
        } else { // 'thisMonth'
            periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
        }
        
        const filtered = reservations.filter(res => {
            const resStart = res.startDate;
            const resEnd = res.endDate;
            return resStart <= periodEnd && resEnd >= periodStart;
        });
    
        return { filteredReservations: filtered, periodDates: { start: periodStart, end: periodEnd } };
    }, [reservations, filterRange]);

    const stats = useMemo(() => {
        if (filteredReservations.length === 0) return null;

        const total = filteredReservations.length;
        let totalDays = 0;
        const usersMap = new Map<string, number>();
        const destMap = new Map<string, number>();
        const vehicleMap = new Map<string, number>();
        const hotelRequests = filteredReservations.filter(r => r.hotelDetails?.required).length;

        filteredReservations.forEach(r => {
            const diff = Math.max(1, Math.ceil((r.endDate.getTime() - r.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);
            totalDays += diff;
            usersMap.set(r.details.name, (usersMap.get(r.details.name) || 0) + 1);
            destMap.set(r.details.destination, (destMap.get(r.details.destination) || 0) + 1);
            vehicleMap.set(r.vehicleName, (vehicleMap.get(r.vehicleName) || 0) + diff);
        });

        const topUsers = Array.from(usersMap.entries()).map(([label, value]) => ({ label, value })).sort((a,b) => b.value - a.value).slice(0, 5);
        const topDests = Array.from(destMap.entries()).map(([label, value]) => ({ label, value })).sort((a,b) => b.value - a.value).slice(0, 5);
        const vehicleUsage = Array.from(vehicleMap.entries()).map(([label, value]) => ({ label, value })).sort((a,b) => b.value - a.value);

        return {
            total,
            avgDuration: (totalDays / total).toFixed(1),
            hotelRate: ((hotelRequests / total) * 100).toFixed(1) + '%',
            topUsers,
            topDests,
            vehicleUsage
        };
    }, [filteredReservations]);

    const handleDownloadPdf = async () => {
        if (!dashboardRef.current || isGeneratingPdf) return;
        setIsGeneratingPdf(true);
        try {
            const canvas = await html2canvas(dashboardRef.current, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const width = pdf.internal.pageSize.getWidth();
            const height = (canvas.height * width) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, width, height);
            pdf.save('Reporte_Flota_FYO.pdf');
        } catch (e) {
            console.error(e);
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in" ref={dashboardRef}>
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Dashboard</h2>
                    <p className="text-slate-500">Métricas de uso de la flota corporativa</p>
                </div>
                <button 
                    onClick={handleDownloadPdf} 
                    disabled={!stats || isGeneratingPdf}
                    className="bg-fyo-green text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 disabled:opacity-50"
                >
                    {isGeneratingPdf ? <SpinnerIcon className="animate-spin w-5 h-5" /> : <DownloadIcon className="w-5 h-5" />}
                    <span>Exportar Reporte</span>
                </button>
            </div>

            <div className="flex gap-2 bg-white dark:bg-slate-800 p-1 rounded-xl w-fit border dark:border-slate-700 shadow-sm">
                {(['all', 'thisMonth', '30days', '7days'] as FilterRange[]).map(r => (
                    <button 
                        key={r} 
                        onClick={() => setFilterRange(r)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filterRange === r ? 'bg-fyo-blue text-white shadow' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                    >
                        {r === 'all' ? 'Todo' : r === 'thisMonth' ? 'Mes Actual' : r === '30days' ? '30 días' : '7 días'}
                    </button>
                ))}
            </div>

            {!stats ? (
                <div className="bg-white dark:bg-slate-800 p-20 rounded-2xl text-center border-2 border-dashed border-slate-200 dark:border-slate-700">
                    <ClipboardListIcon className="w-16 h-16 mx-auto text-slate-200 mb-4" />
                    <p className="text-slate-500 font-medium">No hay datos suficientes para el período seleccionado.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <KpiCard title="Reservas Realizadas" value={stats.total} icon={<ClipboardListIcon className="text-fyo-blue" />} />
                        <KpiCard title="Duración Media" value={`${stats.avgDuration} días`} icon={<CalendarIcon className="text-fyo-cyan" />} />
                        <KpiCard title="Tasa de Hotel" value={stats.hotelRate} icon={<BuildingOffice2Icon className="text-fyo-green" />} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <HorizontalBarChart title="Top Usuarios" data={stats.topUsers} />
                        <VerticalBarChart title="Destinos Frecuentes" data={stats.topDests} />
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border dark:border-slate-700">
                        <PieChart title="Uso por Vehículo (Días Totales)" data={stats.vehicleUsage} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
