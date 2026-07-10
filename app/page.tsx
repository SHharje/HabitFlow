"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle,
  TrendingUp,
  Users,
  Calendar,
  Target,
  BarChart3,
  Zap,
  Star,
  ArrowRight,
  Play,
  Sparkles,
} from "lucide-react"
import { LoginDialog } from "@/components/auth/login-dialog"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const benefits = [
  {
    icon: Target,
    title: "Precision Tracking",
    description: "Set measurable goals with intelligent progress monitoring and adaptive scheduling.",
  },
  {
    icon: TrendingUp,
    title: "Advanced Analytics",
    description: "Visualize patterns with sophisticated charts and predictive insights.",
  },
  {
    icon: Users,
    title: "Community Driven",
    description: "Connect with like-minded individuals and build accountability networks.",
  },
  {
    icon: Calendar,
    title: "Smart Automation",
    description: "AI-powered scheduling that adapts to your lifestyle and optimizes success rates.",
  },
  {
    icon: BarChart3,
    title: "Deep Insights",
    description: "Understand behavioral patterns with machine learning-powered analytics.",
  },
  {
    icon: Zap,
    title: "Habit Stacking",
    description: "Build powerful routines by connecting habits with proven psychological techniques.",
  },
]

const features = [
  {
    title: "Streak Intelligence",
    description: "AI-powered streak analysis with predictive success modeling",
    metric: "98% accuracy",
  },
  {
    title: "Adaptive Reminders",
    description: "Context-aware notifications that learn your optimal timing",
    metric: "5x engagement",
  },
  {
    title: "Behavioral Analytics",
    description: "Deep learning insights into your habit formation patterns",
    metric: "200+ metrics",
  },
]

