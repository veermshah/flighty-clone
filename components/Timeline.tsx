import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import Colors from '@/constants/Colors';
import { formatTime } from '@/lib/format';
import { Flight, FlightStatus } from '@/types';

const steps: Array<{ key: FlightStatus; label: string; time: (flight: Flight) => string | undefined }> = [
  { key: 'scheduled', label: 'Scheduled', time: (flight) => flight.scheduledDeparture },
  { key: 'boarding', label: 'Boarding', time: (flight) => flight.status === 'boarding' ? flight.estimatedDeparture : undefined },
  { key: 'departed', label: 'Departed', time: (flight) => flight.actualDeparture },
  { key: 'en_route', label: 'En Route', time: (flight) => flight.status === 'en_route' ? flight.actualDeparture : undefined },
  { key: 'landed', label: 'Landed', time: (flight) => flight.actualArrival },
  { key: 'arrived', label: 'Arrived', time: (flight) => flight.status === 'arrived' ? flight.actualArrival : undefined },
];

const order: FlightStatus[] = ['scheduled', 'boarding', 'departed', 'en_route', 'landed', 'arrived'];

export function Timeline({ flight }: { flight: Flight }) {
  const opacity = useRef(new Animated.Value(1)).current;
  const currentIndex = Math.max(0, order.indexOf(flight.status === 'delayed' ? 'boarding' : flight.status));
  useEffect(() => {
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(opacity, { toValue: 0.35, duration: 800, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
    ]));
    animation.start();
    return () => animation.stop();
  }, [opacity]);
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Flight Timeline</Text>
      {steps.map((step, index) => {
        const complete = index < currentIndex || (index === currentIndex && ['landed', 'arrived'].includes(flight.status));
        const current = index === currentIndex && !complete;
        const time = step.time(flight);
        return (
          <View key={step.key} style={styles.step}>
            <View style={styles.lineColumn}>
              <Animated.View style={[styles.dot, complete && styles.complete, current && styles.current, current && { opacity }]}>{complete && <Ionicons name="checkmark" size={12} color={Colors.bg} />}</Animated.View>
              {index < steps.length - 1 && <View style={[styles.connector, index < currentIndex && styles.connectorComplete]} />}
            </View>
            <Text style={[styles.label, (complete || current) && styles.activeLabel]}>{step.label}</Text>
            <Text style={styles.time}>{time ? formatTime(time, flight.from.tz) : '—'}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: Colors.card, borderRadius: 18, padding: 18 },
  title: { color: Colors.textPrimary, fontSize: 18, fontWeight: '800', marginBottom: 16 },
  step: { alignItems: 'center', flexDirection: 'row', minHeight: 34 },
  lineColumn: { alignItems: 'center', alignSelf: 'stretch', width: 24 },
  dot: { alignItems: 'center', backgroundColor: Colors.separator, borderRadius: 10, height: 18, justifyContent: 'center', marginTop: 8, width: 18, zIndex: 1 },
  complete: { backgroundColor: Colors.accent },
  current: { backgroundColor: Colors.accent, borderColor: Colors.accent, borderWidth: 3 },
  connector: { backgroundColor: Colors.separator, flex: 1, width: 2 },
  connectorComplete: { backgroundColor: Colors.accent },
  label: { color: Colors.textSecondary, flex: 1, fontSize: 14, marginLeft: 12 },
  activeLabel: { color: Colors.textPrimary, fontWeight: '700' },
  time: { color: Colors.textSecondary, fontSize: 12 },
});
