"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react"
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
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const TOKEN_KEY = "habitflow_token"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  // Optimistic user: set immediately from signIn/signUp response to avoid waiting for the query
  const [optimisticUser, setOptimisticUser] = useState<User | null>(null)

  // Query current user based on token - this is the "verified" user from the server
  const queriedUser = useQuery(api.auth.getCurrentUser, token ? { token } : "skip")

  const signInMutation = useMutation(api.auth.signIn)
  const signUpMutation = useMutation(api.auth.signUp)
  const signOutMutation = useMutation(api.auth.signOut)

  // Initialize: read token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY)
    if (savedToken) {
      setToken(savedToken)
    }
    setIsInitialized(true)
  }, [])

  // Persist token changes to localStorage
  useEffect(() => {
    if (!isInitialized) return
    if (token) {
      localStorage.setItem(TOKEN_KEY, token)
    } else {
      localStorage.removeItem(TOKEN_KEY)
    }
  }, [token, isInitialized])

  // Handle expired/invalid tokens: if we have a token but the query resolved to null, clear it
  useEffect(() => {
    if (isInitialized && token && queriedUser === null) {
      setToken(null)
      setOptimisticUser(null)
    }
  }, [isInitialized, token, queriedUser])

  // Once the real query resolves, clear the optimistic user (the query result takes over)
  useEffect(() => {
    if (queriedUser !== undefined) {
      setOptimisticUser(null)
    }
  }, [queriedUser])

  const signIn = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await signInMutation({ email, password })
      if (result.success && result.token) {
        // Set optimistic user immediately from the mutation response — no waiting for query
        setOptimisticUser({ id: result.user.id, email: result.user.email, name: result.user.name })
        setToken(result.token)
        return { success: true }
      }
      return { success: false, error: "Sign in failed. Please try again." }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Sign in failed"
      if (message.includes("Invalid email or password")) {
        return { success: false, error: "Invalid email or password. Please check your credentials." }
      }
      return { success: false, error: message }
    }
  }, [signInMutation])

  const signUp = useCallback(async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await signUpMutation({ email, password, name })
      if (result.success && result.token) {
        // Set optimistic user immediately — skip the query wait entirely
        setOptimisticUser({ id: result.user.id, email: result.user.email, name: result.user.name })
        setToken(result.token)
        return { success: true }
      }
      return { success: false, error: "Account creation failed. Please try again." }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Sign up failed"
      if (message.includes("already exists")) {
        return { success: false, error: "An account with this email already exists. Try signing in instead." }
      }
      return { success: false, error: message }
    }
  }, [signUpMutation])

  const signOut = useCallback(async () => {
    try {
      if (token) {
        await signOutMutation({ token })
      }
    } catch (error) {
      console.error("Sign out error:", error)
    } finally {
      setToken(null)
      setOptimisticUser(null)
    }
  }, [token, signOutMutation])

  // Use optimistic user if available, otherwise use queried user
  const user = optimisticUser || queriedUser || null

  // Loading: only when we have a token from localStorage but neither optimistic nor queried user is ready
  const isLoading = !isInitialized || (!!token && !optimisticUser && queriedUser === undefined)

  const value: AuthContextType = useMemo(() => ({
    user,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
  }), [user, isLoading, signIn, signUp, signOut])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
