import { query } from "./_generated/server"
import { v } from "convex/values"

export const getHabitAnalytics = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    try {
      const habits = await ctx.db
        .query("habits")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect()

      const logs = await ctx.db
        .query("habitLogs")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect()

    // Get last 30 days of data
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split("T")[0]

    const recentLogs = logs.filter((log) => log.completedAt >= thirtyDaysAgoStr)

    // Daily completion data for the last 30 days
    const dailyCompletions = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]

      const dayLogs = recentLogs.filter((log) => log.completedAt === dateStr)
      const completedHabits = dayLogs.length
      const totalHabits = habits.length

      dailyCompletions.push({
        date: dateStr,
        completed: completedHabits,
        total: totalHabits,
        percentage: totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0,
        dayName: date.toLocaleDateString("en-US", { weekday: "short" }),
      })
    }

    // Category breakdown
    const categoryStats = new Map()
    habits.forEach((habit) => {
      const habitLogs = logs.filter((log) => log.habitId === habit._id)
      const category = habit.category

      if (!categoryStats.has(category)) {
        categoryStats.set(category, {
          category,
          totalHabits: 0,
          completions: 0,
          averageCompletionRate: 0,
        })
      }

      const stats = categoryStats.get(category)
      stats.totalHabits += 1
      stats.completions += habitLogs.length

      // Calculate completion rate for this habit
      const daysSinceStart = Math.floor((Date.now() - new Date(habit.startDate).getTime()) / (24 * 60 * 60 * 1000))
      const expectedCompletions = Math.max(daysSinceStart, 1)
      const completionRate = (habitLogs.length / expectedCompletions) * 100

      stats.averageCompletionRate += completionRate
    })

    const categoryBreakdown = Array.from(categoryStats.values()).map((stats) => ({
      ...stats,
      averageCompletionRate: Math.round(stats.averageCompletionRate / stats.totalHabits),
    }))

    // Weekly trends (last 4 weeks)
    const weeklyTrends = []
    for (let week = 3; week >= 0; week--) {
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - week * 7 - weekStart.getDay())
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)

      const weekStartStr = weekStart.toISOString().split("T")[0]
      const weekEndStr = weekEnd.toISOString().split("T")[0]

      const weekLogs = logs.filter((log) => log.completedAt >= weekStartStr && log.completedAt <= weekEndStr)

      weeklyTrends.push({
        week: `Week ${4 - week}`,
        completions: weekLogs.length,
        expectedCompletions: habits.length * 7,
        completionRate: habits.length > 0 ? Math.round((weekLogs.length / (habits.length * 7)) * 100) : 0,
      })
    }

    // Streak analysis
    const streakAnalysis = await Promise.all(
      habits.map(async (habit) => {
        const habitLogs = logs
          .filter((log) => log.habitId === habit._id)
          .sort((a, b) => a.completedAt.localeCompare(b.completedAt))

        let currentStreak = 0
        let longestStreak = 0
        let tempStreak = 0
        let previousDate: Date | null = null

        // Calculate streaks
        for (const log of habitLogs) {
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

        // Calculate current streak
        const today = new Date().toISOString().split("T")[0]
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0]

        if (habitLogs.length > 0) {
          const latestLog = habitLogs[habitLogs.length - 1]
          if (latestLog.completedAt === today || latestLog.completedAt === yesterday) {
            const checkDate = new Date(latestLog.completedAt)
            const reversedLogs = [...habitLogs].reverse()
            for (const log of reversedLogs) {
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
          habitId: habit._id,
          title: habit.title,
          currentStreak,
          longestStreak,
          totalCompletions: habitLogs.length,
        }
      }),
    )

    // Ensure we always return valid data structures
    const result = {
      dailyCompletions: dailyCompletions.length > 0 ? dailyCompletions : [],
      categoryBreakdown: categoryBreakdown.length > 0 ? categoryBreakdown : [],
      weeklyTrends: weeklyTrends.length > 0 ? weeklyTrends : [],
      streakAnalysis: streakAnalysis.length > 0 ? streakAnalysis : [],
      totalHabits: habits.length,
      totalCompletions: logs.length,
      averageCompletionRate:
        dailyCompletions.length > 0
          ? Math.round(dailyCompletions.reduce((sum, day) => sum + day.percentage, 0) / dailyCompletions.length)
          : 0,
    }

    return result
    } catch (error) {
      console.error("Error in getHabitAnalytics:", error)
      // Return empty data structure on error
      return {
        dailyCompletions: [],
        categoryBreakdown: [],
        weeklyTrends: [],
        streakAnalysis: [],
        totalHabits: 0,
        totalCompletions: 0,
        averageCompletionRate: 0,
      }
    }
  },
})

export const getTimeSpentAnalytics = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const logs = await ctx.db
      .query("habitLogs")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.neq(q.field("timeSpent"), undefined))
      .collect()

    // Get last 7 days of time data
    const timeData = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]

      const dayLogs = logs.filter((log) => log.completedAt === dateStr)
      const totalTime = dayLogs.reduce((sum, log) => sum + (log.timeSpent || 0), 0)

      timeData.push({
        date: dateStr,
        totalTime,
        dayName: date.toLocaleDateString("en-US", { weekday: "short" }),
        sessions: dayLogs.length,
      })
    }

    const totalTimeThisWeek = timeData.reduce((sum, day) => sum + day.totalTime, 0)
    const averageTimePerDay = Math.round(totalTimeThisWeek / 7)

    return {
      timeData,
      totalTimeThisWeek,
      averageTimePerDay,
    }
  },
})
