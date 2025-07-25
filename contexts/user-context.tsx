"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { doc, getDoc, onSnapshot } from "firebase/firestore";

// 🔥 확장된 사용자 데이터 타입
interface UserData {
  uid: string;
  email: string;
  name: string;
  nickname: string;
  phone: string;
  profileImage?: string;
  role: string;
  createdAt: any;
  updatedAt?: any;
}

interface UserContextType {
  user: UserData | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  refreshUser: () => Promise<void>; // 🔥 수동 새로고침 함수
}

const UserContext = createContext<UserContextType>({
  user: null,
  firebaseUser: null,
  loading: true,
  refreshUser: async () => {},
});

// 🔥 안전한 문자열 변환
const safeString = (value: any): string => {
  return value || "";
};

export function UserProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔥 사용자 데이터 수동 새로고침 함수
  const refreshUser = async () => {
    if (!firebaseUser) return;
    
    try {
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        const userData: UserData = {
          uid: firebaseUser.uid,
          email: safeString(data.email),
          name: safeString(data.name),
          nickname: safeString(data.nickname),
          phone: safeString(data.phone),
          profileImage: data.profileImage,
          role: safeString(data.role),
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        };
        setUser(userData);
      }
    } catch (error) {
      console.error("사용자 데이터 새로고침 오류:", error);
    }
  };

  // 🔥 Firebase 인증 상태 감지
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // 🔥 Firestore 실시간 리스너 (사용자 데이터 변경 감지)
  useEffect(() => {
    if (!firebaseUser) return;

    const unsubscribe = onSnapshot(
      doc(db, "users", firebaseUser.uid),
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          const userData: UserData = {
            uid: firebaseUser.uid,
            email: safeString(data.email),
            name: safeString(data.name),
            nickname: safeString(data.nickname),
            phone: safeString(data.phone),
            profileImage: data.profileImage,
            role: safeString(data.role),
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          };
          setUser(userData);
        } else {
          setUser(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error("사용자 데이터 리스너 오류:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firebaseUser]);

  return (
    <UserContext.Provider value={{ user, firebaseUser, loading, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};