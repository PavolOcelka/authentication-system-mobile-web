import { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../lib/useAuth';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function LoginScreen() {
  const { signIn, loading, error, clearError } = useAuth();
  const router = useRouter();

  useEffect(() => { return () => clearError(); }, []);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async () => {
    const success = await signIn(email, password);
    if (success) router.replace('/(tabs)');
  };

  const styles = createStyles(colors);

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
        <Pressable onPress={() => router.replace('/(auth)/forgot-password')} style={({ pressed }) => pressed && styles.linkPressed}>
          <Text style={styles.link}>Forgot password?</Text>
        </Pressable>
        <Text style={styles.separator}> · </Text>
        <Pressable onPress={() => router.replace('/(auth)/register')} style={({ pressed }) => pressed && styles.linkPressed}>
          <Text style={styles.link}>Create account</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function createStyles(colors: typeof Colors.light) {
  return StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: colors.background },
    title: { fontSize: 24, fontWeight: '600', color: colors.text, marginBottom: 24 },
    input: { height: 44, borderWidth: 1, borderColor: '#e4e4e7', borderRadius: 8, paddingHorizontal: 12, fontSize: 14, color: colors.text, marginBottom: 12 },
    button: { height: 44, backgroundColor: colors.tint, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
    buttonDisabled: { opacity: 0.5 },
    buttonText: { color: '#fff', fontSize: 14, fontWeight: '500' },
    error: { color: '#b91c1c', fontSize: 13, marginBottom: 12, padding: 12, backgroundColor: '#fef2f2', borderRadius: 8 },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
    link: { fontSize: 14, color: colors.tabIconDefault },
    linkPressed: { opacity: 0.6 },
    separator: { fontSize: 14, color: colors.tabIconDefault },
  });
}
