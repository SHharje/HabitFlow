"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, Calendar, Target, Clock, Flame, TrendingUp } from "lucide-react"
import { motion } from "framer-motion"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"

interface Habit {
  _id: Id<"habits">
  userId: Id<"users">
  title: string
  category: string
  startDate: string
  frequency: string
  priority: string
  isActive: boolean
  schedule: string[]
  createdAt: number
  updatedAt: number
}

interface HabitCardProps {
  habit: Habit
  onEdit?: (habit: Habit) => void
  onDelete?: (habitId: Id<"habits">) => void
}

const priorityColors = {
  high: "bg-red-100 text-red-900 border-red-300",
  medium: "bg-yellow-100 text-yellow-900 border-yellow-300",
  low: "bg-green-100 text-green-900 border-green-300",
}

const categoryColors = {
  "Health & Fitness": "bg-blue-100 text-blue-900 border-blue-200",
  "Learning & Education": "bg-purple-100 text-purple-900 border-purple-200",
  Productivity: "bg-orange-100 text-orange-900 border-orange-200",
  Mindfulness: "bg-teal-100 text-teal-900 border-teal-200",
  Social: "bg-pink-100 text-pink-900 border-pink-200",
  Creative: "bg-indigo-100 text-indigo-900 border-indigo-200",
  Finance: "bg-emerald-100 text-emerald-900 border-emerald-200",
  Other: "bg-gray-100 text-gray-900 border-gray-200",
}

export function HabitCard({ habit, onEdit, onDelete }: HabitCardProps) {
  const streakData = useQuery(api.habitLogs.getHabitStreak, {
    habitId: habit._id,
    userId: habit.userId,
  })

  const formatSchedule = (schedule: string[]) => {
    if (schedule.length === 7) return "Daily"
    if (schedule.length === 0) return "No schedule"

    const dayAbbr = {
      monday: "Mon",
      tuesday: "Tue",
      wednesday: "Wed",
      thursday: "Thu",
      friday: "Fri",
      saturday: "Sat",
      sunday: "Sun",
    }

    return schedule.map((day) => dayAbbr[day as keyof typeof dayAbbr]).join(", ")
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="h-full hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <CardTitle className="font-serif text-lg leading-tight flex items-center space-x-2">
                <span>{habit.title}</span>
                {streakData && streakData.currentStreak > 0 && (
                  <div className="flex items-center space-x-1">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-bold text-orange-600">{streakData.currentStreak}</span>
                  </div>
                )}
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Badge
                  variant="secondary"
                  className={categoryColors[habit.category as keyof typeof categoryColors] || categoryColors.Other}
                >
                  {habit.category}
                </Badge>
                <Badge variant="outline" className={priorityColors[habit.priority as keyof typeof priorityColors]}>
                  {habit.priority}
                </Badge>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit?.(habit)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete?.(habit._id)} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Started {new Date(habit.startDate).toLocaleDateString()}</span>
            </div>

            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{formatSchedule(habit.schedule)}</span>
            </div>

            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Target className="w-4 h-4" />
              <span className="capitalize">{habit.frequency} habit</span>
            </div>

            {streakData && (
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex items-center space-x-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">Best: {streakData.longestStreak} days</span>
                </div>
                {streakData.lastCompleted && (
                  <div className="text-xs text-muted-foreground">
                    Last: {new Date(streakData.lastCompleted).toLocaleDateString()}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
