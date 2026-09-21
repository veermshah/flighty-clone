import Ionicons from '@expo/vector-icons/Ionicons';
import Svg, { Circle, Line, Path, Rect, Text as SvgText } from 'react-native-svg';
import { StyleSheet, View } from 'react-native';

import Colors from '@/constants/Colors';
import { Flight } from '@/types';

const WIDTH = 360;
const HEIGHT = 200;

function project(lat: number, lon: number, minLat: number, maxLat: number, minLon: number, maxLon: number) {
  return {
    x: 28 + ((lon - minLon) / Math.max(1, maxLon - minLon)) * (WIDTH - 56),
    y: 24 + ((maxLat - lat) / Math.max(1, maxLat - minLat)) * (HEIGHT - 48),
  };
}

function curvePoint(start: { x: number; y: number }, control: { x: number; y: number }, end: { x: number; y: number }, t: number) {
  const inverse = 1 - t;
  return {
    x: inverse * inverse * start.x + 2 * inverse * t * control.x + t * t * end.x,
    y: inverse * inverse * start.y + 2 * inverse * t * control.y + t * t * end.y,
  };
}

export function RouteMap({ flight }: { flight: Flight }) {
  const minLat = Math.min(flight.from.lat, flight.to.lat);
  const maxLat = Math.max(flight.from.lat, flight.to.lat);
  const minLon = Math.min(flight.from.lon, flight.to.lon);
  const maxLon = Math.max(flight.from.lon, flight.to.lon);
  const start = project(flight.from.lat, flight.from.lon, minLat, maxLat, minLon, maxLon);
  const end = project(flight.to.lat, flight.to.lon, minLat, maxLat, minLon, maxLon);
  const control = { x: (start.x + end.x) / 2, y: Math.min(start.y, end.y) - 48 };
  const point = curvePoint(start, control, end, Math.max(0, Math.min(1, flight.progress)));
  const before = curvePoint(start, control, end, Math.max(0, flight.progress - 0.02));
  const after = curvePoint(start, control, end, Math.min(1, flight.progress + 0.02));
  const rotation = (Math.atan2(after.y - before.y, after.x - before.x) * 180) / Math.PI;
  const path = `M ${start.x} ${start.y} Q ${control.x} ${control.y} ${end.x} ${end.y}`;
  const flownPath = `M ${start.x} ${start.y} Q ${control.x} ${control.y} ${point.x} ${point.y}`;
  return (
    <View style={styles.wrapper}>
      <Svg width="100%" height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
        <Rect width={WIDTH} height={HEIGHT} rx={18} fill={Colors.cardElevated} />
        {[1, 2, 3, 4].map((line) => (
          <Line key={`h-${line}`} x1={0} y1={line * 40} x2={WIDTH} y2={line * 40} stroke={Colors.separator} strokeWidth={0.5} opacity={0.55} />
        ))}
        {[1, 2, 3, 4, 5].map((line) => (
          <Line key={`v-${line}`} x1={line * 60} y1={0} x2={line * 60} y2={HEIGHT} stroke={Colors.separator} strokeWidth={0.5} opacity={0.55} />
        ))}
        <Path d={path} fill="none" stroke={Colors.textSecondary} strokeWidth={2} strokeDasharray="5 6" opacity={0.65} />
        {flight.progress > 0 && <Path d={flownPath} fill="none" stroke={Colors.accent} strokeWidth={3} />}
        <Circle cx={start.x} cy={start.y} r={5} fill={Colors.textPrimary} stroke={Colors.accent} strokeWidth={2} />
        <Circle cx={end.x} cy={end.y} r={5} fill={Colors.textPrimary} stroke={Colors.accent} strokeWidth={2} />
        <SvgText x={start.x} y={start.y + 21} fill={Colors.textPrimary} fontSize="11" fontWeight="700" textAnchor="middle">{flight.from.code}</SvgText>
        <SvgText x={end.x} y={end.y + 21} fill={Colors.textPrimary} fontSize="11" fontWeight="700" textAnchor="middle">{flight.to.code}</SvgText>
      </Svg>
      {flight.status === 'en_route' && (
        <Ionicons name="airplane" size={20} color={Colors.accent} style={[styles.airplane, { left: `${(point.x / WIDTH) * 100}%`, top: point.y - 10, transform: [{ rotate: `${rotation}deg` }] }]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { borderRadius: 18, overflow: 'hidden' },
  airplane: { position: 'absolute', marginLeft: -10 },
});
