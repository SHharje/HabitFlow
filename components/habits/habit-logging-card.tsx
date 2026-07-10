"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CheckCircle2, Circle, Clock, MessageSquare, Flame, Edit3 } from "lucide-react"
import { motion } from "framer-motion"
import { useState } from "react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"

interface TodayHabit {
  _id: Id<"habits">
  title: string
  category: string
  priority: string
  isCompletedToday: boolean
  currentStreak: number
  todayLog?: {
    notes?: string
    timeSpent?: number
  }
}

interface HabitLoggingCardProps {
  habit: TodayHabit
  userId: Id<"users">
}

const priorityColors = {
  high: "border-red-300 bg-red-50 text-red-900",
  medium: "border-yellow-300 bg-yellow-50 text-yellow-900",
  low: "border-green-300 bg-green-50 text-green-900",
}

export function HabitLoggingCard({ habit, userId }: HabitLoggingCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [notes, setNotes] = useState(habit.todayLog?.notes || "")
  const [timeSpent, setTimeSpent] = useState(habit.todayLog?.timeSpent?.toString() || "")

  const logCompletion = useMutation(api.habitLogs.logHabitCompletion)
  const removeCompletion = useMutation(api.habitLogs.removeHabitCompletion)

  const today = new Date().toISOString().split("T")[0]

  const handleToggleCompletion = async () => {
    try {
      if (habit.isCompletedToday) {
        await removeCompletion({
          habitId: habit._id,
          userId,
          completedAt: today,
        })
      } else {
        await logCompletion({
          habitId: habit._id,
          userId,
          completedAt: today,
          notes: notes || undefined,
          timeSpent: timeSpent ? Number.parseInt(timeSpent) : undefined,
        })
      }
    } catch (error) {
      console.error("Failed to toggle habit completion:", error)
    }
  }

  const handleSaveDetails = async () => {
    try {
      await logCompletion({
        habitId: habit._id,
        userId,
        completedAt: today,
        notes: notes || undefined,
        timeSpent: timeSpent ? Number.parseInt(timeSpent) : undefined,
      })
      setShowDetails(false)
    } catch (error) {
      console.error("Failed to save habit details:", error)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={`${priorityColors[habit.priority as keyof typeof priorityColors]} border-l-4 ${
          habit.isCompletedToday ? "border-l-primary" : "border-l-muted-foreground"
        }`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <CardTitle className="font-serif text-lg flex items-center space-x-2">
                <span className={habit.isCompletedToday ? "line-through text-muted-foreground" : ""}>
                  {habit.title}
                </span>
                {habit.currentStreak > 0 && (
                  <div className="flex items-center space-x-1">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-bold text-orange-600">{habit.currentStreak}</span>
                  </div>
                )}
              </CardTitle>
              <Badge variant="secondary" className="mt-1">
                {habit.category}
              </Badge>
            </div>
            <Button
              variant={habit.isCompletedToday ? "default" : "outline"}
              size="sm"
              onClick={handleToggleCompletion}
              className={habit.isCompletedToday ? "bg-primary hover:bg-primary/90" : ""}
            >
              {habit.isCompletedToday ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              {habit.todayLog?.timeSpent && (
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{habit.todayLog.timeSpent}m</span>
                </div>
              )}
              {habit.todayLog?.notes && (
                <div className="flex items-center space-x-1">
                  <MessageSquare className="w-3 h-3" />
                  <span>Note added</span>
                </div>
              )}
            </div>
            <Dialog open={showDetails} onOpenChange={setShowDetails}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Edit3 className="w-3 h-3 mr-1" />
                  Details
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="font-serif">Log Details: {habit.title}</DialogTitle>
                  <DialogDescription>Add notes and track time spent on this habit</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="time-spent">Time Spent (minutes)</Label>
                    <Input
                      id="time-spent"
                      type="number"
                      placeholder="e.g., 30"
                      value={timeSpent}
                      onChange={(e) => setTimeSpent(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="How did it go? Any observations or thoughts..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowDetails(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveDetails} className="bg-primary hover:bg-primary/90">
                      Save Details
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
