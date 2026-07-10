"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Flame, Trophy, Target } from "lucide-react"

interface StreakData {
  habitId: string
  title: string
  currentStreak: number
  longestStreak: number
  totalCompletions: number
}

interface StreakAnalysisProps {
  data: StreakData[]
}

export function StreakAnalysis({ data }: StreakAnalysisProps) {
  // Handle empty or invalid data
  if (!data || data.length === 0) {
    return (
      <div className="space-y-6">
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Flame className="w-5 h-5 text-orange-500" />
                <div>
                  <div className="text-2xl font-bold text-primary">0</div>
                  <div className="text-sm text-muted-foreground">Total Active Days</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <div>
                  <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">0</div>
                  <div className="text-sm text-muted-foreground">Best Streak Ever</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-green-500" />
                <div>
                  <div className="text-2xl font-bold text-chart-3">0</div>
                  <div className="text-sm text-muted-foreground">Active Streaks</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-xl">Streak Comparison</CardTitle>
            <CardDescription>Current vs longest streaks for your top habits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              No streak data available
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-xl">Top Performing Habits</CardTitle>
            <CardDescription>Your most consistent habits ranked by current streak</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-[200px] text-muted-foreground">
              No habit data available
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const topStreaks = [...data].sort((a, b) => b.currentStreak - a.currentStreak).slice(0, 5)
  const chartData = topStreaks.map((habit) => ({
    name: habit.title.length > 15 ? habit.title.substring(0, 15) + "..." : habit.title,
    current: habit.currentStreak,
    longest: habit.longestStreak,
  }))

  const totalCurrentStreak = data.reduce((sum, habit) => sum + habit.currentStreak, 0)
  const bestStreak = Math.max(...data.map((habit) => habit.longestStreak), 0)
  const activeStreaks = data.filter((habit) => habit.currentStreak > 0).length

  return (
    <div className="space-y-6">
      {/* Streak Overview */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <div>
                <div className="text-2xl font-bold text-primary">{totalCurrentStreak}</div>
                <div className="text-sm text-muted-foreground">Total Active Days</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{bestStreak}</div>
                <div className="text-sm text-muted-foreground">Best Streak Ever</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold text-chart-3">{activeStreaks}</div>
                <div className="text-sm text-muted-foreground">Active Streaks</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Streak Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-xl">Streak Comparison</CardTitle>
          <CardDescription>Current vs longest streaks for your top habits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full h-[300px] min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
                          <p className="font-medium">{label}</p>
                          <p className="text-sm text-blue-600">Current: {payload[0].value} days</p>
                          <p className="text-sm text-purple-600">Best: {payload[1].value} days</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar dataKey="current" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                <Bar dataKey="longest" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-xl">Top Performing Habits</CardTitle>
          <CardDescription>Your most consistent habits ranked by current streak</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topStreaks.map((habit, index) => (
              <div key={habit.habitId} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center space-x-3">
                  <Badge
                    variant="secondary"
                    className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {index + 1}
                  </Badge>
                  <div>
                    <div className="font-medium">{habit.title}</div>
                    <div className="text-sm text-muted-foreground">{habit.totalCompletions} total completions</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span className="font-bold text-primary">{habit.currentStreak}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">Best: {habit.longestStreak}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
