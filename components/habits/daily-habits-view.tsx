"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar, Target } from "lucide-react"
import { HabitLoggingCard } from "./habit-logging-card"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"

interface DailyHabitsViewProps {
  userId: Id<"users">
}

export function DailyHabitsView({ userId }: DailyHabitsViewProps) {
  const todayHabits = useQuery(api.habitLogs.getTodayHabits, { userId })

  if (!todayHabits) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
          <div className="h-20 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  const completedCount = todayHabits.filter((habit) => habit.isCompletedToday).length
  const totalCount = todayHabits.length
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="space-y-6">
      {/* Today's Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-serif text-xl flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-primary" />
                <span>Today's Habits</span>
              </CardTitle>
              <CardDescription>{today}</CardDescription>
            </div>
            <Badge variant={completionPercentage === 100 ? "default" : "secondary"} className="text-sm">
              {completedCount}/{totalCount} Complete
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Today's Habits */}
      {totalCount > 0 ? (
        <div className="space-y-4">
          <h3 className="font-serif text-lg font-semibold text-foreground">Your Habits for Today</h3>
          <div className="grid gap-4">
            {todayHabits.map((habit) => (
              <HabitLoggingCard 
                key={habit._id} 
                habit={{
                  ...habit,
                  todayLog: habit.todayLog ? {
                    notes: habit.todayLog.notes,
                    timeSpent: habit.todayLog.timeSpent
                  } : undefined
                }} 
                userId={userId} 
              />
            ))}
          </div>
        </div>
      ) : (
        <Card className="text-center py-8">
          <CardContent>
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-foreground mb-2">No habits scheduled for today</h3>
            <p className="text-muted-foreground">
              Create some habits or adjust your schedule to start tracking your daily progress.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
