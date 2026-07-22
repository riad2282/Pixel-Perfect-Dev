import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useOrders } from '@/context/OrdersContext';
import * as Haptics from 'expo-haptics';

const QUICK_PICKS = [
  '২ লিটার কোকাকোলা',
  '১ লিটার মিনারেল ওয়াটার',
  '১ বোতল স্প্রাইট',
  '৬ বোতল পানি',
];

export default function DrinksOrderScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addOrder } = useOrders();

  const [details, setDetails] = useState('');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!details.trim()) {
      Alert.alert('ত্রুটি', 'পানীয়ের নাম ও পরিমাণ লিখুন');
      return;
    }
    if (!address.trim()) {
      Alert.alert('ত্রুটি', 'ডেলিভারি এড্রেস দিন');
      return;
    }
    setSubmitting(true);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const order = await addOrder({
      type: 'drinks',
      details: details.trim(),
      address: address.trim(),
    });
    router.replace({ pathname: '/order-confirmation', params: { orderId: order.id } });
    setSubmitting(false);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#fff' }}
      contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 40 }]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.heading}>পানি বা কোল্ড ড্রিংকস অর্ডার করুন</Text>

      {/* Quick picks */}
      <Text style={styles.label}>দ্রুত সিলেক্ট করুন</Text>
      <View style={styles.quickRow}>
        {QUICK_PICKS.map((pick, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.quickChip, details === pick && styles.quickChipActive]}
            onPress={() => setDetails(pick)}
            activeOpacity={0.8}
          >
            <Text style={[styles.quickText, details === pick && styles.quickTextActive]}>
              {pick}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Details */}
      <Text style={[styles.label, { marginTop: 16 }]}>পণ্যের নাম ও পরিমাণ</Text>
      <View style={styles.textAreaWrap}>
        <TextInput
          style={styles.textArea}
          placeholder="আপনি পানি বা কোল্ড ড্রিংকসের নাম ও পরিমাণ লিখুন (যেমন: ২ লিটার কোকাকোলা বা ১ লিটার মিনারেল ওয়াটার)"
          placeholderTextColor="#aaa"
          value={details}
          onChangeText={setDetails}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />
      </View>

      {/* Address */}
      <Text style={styles.label}>ডেলিভারি অ্যাড্রেস</Text>
      <View style={styles.inputWrap}>
        <Feather name="map-pin" size={18} color="#aaa" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="ডেলিভারি এড্রেস দিন"
          placeholderTextColor="#aaa"
          value={address}
          onChangeText={setAddress}
          multiline
        />
      </View>

      <TouchableOpacity
        style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
        onPress={handleSubmit}
        disabled={submitting}
        activeOpacity={0.85}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Feather name="send" size={18} color="#fff" />
            <Text style={styles.submitText}>অর্ডার সাবমিট</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  heading: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 30,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#555',
    marginBottom: 10,
  },
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickChip: {
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#fafafa',
  },
  quickChipActive: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  quickText: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: '#555',
  },
  quickTextActive: {
    color: '#4CAF50',
    fontFamily: 'Inter_700Bold',
  },
  textAreaWrap: {
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#FAFAFA',
    marginBottom: 20,
    minHeight: 120,
  },
  textArea: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: '#1A1A1A',
    minHeight: 96,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: '#FAFAFA',
    marginBottom: 24,
    minHeight: 52,
  },
  inputIcon: { marginTop: 16, marginRight: 8 },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: '#1A1A1A',
    paddingVertical: 14,
  },
  submitBtn: {
    backgroundColor: '#00BCD4',
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#00BCD4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
  },
});
