"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Clock, Timer } from "lucide-react"

interface TimeData {
  date: string
  totalTime: number
  dayName: string
  sessions: number
}

interface TimeAnalyticsProps {
  data: TimeData[]
  totalTimeThisWeek: number
  averageTimePerDay: number
}

export function TimeAnalytics({ data, totalTimeThisWeek, averageTimePerDay }: TimeAnalyticsProps) {
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  return (
    <div className="space-y-6">
      {/* Time Overview */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold text-primary">{formatTime(totalTimeThisWeek)}</div>
                <div className="text-sm font-medium text-muted-foreground">Total This Week</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Timer className="w-5 h-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatTime(averageTimePerDay)}</div>
                <div className="text-sm font-medium text-muted-foreground">Daily Average</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-xl">Time Spent This Week</CardTitle>
          <CardDescription>Daily time investment in your habits</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="dayName" className="text-muted-foreground" tick={{ fontSize: 12 }} />
              <YAxis className="text-muted-foreground" tick={{ fontSize: 12 }} tickFormatter={formatTime} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                        <p className="font-medium">{label}</p>
                        <p className="text-sm text-primary">Time: {formatTime(data.totalTime)}</p>
                        <p className="text-sm text-muted-foreground">
                          {data.sessions} session{data.sessions !== 1 ? "s" : ""}
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Area
                type="monotone"
                dataKey="totalTime"
                stroke="var(--chart-1)"
                fill="var(--chart-1)"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
