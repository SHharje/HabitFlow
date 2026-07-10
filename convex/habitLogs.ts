import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

export const logHabitCompletion = mutation({
  args: {
    habitId: v.id("habits"),
    userId: v.id("users"),
    completedAt: v.string(), // YYYY-MM-DD format
    notes: v.optional(v.string()),
    timeSpent: v.optional(v.number()), // minutes
  },
  handler: async (ctx, args) => {
    // Check if log already exists for this date
    const existingLog = await ctx.db
      .query("habitLogs")
      .withIndex("by_habit", (q) => q.eq("habitId", args.habitId))
      .filter((q) => q.eq(q.field("completedAt"), args.completedAt))
      .first()

    if (existingLog) {
      // Update existing log
      await ctx.db.patch(existingLog._id, {
        notes: args.notes,
        timeSpent: args.timeSpent,
      })
      return { success: true, logId: existingLog._id }
    } else {
      // Create new log
      const logId = await ctx.db.insert("habitLogs", {
        habitId: args.habitId,
        userId: args.userId,
        completedAt: args.completedAt,
        notes: args.notes,
        timeSpent: args.timeSpent,
        createdAt: Date.now(),
      })

      // Get habit details for social feed
      const habit = await ctx.db.get(args.habitId)
      if (habit) {
        // Calculate current streak
        const logs = await ctx.db
          .query("habitLogs")
          .withIndex("by_habit", (q) => q.eq("habitId", args.habitId))
          .collect()

        let currentStreak = 0
        if (logs.length > 0) {
          const sortedLogs = logs.sort((a, b) => b.completedAt.localeCompare(a.completedAt))
          const latestLog = sortedLogs[0]
          const today = new Date().toISOString().split("T")[0]
          const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0]

          if (latestLog.completedAt === today || latestLog.completedAt === yesterday) {
            const checkDate = new Date(latestLog.completedAt)

            for (const log of sortedLogs) {
              const expectedDate = checkDate.toISOString().split("T")[0]
              if (log.completedAt === expectedDate) {
                currentStreak++
                checkDate.setDate(checkDate.getDate() - 1)
              } else {
                break
              }
            }
          }
        }

        // Add social feed activity for shared habits
        const sharedHabitParticipation = await ctx.db
          .query("sharedHabitParticipants")
          .withIndex("by_personal_habit", (q) => q.eq("personalHabitId", args.habitId))
          .filter((q) => q.eq(q.field("isActive"), true))
          .first()

        if (sharedHabitParticipation) {
          const user = await ctx.db.get(args.userId)
          if (user) {
            let content = `${user.name} completed "${habit.title}"!`
            if (currentStreak > 1) {
              content = `${user.name} completed "${habit.title}" - ${currentStreak} day streak! 🔥`
            }

            await ctx.db.insert("socialFeed", {
              userId: args.userId,
              type: "habit_completion",
              content,
              metadata: {
                habitId: args.habitId,
                habitTitle: habit.title,
                streakCount: currentStreak,
              },
              isPublic: true,
              likesCount: 0,
              createdAt: Date.now(),
            })
          }
        }
      }

      return { success: true, logId }
    }
  },
})

export const removeHabitCompletion = mutation({
  args: {
    habitId: v.id("habits"),
    userId: v.id("users"),
    completedAt: v.string(),
  },
  handler: async (ctx, args) => {
    const log = await ctx.db
      .query("habitLogs")
      .withIndex("by_habit", (q) => q.eq("habitId", args.habitId))
      .filter((q) => q.eq(q.field("completedAt"), args.completedAt))
      .first()

    if (log && log.userId === args.userId) {
      await ctx.db.delete(log._id)
      return { success: true }
    }

    return { success: false, error: "Log not found" }
  },
})

export const getHabitLogs = query({
  args: {
    habitId: v.id("habits"),
    userId: v.id("users"),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const query = ctx.db
      .query("habitLogs")
      .withIndex("by_habit", (q) => q.eq("habitId", args.habitId))
      .filter((q) => q.eq(q.field("userId"), args.userId))

    const logs = await query.collect()

    // Filter by date range if provided
    let filteredLogs = logs
    if (args.startDate) {
      filteredLogs = filteredLogs.filter((log) => log.completedAt >= args.startDate!)
    }
    if (args.endDate) {
      filteredLogs = filteredLogs.filter((log) => log.completedAt <= args.endDate!)
    }

    return filteredLogs.sort((a, b) => b.completedAt.localeCompare(a.completedAt))
  },
})

