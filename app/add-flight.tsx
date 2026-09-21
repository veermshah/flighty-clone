import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Colors from '@/constants/Colors';
import { formatDateLabel, formatTime, statusColor, statusLabel } from '@/lib/format';
import { useFlights } from '@/lib/FlightsContext';
import { generateFlightSchedule } from '@/lib/mockData';
import { Flight } from '@/types';

export default function AddFlightScreen() {
  const [mode, setMode] = useState<'number' | 'route'>('number');
  const [query, setQuery] = useState('');
  const [dateOffset, setDateOffset] = useState(0);
  const { flights, addFlight } = useFlights();
  const date = new Date(Date.now() + dateOffset * 86_400_000);
  const results = useMemo(() => generateFlightSchedule(query, date), [query, dateOffset]);
  const isAdded = (flight: Flight) => flights.some((tracked) => tracked.number === flight.number && tracked.from.code === flight.from.code && tracked.to.code === flight.to.code);
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
        <View style={styles.header}><Text style={styles.title}>Add Flight</Text><Pressable onPress={() => router.back()}><Text style={styles.cancel}>Cancel</Text></Pressable></View>
        <View style={styles.segmented}><Pressable style={[styles.segment, mode === 'number' && styles.segmentActive]} onPress={() => setMode('number')}><Text style={[styles.segmentText, mode === 'number' && styles.segmentTextActive]}>Flight Number</Text></Pressable><Pressable style={[styles.segment, mode === 'route' && styles.segmentActive]} onPress={() => setMode('route')}><Text style={[styles.segmentText, mode === 'route' && styles.segmentTextActive]}>Route</Text></Pressable></View>
        <View style={styles.inputWrap}><Ionicons name="search" color={Colors.textSecondary} size={19} /><TextInput autoFocus autoCapitalize="characters" value={query} onChangeText={setQuery} placeholder={mode === 'number' ? 'UA 1234' : 'SFO to LAX'} placeholderTextColor={Colors.textSecondary} style={styles.input} /></View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateChips}>{[0, 1, 2, 3, 4].map((offset) => <Pressable key={offset} onPress={() => setDateOffset(offset)} style={[styles.dateChip, dateOffset === offset && styles.dateChipActive]}><Text style={[styles.dateChipText, dateOffset === offset && styles.dateChipTextActive]}>{offset === 0 ? 'Today' : offset === 1 ? 'Tomorrow' : new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(new Date(Date.now() + offset * 86_400_000))}</Text><Text style={[styles.dateNumber, dateOffset === offset && styles.dateChipTextActive]}>{new Date(Date.now() + offset * 86_400_000).getDate()}</Text></Pressable>)}</ScrollView>
        <Text style={styles.resultsTitle}>{query.trim() ? 'Results' : 'Popular routes'}</Text>
        {results.length === 0 ? <View style={styles.noResults}><Ionicons name="search-outline" size={30} color={Colors.textSecondary} /><Text style={styles.noResultsText}>No flights found</Text><Text style={styles.noResultsHint}>Try a flight number or route like SFO LAX.</Text></View> : results.map((flight) => <SearchResult key={flight.id} flight={flight} added={isAdded(flight)} onAdd={() => { addFlight(flight); router.back(); }} />)}
      </ScrollView>
    </SafeAreaView>
  );
}

function SearchResult({ flight, added, onAdd }: { flight: Flight; added: boolean; onAdd: () => void }) {
  return <View style={styles.result}><View style={[styles.resultBadge, { backgroundColor: flight.airline.color }]}><Text style={styles.badgeText}>{flight.airline.code}</Text></View><View style={styles.resultMain}><View style={styles.resultTop}><Text style={styles.resultNumber}>{flight.number}</Text><Text style={[styles.resultStatus, { color: statusColor(flight) }]}>{statusLabel(flight)}</Text></View><Text style={styles.resultRoute}>{flight.from.code} → {flight.to.code}</Text><Text style={styles.resultTimes}>{formatTime(flight.estimatedDeparture, flight.from.tz)}  ·  {formatDateLabel(flight.scheduledDeparture)}  ·  {formatTime(flight.estimatedArrival, flight.to.tz)}</Text></View><Pressable disabled={added} onPress={onAdd} style={[styles.addButton, added && styles.addedButton]}><Text style={[styles.addButtonText, added && styles.addedText]}>{added ? 'Added' : 'Add'}</Text></Pressable></View>;
}

