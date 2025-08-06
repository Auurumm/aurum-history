// lib/firebase.ts
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// 🔍 설정값 디버깅 로그
console.group('🔥 Firebase 설정 디버깅');
console.log('API Key:', firebaseConfig.apiKey?.substring(0, 10) + '...');
console.log('Auth Domain:', firebaseConfig.authDomain);
console.log('Project ID:', firebaseConfig.projectId);
console.log('Storage Bucket:', firebaseConfig.storageBucket);
console.log('App ID:', firebaseConfig.appId?.substring(0, 15) + '...');

// 🚨 설정값 유효성 검사
const missingConfig = [];
if (!firebaseConfig.apiKey || firebaseConfig.apiKey.includes('dummy')) {
  missingConfig.push('NEXT_PUBLIC_FIREBASE_API_KEY');
}
if (!firebaseConfig.authDomain || firebaseConfig.authDomain.includes('dummy')) {
  missingConfig.push('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');
}
if (!firebaseConfig.projectId || firebaseConfig.projectId.includes('dummy')) {
  missingConfig.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID');
}
if (!firebaseConfig.storageBucket || firebaseConfig.storageBucket.includes('dummy')) {
  missingConfig.push('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET');
}

if (missingConfig.length > 0) {
  console.error('❌ 누락된 Firebase 설정:', missingConfig);
  console.error('📝 .env.local 파일에 실제 Firebase 설정값을 추가해주세요!');
} else {
  console.log('✅ Firebase 설정이 완료된 것으로 보입니다');
}
console.groupEnd();

// Firebase 앱 초기화
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

console.log('🔥 Firebase 초기화 완료');