export const getHabitStreak = query({
  args: {
    habitId: v.id("habits"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const logs = await ctx.db
      .query("habitLogs")
      .withIndex("by_habit", (q) => q.eq("habitId", args.habitId))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect()

    if (logs.length === 0) {
      return { currentStreak: 0, longestStreak: 0, lastCompleted: null }
    }

    // Sort logs by date (most recent first)
    const sortedLogs = logs.sort((a, b) => b.completedAt.localeCompare(a.completedAt))

    // Calculate current streak
    let currentStreak = 0
    const today = new Date()
    const todayStr = today.toISOString().split("T")[0]
    const yesterdayStr = new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString().split("T")[0]

    // Check if completed today or yesterday to maintain streak
    const latestLog = sortedLogs[0]
    if (latestLog.completedAt === todayStr || latestLog.completedAt === yesterdayStr) {
      const checkDate = new Date(latestLog.completedAt)

      for (const log of sortedLogs) {
        const logDate = log.completedAt
        const expectedDate = checkDate.toISOString().split("T")[0]

        if (logDate === expectedDate) {
          currentStreak++
          checkDate.setDate(checkDate.getDate() - 1)
        } else {
          break
        }
      }
    }

    // Calculate longest streak
    let longestStreak = 0
    let tempStreak = 0
    let previousDate: Date | null = null

    for (const log of sortedLogs.reverse()) {
      const logDate = new Date(log.completedAt)

      if (previousDate === null) {
        tempStreak = 1
      } else {
        const dayDiff = Math.floor((logDate.getTime() - previousDate.getTime()) / (24 * 60 * 60 * 1000))

        if (dayDiff === 1) {
          tempStreak++
        } else {
          longestStreak = Math.max(longestStreak, tempStreak)
          tempStreak = 1
        }
      }

      previousDate = logDate
    }
    longestStreak = Math.max(longestStreak, tempStreak)

    return {
      currentStreak,
      longestStreak,
      lastCompleted: latestLog.completedAt,
    }
  },
})

export const getTodayHabits = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const today = new Date().toISOString().split("T")[0]
    const dayOfWeek = new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase()

    // Get all active habits for user
    const habits = await ctx.db
      .query("habits")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect()

    // Get schedules and logs for today
    const habitsWithStatus = await Promise.all(
      habits.map(async (habit) => {
        // Check if habit is scheduled for today
        const schedules = await ctx.db
          .query("habitSchedules")
          .withIndex("by_habit", (q) => q.eq("habitId", habit._id))
          .collect()

        const isScheduledToday =
          schedules.some((s) => s.dayOfWeek === dayOfWeek) || habit.frequency === "daily" || schedules.length === 0

        // Check if completed today
        const todayLog = await ctx.db
          .query("habitLogs")
          .withIndex("by_habit", (q) => q.eq("habitId", habit._id))
          .filter((q) => q.eq(q.field("completedAt"), today))
          .first()

        // Get streak info
        const logs = await ctx.db
          .query("habitLogs")
          .withIndex("by_habit", (q) => q.eq("habitId", habit._id))
          .collect()

        let currentStreak = 0
        if (logs.length > 0) {
          const sortedLogs = logs.sort((a, b) => b.completedAt.localeCompare(a.completedAt))
          const latestLog = sortedLogs[0]
          const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0]

          if (latestLog.completedAt === today || latestLog.completedAt === yesterday) {
            const checkDate = new Date(latestLog.completedAt)

            for (const log of sortedLogs) {
              const expectedDate = checkDate.toISOString().split("T")[0]
              if (log.completedAt === expectedDate) {
                currentStreak++
                checkDate.setDate(checkDate.getDate() - 1)
              } else {
                break
              }
            }
          }
        }

        return {
          ...habit,
          isScheduledToday,
          isCompletedToday: !!todayLog,
          todayLog,
          currentStreak,
        }
      }),
    )

    return habitsWithStatus.filter((habit) => habit.isScheduledToday)
  },
})
