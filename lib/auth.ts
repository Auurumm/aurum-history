// lib/auth.ts
"use client"

import { useEffect, useState } from "react"
import { auth, db } from "./firebase"
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth"
import {
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore"

export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(true)

      if (firebaseUser) {
        const userDocRef = doc(db, "users", firebaseUser.uid)
        const userSnap = await getDoc(userDocRef)

        // ✅ 자동 등록: users/{uid} 문서가 없으면 생성
        if (!userSnap.exists()) {
          await setDoc(userDocRef, {
            email: firebaseUser.email,
            role: "admin", // 또는 "user" 등
          })
        }

        // ✅ role 확인
        const finalSnap = await getDoc(userDocRef)
        const role = finalSnap.data()?.role
        setIsAdmin(role === "admin")
      } else {
        setIsAdmin(false)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    setError("")
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (err: any) {
      console.error(err)
      setError("로그인 실패: " + err.message)
    }
  }

  const logout = async () => {
    await signOut(auth)
  }

  return {
    user,
    isAdmin,
    login,
    logout,
    loading,
    error,
  }
}
