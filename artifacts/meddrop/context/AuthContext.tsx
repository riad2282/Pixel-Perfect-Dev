import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface User {
  name: string;
  phone: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (name: string, phone: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('meddrop_user');
        if (stored) setUser(JSON.parse(stored));
      } catch {}
      setIsLoading(false);
    })();
  }, []);

  const login = async (name: string, phone: string) => {
    const u = { name, phone };
    // Save locally
    await AsyncStorage.setItem('meddrop_user', JSON.stringify(u));
    setUser(u);
    // Save / update user in Firestore
    try {
      await setDoc(
        doc(db, 'users', phone),
        { name, phone, lastLoginAt: serverTimestamp() },
        { merge: true }
      );
    } catch (e) {
      console.warn('Firestore user sync failed:', e);
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('meddrop_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
