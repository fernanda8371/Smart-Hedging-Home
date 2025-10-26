"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, TrendingUp, Shield, BarChart3, Zap, Globe, DollarSign } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)

  const features = [
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Real-Time Currency Analysis",
      description: "AI-powered insights from global news sources with impact scoring"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Smart Hedging Strategies",
      description: "Advanced options strategies with Black-Scholes modeling"
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Risk Assessment",
      description: "Comprehensive risk profiling and tolerance analysis"
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Multi-Currency Support", 
      description: "Track USD, EUR, GBP, CAD, JPY against MXN"
    }
  ]

  const stats = [
    { label: "Currency Pairs", value: "5+", icon: <DollarSign className="h-5 w-5" /> },
    { label: "News Sources", value: "10+", icon: <Globe className="h-5 w-5" /> },
    { label: "AI Accuracy", value: "95%", icon: <Zap className="h-5 w-5" /> },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl text-primary">SmartHedging</span>
          </div>
          <Link href="/login">
            <Button className="bg-primary hover:bg-primary/90">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge variant="outline" className="mb-6 text-primary border-primary">
            AI-Powered Currency Risk Management
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Master Currency Risk with 
            <span className="text-primary"> Smart Analytics</span>
          </h1>
          
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Transform your currency exposure management with real-time AI analysis, 
            advanced hedging strategies, and comprehensive risk assessment tools.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8">
                Start Free Analysis
                <TrendingUp className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8 border-primary text-primary hover:bg-primary/10">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex justify-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center border-0 shadow-lg bg-white">
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-2 text-primary">
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</div>
                  <div className="text-slate-600">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Everything You Need for Currency Risk Management
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Comprehensive tools designed for modern businesses dealing with currency exposure
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className={`cursor-pointer transition-all duration-300 hover:shadow-xl border-0 ${
                hoveredFeature === index ? 'transform -translate-y-2 shadow-2xl' : 'shadow-lg'
              }`}
              onMouseEnter={() => setHoveredFeature(index)}
              onMouseLeave={() => setHoveredFeature(null)}
            >
              <CardHeader className="pb-4">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-primary/10 rounded-lg text-primary">
                    {feature.icon}
                  </div>
                </div>
                <CardTitle className="text-lg text-center">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary/5 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Ready to Transform Your Currency Risk Management?
          </h2>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses using SmartHedging to protect against currency volatility
          </p>
          <Link href="/login">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8">
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl">SmartHedging</span>
          </div>
          <p className="text-slate-400">
            © 2025 SmartHedging. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}