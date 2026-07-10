import { query, mutation } from "./_generated/server"
import { v } from "convex/values"

export const getUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId)
    if (!user) {
      return null
    }

    return {
      id: user._id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    }
  },
})

export const updateUser = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
  },
  handler: async (ctx, { userId, name }) => {
    const updates: { updatedAt: number; name?: string } = {
      updatedAt: Date.now(),
    }

    if (name !== undefined) {
      updates.name = name
    }

    await ctx.db.patch(userId, updates)

    return { success: true }
  },
})
