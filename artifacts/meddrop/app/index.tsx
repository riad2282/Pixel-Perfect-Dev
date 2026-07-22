import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import * as Haptics from 'expo-haptics';

export default function LoginScreen() {
  const { user, isLoading, login } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/(tabs)/');
    }
  }, [user, isLoading]);

  const handleLogin = async () => {
    if (!name.trim()) {
      Alert.alert('ত্রুটি', 'আপনার নাম লিখুন');
      return;
    }
    if (!phone.trim() || phone.trim().length < 8) {
      Alert.alert('ত্রুটি', 'সঠিক মোবাইল নম্বর লিখুন');
      return;
    }
    setSubmitting(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await login(name.trim(), phone.trim());
    router.replace('/(tabs)/');
    setSubmitting(false);
  };

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#00BCD4" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#fff' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoArea}>
          <Image
            source={require('@/assets/images/icon.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.appName}>MedDrop</Text>
          <Text style={styles.tagline}>ওষুধ আপনার দোরগোড়ায়</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.label}>আপনার নাম</Text>
          <View style={styles.inputRow}>
            <Text style={styles.inputIcon}>👤</Text>
            <TextInput
              style={styles.input}
              placeholder="আপনার নাম লিখুন"
              placeholderTextColor="#aaa"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          <Text style={[styles.label, { marginTop: 16 }]}>মোবাইল নম্বর</Text>
          <View style={styles.inputRow}>
            <Text style={styles.prefix}>+880</Text>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="আপনার মোবাইল নম্বর লিখুন"
              placeholderTextColor="#aaa"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>

          <TouchableOpacity
            style={[styles.loginBtn, submitting && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={submitting}
            activeOpacity={0.85}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginBtnText}>লগইন</Text>
            )}
          </TouchableOpacity>

          <View style={styles.links}>
            <TouchableOpacity onPress={() => Alert.alert('রেজিস্ট্রেশন', 'আপনার নাম ও মোবাইল নম্বর দিয়ে লগইন করুন')}>
              <Text style={styles.linkText}>আকাউন্ট নেই? রেজিস্ট্রেশন করুন</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Alert.alert('সাহায্য', 'আপনার মোবাইল নম্বর দিয়ে লগইন করুন')}>
              <Text style={[styles.linkText, { marginTop: 8 }]}>পাসওয়ার্ড ভুল গেছেন?</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 28,
    backgroundColor: '#fff',
  },
  logoArea: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoImage: {
    width: 90,
    height: 90,
    borderRadius: 20,
    marginBottom: 12,
  },
  appName: {
    fontSize: 36,
    fontFamily: 'Inter_700Bold',
    color: '#00BCD4',
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#888',
    marginTop: 4,
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#444',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#00BCD4',
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: '#F9FDFE',
    minHeight: 52,
  },
  inputIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  prefix: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: '#00BCD4',
    marginRight: 8,
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
    paddingRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: '#1A1A1A',
    paddingVertical: 14,
  },
  loginBtn: {
    backgroundColor: '#00BCD4',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 28,
    shadowColor: '#00BCD4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  loginBtnDisabled: {
    opacity: 0.7,
  },
  loginBtnText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.5,
  },
  links: {
    alignItems: 'center',
    marginTop: 24,
  },
  linkText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#00BCD4',
    textDecorationLine: 'underline',
  },
});
