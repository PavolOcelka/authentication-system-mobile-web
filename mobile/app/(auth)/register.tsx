import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '../../lib/useAuth';
import type { AuthError } from '@shared/types';

export default function RegisterScreen() {
  const { signUp, loading, error } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [localError, setLocalError] = useState<AuthError | null>(null);

  const handleSubmit = async () => {
    setLocalError(null);
    if (password !== confirm) {
      setLocalError({ code: 'local/validation', message: 'Passwords do not match.' });
      return;
    }
    await signUp(email, password);
    if (!error) router.replace('/(tabs)');
  };

  const displayError = localError ?? error;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={styles.title}>Create account</Text>

      {displayError && <Text style={styles.error}>{displayError.message}</Text>}

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
      <TextInput
        style={styles.input}
        placeholder="Confirm password"
        placeholderTextColor="#9ca3af"
        secureTextEntry
        value={confirm}
        onChangeText={setConfirm}
      />

      <Pressable style={[styles.button, loading && styles.buttonDisabled]} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Please wait...' : 'Create account'}</Text>
      </Pressable>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <Link href="/(auth)/login" style={styles.link}>Sign in</Link>
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
  footerText: { fontSize: 14, color: '#71717a' },
  link: { fontSize: 14, color: '#09090b', fontWeight: '500' },
});
