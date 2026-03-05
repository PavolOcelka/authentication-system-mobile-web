import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useAuth } from '../../lib/useAuth';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function DashboardScreen() {
  const { user, signOut } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Signed in as</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>
      <Pressable style={styles.button} onPress={signOut}>
        <Text style={styles.buttonText}>Sign out</Text>
      </Pressable>
    </View>
  );
}

function createStyles(colors: typeof Colors.light) {
  return StyleSheet.create({
    container: { flex: 1, padding: 24, backgroundColor: colors.background, justifyContent: 'center' },
    title: { fontSize: 28, fontWeight: '700', color: colors.text, marginBottom: 24 },
    card: { backgroundColor: colors.card, borderRadius: 12, padding: 20, marginBottom: 32 },
    label: { fontSize: 13, color: colors.tabIconDefault, marginBottom: 4 },
    email: { fontSize: 16, fontWeight: '500', color: colors.text },
    button: { height: 44, backgroundColor: colors.tint, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    buttonText: { color: '#fff', fontSize: 14, fontWeight: '500' },
  });
}
