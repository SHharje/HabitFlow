import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

// Create sample shared habits for the community
export const createSampleSharedHabits = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const now = Date.now()
    
    const sampleHabits = [
      {
        title: "Morning Meditation",
        description: "Start your day with 10 minutes of mindfulness meditation. Perfect for reducing stress and improving focus.",
        category: "Wellness",
        frequency: "daily",
        isPublic: true,
      },
      {
        title: "Daily Reading",
        description: "Read at least 20 pages every day. Expand your knowledge and develop a lifelong learning habit.",
        category: "Learning",
        frequency: "daily",
        isPublic: true,
      },
      {
        title: "Evening Walk",
        description: "Take a 30-minute walk every evening. Great for physical health and mental clarity.",
        category: "Fitness",
        frequency: "daily",
        isPublic: true,
      },
      {
        title: "Weekly Journaling",
        description: "Reflect on your week by writing in your journal every Sunday. Track your progress and goals.",
        category: "Personal Development",
        frequency: "weekly",
        isPublic: true,
      },
      {
        title: "Hydration Challenge",
        description: "Drink 8 glasses of water daily. Stay hydrated and improve your overall health.",
        category: "Health",
        frequency: "daily",
        isPublic: true,
      },
      {
        title: "Gratitude Practice",
        description: "Write down 3 things you're grateful for each day. Cultivate a positive mindset.",
        category: "Mindfulness",
        frequency: "daily",
        isPublic: true,
      },
      {
        title: "Weekly Meal Prep",
        description: "Prepare healthy meals for the week every Sunday. Save time and eat better.",
        category: "Health",
        frequency: "weekly",
        isPublic: true,
      },
      {
        title: "Digital Detox",
        description: "Limit screen time to 2 hours per day outside of work. Improve focus and reduce stress.",
        category: "Wellness",
        frequency: "daily",
        isPublic: true,
      }
    ]

    const createdHabits = []

    for (const habit of sampleHabits) {
      const sharedHabitId = await ctx.db.insert("sharedHabits", {
        creatorId: userId,
        title: habit.title,
        description: habit.description,
        category: habit.category,
        frequency: habit.frequency,
        isPublic: habit.isPublic,
        participantCount: 0,
        createdAt: now,
        updatedAt: now,
      })

      createdHabits.push(sharedHabitId)
    }

    return { success: true, createdHabits }
  },
})

// Create a shared habit
export const createSharedHabit = mutation({
  args: {
    creatorId: v.id("users"),
    title: v.string(),
    description: v.string(),
    category: v.string(),
    frequency: v.string(),
    isPublic: v.boolean(),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    
    const sharedHabitId = await ctx.db.insert("sharedHabits", {
      creatorId: args.creatorId,
      title: args.title,
      description: args.description,
      category: args.category,
      frequency: args.frequency,
      isPublic: args.isPublic,
      participantCount: 1, // Creator is the first participant
      createdAt: now,
      updatedAt: now,
    })

    // Add creator as first participant
    await ctx.db.insert("sharedHabitParticipants", {
      sharedHabitId,
      userId: args.creatorId,
      // personalHabitId is omitted (optional) — will be set when they create their personal habit
      joinedAt: now,
      isActive: true,
    })

    return { success: true, sharedHabitId }
  },
})

// Debug: Get all shared habits (for troubleshooting)
export const getAllSharedHabits = query({
  args: {},
  handler: async (ctx) => {
    const allSharedHabits = await ctx.db.query("sharedHabits").collect()
    
    const habitsWithDetails = await Promise.all(
      allSharedHabits.map(async (shared) => {
        const creator = await ctx.db.get(shared.creatorId)
        const participantCount = await ctx.db
          .query("sharedHabitParticipants")
          .withIndex("by_shared_habit", (q) => q.eq("sharedHabitId", shared._id))
          .filter((q) => q.eq(q.field("isActive"), true))
          .collect()

        return {
          ...shared,
          creator: creator?.name || "Unknown",
          participantCount: participantCount.length,
        }
      }),
    )

    return habitsWithDetails
  },
})

