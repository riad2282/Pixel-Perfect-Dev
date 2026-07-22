import React from 'react';
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOrders, Order, OrderType } from '@/context/OrdersContext';
import { Feather } from '@expo/vector-icons';

const TYPE_LABELS: Record<OrderType, string> = {
  medicine: '💊 ঔষধ',
  cigarette: '🚬 সিগারেট',
  drinks: '🥤 ড্রিংকস',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'অপেক্ষায়',
  confirmed: 'কনফার্ম',
  rider_assigned: 'রাইডার নিয়েছেন',
  delivered: 'ডেলিভারি হয়েছে',
};

const STATUS_COLORS: Record<string, string> = {
  pending: '#FF9800',
  confirmed: '#2196F3',
  rider_assigned: '#4CAF50',
  delivered: '#9E9E9E',
};

function OrderCard({ order, onPress }: { order: Order; onPress: () => void }) {
  const date = new Date(order.createdAt);
  const formatted = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.cardTop}>
        <Text style={styles.typeLabel}>{TYPE_LABELS[order.type]}</Text>
        <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[order.status] + '22' }]}>
          <Text style={[styles.statusText, { color: STATUS_COLORS[order.status] }]}>
            {STATUS_LABELS[order.status]}
          </Text>
        </View>
      </View>
      <Text style={styles.details} numberOfLines={2}>{order.details}</Text>
      <View style={styles.cardBottom}>
        <Feather name="map-pin" size={13} color="#888" />
        <Text style={styles.address} numberOfLines={1}> {order.address}</Text>
      </View>
      <Text style={styles.date}>{formatted}</Text>
    </TouchableOpacity>
  );
}

export default function OrdersScreen() {
  const { orders } = useOrders();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={[styles.header, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 12) }]}>
        <Text style={styles.headerTitle}>আমার অর্ডার</Text>
        <Text style={styles.headerSub}>{orders.length} টি অর্ডার</Text>
      </View>

      <FlatList
        data={orders}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            onPress={() => router.push({ pathname: '/order-confirmation', params: { orderId: item.id } })}
          />
        )}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + 80 },
        ]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!!orders.length}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="shopping-bag" size={56} color="#E0E0E0" />
            <Text style={styles.emptyTitle}>কোনো অর্ডার নেই</Text>
            <Text style={styles.emptyText}>হোম থেকে অর্ডার করুন</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#00BCD4',
    paddingHorizontal: 20,
    paddingBottom: 20,
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
  },
  list: {
    padding: 16,
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
    shadowOpacity: 0.08,
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
  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  details: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#555',
    lineHeight: 20,
    marginBottom: 8,
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  address: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: '#888',
    flex: 1,
  },
  date: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: '#bbb',
    marginTop: 6,
    textAlign: 'right',
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
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
  },
});
