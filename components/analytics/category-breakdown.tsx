"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

interface CategoryData {
  category: string
  totalHabits: number
  completions: number
  averageCompletionRate: number
}

interface CategoryBreakdownProps {
  data: CategoryData[]
}

const categoryColors = {
  "Health & Fitness": "#3b82f6",
  "Learning & Education": "#8b5cf6",
  Productivity: "#f59e0b",
  Mindfulness: "#14b8a6",
  Social: "#ec4899",
  Creative: "#6366f1",
  Finance: "#10b981",
  Other: "#6b7280",
}

export function CategoryBreakdown({ data }: CategoryBreakdownProps) {
  // Handle empty or invalid data
  if (!data || data.length === 0) {
    return (
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-xl">Habits by Category</CardTitle>
            <CardDescription>Distribution of your habits across categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-[250px] text-muted-foreground">
              No category data available
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-xl">Category Performance</CardTitle>
            <CardDescription>Average completion rates by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-[250px] text-muted-foreground">
              No category data available
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const pieData = data.map((item) => ({
    name: item.category,
    value: item.totalHabits,
    completionRate: item.averageCompletionRate,
  }))

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-xl">Habits by Category</CardTitle>
          <CardDescription>Distribution of your habits across categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full h-[250px] min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={categoryColors[entry.name as keyof typeof categoryColors] || categoryColors.Other}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
                          <p className="font-medium">{data.name}</p>
                          <p className="text-sm text-gray-600">
                            {data.value} habit{data.value !== 1 ? "s" : ""}
                          </p>
                          <p className="text-sm font-medium text-blue-600">{data.completionRate}% avg completion</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-xl">Category Performance</CardTitle>
          <CardDescription>Average completion rates by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.map((category) => (
              <div key={category.category} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{category.category}</span>
                  <span className="text-muted-foreground">
                    {category.averageCompletionRate}% • {category.totalHabits} habit
                    {category.totalHabits !== 1 ? "s" : ""}
                  </span>
                </div>
                <Progress value={category.averageCompletionRate} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
