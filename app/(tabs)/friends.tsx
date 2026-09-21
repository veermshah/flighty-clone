import Ionicons from '@expo/vector-icons/Ionicons';
import { Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Colors from '@/constants/Colors';

const friends = [
  { initials: 'AM', name: 'Alex Morgan', color: '#5E5CE6', flight: 'SFO → JFK · Landing in 42m' },
  { initials: 'SK', name: 'Sam Kim', color: '#FF375F', flight: 'LAX → SEA · En Route' },
  { initials: 'JR', name: 'Jordan Reed', color: '#30D158', flight: 'No upcoming flights' },
  { initials: 'NP', name: 'Nina Patel', color: '#64D2FF', flight: 'BOS → LHR · Tomorrow' },
];

export default function FriendsScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.content}>
        <Text style={styles.title}>Friends</Text>
        <Text style={styles.subtitle}>See where your people are headed.</Text>
        <View style={styles.invite}><View style={styles.inviteIcon}><Ionicons name="people" size={22} color={Colors.accent} /></View><View style={styles.inviteCopy}><Text style={styles.inviteTitle}>Flighty Friends</Text><Text style={styles.inviteBody}>Share your flights and follow each other in the air.</Text></View><Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} onPress={() => Share.share({ message: 'Join me on Flighty Friends!' })} /></View>
        <Text style={styles.sectionTitle}>Your friends</Text>
        {friends.map((friend) => <View style={styles.friend} key={friend.name}><View style={[styles.avatar, { backgroundColor: friend.color }]}><Text style={styles.avatarText}>{friend.initials}</Text></View><View style={styles.friendCopy}><Text style={styles.friendName}>{friend.name}</Text><Text style={styles.friendFlight}>{friend.flight}</Text></View><Ionicons name="chevron-forward" size={18} color={Colors.separator} /></View>)}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: Colors.bg, flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 14 },
  title: { color: Colors.textPrimary, fontSize: 34, fontWeight: '800', letterSpacing: -1 },
  subtitle: { color: Colors.textSecondary, fontSize: 15, marginTop: 5 },
  invite: { alignItems: 'center', backgroundColor: Colors.card, borderRadius: 18, flexDirection: 'row', marginTop: 24, padding: 15 },
  inviteIcon: { alignItems: 'center', backgroundColor: `${Colors.accent}22`, borderRadius: 13, height: 46, justifyContent: 'center', width: 46 },
  inviteCopy: { flex: 1, marginHorizontal: 12 },
  inviteTitle: { color: Colors.textPrimary, fontSize: 16, fontWeight: '800' },
  inviteBody: { color: Colors.textSecondary, fontSize: 12, lineHeight: 17, marginTop: 3 },
  sectionTitle: { color: Colors.textSecondary, fontSize: 13, fontWeight: '700', letterSpacing: 0.5, marginBottom: 8, marginTop: 30, textTransform: 'uppercase' },
  friend: { alignItems: 'center', borderBottomColor: Colors.separator, borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: 'row', paddingVertical: 14 },
  avatar: { alignItems: 'center', borderRadius: 23, height: 46, justifyContent: 'center', width: 46 },
  avatarText: { color: Colors.textPrimary, fontSize: 14, fontWeight: '800' },
  friendCopy: { flex: 1, marginLeft: 12 },
  friendName: { color: Colors.textPrimary, fontSize: 16, fontWeight: '700' },
  friendFlight: { color: Colors.textSecondary, fontSize: 13, marginTop: 4 },
});
