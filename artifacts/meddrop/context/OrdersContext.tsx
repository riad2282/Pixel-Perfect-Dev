import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  collection,
  doc,
  addDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';

export type OrderType = 'medicine' | 'cigarette' | 'drinks';
export type OrderStatus = 'pending' | 'confirmed' | 'rider_assigned' | 'delivered';

export interface Order {
  id: string;
  type: OrderType;
  details: string;
  address: string;
  prescriptionUri?: string;
  status: OrderStatus;
  riderName: string;      // খালি থাকবে — রাইডার accept করলে রাইডার অ্যাপ fill করবে
  riderPhone: string;     // খালি থাকবে — রাইডার accept করলে রাইডার অ্যাপ fill করবে
  userPhone: string;
  userName: string;
  createdAt: string;
}

interface OrdersContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'status' | 'riderName' | 'riderPhone' | 'createdAt' | 'userPhone' | 'userName'>) => Promise<Order>;
  getOrder: (id: string) => Order | undefined;
  isLoading: boolean;
}

const OrdersContext = createContext<OrdersContextType>({
  orders: [],
  addOrder: async () => ({} as Order),
  getOrder: () => undefined,
  isLoading: false,
});

function tsToISO(val: unknown): string {
  if (!val) return new Date().toISOString();
  if (val instanceof Timestamp) return val.toDate().toISOString();
  if (typeof val === 'string') return val;
  return new Date().toISOString();
}

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // ───── Real-time listener — শুধু এই ইউজারের অর্ডার ─────
  useEffect(() => {
    if (!user?.phone) {
      setOrders([]);
      return;
    }
    setIsLoading(true);

    const q = query(
      collection(db, 'orders'),
      where('userPhone', '==', user.phone),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const list: Order[] = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
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
          } as Order;
        });
        setOrders(list);
        setIsLoading(false);
        // Offline cache
        AsyncStorage.setItem('meddrop_orders_' + user.phone, JSON.stringify(list)).catch(() => {});
      },
      (err) => {
        console.warn('OrdersContext onSnapshot error:', err);
        AsyncStorage.getItem('meddrop_orders_' + user.phone)
          .then((c) => { if (c) setOrders(JSON.parse(c)); })
          .catch(() => {})
          .finally(() => setIsLoading(false));
      }
    );

    return () => unsub();
  }, [user?.phone]);

  // ───── নতুন অর্ডার যোগ করা ─────
  const addOrder = async (
    input: Omit<Order, 'id' | 'status' | 'riderName' | 'riderPhone' | 'createdAt' | 'userPhone' | 'userName'>
  ): Promise<Order> => {
    const phone = user?.phone ?? 'unknown';
    const name = user?.name ?? '';

    // রাইডার assign করা হবে না — রাইডার অ্যাপ নিজে নেবে
    const payload = {
      ...input,
      userPhone: phone,
      userName: name,
      status: 'pending' as OrderStatus,   // ← pending থেকে শুরু
      riderName: '',                        // ← রাইডার accept করলে fill হবে
      riderPhone: '',
      riderId: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    let id = Date.now().toString() + Math.random().toString(36).substring(2, 9);

    try {
      const ref = await addDoc(collection(db, 'orders'), payload);
      id = ref.id;
    } catch (e) {
      console.warn('Firestore addOrder failed, using local fallback:', e);
      const local: Order = {
        ...input,
        id,
        userPhone: phone,
        userName: name,
        status: 'pending',
        riderName: '',
        riderPhone: '',
        createdAt: new Date().toISOString(),
      };
      setOrders((prev) => [local, ...prev]);
      return local;
    }

    return {
      ...input,
      id,
      userPhone: phone,
      userName: name,
      status: 'pending',
      riderName: '',
      riderPhone: '',
      createdAt: new Date().toISOString(),
    };
  };

  const getOrder = (id: string) => orders.find((o) => o.id === id);

  return (
    <OrdersContext.Provider value={{ orders, addOrder, getOrder, isLoading }}>
      {children}
    </OrdersContext.Provider>
  );
}

export const useOrders = () => useContext(OrdersContext);
