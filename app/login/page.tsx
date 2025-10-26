"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Building2, Shield, TrendingUp } from "lucide-react"
import { useUser, UserProfile } from "@/contexts/user-context"
import { Header } from "@/components/header"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useUser()
  const [isCreatingAccount, setIsCreatingAccount] = useState(false)
  
  const [formData, setFormData] = useState<UserProfile>({
    companyName: '',
    businessDescription: '',
    annualRevenue: 0,
    currency: 'MXN',
    operatingCurrencies: ['MXN', 'USD'],
    riskTolerance: 'medium',
    hedgingObjective: '',
    preferredTimeframe: '1M',
    notificationPreferences: {
      email: true,
      push: false,
      sms: false
    }
  })

  const handleLogin = () => {
    // Mock login - no authentication for now
    const mockProfile: UserProfile = {
      companyName: 'Demo Company',
      businessDescription: 'A financial services company focused on currency risk management.',
      annualRevenue: 5000000,
      currency: 'MXN',
      operatingCurrencies: ['MXN', 'USD', 'EUR'],
      riskTolerance: 'medium',
      hedgingObjective: 'Protect against USD/MXN volatility',
      preferredTimeframe: '1M',
      notificationPreferences: {
        email: true,
        push: false,
        sms: false
      }
    }
    
    login(mockProfile)
    router.push('/')
  }

  const handleCreateAccount = () => {
    if (formData.companyName && formData.businessDescription) {
      login(formData)
      router.push('/')
    }
  }

  const availableCurrencies = [
    { value: 'MXN', label: 'Mexican Peso (MXN)' },
    { value: 'USD', label: 'US Dollar (USD)' },
    { value: 'EUR', label: 'Euro (EUR)' },
    { value: 'GBP', label: 'British Pound (GBP)' },
    { value: 'CAD', label: 'Canadian Dollar (CAD)' },
    { value: 'JPY', label: 'Japanese Yen (JPY)' },
  ]

  if (isCreatingAccount) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Header />
        
        <div className="flex items-center justify-center px-6 py-12">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="flex items-center gap-2 mb-4">
                <button 
                  onClick={() => setIsCreatingAccount(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                  aria-label="Go back to login"
                  title="Go back to login"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <CardTitle className="text-2xl font-bold flex-1">Create Business Account</CardTitle>
              </div>
              <p className="text-gray-600">
                Set up your business profile to get personalized currency risk analysis
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Company Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Company Information
                </h3>
                
                <div>
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                    placeholder="Enter your company name"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="businessDescription">Business Description *</Label>
                  <Textarea
                    id="businessDescription"
                    value={formData.businessDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, businessDescription: e.target.value }))}
                    placeholder="Describe your business, industry, and main activities. This helps our AI provide more relevant analysis."
                    className="mt-1 min-h-24"
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.businessDescription.length}/500 characters
                  </p>
                </div>
              </div>

              {/* Financial Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Financial Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="annualRevenue">Annual Revenue (USD)</Label>
                    <Input
                      id="annualRevenue"
                      type="number"
                      value={formData.annualRevenue}
                      onChange={(e) => setFormData(prev => ({ ...prev, annualRevenue: Number(e.target.value) }))}
                      placeholder="5000000"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="primaryCurrency">Primary Currency</Label>
                    <Select 
                      value={formData.currency} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCurrencies.map((currency) => (
                          <SelectItem key={currency.value} value={currency.value}>
                            {currency.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="hedgingObjective">Hedging Objective</Label>
                  <Textarea
                    id="hedgingObjective"
                    value={formData.hedgingObjective}
                    onChange={(e) => setFormData(prev => ({ ...prev, hedgingObjective: e.target.value }))}
                    placeholder="What are your main currency risk concerns? (e.g., 'Protect against USD/MXN volatility for import costs')"
                    className="mt-1"
                    maxLength={200}
                  />
                </div>
              </div>

              {/* Risk Profile */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Risk Profile
                </h3>
                
                <div>
                  <Label htmlFor="riskTolerance">Risk Tolerance</Label>
                  <Select 
                    value={formData.riskTolerance} 
                    onValueChange={(value: 'low' | 'medium' | 'high') => 
                      setFormData(prev => ({ ...prev, riskTolerance: value }))
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - Conservative approach</SelectItem>
                      <SelectItem value="medium">Medium - Balanced approach</SelectItem>
                      <SelectItem value="high">High - Aggressive approach</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-6 space-y-4">
                <Button 
                  onClick={handleCreateAccount}
                  className="w-full"
                  disabled={!formData.companyName || !formData.businessDescription}
                >
                  Create Account & Start Analysis
                </Button>
                
                <p className="text-xs text-gray-500 text-center">
                  By creating an account, you agree to our terms of service and privacy policy.
                  No authentication required for demo purposes.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />
      
      <div className="flex items-center justify-center px-6 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Welcome to SmartHedging</CardTitle>
            <p className="text-gray-600">
              AI-powered currency risk analysis for businesses
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Button onClick={handleLogin} className="w-full bg-primary hover:bg-primary/90" size="lg">
                Demo Login
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">or</span>
                </div>
              </div>
              
              <Button 
                onClick={() => setIsCreatingAccount(true)} 
                variant="outline" 
                className="w-full" 
                size="lg"
              >
                Create Business Account
              </Button>
            </div>
            
            <div className="text-center text-sm text-gray-500">
              <p>Demo Features:</p>
              <ul className="mt-2 space-y-1 text-xs">
                <li>• Real-time currency analysis</li>
                <li>• AI-powered risk scoring</li>
                <li>• Options strategy recommendations</li>
                <li>• Personalized business insights</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}