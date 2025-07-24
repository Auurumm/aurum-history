"use client"

import { useEffect, useState } from "react"
import { auth } from "@/lib/firebase"
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User // ✅ User 타입 추가
} from "firebase/auth"

export default function LoginButton() {
  const [user, setUser] = useState<User | null>(null) // ✅ 타입 명시

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user)
    })
    return () => unsubscribe()
  }, [])

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider()
    await signInWithPopup(auth, provider)
  }

  const handleLogout = async () => {
    await signOut(auth)
  }

  return (
    <button
      onClick={user ? handleLogout : handleLogin}
      className="px-4 py-2 border rounded-full"
    >
      {user ? "로그아웃" : "Google 로그인"}
    </button>
  )
}
