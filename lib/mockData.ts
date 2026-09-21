import { Airline, Airport, Flight, FlightStatus } from '@/types';

export const airports: Record<string, Airport> = {
  SFO: { code: 'SFO', city: 'San Francisco', name: 'San Francisco International', tz: 'America/Los_Angeles', lat: 37.6213, lon: -122.379 },
  LAX: { code: 'LAX', city: 'Los Angeles', name: 'Los Angeles International', tz: 'America/Los_Angeles', lat: 33.9416, lon: -118.4085 },
  JFK: { code: 'JFK', city: 'New York', name: 'John F. Kennedy International', tz: 'America/New_York', lat: 40.6413, lon: -73.7781 },
  EWR: { code: 'EWR', city: 'Newark', name: 'Newark Liberty International', tz: 'America/New_York', lat: 40.6895, lon: -74.1745 },
  ORD: { code: 'ORD', city: 'Chicago', name: "O'Hare International", tz: 'America/Chicago', lat: 41.9742, lon: -87.9073 },
  DFW: { code: 'DFW', city: 'Dallas', name: 'Dallas/Fort Worth International', tz: 'America/Chicago', lat: 32.8998, lon: -97.0403 },
  SEA: { code: 'SEA', city: 'Seattle', name: 'Seattle-Tacoma International', tz: 'America/Los_Angeles', lat: 47.4502, lon: -122.3088 },
  DEN: { code: 'DEN', city: 'Denver', name: 'Denver International', tz: 'America/Denver', lat: 39.8561, lon: -104.6737 },
  ATL: { code: 'ATL', city: 'Atlanta', name: 'Hartsfield-Jackson Atlanta International', tz: 'America/New_York', lat: 33.6407, lon: -84.4277 },
  BOS: { code: 'BOS', city: 'Boston', name: 'Boston Logan International', tz: 'America/New_York', lat: 42.3656, lon: -71.0096 },
  LHR: { code: 'LHR', city: 'London', name: 'London Heathrow', tz: 'Europe/London', lat: 51.47, lon: -0.4543 },
  NRT: { code: 'NRT', city: 'Tokyo', name: 'Narita International', tz: 'Asia/Tokyo', lat: 35.772, lon: 140.3929 },
  YYZ: { code: 'YYZ', city: 'Toronto', name: 'Toronto Pearson International', tz: 'America/Toronto', lat: 43.6777, lon: -79.6248 },
};

export const airlines: Record<string, Airline> = {
  UA: { code: 'UA', name: 'United Airlines', color: '#0A5EB7' },
  AA: { code: 'AA', name: 'American Airlines', color: '#2D6DB5' },
  DL: { code: 'DL', name: 'Delta Air Lines', color: '#D71939' },
  AS: { code: 'AS', name: 'Alaska Airlines', color: '#005C5C' },
  B6: { code: 'B6', name: 'JetBlue', color: '#153B8D' },
  WN: { code: 'WN', name: 'Southwest', color: '#304CB2' },
  BA: { code: 'BA', name: 'British Airways', color: '#1A2B63' },
  AC: { code: 'AC', name: 'Air Canada', color: '#D82939' },
};

const minutes = (value: number) => value * 60_000;
const iso = (now: number, offsetMinutes: number) => new Date(now + offsetMinutes * 60_000).toISOString();

const routeDistance = (from: Airport, to: Airport) =>
  Math.round(Math.hypot((to.lat - from.lat) * 69, (to.lon - from.lon) * 54));

const makeFlight = (
  id: string,
  airlineCode: string,
  number: string,
  fromCode: string,
  toCode: string,
  now: number,
  departureOffset: number,
  arrivalOffset: number,
  status: FlightStatus,
  delayMinutes = 0,
  extras: Partial<Flight> = {},
): Flight => {
  const from = airports[fromCode];
  const to = airports[toCode];
  const scheduledDeparture = iso(now, departureOffset);
  const scheduledArrival = iso(now, arrivalOffset);
  return {
    id,
    airline: airlines[airlineCode],
    number: `${airlineCode} ${number}`,
    from,
    to,
    scheduledDeparture,
    scheduledArrival,
    estimatedDeparture: iso(now, departureOffset + delayMinutes),
    estimatedArrival: iso(now, arrivalOffset + delayMinutes),
    status,
    delayMinutes,
    aircraft: { type: 'Boeing 737-900', registration: 'N873UA', age: '6 years' },
    distanceMi: routeDistance(from, to),
    progress: status === 'en_route' ? 0.55 : status === 'landed' || status === 'arrived' ? 1 : 0,
    departureTerminal: '3',
    departureGate: 'F12',
    arrivalTerminal: '2',
    arrivalGate: 'B18',
    ...extras,
  };
};

