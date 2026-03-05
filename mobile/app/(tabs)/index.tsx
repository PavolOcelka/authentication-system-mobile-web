import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useAuth } from '../../lib/useAuth';

export default function DashboardScreen() {
  const { user, signOut } = useAuth();

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

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff', justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '700', color: '#09090b', marginBottom: 24 },
  card: { backgroundColor: '#f4f4f5', borderRadius: 12, padding: 20, marginBottom: 32 },
  label: { fontSize: 13, color: '#71717a', marginBottom: 4 },
  email: { fontSize: 16, fontWeight: '500', color: '#09090b' },
  button: { height: 44, backgroundColor: '#dc2626', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#fff', fontSize: 14, fontWeight: '500' },
});
