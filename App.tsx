
import React, { useState, useMemo, useEffect } from 'react';
import type { Vehicle, Reservation, ReservationDetails, HotelDetails } from './types';
import Header from './components/Header';
import VehicleCard from './components/VehicleCard';
import ReservationForm from './components/ReservationForm';
import DateSelectionView from './components/DateSelectionView';
import HotelForm from './components/HotelForm';
import SuccessModal from './components/SuccessModal';
import ProgressStepper from './components/ProgressStepper';
import Dashboard from './components/Dashboard';
import ReservationsListView from './components/ReservationsListView';
import Footer from './components/Footer';
import { CarIcon, SearchIcon, SpinnerIcon } from './components/IconComponents';
import { supabase, supabaseError } from './lib/supabaseClient';

type AppStep = 'DATE_SELECTION' | 'LIST' | 'FORM' | 'HOTEL' | 'SUCCESS';
type AppView = 'RESERVATION' | 'RESERVATIONS_LIST' | 'DASHBOARD';

// --- Centralized Vehicle Data Corrections ---
const PLATE_CORRECTIONS: { [original: string]: string } = {
    'AE729GM': 'AD459VF',
    'AF110DH': 'AG919DW',
};

const NAME_CORRECTIONS: { [plate: string]: string } = {
    'AD459VF': 'Amarok AD459VF',
    'AH437DS': 'Amarok AH437DS',
    'AG919DW': 'Amarok AG919DW',
    'AG204HS': 'Corolla AG204HS',
    'AG491EI': 'Corolla AG491EI',
};

const deserializeHotelDetails = (hotelDetailsFromDb: any): HotelDetails | undefined => {
    if (hotelDetailsFromDb && (hotelDetailsFromDb.required || hotelDetailsFromDb.required === true)) {
        return {
            ...hotelDetailsFromDb,
            checkIn: new Date(hotelDetailsFromDb.checkIn),
            checkOut: new Date(hotelDetailsFromDb.checkOut),
        };
    }
    return undefined;
};

