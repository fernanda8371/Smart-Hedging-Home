"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface UserProfile {
  // Personal/Business Info
  companyName: string
  businessDescription: string
  
  // Financial Info
  annualRevenue: number
  currency: string // Primary currency
  operatingCurrencies: string[] // All currencies they work with
  currencyRevenues: { [currency: string]: number } // Annual revenue per currency
  
  // Risk Profile
  riskTolerance: 'low' | 'medium' | 'high'
  hedgingObjective: string
  
  // Settings
  preferredTimeframe: string
  notificationPreferences: {
    email: boolean
    push: boolean
    sms: boolean
  }
}

interface UserContextType {
  userProfile: UserProfile | null
  setUserProfile: (profile: UserProfile) => void
  updateUserProfile: (updates: Partial<UserProfile>) => void
  clearUserProfile: () => void
  isLoggedIn: boolean
  login: (profile: UserProfile) => void
  logout: () => void
}

const defaultProfile: UserProfile = {
  companyName: '',
  businessDescription: '',
  annualRevenue: 0,
  currency: 'USD',
  operatingCurrencies: ['USD', 'MXN'],
  currencyRevenues: { 'USD': 0, 'MXN': 0 },
  riskTolerance: 'medium',
  hedgingObjective: '',
  preferredTimeframe: '1M',
  notificationPreferences: {
    email: true,
    push: false,
    sms: false
  }
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [userProfile, setUserProfileState] = useState<UserProfile | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    // Load user data from localStorage on mount
    const savedProfile = localStorage.getItem('userProfile')
    const savedLoginStatus = localStorage.getItem('isLoggedIn')
    
    if (savedProfile && savedLoginStatus === 'true') {
      const profile = JSON.parse(savedProfile)
      // Ensure backward compatibility for currencyRevenues
      if (!profile.currencyRevenues) {
        profile.currencyRevenues = {}
        // Initialize with zeros for existing currencies
        profile.operatingCurrencies?.forEach((currency: string) => {
          profile.currencyRevenues[currency] = 0
        })
      }
      setUserProfileState(profile)
      setIsLoggedIn(true)
    }
  }, [])

  const setUserProfile = (profile: UserProfile) => {
    setUserProfileState(profile)
    localStorage.setItem('userProfile', JSON.stringify(profile))
  }

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    if (userProfile) {
      const updatedProfile = { ...userProfile, ...updates }
      setUserProfile(updatedProfile)
    }
  }

  const clearUserProfile = () => {
    setUserProfileState(null)
    localStorage.removeItem('userProfile')
  }

  const login = (profile: UserProfile) => {
    setUserProfile(profile)
    setIsLoggedIn(true)
    localStorage.setItem('isLoggedIn', 'true')
  }

  const logout = () => {
    clearUserProfile()
    setIsLoggedIn(false)
    localStorage.removeItem('isLoggedIn')
  }

  return (
    <UserContext.Provider value={{
      userProfile,
      setUserProfile,
      updateUserProfile,
      clearUserProfile,
      isLoggedIn,
      login,
      logout
    }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

// Utility function to generate URL parameters for MCP
export function generateMCPParameters(userProfile: UserProfile | null): string {
  if (!userProfile) return ''
  
  const params = new URLSearchParams({
    companyName: userProfile.companyName,
    businessDescription: userProfile.businessDescription,
    annualRevenue: userProfile.annualRevenue.toString(),
    primaryCurrency: userProfile.currency,
    operatingCurrencies: userProfile.operatingCurrencies.join(','),
    riskTolerance: userProfile.riskTolerance,
    hedgingObjective: userProfile.hedgingObjective,
    preferredTimeframe: userProfile.preferredTimeframe,
  })
  
  return params.toString()
}