// Get shared habits that user can join
export const getSharedHabits = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const sharedHabits = await ctx.db
      .query("sharedHabits")
      .filter((q) => q.neq(q.field("creatorId"), userId))
      .filter((q) => q.eq(q.field("isPublic"), true))
      .collect()

    const habitsWithDetails = await Promise.all(
      sharedHabits.map(async (shared) => {
        const creator = await ctx.db.get(shared.creatorId)
        const participantCount = await ctx.db
          .query("sharedHabitParticipants")
          .withIndex("by_shared_habit", (q) => q.eq("sharedHabitId", shared._id))
          .filter((q) => q.eq(q.field("isActive"), true))
          .collect()

        return {
          ...shared,
          creator: creator?.name || "Unknown",
          participantCount: participantCount.length,
        }
      }),
    )

    return habitsWithDetails
  },
})

// Get user's shared habits
export const getUserSharedHabits = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const userParticipations = await ctx.db
      .query("sharedHabitParticipants")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect()

    const sharedHabitsDetails = await Promise.all(
      userParticipations.map(async (participation) => {
        const sharedHabit = await ctx.db.get(participation.sharedHabitId)
        if (!sharedHabit) return null

        const creator = await ctx.db.get(sharedHabit.creatorId)

        return {
          ...sharedHabit,
          creator: creator?.name || "Unknown",
          joinedAt: participation.joinedAt,
        }
      }),
    )

    return sharedHabitsDetails.filter((h) => h !== null)
  },
})

// Join a shared habit
export const joinSharedHabit = mutation({
  args: {
    userId: v.id("users"),
    sharedHabitId: v.id("sharedHabits"),
  },
  handler: async (ctx, { userId, sharedHabitId }) => {
    // Check if already joined
    const existing = await ctx.db
      .query("sharedHabitParticipants")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("sharedHabitId"), sharedHabitId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .first()

    if (existing) {
      throw new Error("Already joined this shared habit")
    }

    // Get shared habit details
    const sharedHabit = await ctx.db.get(sharedHabitId)
    if (!sharedHabit) {
      throw new Error("Shared habit not found")
    }

    // Create personal habit for the user
    const now = Date.now()
    const personalHabitId = await ctx.db.insert("habits", {
      userId,
      title: sharedHabit.title,
      category: sharedHabit.category,
      startDate: new Date().toISOString().split("T")[0],
      frequency: sharedHabit.frequency,
      priority: "medium",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    })

    // Add user as participant
    await ctx.db.insert("sharedHabitParticipants", {
      sharedHabitId,
      userId,
      personalHabitId,
      joinedAt: now,
      isActive: true,
    })

    // Update participant count
    const participants = await ctx.db
      .query("sharedHabitParticipants")
      .withIndex("by_shared_habit", (q) => q.eq("sharedHabitId", sharedHabitId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect()

    await ctx.db.patch(sharedHabitId, {
      participantCount: participants.length + 1,
      updatedAt: now,
    })

    // Add social feed activity
    const user = await ctx.db.get(userId)
    if (user) {
      await ctx.db.insert("socialFeed", {
        userId,
        type: "habit_join",
        content: `${user.name} joined the "${sharedHabit.title}" habit!`,
        metadata: {
          sharedHabitId,
          habitTitle: sharedHabit.title,
        },
        isPublic: true,
        likesCount: 0,
        createdAt: now,
      })
    }

    return { success: true, personalHabitId }
  },
})

// Add social feed entry when user joins a shared habit
export const addJoinActivity = mutation({
  args: {
    userId: v.id("users"),
    sharedHabitId: v.id("sharedHabits"),
    sharedHabitTitle: v.string(),
  },
  handler: async (ctx, { userId, sharedHabitId, sharedHabitTitle }) => {
    const user = await ctx.db.get(userId)
    if (!user) return

    await ctx.db.insert("socialFeed", {
      userId,
      type: "habit_join",
      content: `${user.name} joined the "${sharedHabitTitle}" habit!`,
      metadata: {
        sharedHabitId,
        habitTitle: sharedHabitTitle,
      },
      isPublic: true,
      likesCount: 0,
      createdAt: Date.now(),
    })
  },
})

// Add social feed entry when user completes a habit
export const addCompletionActivity = mutation({
  args: {
    userId: v.id("users"),
    habitId: v.id("habits"),
    habitTitle: v.string(),
    streakCount: v.optional(v.number()),
  },
  handler: async (ctx, { userId, habitId, habitTitle, streakCount }) => {
    const user = await ctx.db.get(userId)
    if (!user) return

    let content = `${user.name} completed "${habitTitle}"!`
    if (streakCount && streakCount > 1) {
      content = `${user.name} completed "${habitTitle}" - ${streakCount} day streak! 🔥`
    }

    await ctx.db.insert("socialFeed", {
      userId,
      type: "habit_completion",
      content,
      metadata: {
        habitId,
        habitTitle,
        streakCount,
      },
      isPublic: true,
      likesCount: 0,
      createdAt: Date.now(),
    })
  },
})

// Get social feed activities
export const getSocialFeed = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    // Get recent social feed activities
    const activities = await ctx.db
      .query("socialFeed")
      .withIndex("by_created_at", (q) => q.gte("createdAt", Date.now() - 7 * 24 * 60 * 60 * 1000)) // Last 7 days
      .filter((q) => q.eq(q.field("isPublic"), true))
      .order("desc")
      .take(20)

    const activitiesWithUserDetails = await Promise.all(
      activities.map(async (activity) => {
        const user = await ctx.db.get(activity.userId)
        return {
          ...activity,
          userName: user?.name || "Unknown User",
        }
      })
    )

    return activitiesWithUserDetails
  },
})

