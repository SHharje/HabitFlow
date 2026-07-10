import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

async function hashPassword(password: string): Promise<string> {
  // Use Web Crypto API instead of Buffer for Convex compatibility
  const encoder = new TextEncoder()
  const data = encoder.encode(password + "salt_2024") // Add salt for security
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const hashedPassword = await hashPassword(password)
  return hashedPassword === hash
}

function generateToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export const signUp = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.string(),
  },
  handler: async (ctx, { email, password, name }) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first()

    if (existingUser) {
      throw new Error("User with this email already exists")
    }

    const passwordHash = await hashPassword(password)
    const now = Date.now()

    const userId = await ctx.db.insert("users", {
      email,
      name,
      passwordHash,
      createdAt: now,
      updatedAt: now,
    })

    // Create session
    const token = generateToken()
    const expiresAt = now + 7 * 24 * 60 * 60 * 1000 // 7 days

    await ctx.db.insert("sessions", {
      userId,
      token,
      expiresAt,
      createdAt: now,
    })

    return {
      success: true,
      user: {
        id: userId,
        email,
        name,
      },
      token,
    }
  },
})

export const signIn = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, { email, password }) => {
    // Find user by email
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first()

    if (!user) {
      throw new Error("Invalid email or password")
    }

    const isValidPassword = await verifyPassword(password, user.passwordHash)
    if (!isValidPassword) {
      throw new Error("Invalid email or password")
    }

    // Create new session
    const token = generateToken()
    const now = Date.now()
    const expiresAt = now + 7 * 24 * 60 * 60 * 1000 // 7 days

    await ctx.db.insert("sessions", {
      userId: user._id,
      token,
      expiresAt,
      createdAt: now,
    })

    return {
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
      token,
    }
  },
})

export const signOut = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, { token }) => {
    // Find and delete the session
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", token))
      .first()

    if (session) {
      await ctx.db.delete(session._id)
    }

    return { success: true }
  },
})

export const getCurrentUser = query({
  args: {
    token: v.optional(v.string()),
  },
  handler: async (ctx, { token }) => {
    if (!token) {
      return null
    }

    // Find session
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", token))
      .first()

    if (!session || session.expiresAt < Date.now()) {
      return null
    }

    // Get user
    const user = await ctx.db.get(session.userId)
    if (!user) {
      return null
    }

    return {
      id: user._id,
      email: user.email,
      name: user.name,
    }
  },
})

export const validateSession = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, { token }) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", token))
      .first()

    if (!session || session.expiresAt < Date.now()) {
      return { valid: false }
    }

    return { valid: true, userId: session.userId }
  },
})
