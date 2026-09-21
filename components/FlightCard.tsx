import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import Colors from '@/constants/Colors';
import { durationLabel, formatTime, statusColor, statusLabel } from '@/lib/format';
import { Flight } from '@/types';
import { RouteProgress } from './RouteProgress';

export function FlightCard({ flight, onPress, onLongPress }: { flight: Flight; onPress: () => void; onLongPress: () => void }) {
  const color = statusColor(flight);
  const duration = Math.max(1, Math.round(flight.distanceMi / 8.2));
  const active = flight.status === 'en_route' || flight.status === 'departed' || flight.status === 'landed' || flight.status === 'arrived';
  const delayed = flight.delayMinutes > 0;
  return (
    <Pressable style={({ pressed }) => [styles.card, pressed && styles.pressed]} onPress={onPress} onLongPress={onLongPress} delayLongPress={550}>
      <View style={styles.topRow}>
        <View style={[styles.airlineBadge, { backgroundColor: flight.airline.color }]}>
          <Text style={styles.airlineCode}>{flight.airline.code}</Text>
        </View>
        <View style={styles.flightMeta}>
          <Text style={styles.flightNumber}>{flight.number}</Text>
          <Text style={styles.airlineName}>{flight.airline.name}</Text>
        </View>
        <View style={[styles.statusPill, { backgroundColor: `${color}25` }]}>
          <Text style={[styles.statusText, { color }]}>{statusLabel(flight)}</Text>
        </View>
      </View>
      <View style={styles.routeRow}>
        <View style={styles.airport}>
          <Text style={styles.code}>{flight.from.code}</Text>
          <Text style={styles.city}>{flight.from.city}</Text>
        </View>
        <RouteProgress progress={flight.progress} active={active} />
        <View style={[styles.airport, styles.destination]}>
          <Text style={styles.code}>{flight.to.code}</Text>
          <Text style={styles.city}>{flight.to.city}</Text>
        </View>
      </View>
      <View style={styles.bottomRow}>
        <View style={styles.timeGroup}>
          <Text style={styles.time}>{formatTime(flight.estimatedDeparture, flight.from.tz)}</Text>
          {delayed && <Text style={styles.struckTime}>{formatTime(flight.scheduledDeparture, flight.from.tz)}</Text>}
        </View>
        <View style={styles.duration}>
          <Ionicons name="airplane-outline" size={13} color={Colors.textSecondary} />
          <Text style={styles.durationText}>{durationLabel(duration)}</Text>
        </View>
        <View style={[styles.timeGroup, styles.arrivalTime]}>
          <Text style={styles.time}>{formatTime(flight.estimatedArrival, flight.to.tz)}</Text>
          {delayed && <Text style={styles.struckTime}>{formatTime(flight.scheduledArrival, flight.to.tz)}</Text>}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: Colors.card, borderRadius: 18, marginBottom: 12, padding: 16 },
  pressed: { opacity: 0.82 },
  topRow: { flexDirection: 'row', alignItems: 'center' },
  airlineBadge: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  airlineCode: { color: Colors.textPrimary, fontSize: 13, fontWeight: '800' },
  flightMeta: { flex: 1, marginLeft: 11 },
  flightNumber: { color: Colors.textPrimary, fontSize: 16, fontWeight: '700' },
  airlineName: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  statusPill: { borderRadius: 99, paddingHorizontal: 9, paddingVertical: 6 },
  statusText: { fontSize: 11, fontWeight: '700' },
  routeRow: { alignItems: 'center', flexDirection: 'row', marginTop: 22 },
  airport: { width: 70 },
  destination: { alignItems: 'flex-end' },
  code: { color: Colors.textPrimary, fontSize: 28, fontWeight: '800', letterSpacing: -1 },
  city: { color: Colors.textSecondary, fontSize: 11, marginTop: 2 },
  bottomRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  timeGroup: { minWidth: 75 },
  arrivalTime: { alignItems: 'flex-end' },
  time: { color: Colors.textPrimary, fontSize: 15, fontWeight: '700' },
  struckTime: { color: Colors.delayed, fontSize: 11, marginTop: 2, textDecorationLine: 'line-through' },
  duration: { alignItems: 'center', flexDirection: 'row', gap: 5 },
  durationText: { color: Colors.textSecondary, fontSize: 12 },
});
