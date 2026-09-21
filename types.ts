export type FlightStatus =
  | 'scheduled'
  | 'boarding'
  | 'departed'
  | 'en_route'
  | 'landed'
  | 'arrived'
  | 'delayed'
  | 'cancelled';

export interface Airport {
  code: string;
  city: string;
  name: string;
  tz: string;
  lat: number;
  lon: number;
}

export interface Airline {
  code: string;
  name: string;
  color: string;
}

export interface Flight {
  id: string;
  airline: Airline;
  number: string;
  from: Airport;
  to: Airport;
  scheduledDeparture: string;
  scheduledArrival: string;
  estimatedDeparture: string;
  estimatedArrival: string;
  actualDeparture?: string;
  actualArrival?: string;
  status: FlightStatus;
  delayMinutes: number;
  departureTerminal?: string;
  departureGate?: string;
  arrivalTerminal?: string;
  arrivalGate?: string;
  baggageClaim?: string;
  aircraft: { type: string; registration: string; age?: string };
  distanceMi: number;
  progress: number;
  altitudeFt?: number;
  speedMph?: number;
  seat?: string;
  confirmation?: string;
}
