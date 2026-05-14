import { initializeApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY as string | undefined;
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined;

export const isFirebaseConfigured = !!(apiKey && projectId);

export let db: Firestore | null = null;

if (isFirebaseConfigured) {
  try {
    const app = initializeApp({
      apiKey,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    });
    db = getFirestore(app);
  } catch {
    console.warn('Firebase başlatılamadı, localStorage kullanılıyor.');
  }
}
