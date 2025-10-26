"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { 
  Building2, 
  Shield, 
  TrendingUp, 
  Bell, 
  Copy, 
  ExternalLink,
  Save,
  User,
  DollarSign
} from "lucide-react"
import { useUser, UserProfile, generateMCPParameters } from "@/contexts/user-context"
import { Header } from "@/components/header"
import { InfoTooltip } from "@/components/ui/info-tooltip"

export default function SettingsPage() {
  const router = useRouter()
  const { userProfile, updateUserProfile, isLoggedIn, logout } = useUser()
  const [formData, setFormData] = useState<UserProfile | null>(null)
  const [mcpUrl, setMcpUrl] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login')
      return
    }
    
    if (userProfile) {
      // Ensure currencyRevenues exists for backward compatibility
      const migratedProfile = {
        ...userProfile,
        currencyRevenues: userProfile.currencyRevenues || {}
      }
      setFormData(migratedProfile)
    }
  }, [isLoggedIn, userProfile, router])

  useEffect(() => {
    // Generate MCP URL whenever form data changes
    if (formData) {
      const baseUrl = window.location.origin
      const params = generateMCPParameters(formData)
      setMcpUrl(`${baseUrl}/api/mcp?${params}`)
    }
  }, [formData])

  const handleSave = () => {
    if (formData) {
      updateUserProfile(formData)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // Could add a toast notification here
    } catch (err) {
      console.error('Failed to copy:', err)
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

  const handleCurrencyToggle = (currency: string) => {
    if (!formData) return
    
    const newCurrencies = formData.operatingCurrencies.includes(currency)
      ? formData.operatingCurrencies.filter(c => c !== currency)
      : [...formData.operatingCurrencies, currency]
    
    // Initialize currency revenue if adding new currency
    const updatedRevenues = { ...formData.currencyRevenues }
    if (!formData.operatingCurrencies.includes(currency) && newCurrencies.includes(currency)) {
      updatedRevenues[currency] = 0
    }
    // Remove currency revenue if removing currency
    if (formData.operatingCurrencies.includes(currency) && !newCurrencies.includes(currency)) {
      delete updatedRevenues[currency]
    }
    
    setFormData(prev => prev ? { 
      ...prev, 
      operatingCurrencies: newCurrencies,
      currencyRevenues: updatedRevenues
    } : null)
  }

  const handleCurrencyRevenueChange = (currency: string, amount: number) => {
    if (!formData) return
    
    setFormData(prev => prev ? {
      ...prev,
      currencyRevenues: {
        ...prev.currencyRevenues,
        [currency]: amount
      }
    } : null)
  }

  if (!formData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <h2 className="text-xl font-semibold">Loading...</h2>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Business Settings</h1>
            <p className="text-gray-600">
              Manage your business profile and AI analysis preferences
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              onClick={handleSave}
              className={`flex items-center gap-2 ${saved ? 'bg-green-600' : ''}`}
            >
              <Save className="w-4 h-4" />
              {saved ? 'Saved!' : 'Save Changes'}
            </Button>
            
            <Button variant="outline" onClick={logout}>
              Log Out
            </Button>
          </div>
        </div>

        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Company Information
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => setFormData(prev => prev ? { ...prev, companyName: e.target.value } : null)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="primaryCurrency">Primary Currency</Label>
                <Select 
                  value={formData.currency} 
                  onValueChange={(value) => setFormData(prev => prev ? { ...prev, currency: value } : null)}
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
              <div className="flex items-center gap-2 mb-2">
                <Label htmlFor="businessDescription">Business Description</Label>
                <InfoTooltip content="This description helps our AI provide more relevant analysis and recommendations tailored to your industry and business model." />
              </div>
              <Textarea
                id="businessDescription"
                value={formData.businessDescription}
                onChange={(e) => setFormData(prev => prev ? { ...prev, businessDescription: e.target.value } : null)}
                placeholder="Describe your business, industry, main activities, and any specific currency risk concerns..."
                className="min-h-24"
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.businessDescription.length}/500 characters
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Financial Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Financial Profile
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Label htmlFor="annualRevenue">Annual Revenue (USD)</Label>
                  <InfoTooltip content="Your annual revenue helps determine the scale of analysis and appropriate hedging strategies." />
                </div>
                <Input
                  id="annualRevenue"
                  type="number"
                  value={formData.annualRevenue}
                  onChange={(e) => setFormData(prev => prev ? { ...prev, annualRevenue: Number(e.target.value) } : null)}
                  placeholder="5000000"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <Label>Operating Currencies</Label>
                <InfoTooltip content="Select all currencies your business operates in. This affects how gains/losses are calculated and which currency pairs are most relevant for your analysis." />
              </div>
              <div className="flex flex-wrap gap-2">
                {availableCurrencies.map((currency) => (
                  <Badge
                    key={currency.value}
                    variant={formData.operatingCurrencies.includes(currency.value) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-opacity-80 transition-colors"
                    onClick={() => handleCurrencyToggle(currency.value)}
                  >
                    {currency.label}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Selected: {formData.operatingCurrencies.join(', ')}
              </p>
            </div>

            {/* Currency Revenue Breakdown */}
            {formData.operatingCurrencies.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Label>Annual Revenue by Currency</Label>
                  <InfoTooltip content="Specify your approximate annual revenue in each operating currency to help calculate exposure and risk." />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.operatingCurrencies.map((currency) => (
                    <div key={currency}>
                      <Label htmlFor={`revenue-${currency}`} className="text-sm">
                        Revenue in {currency}
                      </Label>
                      <Input
                        id={`revenue-${currency}`}
                        type="number"
                        placeholder="0"
                        value={formData.currencyRevenues[currency] || ''}
                        onChange={(e) => handleCurrencyRevenueChange(currency, Number(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Enter annual revenue amounts for each selected currency to improve analysis accuracy.
                </p>
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Label htmlFor="hedgingObjective">Hedging Objective</Label>
                <InfoTooltip content="Describe your main currency risk concerns and hedging goals to get more targeted recommendations." />
              </div>
              <Textarea
                id="hedgingObjective"
                value={formData.hedgingObjective}
                onChange={(e) => setFormData(prev => prev ? { ...prev, hedgingObjective: e.target.value } : null)}
                placeholder="What are your main currency risk concerns? (e.g., 'Protect against USD/MXN volatility for import costs', 'Hedge EUR revenue exposure')"
                className="min-h-16"
                maxLength={200}
              />
            </div>
          </CardContent>
        </Card>

        {/* Risk Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Risk Profile & Preferences
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="riskTolerance">Risk Tolerance</Label>
                <Select 
                  value={formData.riskTolerance} 
                  onValueChange={(value: 'low' | 'medium' | 'high') => 
                    setFormData(prev => prev ? { ...prev, riskTolerance: value } : null)
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

              <div>
                <Label htmlFor="preferredTimeframe">Preferred Analysis Timeframe</Label>
                <Select 
                  value={formData.preferredTimeframe} 
                  onValueChange={(value) => setFormData(prev => prev ? { ...prev, preferredTimeframe: value } : null)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1D">1 Day</SelectItem>
                    <SelectItem value="1W">1 Week</SelectItem>
                    <SelectItem value="1M">1 Month</SelectItem>
                    <SelectItem value="3M">3 Months</SelectItem>
                    <SelectItem value="6M">6 Months</SelectItem>
                    <SelectItem value="1Y">1 Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notification Preferences
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-gray-500">Receive analysis updates via email</p>
                </div>
                <Switch
                  checked={formData.notificationPreferences.email}
                  onCheckedChange={(checked) => 
                    setFormData(prev => prev ? {
                      ...prev,
                      notificationPreferences: { ...prev.notificationPreferences, email: checked }
                    } : null)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-gray-500">Browser push notifications for urgent alerts</p>
                </div>
                <Switch
                  checked={formData.notificationPreferences.push}
                  onCheckedChange={(checked) => 
                    setFormData(prev => prev ? {
                      ...prev,
                      notificationPreferences: { ...prev.notificationPreferences, push: checked }
                    } : null)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>SMS Notifications</Label>
                  <p className="text-sm text-gray-500">Text message alerts for critical market events</p>
                </div>
                <Switch
                  checked={formData.notificationPreferences.sms}
                  onCheckedChange={(checked) => 
                    setFormData(prev => prev ? {
                      ...prev,
                      notificationPreferences: { ...prev.notificationPreferences, sms: checked }
                    } : null)
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* MCP Integration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="w-5 h-5" />
              MCP Integration
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Label>Generated MCP URL</Label>
                <InfoTooltip content="This URL contains your business parameters and can be used with MCP (Model Context Protocol) for AI integrations. The URL updates automatically when you change your settings." />
              </div>
              <div className="flex gap-2">
                <Input
                  value={mcpUrl}
                  readOnly
                  className="font-mono text-xs"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(mcpUrl)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                This URL contains your business context and preferences for AI analysis
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-sm mb-2">Business Impact Analysis</h4>
              <div className="text-sm text-gray-700 space-y-1">
                <p><strong>Primary Currency:</strong> {formData.currency}</p>
                <p><strong>Operating Currencies:</strong> {formData.operatingCurrencies.join(', ')}</p>
                <p><strong>Revenue Scale:</strong> ${formData.annualRevenue.toLocaleString()} USD</p>
                <p><strong>Risk Profile:</strong> {formData.riskTolerance} risk tolerance</p>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                <strong>Impact Logic:</strong> Currency movements are analyzed based on your primary currency and revenue exposure. 
                For example, if your primary currency is MXN and USD strengthens, this may represent different impacts 
                depending on whether you have USD revenues (positive) or USD costs (negative).
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}