// Get leaderboard for a shared habit
export const getSharedHabitLeaderboard = query({
  args: { sharedHabitId: v.id("sharedHabits") },
  handler: async (ctx, { sharedHabitId }) => {
    const participants = await ctx.db
      .query("sharedHabitParticipants")
      .withIndex("by_shared_habit", (q) => q.eq("sharedHabitId", sharedHabitId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect()

    const leaderboard = await Promise.all(
      participants.map(async (participant) => {
        const user = await ctx.db.get(participant.userId)

        // Use the participant's linked personal habit to look up logs
        let currentStreak = 0
        let totalCompletions = 0
        let completionRate = 0

        if (participant.personalHabitId) {
          const logs = await ctx.db
            .query("habitLogs")
            .withIndex("by_habit", (q) => q.eq("habitId", participant.personalHabitId!))
            .filter((q) => q.eq(q.field("userId"), participant.userId))
            .collect()

          totalCompletions = logs.length

          // Calculate current streak from completedAt dates
          if (logs.length > 0) {
            const sortedLogs = logs.sort((a, b) => b.completedAt.localeCompare(a.completedAt))
            const today = new Date().toISOString().split("T")[0]
            const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0]

            const latestLog = sortedLogs[0]
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

          // Calculate completion rate (last 30 days)
          const thirtyDaysAgo = new Date()
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
          const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split("T")[0]
          const recentLogs = logs.filter((log) => log.completedAt >= thirtyDaysAgoStr)
          completionRate = Math.round((recentLogs.length / 30) * 100)
        }

        return {
          userId: participant.userId,
          name: user?.name || "Unknown",
          currentStreak,
          completionRate: Math.min(completionRate, 100),
          totalCompletions,
          joinedAt: participant.joinedAt,
        }
      }),
    )

    return leaderboard.sort((a, b) => b.currentStreak - a.currentStreak)
  },
})

// Get shared habits created by user
export const getUserCreatedSharedHabits = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const sharedHabits = await ctx.db
      .query("sharedHabits")
      .withIndex("by_creator", (q) => q.eq("creatorId", userId))
      .collect()

    const habitsWithDetails = await Promise.all(
      sharedHabits.map(async (shared) => {
        const participants = await ctx.db
          .query("sharedHabitParticipants")
          .withIndex("by_shared_habit", (q) => q.eq("sharedHabitId", shared._id))
          .filter((q) => q.eq(q.field("isActive"), true))
          .collect()

        return {
          ...shared,
          participantCount: participants.length,
        }
      }),
    )

    return habitsWithDetails
  },
})