const now = Date.now();
export const seedFlights: Flight[] = [
  makeFlight('seed-en-route', 'UA', '1234', 'SFO', 'JFK', now, -165, 180, 'en_route', 0, {
    aircraft: { type: 'Boeing 787-9', registration: 'N26952', age: '4 years' },
    altitudeFt: 36_000,
    speedMph: 540,
    seat: '12A',
    confirmation: 'FLY7Y2',
  }),
  makeFlight('seed-delayed', 'AA', '482', 'LAX', 'ORD', now, 35, 275, 'delayed', 47, {
    aircraft: { type: 'Airbus A321', registration: 'N178US', age: '8 years' },
    departureTerminal: '4',
    departureGate: '42A',
    arrivalTerminal: '3',
    arrivalGate: 'K6',
    seat: '7F',
    confirmation: 'AA82KQ',
  }),
  makeFlight('seed-tomorrow', 'DL', '1688', 'ATL', 'BOS', now, 24 * 60 + 125, 24 * 60 + 255, 'scheduled', 0, {
    aircraft: { type: 'Airbus A220-100', registration: 'N104DU', age: '3 years' },
    departureTerminal: 'S',
    departureGate: 'A27',
    arrivalTerminal: 'A',
    arrivalGate: 'B9',
    seat: '14C',
    confirmation: 'DL4P9M',
  }),
  makeFlight('seed-landed', 'AS', '224', 'SEA', 'LAX', now, -420, -300, 'landed', 0, {
    actualDeparture: iso(now, -405),
    actualArrival: iso(now, -300),
    baggageClaim: '7',
    aircraft: { type: 'Boeing 737-9 MAX', registration: 'N932AK', age: '2 years' },
    departureTerminal: 'N',
    departureGate: 'N14',
    arrivalTerminal: '6',
    arrivalGate: '65A',
  }),
  makeFlight('seed-arrived', 'BA', '286', 'SFO', 'LHR', now, -10_080, -9_700, 'arrived', 0, {
    actualDeparture: iso(now, -10_060),
    actualArrival: iso(now, -9_700),
    aircraft: { type: 'Boeing 777-300ER', registration: 'G-STBL', age: '10 years' },
    distanceMi: 5367,
    departureTerminal: 'I',
    departureGate: 'A4',
    arrivalTerminal: '5',
    arrivalGate: 'B32',
    baggageClaim: '6',
    seat: '32K',
    confirmation: 'BA1L8M',
  }),
];

const popularRoutes: Array<[string, string, string, string]> = [
  ['UA', '1234', 'SFO', 'JFK'],
  ['AA', '482', 'LAX', 'ORD'],
  ['DL', '1688', 'ATL', 'BOS'],
  ['AC', '743', 'YYZ', 'LHR'],
];

export function generateFlightSchedule(query: string, date: Date): Flight[] {
  const normalized = query.trim().toUpperCase().replace(/\s+TO\s+|\s*[-→]\s*/g, ' ');
  const compact = normalized.replace(/\s+/g, '');
  const matches = popularRoutes.filter(([carrier, number, from, to]) => {
    if (!normalized) return true;
    return `${carrier}${number}`.includes(compact) || `${carrier} ${number}`.includes(normalized) || `${from} ${to}`.includes(normalized) || `${to} ${from}`.includes(normalized);
  });
  const base = date.getTime();
  return matches.slice(0, 6).map(([carrier, number, from, to], index) =>
    makeFlight(
      `search-${carrier}-${number}-${from}-${to}-${date.toISOString().slice(0, 10)}`,
      carrier,
      number,
      from,
      to,
      base,
      90 + index * 115,
      270 + index * 115,
      'scheduled',
      0,
      { aircraft: { type: index % 2 ? 'Airbus A321neo' : 'Boeing 737-900', registration: `N${(700 + index * 31).toString()}UA`, age: `${index + 2} years` } },
    ),
  );
}
