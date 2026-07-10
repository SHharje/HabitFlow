import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.string(),
    passwordHash: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_email", ["email"]),

  habits: defineTable({
    userId: v.id("users"),
    title: v.string(),
    category: v.string(),
    startDate: v.string(),
    frequency: v.string(), // daily, weekly, custom
    priority: v.string(), // high, medium, low
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  habitSchedules: defineTable({
    habitId: v.id("habits"),
    userId: v.id("users"),
    dayOfWeek: v.string(), // monday, tuesday, etc.
    createdAt: v.number(),
  })
    .index("by_habit", ["habitId"])
    .index("by_user", ["userId"]),

  habitLogs: defineTable({
    habitId: v.id("habits"),
    userId: v.id("users"),
    completedAt: v.string(), // date string YYYY-MM-DD
    notes: v.optional(v.string()),
    timeSpent: v.optional(v.number()), // minutes
    createdAt: v.number(),
  })
    .index("by_habit", ["habitId"])
    .index("by_user", ["userId"])
    .index("by_date", ["completedAt"]),

  sessions: defineTable({
    userId: v.id("users"),
    token: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_token", ["token"])
    .index("by_user", ["userId"]),

  // <CHANGE> Adding social features tables
  sharedHabits: defineTable({
    creatorId: v.id("users"),
    title: v.string(),
    description: v.string(),
    category: v.string(),
    frequency: v.string(),
    isPublic: v.boolean(),
    participantCount: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_creator", ["creatorId"])
    .index("by_category", ["category"])
    .index("by_public", ["isPublic"]),

  sharedHabitParticipants: defineTable({
    sharedHabitId: v.id("sharedHabits"),
    userId: v.id("users"),
    personalHabitId: v.optional(v.id("habits")),
    joinedAt: v.number(),
    isActive: v.boolean(),
  })
    .index("by_shared_habit", ["sharedHabitId"])
    .index("by_user", ["userId"])
    .index("by_personal_habit", ["personalHabitId"]),

  socialFeed: defineTable({
    userId: v.id("users"),
    type: v.string(), // achievement, milestone, habit_completion, streak
    content: v.string(),
    metadata: v.optional(v.object({
      habitId: v.optional(v.id("habits")),
      sharedHabitId: v.optional(v.id("sharedHabits")),
      streakCount: v.optional(v.number()),
      milestone: v.optional(v.string()),
      habitTitle: v.optional(v.string()),
    })),
    isPublic: v.boolean(),
    likesCount: v.number(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_type", ["type"])
    .index("by_public", ["isPublic"])
    .index("by_created_at", ["createdAt"]),
})
