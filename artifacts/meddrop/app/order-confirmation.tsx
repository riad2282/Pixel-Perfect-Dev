import React, { useEffect, useState } from 'react';
import {
  Alert,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { doc, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order, OrderType, OrderStatus } from '@/context/OrdersContext';
import * as Haptics from 'expo-haptics';

const TYPE_LABELS: Record<OrderType, string> = {
  medicine: '💊 ঔষধ অর্ডার',
  cigarette: '🚬 সিগারেট অর্ডার',
  drinks: '🥤 ড্রিংকস অর্ডার',
};

// প্রতিটি status-এর জন্য UI config
const STATUS_CONFIG: Record<OrderStatus, {
  label: string;
  sub: string;
  color: string;
  icon: 'clock' | 'check-circle' | 'truck' | 'package';
}> = {
  pending: {
    label: 'অর্ডার পেয়েছি',
    sub: 'রাইডার খোঁজা হচ্ছে...',
    color: '#FF9800',
    icon: 'clock',
  },
  confirmed: {
    label: 'অর্ডার কনফার্ম',
    sub: 'রাইডার আসছেন...',
    color: '#2196F3',
    icon: 'check-circle',
  },
  rider_assigned: {
    label: 'রাইডার রওনা হয়েছেন! 🛵',
    sub: 'আপনার কাছে আসছেন',
    color: '#4CAF50',
    icon: 'truck',
  },
  delivered: {
    label: 'ডেলিভারি সম্পন্ন ✅',
    sub: 'আপনার পণ্য পৌঁছে গেছে',
    color: '#9E9E9E',
    icon: 'package',
  },
};

// স্ট্যাটাস অনুযায়ী delivery steps
function getSteps(status: OrderStatus) {
  const done = (s: OrderStatus) => {
    const order: OrderStatus[] = ['pending', 'confirmed', 'rider_assigned', 'delivered'];
    return order.indexOf(status) >= order.indexOf(s);
  };
  return [
    { label: 'অর্ডার রিসিভ হয়েছে', done: done('pending') },
    { label: 'অর্ডার কনফার্ম হয়েছে', done: done('confirmed') },
    { label: 'রাইডার রওনা হয়েছেন', done: done('rider_assigned') },
    { label: 'ডেলিভারি সম্পন্ন', done: done('delivered') },
  ];
}

function tsToISO(val: unknown): string {
  if (!val) return new Date().toISOString();
  if (val instanceof Timestamp) return val.toDate().toISOString();
  if (typeof val === 'string') return val;
  return new Date().toISOString();
}

export default function OrderConfirmationScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const prevStatus = React.useRef<OrderStatus | null>(null);

  // ───── Firestore real-time listener — এই অর্ডারটি watch করো ─────
  useEffect(() => {
    if (!orderId) { setLoading(false); return; }

    const unsub = onSnapshot(
      doc(db, 'orders', orderId),
      (snap) => {
        if (!snap.exists()) { setLoading(false); return; }
        const data = snap.data();
        const updated: Order = {
          id: snap.id,
          type: data.type,
          details: data.details,
          address: data.address,
          prescriptionUri: data.prescriptionUri,
          status: data.status,
          riderName: data.riderName ?? '',
          riderPhone: data.riderPhone ?? '',
          userPhone: data.userPhone,
          userName: data.userName ?? '',
          createdAt: tsToISO(data.createdAt),
        };

        // স্ট্যাটাস বদলালে haptic ও notification
        if (prevStatus.current && prevStatus.current !== updated.status) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        prevStatus.current = updated.status;
        setOrder(updated);
        setLoading(false);
      },
      (err) => {
        console.warn('order-confirmation onSnapshot error:', err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [orderId]);

  const handleCall = async () => {
    if (!order?.riderPhone) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const cleaned = order.riderPhone.replace(/[^0-9]/g, '');
    const url = `tel:${cleaned}`;
    const ok = await Linking.canOpenURL(url);
    if (ok) Linking.openURL(url);
    else Alert.alert('কল', `রাইডারের নম্বর: ${order.riderPhone}`);
  };

  // ── Loading ──
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#00BCD4" />
        <Text style={styles.loadingText}>অর্ডার লোড হচ্ছে...</Text>
      </View>
    );
  }

  // ── Not found ──
  if (!order) {
    return (
      <View style={styles.center}>
        <Feather name="alert-circle" size={48} color="#E0E0E0" />
        <Text style={styles.notFoundText}>অর্ডার পাওয়া যায়নি</Text>
        <TouchableOpacity style={styles.goHomeBtn} onPress={() => router.replace('/(tabs)/')}>
          <Text style={styles.goHomeBtnText}>হোমে যান</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const cfg = STATUS_CONFIG[order.status];
  const steps = getSteps(order.status);
  const riderAssigned = order.status === 'rider_assigned' || order.status === 'delivered';

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#f5f5f5' }}
      contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 40 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Status Banner (রঙ বদলায়) ── */}
      <View style={[styles.banner, { backgroundColor: cfg.color }]}>
        <View style={styles.bannerIconCircle}>
          <Feather name={cfg.icon} size={40} color="#fff" />
        </View>
        <Text style={styles.bannerTitle}>{cfg.label}</Text>
        <Text style={styles.bannerSub}>{cfg.sub}</Text>

        {/* Pending হলে পালসিং লোডার দেখাই */}
        {order.status === 'pending' && (
          <View style={styles.searchingRow}>
            <ActivityIndicator color="#fff" size="small" />
            <Text style={styles.searchingText}>রাইডার খুঁজছি...</Text>
          </View>
        )}
      </View>

      {/* ── অর্ডার বিবরণ ── */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Feather name="shopping-bag" size={18} color="#00BCD4" />
          <Text style={styles.cardTitle}>অর্ডার বিবরণ</Text>
        </View>
        <View style={styles.divider} />
        <Row label="ধরন" value={TYPE_LABELS[order.type]} />
        <Row label="পণ্য" value={order.details} />
        <Row label="ঠিকানা" value={order.address} />
      </View>

      {/* ── রাইডার ইনফো ── */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Feather name="truck" size={18} color="#00BCD4" />
          <Text style={styles.cardTitle}>রাইডার স্ট্যাটাস</Text>
        </View>
        <View style={styles.divider} />

        {riderAssigned ? (
          <>
            {/* রাইডার accept করেছে */}
            <View style={styles.acceptedBanner}>
              <Feather name="check-circle" size={26} color="#fff" />
              <Text style={styles.acceptedText}>রাইডার অ্যাকসেপ্ট করেছেন!</Text>
            </View>
            <View style={styles.riderBox}>
              <View style={styles.riderAvatar}>
                <Feather name="user" size={24} color="#00BCD4" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.riderName}>{order.riderName || 'রাইডার'}</Text>
                <Text style={styles.riderPhone}>{order.riderPhone}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.callBtn} onPress={handleCall} activeOpacity={0.85}>
              <Feather name="phone" size={20} color="#fff" />
              <Text style={styles.callBtnText}>রাইডারকে কল করুন</Text>
            </TouchableOpacity>
          </>
        ) : (
          /* রাইডার এখনো নেয়নি */
          <View style={styles.waitingBox}>
            <ActivityIndicator color="#FF9800" />
            <Text style={styles.waitingText}>
              রাইডার খোঁজা হচ্ছে, একটু অপেক্ষা করুন...
            </Text>
          </View>
        )}
      </View>

      {/* ── ডেলিভারির ধাপ ── */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>ডেলিভারির ধাপ</Text>
        <View style={styles.divider} />
        {steps.map((step, i) => (
          <View key={i} style={styles.stepRow}>
            <View style={[styles.stepDot, step.done && styles.stepDotDone]}>
              {step.done && <Feather name="check" size={10} color="#fff" />}
            </View>
            <Text style={[styles.stepLabel, step.done && styles.stepLabelDone]}>
              {step.label}
            </Text>
          </View>
        ))}
      </View>

      {/* ── হোম বাটন ── */}
      <TouchableOpacity
        style={styles.homeBtn}
        onPress={() => router.replace('/(tabs)/')}
        activeOpacity={0.85}
      >
        <Feather name="home" size={18} color="#00BCD4" />
        <Text style={styles.homeBtnText}>হোমে ফিরে যান</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailKey}>{label}</Text>
      <Text style={[styles.detailValue, { flex: 1, textAlign: 'right' }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  center: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, backgroundColor: '#fff',
  },
  loadingText: { fontSize: 14, fontFamily: 'Inter_400Regular', color: '#888' },
  notFoundText: { fontSize: 18, fontFamily: 'Inter_600SemiBold', color: '#888' },
  goHomeBtn: {
    backgroundColor: '#00BCD4', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12,
  },
  goHomeBtnText: { color: '#fff', fontFamily: 'Inter_700Bold', fontSize: 15 },

  // Banner
  banner: {
    borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 16,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6,
  },
  bannerIconCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  bannerTitle: { fontSize: 20, fontFamily: 'Inter_700Bold', color: '#fff', textAlign: 'center' },
  bannerSub: {
    fontSize: 14, fontFamily: 'Inter_400Regular',
    color: 'rgba(255,255,255,0.88)', marginTop: 4,
  },
  searchingRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14,
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 8,
  },
  searchingText: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: '#fff' },

  // Cards
  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 6, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  cardTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', color: '#1A1A1A' },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginBottom: 12 },
  detailRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 8, gap: 8,
  },
  detailKey: { fontSize: 14, fontFamily: 'Inter_500Medium', color: '#888' },
  detailValue: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#1A1A1A' },

  // Rider
  acceptedBanner: {
    backgroundColor: '#4CAF50', borderRadius: 12, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14,
  },
  acceptedText: { color: '#fff', fontSize: 16, fontFamily: 'Inter_700Bold' },
  riderBox: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#F5F9FA', borderRadius: 12, padding: 12, marginBottom: 14,
  },
  riderAvatar: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: '#E0F7FA', alignItems: 'center', justifyContent: 'center',
  },
  riderName: { fontSize: 15, fontFamily: 'Inter_700Bold', color: '#1A1A1A' },
  riderPhone: { fontSize: 13, fontFamily: 'Inter_400Regular', color: '#555', marginTop: 2 },
  callBtn: {
    backgroundColor: '#00BCD4', borderRadius: 12, paddingVertical: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: '#00BCD4', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3, shadowRadius: 6, elevation: 4,
  },
  callBtnText: { color: '#fff', fontSize: 16, fontFamily: 'Inter_700Bold' },
  waitingBox: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#FFF8F0', borderRadius: 12,
    padding: 16, borderWidth: 1, borderColor: '#FFE0B2',
  },
  waitingText: {
    fontSize: 14, fontFamily: 'Inter_400Regular', color: '#E65100', flex: 1,
  },

  // Steps
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  stepDot: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: '#E0E0E0',
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
  },
  stepDotDone: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  stepLabel: { fontSize: 14, fontFamily: 'Inter_400Regular', color: '#aaa' },
  stepLabelDone: { color: '#1A1A1A', fontFamily: 'Inter_600SemiBold' },

  // Home btn
  homeBtn: {
    borderWidth: 2, borderColor: '#00BCD4', borderRadius: 14, paddingVertical: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#fff',
  },
  homeBtnText: { color: '#00BCD4', fontSize: 16, fontFamily: 'Inter_700Bold' },
});
