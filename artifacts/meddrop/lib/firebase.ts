import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase project: meddrop-11adb
const firebaseConfig = {
  apiKey: 'AIzaSyB5tl5QFT9UrcppnpBgKvs9O6B7fg8gHaE',
  authDomain: 'meddrop-11adb.firebaseapp.com',
  projectId: 'meddrop-11adb',
  storageBucket: 'meddrop-11adb.firebasestorage.app',
  messagingSenderId: '1071925812575',
  appId: '1:1071925812575:android:6d981f9a85c08b6a22aaea',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);
