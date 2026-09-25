import Ionicons from '@expo/vector-icons/Ionicons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Colors from '@/constants/Colors';
import { useFlights } from '@/lib/FlightsContext';

const settings = ['Notifications', 'Units', 'Calendar Sync', 'About'];

export default function PassportScreen() {
  const { flights } = useFlights();
  const miles = flights.reduce((sum, flight) => sum + flight.distanceMi, 0);
  const hours = Math.round(flights.reduce((sum, flight) => sum + flight.distanceMi / 500, 0));
  const airports = new Set(flights.flatMap((flight) => [flight.from.code, flight.to.code])).size;
  const airlines = new Set(flights.map((flight) => flight.airline.code)).size;
  const countries = new Set(flights.flatMap((flight) => [flight.from.tz.split('/')[0], flight.to.tz.split('/')[0]])).size;
  const routeCounts = flights.reduce<Record<string, number>>((counts, flight) => { const route = `${flight.from.code} → ${flight.to.code}`; counts[route] = (counts[route] ?? 0) + 1; return counts; }, {});
  const topRoutes = Object.entries(routeCounts).sort(([, a], [, b]) => b - a).slice(0, 3);
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Passport</Text>
        <View style={styles.profile}><View style={styles.profileAvatar}><Text style={styles.profileInitials}>VS</Text></View><View style={styles.profileCopy}><Text style={styles.name}>Veer Shah</Text><View style={styles.proBadge}><Ionicons name="sparkles" size={12} color={Colors.accent} /><Text style={styles.proText}>Flighty Pro</Text></View></View><Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} /></View>
        <View style={styles.stats}><Stat label="Flights" value={`${flights.length}`} /><Stat label="Miles" value={miles.toLocaleString()} /><Stat label="Hours" value={`${hours}`} /><Stat label="Airports" value={`${airports}`} /><Stat label="Airlines" value={`${airlines}`} /><Stat label="Countries" value={`${countries}`} /></View>
        <SectionTitle title="Top Routes" />
        <View style={styles.card}>{topRoutes.map(([route, count]) => <View key={route} style={styles.route}><Ionicons name="airplane-outline" size={17} color={Colors.accent} /><Text style={styles.routeText}>{route}</Text><Text style={styles.routeCount}>{count} flight{count === 1 ? '' : 's'}</Text></View>)}</View>
        <SectionTitle title="Airports Visited" />
        <View style={styles.chips}>{Array.from(new Set(flights.flatMap((flight) => [flight.from.code, flight.to.code]))).map((code) => <View style={styles.chip} key={code}><Text style={styles.chipText}>{code}</Text></View>)}</View>
        <SectionTitle title="Settings" />
        <View style={styles.card}>{settings.map((setting) => <View style={styles.setting} key={setting}><Text style={styles.settingText}>{setting}</Text><Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} /></View>)}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value }: { label: string; value: string }) { return <View style={styles.stat}><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>; }
function SectionTitle({ title }: { title: string }) { return <Text style={styles.sectionTitle}>{title}</Text>; }

const styles = StyleSheet.create({
  safe: { backgroundColor: Colors.bg, flex: 1 },
  content: { paddingBottom: 40, paddingHorizontal: 16, paddingTop: 14 },
  title: { color: Colors.textPrimary, fontSize: 34, fontWeight: '800', letterSpacing: -1 },
  profile: { alignItems: 'center', flexDirection: 'row', marginTop: 23 },
  profileAvatar: { alignItems: 'center', backgroundColor: Colors.accent, borderRadius: 30, height: 60, justifyContent: 'center', width: 60 },
  profileInitials: { color: Colors.bg, fontSize: 20, fontWeight: '900' },
  profileCopy: { flex: 1, marginLeft: 13 },
  name: { color: Colors.textPrimary, fontSize: 18, fontWeight: '800' },
  proBadge: { alignItems: 'center', backgroundColor: `${Colors.accent}22`, borderRadius: 8, flexDirection: 'row', marginTop: 6, paddingHorizontal: 7, paddingVertical: 4, alignSelf: 'flex-start' },
  proText: { color: Colors.accent, fontSize: 11, fontWeight: '800', marginLeft: 4 },
  stats: { backgroundColor: Colors.card, borderRadius: 18, flexDirection: 'row', flexWrap: 'wrap', marginTop: 25, paddingVertical: 17 },
  stat: { alignItems: 'center', width: '33.33%', paddingVertical: 7 },
  statValue: { color: Colors.textPrimary, fontSize: 20, fontWeight: '800' },
  statLabel: { color: Colors.textSecondary, fontSize: 11, marginTop: 4 },
  sectionTitle: { color: Colors.textSecondary, fontSize: 13, fontWeight: '700', letterSpacing: 0.5, marginBottom: 9, marginTop: 25, textTransform: 'uppercase' },
  card: { backgroundColor: Colors.card, borderRadius: 18, paddingHorizontal: 16 },
  route: { alignItems: 'center', borderBottomColor: Colors.separator, borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: 'row', paddingVertical: 14 },
  routeText: { color: Colors.textPrimary, flex: 1, fontSize: 15, fontWeight: '700', marginLeft: 10 },
  routeCount: { color: Colors.textSecondary, fontSize: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { backgroundColor: Colors.card, borderRadius: 10, paddingHorizontal: 13, paddingVertical: 9 },
  chipText: { color: Colors.textPrimary, fontSize: 13, fontWeight: '700' },
  setting: { alignItems: 'center', borderBottomColor: Colors.separator, borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16 },
  settingText: { color: Colors.textPrimary, fontSize: 15 },
});
