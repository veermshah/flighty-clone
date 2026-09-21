import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, PropsWithChildren, useContext, useEffect, useReducer } from 'react';

import { seedFlights } from '@/lib/mockData';
import { Flight } from '@/types';

const STORAGE_KEY = 'flighty.flights.v1';

type State = { flights: Flight[] };
type Action =
  | { type: 'replace'; flights: Flight[] }
  | { type: 'add'; flight: Flight }
  | { type: 'remove'; id: string }
  | { type: 'tick' };

function reducer(state: State, action: Action): State {
  if (action.type === 'replace') return { flights: action.flights };
  if (action.type === 'add') return { flights: [action.flight, ...state.flights] };
  if (action.type === 'remove') return { flights: state.flights.filter((flight) => flight.id !== action.id) };
  const now = Date.now();
  return {
    flights: state.flights.map((flight) => {
      if (flight.status === 'en_route') {
        const progress = Math.min(1, flight.progress + 0.003);
        if (progress >= 1) {
          return { ...flight, progress: 1, status: 'landed', actualArrival: new Date(now).toISOString(), altitudeFt: 0, speedMph: 0 };
        }
        return {
          ...flight,
          progress,
          altitudeFt: Math.max(30_000, (flight.altitudeFt ?? 35_000) + Math.round((Math.random() - 0.5) * 500)),
          speedMph: Math.max(430, (flight.speedMph ?? 520) + Math.round((Math.random() - 0.5) * 14)),
        };
      }
      if (flight.status === 'scheduled' && new Date(flight.estimatedDeparture).getTime() <= now) {
        return { ...flight, status: 'departed', actualDeparture: new Date(now).toISOString(), progress: 0.015 };
      }
      return flight;
    }),
  };
}

type FlightsContextValue = {
  flights: Flight[];
  addFlight: (flight: Flight) => void;
  removeFlight: (id: string) => void;
  getFlight: (id: string) => Flight | undefined;
};

const FlightsContext = createContext<FlightsContextValue | null>(null);

export function FlightsProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(reducer, { flights: seedFlights });

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as Flight[];
          if (Array.isArray(parsed) && parsed.length) dispatch({ type: 'replace', flights: parsed });
        } catch {
          // Keep the deterministic seed data when storage is malformed.
        }
      }
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state.flights)).catch(() => undefined);
  }, [state.flights]);

  useEffect(() => {
    const interval = setInterval(() => dispatch({ type: 'tick' }), 4_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <FlightsContext.Provider
      value={{
        flights: state.flights,
        addFlight: (flight) => dispatch({ type: 'add', flight }),
        removeFlight: (id) => dispatch({ type: 'remove', id }),
        getFlight: (id) => state.flights.find((flight) => flight.id === id),
      }}>
      {children}
    </FlightsContext.Provider>
  );
}

export function useFlights(): FlightsContextValue {
  const value = useContext(FlightsContext);
  if (!value) throw new Error('useFlights must be used inside FlightsProvider');
  return value;
}
