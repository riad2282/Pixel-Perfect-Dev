import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
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
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import { useOrders } from '@/context/OrdersContext';
import * as Haptics from 'expo-haptics';

export default function MedicineOrderScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addOrder } = useOrders();

  const [prescription, setPrescription] = useState<string | null>(null);
  const [medicineName, setMedicineName] = useState('');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPrescription(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('অনুমতি প্রয়োজন', 'ক্যামেরা ব্যবহার করতে অনুমতি দিন');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled && result.assets[0]) {
      setPrescription(result.assets[0].uri);
    }
  };

  const handleUpload = () => {
    Alert.alert('প্রেসক্রিপশন', 'কোথা থেকে আপলোড করবেন?', [
      { text: 'গ্যালারি থেকে', onPress: pickImage },
      { text: 'ক্যামেরা দিয়ে', onPress: takePhoto },
      { text: 'বাতিল', style: 'cancel' },
    ]);
  };

  const handleSubmit = async () => {
    if (!medicineName.trim() && !prescription) {
      Alert.alert('ত্রুটি', 'প্রেসক্রিপশন আপলোড করুন বা ওষুধের নাম লিখুন');
      return;
    }
    if (!address.trim()) {
      Alert.alert('ত্রুটি', 'ডেলিভারি অ্যাড্রেস দিন');
      return;
    }
    setSubmitting(true);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const order = await addOrder({
      type: 'medicine',
      details: medicineName.trim() || 'প্রেসক্রিপশন অনুযায়ী',
      address: address.trim(),
      prescriptionUri: prescription ?? undefined,
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
      <Text style={styles.heading}>ফার্মেসি থেকে ওষুধ অর্ডার করুন</Text>

      {/* Prescription Upload */}
      <TouchableOpacity style={styles.uploadBox} onPress={handleUpload} activeOpacity={0.8}>
        {prescription ? (
          <View style={styles.previewWrap}>
            <Image source={{ uri: prescription }} style={styles.preview} resizeMode="cover" />
            <View style={styles.previewOverlay}>
              <Feather name="check-circle" size={28} color="#4CAF50" />
              <Text style={styles.previewText}>প্রেসক্রিপশন আপলোড হয়েছে</Text>
            </View>
          </View>
        ) : (
          <>
            <View style={styles.uploadIcon}>
              <Feather name="camera" size={32} color="#00BCD4" />
              <Feather name="file-text" size={22} color="#00BCD4" style={{ marginLeft: -8, marginTop: 10 }} />
            </View>
            <Text style={styles.uploadTitle}>প্রেসক্রিপশন আপলোড করুন</Text>
            <Text style={styles.uploadSub}>ক্যামেরা বা গ্যালারি থেকে</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Medicine Name */}
      <Text style={styles.label}>ওষুধের নাম (যদি প্রেসক্রিপশন ছাড়া লাগে)</Text>
      <View style={styles.inputWrap}>
        <Feather name="package" size={18} color="#aaa" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="আপনার ওষুধের নাম লিখুন"
          placeholderTextColor="#aaa"
          value={medicineName}
          onChangeText={setMedicineName}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      {/* Address */}
      <Text style={styles.label}>ডেলিভারি ঠিকানা</Text>
      <View style={styles.inputWrap}>
        <Feather name="map-pin" size={18} color="#aaa" style={styles.inputIcon} />
        <TextInput
          style={[styles.input, { minHeight: 52 }]}
          placeholder="আপনার ডেলিভারি এড্রেস দিন"
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
  container: {
    padding: 20,
  },
  heading: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 30,
  },
  uploadBox: {
    borderWidth: 2,
    borderColor: '#00BCD4',
    borderStyle: 'dashed',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#F0FDFE',
    marginBottom: 24,
    minHeight: 140,
    justifyContent: 'center',
  },
  uploadIcon: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  uploadTitle: {
    fontSize: 17,
    fontFamily: 'Inter_700Bold',
    color: '#00BCD4',
  },
  uploadSub: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: '#888',
    marginTop: 4,
  },
  previewWrap: {
    width: '100%',
    height: 140,
    borderRadius: 10,
    overflow: 'hidden',
  },
  preview: {
    width: '100%',
    height: '100%',
  },
  previewOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  previewText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#4CAF50',
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#555',
    marginBottom: 8,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: '#FAFAFA',
    marginBottom: 20,
    minHeight: 80,
  },
  inputIcon: {
    marginTop: 16,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: '#1A1A1A',
    paddingVertical: 14,
    minHeight: 80,
  },
  submitBtn: {
    backgroundColor: '#00BCD4',
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 8,
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
