import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { collection, onSnapshot, orderBy, query, doc, updateDoc } from 'firebase/firestore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { db } from '@/lib/firebase';
import { Order, OrderStatus, OrderType } from '@/context/OrdersContext';

const TYPE_LABELS: Record<OrderType, string> = {
  medicine: '💊 ঔষধ',
  cigarette: '🚬 সিগারেট',
  drinks: '🥤 ড্রিংকস',
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'অপেক্ষায়',
  confirmed: 'কনফার্ম',
  rider_assigned: 'রাইডার যাচ্ছেন',
  delivered: 'ডেলিভারি হয়েছে',
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: '#FF9800',
  confirmed: '#2196F3',
  rider_assigned: '#4CAF50',
  delivered: '#9E9E9E',
};

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: 'confirmed',
  confirmed: 'rider_assigned',
  rider_assigned: 'delivered',
};

const NEXT_STATUS_LABEL: Partial<Record<OrderStatus, string>> = {
  pending: '✅ কনফার্ম করুন',
  confirmed: '🛵 রাইডার পাঠান',
  rider_assigned: '📦 ডেলিভারি দিন',
};

function AdminOrderCard({ order, onStatusChange }: { order: Order; onStatusChange: (id: string, status: OrderStatus) => void }) {
  const date = new Date(order.createdAt);
  const formatted = `${date.getDate()}/${date.getMonth() + 1} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  const nextStatus = NEXT_STATUS[order.status];

  return (
    <View style={styles.card}>
      {/* Header row */}
      <View style={styles.cardTop}>
        <Text style={styles.typeLabel}>{TYPE_LABELS[order.type]}</Text>
        <View style={[styles.badge, { backgroundColor: STATUS_COLORS[order.status] + '22' }]}>
          <Text style={[styles.badgeText, { color: STATUS_COLORS[order.status] }]}>
            {STATUS_LABELS[order.status]}
          </Text>
        </View>
      </View>

      {/* Customer phone */}
      <View style={styles.infoRow}>
        <Feather name="phone" size={13} color="#00BCD4" />
        <Text style={styles.infoText}> 📞 {order.userPhone}</Text>
      </View>

      {/* Details */}
      <Text style={styles.details} numberOfLines={2}>{order.details}</Text>

      {/* Address */}
      <View style={styles.infoRow}>
        <Feather name="map-pin" size={13} color="#888" />
        <Text style={styles.address} numberOfLines={1}> {order.address}</Text>
      </View>

      {/* Rider */}
      <View style={styles.riderRow}>
        <Feather name="user" size={13} color="#555" />
        <Text style={styles.riderText}> {order.riderName} — {order.riderPhone}</Text>
      </View>

      <Text style={styles.date}>{formatted}</Text>

      {/* Action button */}
      {nextStatus && (
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: STATUS_COLORS[nextStatus] }]}
          onPress={() => onStatusChange(order.id, nextStatus)}
          activeOpacity={0.8}
        >
          <Text style={styles.actionBtnText}>{NEXT_STATUS_LABEL[order.status]}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function AdminScreen() {
  const insets = useSafeAreaInsets();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'delivered'>('active');

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));

    const unsub = onSnapshot(q, (snap) => {
      const list: Order[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          type: data.type,
          details: data.details,
          address: data.address,
          prescriptionUri: data.prescriptionUri,
          status: data.status,
          riderName: data.riderName,
          riderPhone: data.riderPhone,
          userPhone: data.userPhone,
          createdAt: data.createdAt?.toDate?.()?.toISOString?.() ?? new Date().toISOString(),
        } as Order;
      });
      setOrders(list);
      setLoading(false);
    }, (err) => {
      console.warn('Admin onSnapshot error:', err);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleStatusChange = async (id: string, newStatus: OrderStatus) => {
    try {
      await updateDoc(doc(db, 'orders', id), { status: newStatus });
    } catch (e) {
      Alert.alert('ত্রুটি', 'স্ট্যাটাস আপডেট করা যায়নি');
    }
  };

  const filtered = orders.filter((o) => {
    if (filter === 'active') return o.status !== 'delivered';
    if (filter === 'delivered') return o.status === 'delivered';
    return true;
  });

  const activeCount = orders.filter((o) => o.status !== 'delivered').length;

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 12) }]}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>🛵 Admin Panel</Text>
          {activeCount > 0 && (
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>{activeCount} চলমান</Text>
            </View>
          )}
        </View>
        <Text style={styles.headerSub}>সব কাস্টমারের অর্ডার রিয়েল-টাইম</Text>

        {/* Filter tabs */}
        <View style={styles.filterRow}>
          {(['active', 'all', 'delivered'] as const).map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterTab, filter === f && styles.filterTabActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterTabText, filter === f && styles.filterTabTextActive]}>
                {f === 'active' ? 'চলমান' : f === 'all' ? 'সব' : 'সম্পন্ন'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#00BCD4" />
          <Text style={styles.loadingText}>লোড হচ্ছে...</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AdminOrderCard order={item} onStatusChange={handleStatusChange} />
          )}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 90 }]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="inbox" size={56} color="#E0E0E0" />
              <Text style={styles.emptyTitle}>কোনো অর্ডার নেই</Text>
              <Text style={styles.emptyText}>
                {filter === 'active' ? 'নতুন অর্ডার আসলে এখানে দেখা যাবে' : 'কোনো তথ্য পাওয়া যায়নি'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#00BCD4',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
  },
  headerSub: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
    marginBottom: 12,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 5,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  liveText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: '#fff',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  filterTabActive: {
    backgroundColor: '#fff',
  },
  filterTabText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: 'rgba(255,255,255,0.85)',
  },
  filterTabTextActive: {
    color: '#00BCD4',
  },
  list: {
    padding: 14,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeLabel: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    color: '#1A1A1A',
  },
  badge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: '#00BCD4',
  },
  details: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#555',
    lineHeight: 20,
    marginBottom: 6,
  },
  address: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: '#888',
    flex: 1,
  },
  riderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  riderText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#777',
  },
  date: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: '#bbb',
    marginTop: 6,
    textAlign: 'right',
  },
  actionBtn: {
    marginTop: 12,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#888',
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: '#888',
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#aaa',
    textAlign: 'center',
  },
});
