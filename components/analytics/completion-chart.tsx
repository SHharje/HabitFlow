"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { TrendingUp } from "lucide-react"

interface CompletionData {
  date: string
  completed: number
  total: number
  percentage: number
  dayName: string
}

interface CompletionChartProps {
  data: CompletionData[]
}

export function CompletionChart({ data }: CompletionChartProps) {
  // Handle empty or invalid data
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-xl">Completion Trends</CardTitle>
          <CardDescription>Daily habit completion over the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No completion data available
          </div>
        </CardContent>
      </Card>
    )
  }





  const averageCompletion =
    data.length > 0 ? Math.round(data.reduce((sum, day) => sum + day.percentage, 0) / data.length) : 0

  const trend = data.length >= 2 ? data[data.length - 1].percentage - data[0].percentage : 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-serif text-xl">Completion Trends</CardTitle>
            <CardDescription>Daily habit completion over the last 30 days</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{averageCompletion}%</div>
            <div className="text-sm font-medium text-muted-foreground">30-Day Average</div>
            <div className={`text-sm flex items-center justify-end mt-1 ${trend >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
              <TrendingUp className={`w-3 h-3 mr-1 ${trend < 0 ? "rotate-180" : ""}`} />
              {trend >= 0 ? "+" : ""}
              {trend}%
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[300px] min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="dayName" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
              <YAxis tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} domain={[0, 100]} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                        <p className="font-medium text-foreground">{label}</p>
                        <p className="text-sm text-muted-foreground">
                          {data.completed}/{data.total} habits completed
                        </p>
                        <p className="text-sm font-medium text-primary">{data.percentage}% completion rate</p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Line
                type="monotone"
                dataKey="percentage"
                stroke="var(--chart-1)"
                strokeWidth={3}
                dot={{ fill: "var(--chart-1)", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "var(--chart-1)", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
