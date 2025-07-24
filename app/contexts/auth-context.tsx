// contexts/auth-context.tsx
"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { auth } from "../lib/firebase"
import { User, onAuthStateChanged } from "firebase/auth"

const AuthContext = createContext<User | null>(null)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser)
    return () => unsubscribe()
  }, [])

  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
