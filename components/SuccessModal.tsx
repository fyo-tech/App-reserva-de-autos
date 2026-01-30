
import React, { useRef, useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { Reservation } from '../types';
import { 
  CheckCircleIcon, 
  DownloadIcon, 
  CarIcon, 
  BuildingOffice2Icon, 
  SpinnerIcon,
  MapPinIcon,
  CalendarIcon,
  UsersIcon,
  ClipboardListIcon
} from './IconComponents';

interface SuccessModalProps {
  reservation: Reservation;
  onNewReservation: () => void;
  onViewReservations?: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ reservation, onNewReservation, onViewReservations }) => {
  const [isExporting, setIsExporting] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);
  const { hotelDetails } = reservation;

  const handleDownloadPDF = async () => {
    if (!receiptRef.current) return;
    setIsExporting(true);
    
    try {
      const element = receiptRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save(`Reserva_FYO_${reservation.id.slice(0, 8)}.pdf`);
    } catch (error) {
      console.error("Error al generar PDF:", error);
      alert("No se pudo generar el comprobante. Intentá nuevamente.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Mensaje de Éxito Principal */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-fyo-green/10 rounded-full mb-4">
          <CheckCircleIcon className="w-12 h-12 text-fyo-green" />
        </div>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">¡Reserva Confirmada con Éxito!</h2>
        <p className="text-slate-600 dark:text-slate-300">Se ha enviado un correo de confirmación a <span className="font-bold text-fyo-blue dark:text-fyo-cyan">{reservation.details.email}</span>.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lado Izquierdo: El Comprobante (Lo que se exporta a PDF) */}
        <div className="lg:col-span-2">
          <div 
            ref={receiptRef}
            className="bg-white p-8 rounded-xl shadow-xl border border-slate-200 text-slate-800"
          >
            {/* Header Comprobante */}
            <div className="flex justify-between items-start border-b-2 border-fyo-blue pb-6 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-fyo-cyan rounded flex items-center justify-center text-white font-bold text-xs">FYO</div>
                  <h3 className="text-xl font-black text-fyo-blue tracking-tighter">COMPROBANTE DE RESERVA</h3>
                </div>
                <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Reserva ID: #{reservation.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Fecha de Emisión</p>
                <p className="font-bold">{new Date().toLocaleDateString()}</p>
              </div>
            </div>

            <div className="space-y-8">
              {/* Sección Vehículo */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <CarIcon className="w-5 h-5 text-fyo-blue" />
                  <h4 className="font-bold text-fyo-blue uppercase text-sm tracking-wider">Detalles del Vehículo</h4>
                </div>
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <div>
                    <p className="text-xs text-slate-500 uppercase">Vehículo</p>
                    <p className="font-bold">{reservation.vehicleName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase">Patente</p>
                    <p className="font-bold">OFICIAL</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase">Salida</p>
                    <p className="font-bold">{reservation.startDate.toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase">Regreso</p>
                    <p className="font-bold">{reservation.endDate.toLocaleDateString()}</p>
                  </div>
                </div>
              </section>

              {/* Sección Pasajeros */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <UsersIcon className="w-5 h-5 text-fyo-blue" />
                  <h4 className="font-bold text-fyo-blue uppercase text-sm tracking-wider">Conductor y Acompañantes</h4>
                </div>
                <div className="space-y-2">
                  {reservation.details.attendees.map((name, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                      <span className="text-sm">{name}</span>
                      <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-bold uppercase">
                        {i === 0 ? 'Conductor Principal' : 'Acompañante'}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Sección Destino */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <MapPinIcon className="w-5 h-5 text-fyo-blue" />
                  <h4 className="font-bold text-fyo-blue uppercase text-sm tracking-wider">Destino del Viaje</h4>
                </div>
                <p className="text-lg font-bold text-slate-800">{reservation.details.destination}</p>
              </section>

              {/* Sección Hotelería (Solo si aplica) */}
              {hotelDetails && hotelDetails.required && (
                <section className="bg-fyo-cyan/5 border-l-4 border-fyo-cyan p-6 rounded-r-lg">
                  <div className="flex items-center gap-2 mb-4">
                    <BuildingOffice2Icon className="w-5 h-5 text-fyo-cyan" />
                    <h4 className="font-bold text-fyo-cyan uppercase text-sm tracking-wider">Servicio de Hotelería</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase">Check-in</p>
                      <p className="font-bold">{hotelDetails.checkIn.toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase">Check-out</p>
                      <p className="font-bold">{hotelDetails.checkOut.toLocaleDateString()}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[10px] text-slate-500 uppercase">Habitaciones</p>
                      <p className="font-bold">
                        {hotelDetails.rooms.map(r => `${r.quantity} x ${r.type === 'single' ? 'Single' : 'Doble'}`).join(', ')}
                      </p>
                    </div>
                  </div>
                </section>
              )}

              {/* Pie del Comprobante */}
              <div className="pt-8 border-t border-slate-100 text-center">
                <p className="text-[10px] text-slate-400">Este es un documento generado automáticamente por el Sistema de Flota FYO.</p>
                <p className="text-[10px] text-slate-400">Para soporte contactar a gruporecepcion@fyo.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lado Derecho: Acciones Rápidas */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
            <h4 className="font-bold text-slate-800 dark:text-white mb-4">Acciones</h4>
            
            <button
              onClick={handleDownloadPDF}
              disabled={isExporting}
              className="w-full flex items-center justify-center gap-3 bg-fyo-blue hover:bg-fyo-blue/90 text-white font-bold py-3 px-4 rounded-lg transition-all mb-3 shadow-md"
            >
              {isExporting ? <SpinnerIcon className="w-5 h-5 animate-spin" /> : <DownloadIcon className="w-5 h-5" />}
              <span>Descargar Comprobante</span>
            </button>

            <button
              onClick={onNewReservation}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-fyo-blue border-2 border-fyo-blue font-bold py-3 px-4 rounded-lg transition-all mb-3"
            >
              <CarIcon className="w-5 h-5" />
              <span>Hacer Nueva Reserva</span>
            </button>

            <button
              onClick={onViewReservations}
              className="w-full flex items-center justify-center gap-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-white font-bold py-3 px-4 rounded-lg transition-all"
            >
              <ClipboardListIcon className="w-5 h-5" />
              <span>Ver Mis Reservas</span>
            </button>
          </div>

          <div className="bg-fyo-cyan/10 border border-fyo-cyan/20 p-6 rounded-xl">
            <p className="text-sm text-fyo-blue dark:text-fyo-cyan font-medium leading-relaxed">
              <strong>Recuerda:</strong> El combustible debe estar siempre por encima de 1/4 al devolver la unidad y se debe reportar cualquier novedad en el grupo de WhatsApp.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
