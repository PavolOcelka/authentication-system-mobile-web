import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '../../lib/useAuth';

export default function LoginScreen() {
  const { signIn, loading, error } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async () => {
    await signIn(email, password);
    if (!error) router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={styles.title}>Sign in</Text>

      {error && <Text style={styles.error}>{error.message}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#9ca3af"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#9ca3af"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Pressable style={[styles.button, loading && styles.buttonDisabled]} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Please wait...' : 'Sign in'}</Text>
      </Pressable>

      <View style={styles.footer}>
        <Link href="/(auth)/forgot-password" style={styles.link}>Forgot password?</Link>
        <Text style={styles.separator}> · </Text>
        <Link href="/(auth)/register" style={styles.link}>Create account</Link>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: '600', color: '#09090b', marginBottom: 24 },
  input: { height: 44, borderWidth: 1, borderColor: '#e4e4e7', borderRadius: 8, paddingHorizontal: 12, fontSize: 14, color: '#09090b', marginBottom: 12 },
  button: { height: 44, backgroundColor: '#09090b', borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontSize: 14, fontWeight: '500' },
  error: { color: '#b91c1c', fontSize: 13, marginBottom: 12, padding: 12, backgroundColor: '#fef2f2', borderRadius: 8 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  link: { fontSize: 14, color: '#71717a' },
  separator: { fontSize: 14, color: '#71717a' },
});
