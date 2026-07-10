"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Calendar, Target, Clock, AlertCircle, Lightbulb } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface HabitData {
  _id: Id<"habits">
  title: string
  category: string
  startDate: string
  frequency: string
  priority: string
  isActive: boolean
  schedule: string[]
}

interface HabitSuggestion {
  title: string
  category: string
  frequency: string
  priority: string
}

interface CreateHabitDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  habitToEdit?: HabitData | null
  isEditing?: boolean
}

const categories = [
  "Health & Fitness",
  "Learning & Education",
  "Productivity",
  "Mindfulness",
  "Social",
  "Creative",
  "Finance",
  "Other",
]

const frequencies = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "custom", label: "Custom Schedule" },
]

const priorities = [
  { value: "high", label: "High", color: "bg-red-100 text-red-800" },
  { value: "medium", label: "Medium", color: "bg-yellow-100 text-yellow-800" },
  { value: "low", label: "Low", color: "bg-green-100 text-green-800" },
]

const daysOfWeek = [
  { value: "monday", label: "Mon" },
  { value: "tuesday", label: "Tue" },
  { value: "wednesday", label: "Wed" },
  { value: "thursday", label: "Thu" },
  { value: "friday", label: "Fri" },
  { value: "saturday", label: "Sat" },
  { value: "sunday", label: "Sun" },
]

export function CreateHabitDialog({ open, onOpenChange, onSuccess, habitToEdit, isEditing }: CreateHabitDialogProps) {
  const { user } = useAuth()
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0])
  const [frequency, setFrequency] = useState("daily")
  const [priority, setPriority] = useState("medium")
  const [schedule, setSchedule] = useState<string[]>(["monday", "tuesday", "wednesday", "thursday", "friday"])
  const [isActive, setIsActive] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  const createHabit = useMutation(api.habits.createHabit)
  const updateHabit = useMutation(api.habits.updateHabit)
  const suggestions = useQuery(api.habits.searchHabits, searchTerm.length >= 2 ? { searchTerm } : "skip")

  // Populate form when editing
  useEffect(() => {
    if (isEditing && habitToEdit) {
      setTitle(habitToEdit.title || "")
      setCategory(habitToEdit.category || "")
      setStartDate(habitToEdit.startDate || new Date().toISOString().split("T")[0])
      setFrequency(habitToEdit.frequency || "daily")
      setPriority(habitToEdit.priority || "medium")
      setSchedule(habitToEdit.schedule || ["monday", "tuesday", "wednesday", "thursday", "friday"])
      setIsActive(habitToEdit.isActive ?? true)
    }
  }, [isEditing, habitToEdit])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!user) {
      setError("You must be logged in to create habits")
      return
    }

    if (!title.trim() || !category) {
      setError("Please fill in all required fields")
      return
    }

    try {
              if (isEditing && habitToEdit) {
          // Update existing habit
          await updateHabit({
            habitId: habitToEdit._id,
            userId: user.id,
            title: title.trim(),
            category,
            frequency,
            priority,
            isActive,
            schedule: frequency === "custom" ? schedule : frequency === "daily" ? daysOfWeek.map((d) => d.value) : [],
          })
        } else {
        // Create new habit
        await createHabit({
          userId: user.id,
          title: title.trim(),
          category,
          startDate,
          frequency,
          priority,
          isActive: true,
          schedule: frequency === "custom" ? schedule : frequency === "daily" ? daysOfWeek.map((d) => d.value) : [],
        })
      }

      onOpenChange(false)
      onSuccess?.()
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${isEditing ? 'update' : 'create'} habit`)
    }
  }

  const resetForm = () => {
    setTitle("")
    setCategory("")
    setStartDate(new Date().toISOString().split("T")[0])
    setFrequency("daily")
    setPriority("medium")
    setSchedule(["monday", "tuesday", "wednesday", "thursday", "friday"])
    setIsActive(true)
    setError("")
    setSearchTerm("")
  }

  const handleScheduleChange = (day: string, checked: boolean) => {
    if (checked) {
      setSchedule([...schedule, day])
    } else {
      setSchedule(schedule.filter((d) => d !== day))
    }
  }

  const applySuggestion = (suggestion: HabitSuggestion) => {
    setTitle(suggestion.title)
    setCategory(suggestion.category)
    setFrequency(suggestion.frequency)
    setPriority(suggestion.priority)
    setSearchTerm("")
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        onOpenChange(open)
        if (!open) resetForm()
      }}
    >
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">
            {isEditing ? "Edit Habit" : "Create New Habit"}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? "Update your habit settings and preferences" : "Start building a new habit that will help you achieve your goals"}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Habit Title with Suggestions */}
          <div className="space-y-2">
            <Label htmlFor="title">Habit Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Morning Exercise, Read 30 minutes, Meditate..."
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                setSearchTerm(e.target.value)
              }}
              required
            />

            {/* Suggestions */}
            {suggestions && suggestions.length > 0 && (
              <Card className="mt-2">
                <CardHeader className="pb-2">
                  <div className="flex items-center space-x-2">
                    <Lightbulb className="w-4 h-4 text-primary" />
                    <CardTitle className="text-sm">Suggested Habits</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {suggestions.slice(0, 3).map((suggestion, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-muted rounded-lg cursor-pointer hover:bg-muted/80"
                        onClick={() => applySuggestion(suggestion)}
                      >
                        <div>
                          <div className="font-medium text-sm">{suggestion.title}</div>
                          <div className="text-xs text-muted-foreground">{suggestion.category}</div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {suggestion.priority}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

                      {/* Start Date - Only show when creating new habit */}
          {!isEditing && (
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Frequency */}
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {frequencies.map((freq) => (
                    <SelectItem key={freq.value} value={freq.value}>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>{freq.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((prio) => (
                    <SelectItem key={prio.value} value={prio.value}>
                      <div className="flex items-center space-x-2">
                        <Target className="w-4 h-4" />
                        <span>{prio.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Status - Only show when editing */}
          {isEditing && (
            <div className="space-y-2">
              <Label>Active Status</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={isActive}
                  onCheckedChange={(checked) => setIsActive(checked as boolean)}
                />
                <Label htmlFor="isActive" className="text-sm font-medium">
                  Keep this habit active
                </Label>
              </div>
            </div>
          )}

          {/* Custom Schedule */}
          {frequency === "custom" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <Label>Schedule Days</Label>
              <Card>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-7 gap-2">
                    {daysOfWeek.map((day) => (
                      <div key={day.value} className="flex flex-col items-center space-y-2">
                        <Label htmlFor={day.value} className="text-xs font-medium">
                          {day.label}
                        </Label>
                        <Checkbox
                          id={day.value}
                          checked={schedule.includes(day.value)}
                          onCheckedChange={(checked) => handleScheduleChange(day.value, checked as boolean)}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              {isEditing ? "Update Habit" : "Create Habit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
