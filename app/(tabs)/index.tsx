import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, RefreshControl, SectionList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Colors from '@/constants/Colors';
import { FlightCard } from '@/components/FlightCard';
import { formatDateLabel } from '@/lib/format';
import { useFlights } from '@/lib/FlightsContext';
import { Flight } from '@/types';

function isToday(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  return date.toDateString() === now.toDateString();
}

export default function FlightsScreen() {
  const { flights, removeFlight } = useFlights();
  const [showPast, setShowPast] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const sorted = useMemo(() => [...flights].sort((a, b) => new Date(a.estimatedDeparture).getTime() - new Date(b.estimatedDeparture).getTime()), [flights]);
  const live = sorted.filter((flight) => ['en_route', 'departed', 'boarding', 'delayed'].includes(flight.status) && (isToday(flight.estimatedDeparture) || flight.status === 'en_route'));
  const upcoming = sorted.filter((flight) => !live.includes(flight) && !['landed', 'arrived', 'cancelled'].includes(flight.status));
  const past = sorted.filter((flight) => ['landed', 'arrived', 'cancelled'].includes(flight.status));
  const sections = [
    ...(live.length ? [{ title: 'Live', data: live }] : []),
    ...(upcoming.length ? [{ title: 'Upcoming', data: upcoming }] : []),
    ...(past.length && showPast ? [{ title: 'Past', data: past }] : []),
  ];
  const confirmRemove = (flight: Flight) => Alert.alert('Remove flight?', `${flight.number} · ${flight.from.code} to ${flight.to.code}`, [{ text: 'Cancel', style: 'cancel' }, { text: 'Remove', style: 'destructive', onPress: () => removeFlight(flight.id) }]);
  const refresh = async () => { setRefreshing(true); await new Promise((resolve) => setTimeout(resolve, 600)); setRefreshing(false); };
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <SectionList
        sections={sections}
        keyExtractor={(flight) => flight.id}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={Colors.accent} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>My Flights</Text>
              {live.length > 0 && <View style={styles.liveLabel}><View style={styles.liveDot} /><Text style={styles.liveText}>Live</Text></View>}
            </View>
            <View style={styles.headerActions}>
              <Ionicons name="notifications-outline" color={Colors.textSecondary} size={22} />
              <Ionicons name="add" color={Colors.bg} size={26} style={styles.addIcon} onPress={() => router.push('/add-flight')} />
            </View>
          </View>
        }
        renderSectionHeader={({ section }) => <Text style={styles.sectionTitle}>{section.title}</Text>}
        renderItem={({ item }) => <FlightCard flight={item} onPress={() => router.push({ pathname: '/flight/[id]', params: { id: item.id } })} onLongPress={() => confirmRemove(item)} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}><Ionicons name="airplane" color={Colors.accent} size={38} /></View>
            <Text style={styles.emptyTitle}>Add your first flight</Text>
            <Text style={styles.emptyBody}>Track your journey in real time with Flighty.</Text>
            <Text style={styles.emptyButton} onPress={() => router.push('/add-flight')}>Add Flight</Text>
          </View>
        }
        ListFooterComponent={past.length > 0 ? <Text style={styles.pastToggle} onPress={() => setShowPast(!showPast)}>{showPast ? 'Hide past flights' : `Show ${past.length} past flight${past.length === 1 ? '' : 's'}`}</Text> : null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: Colors.bg, flex: 1 },
  content: { paddingBottom: 28, paddingHorizontal: 16 },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 22, paddingTop: 12 },
  title: { color: Colors.textPrimary, fontSize: 34, fontWeight: '800', letterSpacing: -1 },
  liveLabel: { alignItems: 'center', flexDirection: 'row', marginTop: 4 },
  liveDot: { backgroundColor: Colors.onTime, borderRadius: 4, height: 8, marginRight: 6, width: 8 },
  liveText: { color: Colors.onTime, fontSize: 13, fontWeight: '700' },
  headerActions: { alignItems: 'center', flexDirection: 'row', gap: 18 },
  addIcon: { backgroundColor: Colors.accent, borderRadius: 20, padding: 7 },
  sectionTitle: { color: Colors.textSecondary, fontSize: 14, fontWeight: '700', letterSpacing: 0.5, marginBottom: 10, marginTop: 6, textTransform: 'uppercase' },
  empty: { alignItems: 'center', paddingTop: 110 },
  emptyIcon: { alignItems: 'center', backgroundColor: `${Colors.accent}22`, borderRadius: 28, height: 78, justifyContent: 'center', width: 78 },
  emptyTitle: { color: Colors.textPrimary, fontSize: 20, fontWeight: '800', marginTop: 18 },
  emptyBody: { color: Colors.textSecondary, fontSize: 14, marginTop: 7 },
  emptyButton: { backgroundColor: Colors.accent, borderRadius: 12, color: Colors.bg, fontSize: 15, fontWeight: '800', marginTop: 20, overflow: 'hidden', paddingHorizontal: 20, paddingVertical: 12 },
  pastToggle: { color: Colors.accent, fontSize: 14, fontWeight: '700', paddingVertical: 18, textAlign: 'center' },
});