const styles = StyleSheet.create({
  safe: { backgroundColor: Colors.bg, flex: 1 },
  content: { paddingBottom: 32, paddingHorizontal: 16 },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 24, paddingTop: 8 },
  title: { color: Colors.textPrimary, fontSize: 30, fontWeight: '800', letterSpacing: -0.8 },
  cancel: { color: Colors.accent, fontSize: 16, fontWeight: '700' },
  segmented: { backgroundColor: Colors.card, borderRadius: 11, flexDirection: 'row', padding: 3 },
  segment: { alignItems: 'center', borderRadius: 9, flex: 1, paddingVertical: 10 },
  segmentActive: { backgroundColor: Colors.cardElevated },
  segmentText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '700' },
  segmentTextActive: { color: Colors.textPrimary },
  inputWrap: { alignItems: 'center', backgroundColor: Colors.card, borderRadius: 13, flexDirection: 'row', marginTop: 17, paddingHorizontal: 13 },
  input: { color: Colors.textPrimary, flex: 1, fontSize: 17, height: 51, marginLeft: 9 },
  dateChips: { gap: 8, paddingVertical: 19 },
  dateChip: { alignItems: 'center', backgroundColor: Colors.card, borderRadius: 12, minWidth: 66, paddingHorizontal: 10, paddingVertical: 9 },
  dateChipActive: { backgroundColor: Colors.accent },
  dateChipText: { color: Colors.textSecondary, fontSize: 11, fontWeight: '700' },
  dateNumber: { color: Colors.textPrimary, fontSize: 16, fontWeight: '800', marginTop: 2 },
  dateChipTextActive: { color: Colors.bg },
  resultsTitle: { color: Colors.textSecondary, fontSize: 13, fontWeight: '700', letterSpacing: 0.5, marginBottom: 10, textTransform: 'uppercase' },
  result: { alignItems: 'center', backgroundColor: Colors.card, borderRadius: 16, flexDirection: 'row', marginBottom: 10, padding: 13 },
  resultBadge: { alignItems: 'center', borderRadius: 10, height: 38, justifyContent: 'center', width: 38 },
  badgeText: { color: Colors.textPrimary, fontSize: 11, fontWeight: '800' },
  resultMain: { flex: 1, marginLeft: 10 },
  resultTop: { alignItems: 'center', flexDirection: 'row' },
  resultNumber: { color: Colors.textPrimary, fontSize: 15, fontWeight: '800' },
  resultStatus: { fontSize: 11, fontWeight: '700', marginLeft: 8 },
  resultRoute: { color: Colors.textPrimary, fontSize: 16, fontWeight: '700', marginTop: 4 },
  resultTimes: { color: Colors.textSecondary, fontSize: 11, marginTop: 4 },
  addButton: { backgroundColor: Colors.accent, borderRadius: 9, paddingHorizontal: 12, paddingVertical: 8 },
  addedButton: { backgroundColor: Colors.cardElevated },
  addButtonText: { color: Colors.bg, fontSize: 12, fontWeight: '800' },
  addedText: { color: Colors.textSecondary },
  noResults: { alignItems: 'center', paddingTop: 90 },
  noResultsText: { color: Colors.textPrimary, fontSize: 18, fontWeight: '800', marginTop: 13 },
  noResultsHint: { color: Colors.textSecondary, fontSize: 13, marginTop: 6 },
});
