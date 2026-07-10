"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"

interface User {
  id: Id<"users">
  email: string
  name: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signOut: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)

  const user = useQuery(api.auth.getCurrentUser, token ? { token } : "skip")

  const signInMutation = useMutation(api.auth.signIn)
  const signUpMutation = useMutation(api.auth.signUp)
  const signOutMutation = useMutation(api.auth.signOut)

  useEffect(() => {
    const savedToken = localStorage.getItem("habitflow_token")
    if (savedToken) {
      setToken(savedToken)
    }
    setIsInitialized(true)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (token) {
      localStorage.setItem("habitflow_token", token)
    } else {
      localStorage.removeItem("habitflow_token")
    }
  }, [token])

  const signIn = async (email: string, password: string) => {
    try {
      const result = await signInMutation({ email, password })
      if (result.success) {
        setToken(result.token)
      }
    } catch (error) {
      console.error("Sign in error:", error)
      throw error
    }
  }

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const result = await signUpMutation({ email, password, name })
      if (result.success) {
        setToken(result.token)
      }
    } catch (error) {
      console.error("Sign up error:", error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      if (token) {
        await signOutMutation({ token })
      }
      setToken(null)
    } catch (error) {
      console.error("Sign out error:", error)
      setToken(null)
    }
  }

  const value: AuthContextType = {
    user: user || null,
    isLoading: !isInitialized || (!!token && user === undefined),
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
