"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Trophy, TrendingUp, Target } from "lucide-react"
import { motion } from "framer-motion"
import type { Id } from "@/convex/_generated/dataModel"

interface SharedHabitLeaderboardProps {
  sharedHabitId: Id<"sharedHabits">
}

export function SharedHabitLeaderboard({ sharedHabitId }: SharedHabitLeaderboardProps) {
  const leaderboard = useQuery(api.social.getSharedHabitLeaderboard, { sharedHabitId })

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-4 h-4 text-yellow-500" />
    if (index === 1) return <Trophy className="w-4 h-4 text-gray-400" />
    if (index === 2) return <Trophy className="w-4 h-4 text-amber-600" />
    return (
      <span className="w-4 h-4 flex items-center justify-center text-xs font-bold text-muted-foreground">
        #{index + 1}
      </span>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Trophy className="w-5 h-5 text-primary" />
          <span>Leaderboard</span>
        </CardTitle>
        <CardDescription>See how everyone is doing</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {leaderboard && leaderboard.length > 0 ? (
            leaderboard.map((participant, index) => (
              <motion.div
                key={participant.userId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50"
              >
                <div className="flex items-center justify-center w-6">{getRankIcon(index)}</div>
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {participant.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-medium text-sm">{participant.name}</div>
                  <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>{participant.currentStreak} day streak</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Target className="w-3 h-3" />
                      <span>{participant.completionRate}% rate</span>
                    </div>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {participant.totalCompletions}
                </Badge>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Trophy className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No participants yet</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
