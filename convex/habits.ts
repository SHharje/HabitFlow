import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

export const createHabit = mutation({
  args: {
    userId: v.id("users"),
    title: v.string(),
    category: v.string(),
    startDate: v.string(),
    frequency: v.string(),
    priority: v.string(),
    isActive: v.boolean(),
    schedule: v.array(v.string()), // days of week: ["monday", "tuesday", etc.]
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    const habitId = await ctx.db.insert("habits", {
      userId: args.userId,
      title: args.title,
      category: args.category,
      startDate: args.startDate,
      frequency: args.frequency,
      priority: args.priority,
      isActive: args.isActive,
      createdAt: now,
      updatedAt: now,
    })

    // Create schedule entries
    if (args.schedule.length > 0) {
      for (const day of args.schedule) {
        await ctx.db.insert("habitSchedules", {
          habitId,
          userId: args.userId,
          dayOfWeek: day,
          createdAt: now,
        })
      }
    }

    return { success: true, habitId }
  },
})

export const getUserHabits = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const habits = await ctx.db
      .query("habits")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect()

    // Get schedules for each habit
    const habitsWithSchedule = await Promise.all(
      habits.map(async (habit) => {
        const schedule = await ctx.db
          .query("habitSchedules")
          .withIndex("by_habit", (q) => q.eq("habitId", habit._id))
          .collect()

        return {
          ...habit,
          schedule: schedule.map((s) => s.dayOfWeek),
        }
      }),
    )

    return habitsWithSchedule
  },
})

export const updateHabit = mutation({
  args: {
    habitId: v.id("habits"),
    userId: v.id("users"),
    title: v.optional(v.string()),
    category: v.optional(v.string()),
    frequency: v.optional(v.string()),
    priority: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    schedule: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    // Verify ownership
    const habit = await ctx.db.get(args.habitId)
    if (!habit || habit.userId !== args.userId) {
      throw new Error("Habit not found or access denied")
    }

    const updates: {
      updatedAt: number
      title?: string
      category?: string
      frequency?: string
      priority?: string
      isActive?: boolean
    } = {
      updatedAt: Date.now(),
    }

    if (args.title !== undefined) updates.title = args.title
    if (args.category !== undefined) updates.category = args.category
    if (args.frequency !== undefined) updates.frequency = args.frequency
    if (args.priority !== undefined) updates.priority = args.priority
    if (args.isActive !== undefined) updates.isActive = args.isActive

    await ctx.db.patch(args.habitId, updates)

    // Update schedule if provided
    if (args.schedule !== undefined) {
      // Delete existing schedule
      const existingSchedule = await ctx.db
        .query("habitSchedules")
        .withIndex("by_habit", (q) => q.eq("habitId", args.habitId))
        .collect()

      for (const schedule of existingSchedule) {
        await ctx.db.delete(schedule._id)
      }

      // Create new schedule
      const now = Date.now()
      for (const day of args.schedule) {
        await ctx.db.insert("habitSchedules", {
          habitId: args.habitId,
          userId: args.userId,
          dayOfWeek: day,
          createdAt: now,
        })
      }
    }

    return { success: true }
  },
})

export const deleteUserHabit = mutation({
  args: {
    habitId: v.id("habits"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Verify ownership
    const habit = await ctx.db.get(args.habitId)
    if (!habit || habit.userId !== args.userId) {
      throw new Error("Habit not found or access denied")
    }

    // Delete user's connection to the habit (soft delete)
    await ctx.db.patch(args.habitId, {
      isActive: false,
      updatedAt: Date.now(),
    })

    // Delete schedule entries
    const schedules = await ctx.db
      .query("habitSchedules")
      .withIndex("by_habit", (q) => q.eq("habitId", args.habitId))
      .collect()

    for (const schedule of schedules) {
      await ctx.db.delete(schedule._id)
    }

    return { success: true }
  },
})

export const searchHabits = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, { searchTerm }) => {
    if (searchTerm.length < 2) return []

    const allHabits = await ctx.db.query("habits").collect()

    // Simple search by title and category
    const filtered = allHabits.filter(
      (habit) =>
        habit.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        habit.category.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    // Group by title to show unique habits
    const uniqueHabits = new Map()
    filtered.forEach((habit) => {
      const key = habit.title.toLowerCase()
      if (!uniqueHabits.has(key)) {
        uniqueHabits.set(key, {
          title: habit.title,
          category: habit.category,
          frequency: habit.frequency,
          priority: habit.priority,
        })
      }
    })

    return Array.from(uniqueHabits.values()).slice(0, 10)
  },
})

export const getHabitStats = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const habits = await ctx.db
      .query("habits")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect()

    const activeHabits = habits.length

    // Get habit logs for streak calculation
    const logs = await ctx.db
      .query("habitLogs")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect()

    // Calculate current streak (simplified)
    const today = new Date().toISOString().split("T")[0]
    const recentLogs = logs.filter((log) => log.completedAt >= today)

    // Calculate completion rate for this week
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    const weekStartStr = weekStart.toISOString().split("T")[0]

    const weekLogs = logs.filter((log) => log.completedAt >= weekStartStr)
    const expectedCompletions = activeHabits * 7 // Simplified: assume daily habits
    const actualCompletions = weekLogs.length
    const completionRate = expectedCompletions > 0 ? Math.round((actualCompletions / expectedCompletions) * 100) : 0

    return {
      activeHabits,
      currentStreak: recentLogs.length,
      completionRate: Math.min(completionRate, 100),
    }
  },
})
