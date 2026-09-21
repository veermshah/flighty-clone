import { Flight } from '@/types';
import Colors from '@/constants/Colors';

export function formatTime(iso: string, tz?: string): string {
  return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: tz }).format(new Date(iso));
}

export function formatDateLabel(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const diff = Math.round((day - start) / 86_400_000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  return new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(date);
}

export function statusLabel(flight: Flight): string {
  switch (flight.status) {
    case 'delayed': return `Delayed ${flight.delayMinutes}m`;
    case 'en_route': return 'En Route';
    case 'boarding': return 'Boarding';
    case 'departed': return 'Departed';
    case 'landed': return 'Landed';
    case 'arrived': return 'Arrived';
    case 'cancelled': return 'Cancelled';
    default: return 'On Time';
  }
}

export function statusColor(flight: Flight): string {
  if (flight.status === 'delayed' || flight.status === 'cancelled') return Colors.delayed;
  if (flight.status === 'en_route' || flight.status === 'departed') return Colors.info;
  if (flight.status === 'landed' || flight.status === 'arrived' || flight.status === 'boarding') return Colors.onTime;
  return Colors.textSecondary;
}

export function durationLabel(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return hours ? `${hours}h ${mins.toString().padStart(2, '0')}m` : `${mins}m`;
}

export function minutesUntil(iso: string): number {
  return Math.max(0, Math.round((new Date(iso).getTime() - Date.now()) / 60_000));
}
