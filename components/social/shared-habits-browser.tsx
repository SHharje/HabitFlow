"use client"

import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Plus, TrendingUp, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import type { Id } from "@/convex/_generated/dataModel"

interface SharedHabitsBrowserProps {
  userId: Id<"users">
}

export function SharedHabitsBrowser({ userId }: SharedHabitsBrowserProps) {
  const sharedHabits = useQuery(api.social.getSharedHabits, { userId })
  const joinSharedHabit = useMutation(api.social.joinSharedHabit)
  const createSampleHabits = useMutation(api.social.createSampleSharedHabits)

  const handleJoinHabit = async (sharedHabitId: Id<"sharedHabits">) => {
    try {
      await joinSharedHabit({ userId, sharedHabitId })
    } catch (error) {
      console.error("Failed to join shared habit:", error)
    }
  }

  const handleCreateSampleHabits = async () => {
    try {
      await createSampleHabits({ userId })
    } catch (error) {
      console.error("Failed to create sample habits:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-primary" />
          <h3 className="font-serif text-xl font-bold text-foreground">Community Habits</h3>
        </div>
        
        <Button 
          size="sm" 
          variant="outline"
          onClick={handleCreateSampleHabits}
          className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
        >
          <Sparkles className="w-4 h-4 mr-1" />
          Add Sample Habits
        </Button>
      </div>

      <div className="max-h-96 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400 scrollbar-thumb-rounded-full">
        {sharedHabits && sharedHabits.length > 0 ? (
          sharedHabits.map((shared, index) => (
            <motion.div
              key={shared._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{shared.title}</CardTitle>
                      <CardDescription>by {shared.creator}</CardDescription>
                      {shared.description && (
                        <p className="text-sm text-muted-foreground mt-1">{shared.description}</p>
                      )}
                      
                    </div>
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      <Users className="w-3 h-3" />
                      <span>{shared.participantCount}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="w-4 h-4" />
                        <span>{shared.category}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {shared.frequency}
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleJoinHabit(shared._id)}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Join
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          <Card className="text-center py-8">
            <CardContent>
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-muted-foreground" />
              </div>
              <h4 className="font-medium text-foreground mb-2">No Community Habits</h4>
              <p className="text-sm text-muted-foreground mb-4">Click &quot;Add Sample Habits&quot; to populate the community with example habits!</p>
              <Button 
                onClick={handleCreateSampleHabits}
                className="bg-primary hover:bg-primary/90"
              >
                <Sparkles className="w-4 h-4 mr-1" />
                Add Sample Habits
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
