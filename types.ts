export interface Vehicle {
  id: number;
  name: string;
  plate: string;
  type: "pickup" | "sedan";
  capacity: number;
  fuelType: string;
  features?: string[];
}

export interface ReservationDetails {
  name: string;
  email: string;
  destination: string;
  attendees: string[]; // List of attendee names, first is the main contact
}

export interface HotelPassenger {
  name: string;
}

export interface HotelRoom {
  quantity: number;
  type: 'single' | 'double';
}

export interface HotelDetails {
  required: boolean;
  passengers: HotelPassenger[];
  checkIn: Date;
  checkOut: Date;
  rooms: HotelRoom[];
  suggestions: string;
  accountingAccount?: string;
}

export interface Reservation {
  id: string;
  vehicleId: number;
  vehicleName: string;
  details: ReservationDetails;
  startDate: Date;
  endDate: Date;
  hotelDetails?: HotelDetails;
}