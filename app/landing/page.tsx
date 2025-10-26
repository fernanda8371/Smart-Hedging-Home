"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, TrendingUp, Shield, BarChart3, Zap, Globe, DollarSign } from "lucide-react"
import Link from "next/link"
import "../../styles/landing.css"

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
      <header className="border-b bg-white/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <img 
                src="/smartHedgingLogo.png" 
                alt="SmartHedging Logo" 
                className="w-10 h-10 object-contain"
              />
            </div>
            <div>
              <span className="font-bold text-xl text-brand">SmartHedging</span>
              <div className="text-xs text-slate-500 font-medium">Currency Risk Management</div>
            </div>
          </div>

          <Link href="/login">
            <Button className="btn-brand shadow-lg">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-hero-gradient">
        <div className="absolute inset-0 bg-brand-gradient"></div>
        <div className="container mx-auto px-4 py-24 text-center relative">
          <div className="max-w-5xl mx-auto">
            <Badge variant="outline" className="mb-8 border-brand bg-white/80 backdrop-blur-sm px-4 py-2 text-brand">
              <Zap className="w-4 h-4 mr-2" />
              AI-Powered Currency Risk Management
            </Badge>
            
            <h1 className="text-6xl md:text-7xl font-bold text-slate-900 mb-8 leading-tight">
              Master Currency Risk with 
              <span className="text-brand"> Smart Analytics</span>
            </h1>
            
            <p className="text-2xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Transform your currency exposure management with real-time AI analysis, 
              advanced hedging strategies, and comprehensive risk assessment tools designed for modern businesses.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Link href="/login">
                <Button 
                  size="lg" 
                  className="btn-brand text-xl px-10 py-4 shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  Start Free Analysis
                  <TrendingUp className="ml-3 h-6 w-6" />
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-slate-500">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 icon-brand" />
                <span className="font-medium">Bank-Grade Security</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 icon-brand" />
                <span className="font-medium">Real-Time Data</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-16 border-t border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="flex justify-center mb-4">
                  <div className="p-4 rounded-full text-white group-hover:scale-110 transition-all duration-300 shadow-lg bg-brand">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-4xl font-bold text-slate-900 mb-2">{stat.value}</div>
                <div className="text-slate-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-features-gradient">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <Badge className="mb-6 bg-brand-light border-brand text-brand">
              <BarChart3 className="w-4 h-4 mr-2" />
              Professional Tools
            </Badge>
            <h2 className="text-5xl font-bold text-slate-900 mb-6">
              Everything You Need for Currency Risk Management
            </h2>
            <p className="text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Comprehensive tools designed for modern businesses dealing with currency exposure and international markets
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className={`cursor-pointer transition-all duration-500 hover:shadow-2xl border-0 group relative overflow-hidden ${
                  hoveredFeature === index ? 'transform -translate-y-3 shadow-2xl scale-105' : 'shadow-lg'
                }`}
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <div className="absolute inset-0 feature-card-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="pb-6 relative">
                  <div className="flex justify-center mb-6">
                    <div 
                      className={`p-4 rounded-xl text-white transition-all duration-300 ${
                        hoveredFeature === index ? 'scale-110 bg-brand' : 'bg-brand-button'
                      }`}
                    >
                      {feature.icon}
                    </div>
                  </div>
                  <CardTitle className="text-xl text-center font-bold text-slate-900">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <CardDescription className="text-center text-slate-600 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden bg-cta">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 text-center relative">
          <h2 className="text-5xl font-bold mb-6 text-white">
            Ready to Transform Your Currency Risk Management?
          </h2>
          <p className="text-2xl mb-12 max-w-3xl mx-auto opacity-90 text-white">
            Join thousands of businesses using SmartHedging to protect against currency volatility and optimize their international operations
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/login">
              <Button 
                size="lg" 
                className="btn-brand text-xl px-10 py-4 shadow-xl"
              >
                Get Started Now
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-xl px-10 py-4 border-white text-white hover:bg-white/20 bg-transparent"
            >
              <Zap className="mr-3 h-6 w-6" />
              Schedule Demo
            </Button>
          </div>
          <p className="mt-8 text-lg opacity-75 text-white">
            No credit card required • Free 30-day trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 flex items-center justify-center">
                  <img 
                    src="/smartHedgingLogo.png" 
                    alt="SmartHedging Logo" 
                    className="w-10 h-10 object-contain filter invert"
                  />
                </div>
                <div>
                  <span className="font-bold text-xl text-white">SmartHedging</span>
                  <div className="text-xs text-slate-400 font-medium">Currency Risk Management</div>
                </div>
              </div>
              <p className="text-slate-400 mb-4 max-w-md">
                Transform your currency exposure management with AI-powered analytics and professional hedging strategies.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Security</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">API</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="#" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Status</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 pt-8 text-center">
            <p className="text-slate-400">
              © 2025 SmartHedging. All rights reserved. | Built with precision for currency risk management.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}