const App: React.FC = () => {
    const [step, setStep] = useState<AppStep>('DATE_SELECTION');
    const [view, setView] = useState<AppView>('RESERVATION');
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    
    const [tripDates, setTripDates] = useState<{ startDate: Date, endDate: Date } | null>(null);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const [reservationDetails, setReservationDetails] = useState<ReservationDetails | null>(null);
    const [lastReservation, setLastReservation] = useState<Reservation | null>(null);
    
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("all");

    // Fetch initial data
    useEffect(() => {
        if (supabaseError) {
            setError(supabaseError);
            setIsLoading(false);
            return;
        }

        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                if (!supabase) throw new Error("Supabase client not initialized.");

                // 1. Fetch Vehicles
                const { data: vehiclesData, error: vehiclesError } = await supabase
                    .from('vehicles')
                    .select('*')
                    .order('id');
                if (vehiclesError) throw vehiclesError;
                
                const correctedVehicles = (vehiclesData || []).map(v => {
                    const vehicle = { 
                        ...v,
                        fuelType: v.fuel_type || v.fuelType // Support both cases
                    };
                    const originalPlate = vehicle.plate?.toUpperCase();

                    if (originalPlate && PLATE_CORRECTIONS[originalPlate]) {
                        vehicle.plate = PLATE_CORRECTIONS[originalPlate];
                    }
                    
                    const finalPlate = vehicle.plate?.toUpperCase();
                    if (finalPlate && NAME_CORRECTIONS[finalPlate]) {
                        vehicle.name = NAME_CORRECTIONS[finalPlate];
                    }
                    
                    return vehicle;
                });
                
                setVehicles(correctedVehicles);

                // 2. Fetch Reservations
                const { data: reservationsData, error: reservationsError } = await supabase
                    .from('reservations')
                    .select('*');
                if (reservationsError) throw reservationsError;

                const formattedReservations = (reservationsData || []).map(r => {
                    const vId = r.vehicle_id || r.vehicleId;
                    const vehicle = correctedVehicles.find(v => v.id === vId);
                    const vehicleName = vehicle ? vehicle.name : 'Vehículo Desconocido';
                    
                    // Robust date conversion
                    const rawStart = r.start_date || r.startDate;
                    const rawEnd = r.end_date || r.endDate;
                    
                    return {
                        id: r.id,
                        vehicleId: vId,
                        vehicleName: vehicleName,
                        details: {
                            name: r.details?.name || (r.attendees ? r.attendees[0] : 'Sin Nombre'),
                            email: r.user_email || r.userEmail || '',
                            destination: r.destination || '',
                            attendees: r.attendees || [],
                        },
                        startDate: new Date(rawStart + 'T12:00:00'),
                        endDate: new Date(rawEnd + 'T12:00:00'),
                        hotelDetails: deserializeHotelDetails(r.hotel_details || r.hotelDetails),
                    };
                });
                setReservations(formattedReservations);

            } catch (err: any) {
                console.error("Error fetching data:", err);
                setError(err?.message || 'Error al conectar con la base de datos.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // Real-time listener
    useEffect(() => {
        if (!supabase || vehicles.length === 0) return;

        const channel = supabase
          .channel('realtime-reservations')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'reservations' },
            async () => {
                // For simplicity and to ensure we have vehicle joins, re-fetch all
                const { data } = await supabase.from('reservations').select('*');
                if (data) {
                    const formatted = data.map(r => {
                        const vId = r.vehicle_id || r.vehicleId;
                        const vehicle = vehicles.find(v => v.id === vId);
                        return {
                            id: r.id,
                            vehicleId: vId,
                            vehicleName: vehicle ? vehicle.name : 'Vehículo Desconocido',
                            details: {
                                name: r.details?.name || (r.attendees ? r.attendees[0] : 'Sin Nombre'),
                                email: r.user_email || r.userEmail || '',
                                destination: r.destination || '',
                                attendees: r.attendees || [],
                            },
                            startDate: new Date((r.start_date || r.startDate) + 'T12:00:00'),
                            endDate: new Date((r.end_date || r.endDate) + 'T12:00:00'),
                            hotelDetails: deserializeHotelDetails(r.hotel_details || r.hotelDetails),
                        };
                    });
                    setReservations(formatted);
                }
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
    }, [vehicles]);

    const handleDatesSubmit = (startDate: Date, endDate: Date) => {
        setTripDates({ startDate, endDate });
        setStep('LIST');
    };

    const handleSelectVehicle = (vehicle: Vehicle) => {
        setSelectedVehicle(vehicle);
        setStep('FORM');
    };

    const handleFormSubmit = (details: ReservationDetails) => {
        setReservationDetails(details);
        setStep('HOTEL');
    };

    const handleHotelFormSubmit = async (hotelDetails: HotelDetails) => {
        if (!selectedVehicle || !reservationDetails || !tripDates || !supabase || isSubmitting) return;
        
        setIsSubmitting(true);
        try {
            const { startDate, endDate } = tripDates;
            
            // Format for database
            const payload = {
                vehicle_id: selectedVehicle.id,
                user_email: reservationDetails.email,
                destination: reservationDetails.destination,
                attendees: reservationDetails.attendees,
                start_date: startDate.toISOString().split('T')[0],
                end_date: endDate.toISOString().split('T')[0],
                hotel_details: hotelDetails.required ? {
                    ...hotelDetails,
                    checkIn: hotelDetails.checkIn.toISOString(),
                    checkOut: hotelDetails.checkOut.toISOString(),
                } : { required: false }
            };
    
            const { data, error } = await supabase
                .from('reservations')
                .insert([payload])
                .select()
                .single();

            if (error) throw error;
            
            const newRes: Reservation = {
                id: data.id,
                vehicleId: selectedVehicle.id,
                vehicleName: selectedVehicle.name,
                details: reservationDetails,
                startDate,
                endDate,
                hotelDetails,
            };

            setLastReservation(newRes);
            setStep('SUCCESS');

            // Trigger email (async, don't block UI)
            supabase.functions.invoke('send-confirmation-email', {
                body: { reservation: payload },
            }).catch(console.error);

        } catch (err: any) {
            console.error("Error saving reservation:", err);
            alert(`Error: ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBack = () => {
        if (step === 'LIST') {
            setStep('DATE_SELECTION');
            setTripDates(null);
        } else if (step === 'FORM') {
            setStep('LIST');
            setSelectedVehicle(null);
        } else if (step === 'HOTEL') {
            setStep('FORM');
        }
    };
    
    const handleNewReservation = () => {
        setStep('DATE_SELECTION');
        setSelectedVehicle(null);
        setReservationDetails(null);
        setTripDates(null);
        setLastReservation(null);
        setView('RESERVATION');
    };

    const filteredVehicles = useMemo(() => {
        let available = vehicles.filter((v) => {
            const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) || v.plate.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = filterType === "all" || v.type === filterType;
            return matchesSearch && matchesType;
        });

        if (tripDates) {
            const { startDate, endDate } = tripDates;
            available = available.filter(v => {
                return !reservations.some(res => {
                    if (res.vehicleId !== v.id) return false;
                    return startDate <= res.endDate && endDate >= res.startDate;
                });
            });
        }
        return available;
    }, [vehicles, searchTerm, filterType, tripDates, reservations]);

    const renderContent = () => {
        if (isLoading) return (
            <div className="flex flex-col items-center justify-center h-64">
                <SpinnerIcon className="h-10 w-10 text-fyo-blue animate-spin" />
                <p className="mt-4 text-slate-500">Sincronizando flota...</p>
            </div>
        );

        if (error) return (
            <div className="text-center p-8 bg-red-50 rounded-xl border border-red-200">
                <p className="text-red-600 font-bold mb-4">{error}</p>
                <button onClick={() => window.location.reload()} className="bg-fyo-blue text-white px-6 py-2 rounded-lg">Reintentar</button>
            </div>
        );

        if (view === 'DASHBOARD') return <Dashboard reservations={reservations} vehicles={vehicles} />;
        if (view === 'RESERVATIONS_LIST') return <ReservationsListView reservations={reservations} vehicles={vehicles} />;

        switch (step) {
            case 'DATE_SELECTION': return <DateSelectionView reservations={reservations} onDatesSubmit={handleDatesSubmit} />;
            case 'FORM': return selectedVehicle && <ReservationForm vehicle={selectedVehicle} onSubmit={handleFormSubmit} onBack={handleBack} tripDates={tripDates} />;
            case 'HOTEL': return tripDates && reservationDetails && <HotelForm vehicleReservationDates={tripDates} reservationDetails={reservationDetails} onSubmit={handleHotelFormSubmit} onBack={handleBack} isSubmitting={isSubmitting} />;
            case 'SUCCESS': return lastReservation && <SuccessModal reservation={lastReservation} onNewReservation={handleNewReservation} onViewReservations={() => setView('RESERVATIONS_LIST')} />;
            case 'LIST':
            default: return (
                <div className="animate-fade-in">
                    <div className="mb-8 text-center">
                        <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Vehículos Disponibles</h2>
                        <div className="inline-block bg-fyo-blue/10 px-4 py-2 rounded-full text-fyo-blue font-bold text-sm">
                            {tripDates?.startDate.toLocaleDateString()} — {tripDates?.endDate.toLocaleDateString()}
                        </div>
                    </div>
                    <div className="mb-8 max-w-2xl mx-auto flex gap-4">
                        <div className="relative flex-grow">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input type="text" placeholder="Buscar modelo o patente..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-fyo-blue" />
                        </div>
                        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="px-4 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 outline-none">
                            <option value="all">Todos</option>
                            <option value="pickup">Camionetas</option>
                            <option value="sedan">Sedanes</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {filteredVehicles.map(v => <VehicleCard key={v.id} vehicle={v} onReserve={handleSelectVehicle} />)}
                    </div>
                    {filteredVehicles.length === 0 && (
                        <div className="text-center py-20 text-slate-400">
                            <CarIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
                            <p>No hay vehículos disponibles para estas fechas.</p>
                        </div>
                    )}
                </div>
            );
        }
    };
    
    return (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
            <Header view={view} onViewChange={setView} />
            {view === 'RESERVATION' && step !== 'SUCCESS' && (
                <div className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 py-6">
                    <ProgressStepper currentStep={step} />
                </div>
            )}
            <main className="container mx-auto px-4 py-8 flex-grow">
                {renderContent()}
            </main>
            <Footer />
        </div>
    );
};

export default App;
