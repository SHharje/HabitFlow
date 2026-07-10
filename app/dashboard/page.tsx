"use client"

import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, LogOut, Plus, TrendingUp, Target, Calendar, BarChart3, Users, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { CreateHabitDialog } from "@/components/habits/create-habit-dialog"
import { HabitCard } from "@/components/habits/habit-card"
import { DailyHabitsView } from "@/components/habits/daily-habits-view"
import { CompletionChart } from "@/components/analytics/completion-chart"
import { CategoryBreakdown } from "@/components/analytics/category-breakdown"
import { StreakAnalysis } from "@/components/analytics/streak-analysis"
import { TimeAnalytics } from "@/components/analytics/time-analytics"
import { SharedHabitsBrowser } from "@/components/social/shared-habits-browser"
import { SocialFeed } from "@/components/social/social-feed"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { useRouter } from "next/navigation"

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

export default function DashboardPage() {
  const { user, signOut, isLoading } = useAuth()
  const router = useRouter()
  const [showCreateHabit, setShowCreateHabit] = useState(false)
  const [habitToEdit, setHabitToEdit] = useState<Habit | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const habits = useQuery(api.habits.getUserHabits, user ? { userId: user.id } : "skip")
  const stats = useQuery(api.habits.getHabitStats, user ? { userId: user.id } : "skip")
  const analytics = useQuery(api.analytics.getHabitAnalytics, user ? { userId: user.id } : "skip")
  const timeSpentAnalytics = useQuery(api.analytics.getTimeSpentAnalytics, user ? { userId: user.id } : "skip")
  const userSharedHabits = useQuery(api.social.getUserSharedHabits, user ? { userId: user.id } : "skip")
  const deleteHabit = useMutation(api.habits.deleteUserHabit)

  const handleDeleteHabit = async (habitId: Id<"habits">) => {
    if (!user) return

    if (confirm("Are you sure you want to delete this habit?")) {
      try {
        await deleteHabit({ habitId, userId: user.id })
      } catch (error) {
        console.error("Failed to delete habit:", error)
      }
    }
  }

  const handleEditHabit = (habit: Habit) => {
    setHabitToEdit(habit)
    setIsEditing(true)
    setShowCreateHabit(true)
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    }
  }, [isLoading, user, router])

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/25">
            <Sparkles className="w-6 h-6 text-white animate-pulse" />
          </div>
          <p className="text-muted-foreground font-medium">
            {isLoading ? "Loading your dashboard..." : "Redirecting..."}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-xl flex items-center justify-center shadow-lg shadow-primary/25">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <span className="font-serif text-2xl font-bold text-foreground">HabitFlow</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground font-medium">Welcome, {user.name}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="border-border hover:bg-muted bg-transparent"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="container mx-auto px-6 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="mb-10">
            <h1 className="font-serif text-5xl font-bold text-foreground mb-3">Your Dashboard</h1>
            <p className="text-xl text-muted-foreground font-medium">Track your habits and build lasting routines</p>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-10">
            <Card className="hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 border-border/50 bg-gradient-to-b from-card to-background">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center space-x-3 font-semibold">
                  <div className="w-10 h-10 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl flex items-center justify-center">
                    <Target className="w-5 h-5 text-primary" />
                  </div>
                  <span>Active Habits</span>
                </CardTitle>
                <CardDescription className="font-medium">Habits you're currently tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {stats?.activeHabits || 0}
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg hover:shadow-accent/10 transition-all duration-300 border-border/50 bg-gradient-to-b from-card to-background">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center space-x-3 font-semibold">
                  <div className="w-10 h-10 bg-gradient-to-r from-chart-2/10 to-destructive/10 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-chart-2" />
                  </div>
                  <span>Current Streak</span>
                </CardTitle>
                <CardDescription className="font-medium">Your longest active streak</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold bg-gradient-to-r from-chart-2 to-destructive bg-clip-text text-transparent">
                  {stats?.currentStreak || 0} <span className="text-lg">days</span>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg hover:shadow-accent/10 transition-all duration-300 border-border/50 bg-gradient-to-b from-card to-background">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center space-x-3 font-semibold">
                  <div className="w-10 h-10 bg-gradient-to-r from-chart-3/10 to-muted-foreground/10 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-chart-3" />
                  </div>
                  <span>Completion Rate</span>
                </CardTitle>
                <CardDescription className="font-medium">This week's success rate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold bg-gradient-to-r from-chart-3 to-muted-foreground bg-clip-text text-transparent">
                  {stats?.completionRate || 0}
                  <span className="text-lg">%</span>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg hover:shadow-accent/10 transition-all duration-300 border-border/50 bg-gradient-to-b from-card to-background">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center space-x-3 font-semibold">
                  <div className="w-10 h-10 bg-gradient-to-r from-chart-4/10 to-chart-5/10 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-chart-4" />
                  </div>
                  <span>Shared Habits</span>
                </CardTitle>
                <CardDescription className="font-medium">Habits with community</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold bg-gradient-to-r from-chart-4 to-chart-5 bg-clip-text text-transparent">
                  {userSharedHabits?.length || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="today" className="space-y-8">
            <div className="flex items-center justify-between">
              <TabsList className="bg-muted/50 border border-border/50">
                <TabsTrigger value="today" className="font-medium">
                  Today
                </TabsTrigger>
                <TabsTrigger value="habits" className="font-medium">
                  All Habits
                </TabsTrigger>
                <TabsTrigger value="analytics" className="font-medium">
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="community" className="font-medium">
                  Community
                </TabsTrigger>
              </TabsList>
              <Button
                onClick={() => setShowCreateHabit(true)}
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg shadow-primary/25 font-semibold"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Habit
              </Button>
            </div>

            <TabsContent value="today">
              <DailyHabitsView userId={user.id} />
            </TabsContent>

            <TabsContent value="habits">
              <div className="space-y-8">
                <h2 className="font-serif text-3xl font-bold text-foreground">Your Habits</h2>
                {habits && habits.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {habits.map((habit) => (
                      <HabitCard key={habit._id} habit={habit} onEdit={handleEditHabit} onDelete={handleDeleteHabit} />
                    ))}
                  </div>
                ) : (
                  <Card className="text-center py-16 border-border/50 bg-gradient-to-b from-card to-background">
                    <CardContent>
                      <div className="w-20 h-20 bg-gradient-to-r from-muted to-background rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <Plus className="w-10 h-10 text-muted-foreground" />
                      </div>
                      <h3 className="font-serif text-2xl font-bold text-foreground mb-3">No habits yet</h3>
                      <p className="text-muted-foreground mb-8 text-lg font-medium max-w-md mx-auto">
                        Start your journey by creating your first habit. Choose something small and build from there.
                      </p>
                      <Button
                        onClick={() => setShowCreateHabit(true)}
                        className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg shadow-primary/25 px-8 py-3 text-lg font-semibold"
                      >
                        <Plus className="w-5 h-5 mr-2" />
                        Create Your First Habit
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="analytics">
              <div className="space-y-10">
                <div className="flex items-center space-x-3 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="font-serif text-3xl font-bold text-foreground">Analytics & Insights</h2>
                </div>

                {analytics && analytics.totalHabits > 0 ? (
                  <>

                    <CompletionChart data={analytics.dailyCompletions} />
                    <CategoryBreakdown data={analytics.categoryBreakdown} />
                    <StreakAnalysis data={analytics.streakAnalysis} />
                    {timeSpentAnalytics && (
                      <TimeAnalytics
                        data={timeSpentAnalytics.timeData}
                        totalTimeThisWeek={timeSpentAnalytics.totalTimeThisWeek}
                        averageTimePerDay={timeSpentAnalytics.averageTimePerDay}
                      />
                    )}
                  </>
                ) : (
                  <Card className="text-center py-16 border-border/50 bg-gradient-to-b from-card to-background">
                    <CardContent>
                      <div className="w-20 h-20 bg-gradient-to-r from-muted to-background rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <BarChart3 className="w-10 h-10 text-muted-foreground" />
                      </div>
                      <h3 className="font-serif text-2xl font-bold text-foreground mb-3">No Analytics Yet</h3>
                      <p className="text-muted-foreground mb-8 text-lg font-medium max-w-md mx-auto">
                        Create some habits and start logging completions to see detailed analytics and insights.
                      </p>
                      <Button
                        onClick={() => setShowCreateHabit(true)}
                        className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg shadow-primary/25 px-8 py-3 text-lg font-semibold"
                      >
                        <Plus className="w-5 h-5 mr-2" />
                        Create Your First Habit
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="community">
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <SocialFeed userId={user.id} />
                </div>
                <div>
                  <SharedHabitsBrowser userId={user.id} />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      <CreateHabitDialog
        open={showCreateHabit}
        onOpenChange={(open) => {
          setShowCreateHabit(open)
          if (!open) {
            setIsEditing(false)
            setHabitToEdit(null)
          }
        }}
        onSuccess={() => {
          // Habits will automatically refresh due to Convex reactivity
        }}
        habitToEdit={habitToEdit}
        isEditing={isEditing}
      />
    </div>
  )
}