export default function HomePage() {
  const [showLogin, setShowLogin] = useState(false)
  const { user, isLoading } = useAuth()
  const router = useRouter()

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (user && !isLoading) {
      router.push("/dashboard")
    }
  }, [user, isLoading, router])

  // Show loading animation while checking auth or while authenticated (redirecting to dashboard)
  if (isLoading || user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center overflow-hidden">
        {/* Animated background orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, var(--chart-1), transparent)" }}
            animate={{ scale: [1, 1.3, 1], x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full opacity-15"
            style={{ background: "radial-gradient(circle, var(--chart-2), transparent)" }}
            animate={{ scale: [1.2, 1, 1.2], x: [0, -20, 0], y: [0, 30, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <motion.div
          className="text-center relative z-10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Spinning rings */}
          <div className="relative w-24 h-24 mx-auto mb-8">
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-transparent"
              style={{ borderTopColor: "var(--chart-1)", borderRightColor: "var(--chart-1)" }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-2 rounded-full border-2 border-transparent"
              style={{ borderBottomColor: "var(--chart-2)", borderLeftColor: "var(--chart-2)" }}
              animate={{ rotate: -360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-4 rounded-full border-2 border-transparent"
              style={{ borderTopColor: "var(--chart-4)", borderLeftColor: "var(--chart-4)" }}
              animate={{ rotate: 360 }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
            />
            {/* Center logo */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg shadow-primary/25"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Sparkles className="w-5 h-5 text-white" />
              </motion.div>
            </div>
          </div>

          {/* Text */}
          <motion.p
            className="text-lg font-semibold text-foreground mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {user ? "Welcome back!" : "HabitFlow"}
          </motion.p>
          <motion.p
            className="text-sm text-muted-foreground font-medium"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {user ? "Taking you to your dashboard..." : "Loading your experience..."}
          </motion.p>

          {/* Loading dots */}
          <div className="flex justify-center gap-1.5 mt-4">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-muted-foreground/50"
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <motion.nav
        className="border-b border-border bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-xl flex items-center justify-center shadow-lg shadow-primary/25">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <span className="font-serif text-2xl font-bold text-foreground">HabitFlow</span>
          </div>
          <Button
            onClick={() => setShowLogin(true)}
            className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg shadow-primary/25"
          >
            Get Started
          </Button>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto text-center">
          <motion.div variants={staggerContainer} initial="initial" animate="animate" className="max-w-5xl mx-auto">
            <motion.div variants={fadeInUp}>
              <Badge
                variant="secondary"
                className="mb-6 bg-chart-1/10 text-chart-1 border-chart-1/20 px-4 py-2"
              >
                <Star className="w-4 h-4 mr-2" />
                Trusted by 50,000+ users worldwide
              </Badge>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="font-serif text-6xl md:text-8xl font-bold text-foreground mb-8 leading-tight"
            >
              Build Habits That
              <span className="bg-gradient-to-r from-primary via-chart-1 to-chart-2 bg-clip-text text-transparent block">
                Transform Lives
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed font-medium"
            >
              Experience the future of habit formation with AI-powered insights, predictive analytics, and
              community-driven accountability. Build lasting change with scientific precision.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white px-10 py-4 text-lg font-semibold shadow-xl shadow-primary/25"
                onClick={() => setShowLogin(true)}
              >
                Start Your Journey
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="px-10 py-4 text-lg font-semibold border-border hover:bg-muted bg-transparent"
              >
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Demo */}
      <section className="py-24 px-6 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="font-serif text-5xl font-bold text-foreground mb-6">Intelligence Meets Simplicity</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-medium">
              Discover how advanced analytics and intuitive design create the perfect habit-building experience.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8 mb-20"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="h-full hover:shadow-2xl hover:shadow-accent/10 transition-all duration-500 hover:-translate-y-2 border-border/50 bg-gradient-to-b from-card to-background">
                  <CardHeader className="pb-4">
                    <CardTitle className="font-serif text-2xl font-bold">{feature.title}</CardTitle>
                    <CardDescription className="text-base leading-relaxed">{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold bg-gradient-to-r from-chart-1 to-chart-2 bg-clip-text text-transparent">
                      {feature.metric}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Demo Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-gradient-to-b from-card to-background border border-border/50 rounded-2xl p-10 shadow-2xl shadow-accent/5 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-serif text-3xl font-bold text-foreground">Your Dashboard Preview</h3>
                <Badge
                  variant="secondary"
                  className="bg-chart-1/10 text-chart-1 border-chart-1/20 px-3 py-1"
                >
                  Live Analytics
                </Badge>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-6 bg-gradient-to-r from-muted to-background rounded-xl border border-border/50">
                    <div className="flex items-center space-x-4">
                      <div className="w-4 h-4 bg-gradient-to-r from-chart-1 to-chart-2 rounded-full shadow-lg shadow-chart-1/25"></div>
                      <span className="font-semibold text-lg text-foreground">Morning Workout</span>
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">14 day streak</div>
                  </div>
                  <div className="flex items-center justify-between p-6 bg-gradient-to-r from-muted to-background rounded-xl border border-border/50">
                    <div className="flex items-center space-x-4">
                      <div className="w-4 h-4 bg-gradient-to-r from-chart-2 to-destructive rounded-full shadow-lg shadow-chart-2/25"></div>
                      <span className="font-semibold text-lg text-foreground">Deep Reading</span>
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">21 day streak</div>
                  </div>
                  <div className="flex items-center justify-between p-6 bg-gradient-to-r from-muted to-background rounded-xl border border-border/50">
                    <div className="flex items-center space-x-4">
                      <div className="w-4 h-4 bg-gradient-to-r from-chart-3 to-muted-foreground rounded-full shadow-lg shadow-chart-3/25"></div>
                      <span className="font-semibold text-lg text-foreground">Mindfulness</span>
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">7 day streak</div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-muted to-background rounded-xl p-8 flex items-center justify-center border border-border/50">
                  <div className="text-center">
                    <div className="text-5xl font-bold bg-gradient-to-r from-chart-1 to-chart-2 bg-clip-text text-transparent mb-3">
                      92%
                    </div>
                    <div className="text-lg text-muted-foreground font-medium">Success Rate</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="font-serif text-5xl font-bold text-foreground mb-6">Why Choose HabitFlow?</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-medium">
              Built with cutting-edge technology and designed for sustainable behavioral change.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {benefits.map((benefit, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="h-full hover:shadow-2xl hover:shadow-accent/10 transition-all duration-500 hover:-translate-y-2 border-border/50 bg-gradient-to-b from-card to-background group">
                  <CardHeader className="pb-6">
                    <div className="w-16 h-16 bg-chart-1/10 rounded-2xl flex items-center justify-center mb-6 group-hover:shadow-lg group-hover:shadow-chart-1/25 transition-all duration-300">
                      <benefit.icon className="w-8 h-8 text-chart-1" />
                    </div>
                    <CardTitle className="font-serif text-2xl font-bold mb-3">{benefit.title}</CardTitle>
                    <CardDescription className="text-base leading-relaxed">{benefit.description}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gradient-to-r from-accent/5 to-secondary/5">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="font-serif text-5xl font-bold text-foreground mb-8">Ready to Transform Your Life?</h2>
            <p className="text-xl text-muted-foreground mb-10 font-medium">
              Join thousands of users who have already built lasting habits with HabitFlow's intelligent platform.
            </p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white px-12 py-4 text-lg font-semibold shadow-xl shadow-primary/25"
              onClick={() => setShowLogin(true)}
            >
              Start Your Journey Today
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-16 px-6 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-xl flex items-center justify-center shadow-lg shadow-primary/25">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <span className="font-serif text-2xl font-bold text-foreground">HabitFlow</span>
          </div>
          <p className="text-muted-foreground font-medium">
            © 2024 HabitFlow. Building better habits, one day at a time.
          </p>
        </div>
      </footer>

      <LoginDialog open={showLogin} onOpenChange={setShowLogin} />
    </div>
  )
}
