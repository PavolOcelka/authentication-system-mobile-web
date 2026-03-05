import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../lib/useAuth';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function ForgotPasswordScreen() {
  const { resetPassword, loading, error } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    await resetPassword(email);
    if (!error) setSent(true);
  };

  const styles = createStyles(colors);

  if (sent) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Check your email</Text>
        <Text style={styles.subtitle}>We sent a password reset link to {email}</Text>
        <Pressable onPress={() => router.replace('/(auth)/login')} style={({ pressed }) => pressed && styles.linkPressed}>
          <Text style={styles.link}>Back to sign in</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={styles.title}>Reset password</Text>
      <Text style={styles.subtitle}>Enter your email and we'll send you a reset link.</Text>

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

      <Pressable style={[styles.button, loading && styles.buttonDisabled]} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Sending...' : 'Send reset link'}</Text>
      </Pressable>

      <View style={styles.footer}>
        <Pressable onPress={() => router.replace('/(auth)/login')} style={({ pressed }) => pressed && styles.linkPressed}>
          <Text style={styles.link}>Back to sign in</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function createStyles(colors: typeof Colors.light) {
  return StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: colors.background },
    title: { fontSize: 24, fontWeight: '600', color: colors.text, marginBottom: 8 },
    subtitle: { fontSize: 14, color: colors.tabIconDefault, marginBottom: 24 },
    input: { height: 44, borderWidth: 1, borderColor: '#e4e4e7', borderRadius: 8, paddingHorizontal: 12, fontSize: 14, color: colors.text, marginBottom: 12 },
    button: { height: 44, backgroundColor: colors.tint, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
    buttonDisabled: { opacity: 0.5 },
    buttonText: { color: '#fff', fontSize: 14, fontWeight: '500' },
    error: { color: '#b91c1c', fontSize: 13, marginBottom: 12, padding: 12, backgroundColor: '#fef2f2', borderRadius: 8 },
    footer: { alignItems: 'center', marginTop: 24 },
    link: { fontSize: 14, color: colors.text, fontWeight: '500' },
    linkPressed: { opacity: 0.6 },
  });
}
