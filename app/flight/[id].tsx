import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { Platform, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Colors from '@/constants/Colors';
import { RouteMap } from '@/components/RouteMap';
import { Timeline } from '@/components/Timeline';
import { durationLabel, formatDateLabel, formatTime, minutesUntil, statusColor, statusLabel } from '@/lib/format';
import { confirmDestructive } from '@/lib/confirm';
import { useFlights } from '@/lib/FlightsContext';

export default function FlightDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getFlight, removeFlight } = useFlights();
  const flight = getFlight(id);
  const duration = flight ? Math.round(flight.distanceMi / 8.2) : 0;
  const timeline = useMemo(() => flight, [flight]);
  if (!flight) {
    return (
      <SafeAreaView style={styles.safe}>
        <Pressable onPress={() => router.back()} style={styles.backButton}><Ionicons name="chevron-back" color={Colors.textPrimary} size={28} /></Pressable>
        <View style={styles.notFound}><Ionicons name="airplane-outline" size={42} color={Colors.textSecondary} /><Text style={styles.notFoundTitle}>Flight not found</Text><Text style={styles.notFoundBody}>This flight may have been removed.</Text></View>
      </SafeAreaView>
    );
  }
  const color = statusColor(flight);
  const shareFlight = async () => {
    const message = `${flight.number}: ${flight.from.code} → ${flight.to.code} · ${statusLabel(flight)}`;
    try {
      if (Platform.OS === 'web') {
        if (typeof navigator.share === 'function') await navigator.share({ text: message });
        else await navigator.clipboard.writeText(message);
        return;
      }
      await Share.share({ message });
    } catch {
      // user dismissed the share sheet or sharing is unavailable
    }
  };
  const statusHeadline = flight.status === 'en_route' ? `Landing in ${Math.floor(minutesUntil(flight.estimatedArrival) / 60)}h ${minutesUntil(flight.estimatedArrival) % 60}m` : flight.status === 'delayed' ? `Delayed ${flight.delayMinutes} min` : flight.status === 'landed' || flight.status === 'arrived' ? `Landed ${formatTime(flight.actualArrival ?? flight.estimatedArrival, flight.to.tz)}` : `Departs in ${Math.floor(minutesUntil(flight.estimatedDeparture) / 60)}h ${minutesUntil(flight.estimatedDeparture) % 60}m`;
  const remove = () => confirmDestructive('Remove flight?', `Remove ${flight.number} from your flights?`, 'Remove', () => { removeFlight(flight.id); router.back(); });
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.headerButton}><Ionicons name="chevron-back" color={Colors.textPrimary} size={27} /></Pressable>
          <Text style={styles.headerTitle}>{flight.number} · {formatDateLabel(flight.scheduledDeparture)}</Text>
          <Pressable onPress={shareFlight} style={styles.headerButton}><Ionicons name="share-outline" color={Colors.textPrimary} size={22} /></Pressable>
        </View>
        <View style={styles.mapCard}><RouteMap flight={flight} /></View>
        <View style={styles.heroRoute}>
          <View><Text style={styles.heroCode}>{flight.from.code}</Text><Text style={styles.heroCity}>{flight.from.city}</Text></View>
          <Ionicons name="arrow-forward" color={Colors.textSecondary} size={22} />
          <View style={styles.heroDestination}><Text style={styles.heroCode}>{flight.to.code}</Text><Text style={styles.heroCity}>{flight.to.city}</Text></View>
        </View>
        <View style={[styles.statusPill, { backgroundColor: `${color}25` }]}><Text style={[styles.statusText, { color }]}>{statusLabel(flight)}</Text></View>
        <Text style={styles.statusHeadline}>{statusHeadline}</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Departure <Text style={styles.cardTitleMuted}>/ Arrival</Text></Text>
          <View style={styles.twoColumns}>
            <AirportInfo label={flight.from.code} time={flight.estimatedDeparture} scheduled={flight.scheduledDeparture} tz={flight.from.tz} terminal={flight.departureTerminal} gate={flight.departureGate} changed={flight.delayMinutes > 0} />
            <View style={styles.verticalDivider} />
            <AirportInfo label={flight.to.code} time={flight.estimatedArrival} scheduled={flight.scheduledArrival} tz={flight.to.tz} terminal={flight.arrivalTerminal} gate={flight.arrivalGate} baggage={flight.baggageClaim} changed={flight.delayMinutes > 0} />
          </View>
        </View>
        <Timeline flight={timeline!} />
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Aircraft</Text>
          <View style={styles.aircraftTop}><View><Text style={styles.aircraftType}>{flight.aircraft.type}</Text><Text style={styles.muted}>{flight.aircraft.registration}</Text></View><Text style={styles.aircraftAge}>{flight.aircraft.age}</Text></View>
          {flight.status === 'en_route' && <View style={styles.statsGrid}><LiveStat label="Altitude" value={`${(flight.altitudeFt ?? 0).toLocaleString()} ft`} /><LiveStat label="Speed" value={`${flight.speedMph ?? 0} mph`} /></View>}
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Trip</Text>
          <View style={styles.tripGrid}><TripInfo label="Seat" value={flight.seat ?? '—'} /><TripInfo label="Confirmation" value={flight.confirmation ?? '—'} /><TripInfo label="Distance" value={`${flight.distanceMi.toLocaleString()} mi`} /><TripInfo label="Duration" value={durationLabel(duration)} /></View>
        </View>
        <Pressable onPress={remove} style={styles.remove}><Ionicons name="trash-outline" size={17} color={Colors.delayed} /><Text style={styles.removeText}>Remove Flight</Text></Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function AirportInfo({ label, time, scheduled, tz, terminal, gate, baggage, changed }: { label: string; time: string; scheduled: string; tz: string; terminal?: string; gate?: string; baggage?: string; changed: boolean }) {
  return <View style={styles.airportInfo}><Text style={styles.airportLabel}>{label}</Text><Text style={styles.detailTime}>{formatTime(time, tz)}</Text>{changed && <Text style={styles.detailScheduled}>{formatTime(scheduled, tz)}</Text>}<Text style={styles.muted}>Terminal {terminal ?? '—'} · Gate {gate ?? '—'}</Text>{baggage && <Text style={styles.muted}>Baggage {baggage}</Text>}</View>;
}
function LiveStat({ label, value }: { label: string; value: string }) { return <View style={styles.stat}><Text style={styles.muted}>{label}</Text><Text style={styles.statValue}>{value}</Text></View>; }
function TripInfo({ label, value }: { label: string; value: string }) { return <View style={styles.tripInfo}><Text style={styles.muted}>{label}</Text><Text style={styles.tripValue}>{value}</Text></View>; }

