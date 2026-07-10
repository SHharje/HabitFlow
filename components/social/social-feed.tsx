"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, TrendingUp, Calendar, Users, Star } from "lucide-react"
import { motion } from "framer-motion"
import { formatDistanceToNow } from "date-fns"
import type { Id } from "@/convex/_generated/dataModel"

interface SocialFeedProps {
  userId: Id<"users">
}

export function SocialFeed({ userId }: SocialFeedProps) {
  const activities = useQuery(api.social.getSocialFeed, { userId })

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "habit_join":
        return <Users className="w-4 h-4 text-blue-500" />
      case "habit_completion":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "streak":
        return <Star className="w-4 h-4 text-yellow-500" />
      default:
        return <TrendingUp className="w-4 h-4 text-purple-500" />
    }
  }

  const getActivityBadge = (type: string) => {
    switch (type) {
      case "habit_join":
        return <Badge variant="secondary" className="text-xs">Joined</Badge>
      case "habit_completion":
        return <Badge variant="default" className="text-xs">Completed</Badge>
      case "streak":
        return <Badge variant="outline" className="text-xs">Streak</Badge>
      default:
        return <Badge variant="outline" className="text-xs">Activity</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h3 className="font-serif text-xl font-bold text-foreground">Community Activity</h3>
      </div>

      <div className="space-y-4">
        {activities && activities.length > 0 ? (
          activities.map((activity, index) => (
            <motion.div
              key={activity._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="hover:shadow-sm transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {activity.userName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        {getActivityIcon(activity.type)}
                        <CardTitle className="text-sm font-medium">
                          {activity.content}
                        </CardTitle>
                        {getActivityBadge(activity.type)}
                      </div>
                      <CardDescription className="flex items-center space-x-2 mt-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDistanceToNow(activity.createdAt, { addSuffix: true })}</span>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </motion.div>
          ))
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-muted-foreground" />
              </div>
              <h4 className="font-serif text-lg font-bold text-foreground mb-2">No Activity Yet</h4>
              <p className="text-muted-foreground">Join some community habits to see what others are accomplishing!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
