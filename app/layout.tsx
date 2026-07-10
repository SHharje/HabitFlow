import type React from "react"
import type { Metadata } from "next"
import { Work_Sans, Open_Sans } from "next/font/google"
import "./globals.css"
import { ConvexProvider } from "@/components/providers/convex-provider"
import { AuthProvider } from "@/lib/auth-context"

const workSans = Work_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-work-sans",
  weight: ["400", "500", "600", "700"],
})

const openSans = Open_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-open-sans",
  weight: ["400", "500", "600"],
})

export const metadata: Metadata = {
  title: "HabitFlow - Build Better Habits",
  description: "Track, analyze, and build lasting habits with our comprehensive habit tracker",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${workSans.variable} ${openSans.variable} antialiased`}>
      <body className="font-sans">
        <ConvexProvider>
          <AuthProvider>{children}</AuthProvider>
        </ConvexProvider>
      </body>
    </html>
  )
}