const styles = StyleSheet.create({
  safe: { backgroundColor: Colors.bg, flex: 1 },
  content: { paddingBottom: 36, paddingHorizontal: 16 },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 17, paddingTop: 5 },
  headerButton: { alignItems: 'center', height: 38, justifyContent: 'center', width: 38 },
  headerTitle: { color: Colors.textPrimary, fontSize: 15, fontWeight: '700' },
  mapCard: { backgroundColor: Colors.card, borderRadius: 18, overflow: 'hidden' },
  heroRoute: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: 21 },
  heroDestination: { alignItems: 'flex-end' },
  heroCode: { color: Colors.textPrimary, fontSize: 44, fontWeight: '800', letterSpacing: -2 },
  heroCity: { color: Colors.textSecondary, fontSize: 13, marginTop: 1 },
  statusPill: { alignSelf: 'flex-start', borderRadius: 99, marginTop: 19, paddingHorizontal: 10, paddingVertical: 6 },
  statusText: { fontSize: 12, fontWeight: '800' },
  statusHeadline: { color: Colors.textPrimary, fontSize: 25, fontWeight: '800', marginBottom: 21, marginTop: 10 },
  card: { backgroundColor: Colors.card, borderRadius: 18, marginBottom: 13, padding: 18 },
  cardTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: '800', marginBottom: 17 },
  cardTitleMuted: { color: Colors.textSecondary, fontWeight: '500' },
  twoColumns: { flexDirection: 'row' },
  verticalDivider: { backgroundColor: Colors.separator, marginHorizontal: 15, width: 1 },
  airportInfo: { flex: 1 },
  airportLabel: { color: Colors.textSecondary, fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
  detailTime: { color: Colors.textPrimary, fontSize: 23, fontWeight: '800', marginTop: 4 },
  detailScheduled: { color: Colors.delayed, fontSize: 12, textDecorationLine: 'line-through' },
  muted: { color: Colors.textSecondary, fontSize: 12, marginTop: 7 },
  aircraftTop: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between' },
  aircraftType: { color: Colors.textPrimary, fontSize: 16, fontWeight: '700' },
  aircraftAge: { color: Colors.textSecondary, fontSize: 13 },
  statsGrid: { borderTopColor: Colors.separator, borderTopWidth: 1, flexDirection: 'row', marginTop: 16, paddingTop: 14 },
  stat: { flex: 1 },
  statValue: { color: Colors.textPrimary, fontSize: 18, fontWeight: '800', marginTop: 2 },
  tripGrid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 18 },
  tripInfo: { width: '50%' },
  tripValue: { color: Colors.textPrimary, fontSize: 16, fontWeight: '700', marginTop: 3 },
  remove: { alignItems: 'center', flexDirection: 'row', justifyContent: 'center', paddingVertical: 17 },
  removeText: { color: Colors.delayed, fontSize: 15, fontWeight: '700', marginLeft: 7 },
  backButton: { padding: 18 },
  notFound: { alignItems: 'center', flex: 1, justifyContent: 'center', paddingBottom: 100 },
  notFoundTitle: { color: Colors.textPrimary, fontSize: 22, fontWeight: '800', marginTop: 16 },
  notFoundBody: { color: Colors.textSecondary, fontSize: 14, marginTop: 7 },
});
