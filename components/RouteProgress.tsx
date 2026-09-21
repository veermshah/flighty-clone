import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import Colors from '@/constants/Colors';

export function RouteProgress({ progress, active }: { progress: number; active: boolean }) {
  return (
    <View style={styles.container}>
      <View style={styles.track} />
      {active && <View style={[styles.fill, { width: `${Math.max(3, progress * 100)}%` }]} />}
      <Ionicons
        name="airplane"
        size={16}
        color={active ? Colors.accent : Colors.textSecondary}
        style={[styles.plane, { left: `${Math.min(94, Math.max(4, progress * 100))}%` }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, height: 24, justifyContent: 'center', marginHorizontal: 10, position: 'relative' },
  track: { height: 2, backgroundColor: Colors.separator, borderRadius: 1, width: '100%' },
  fill: { position: 'absolute', left: 0, height: 2, backgroundColor: Colors.accent, borderRadius: 1 },
  plane: { position: 'absolute', top: 4, marginLeft: -8 },
});
