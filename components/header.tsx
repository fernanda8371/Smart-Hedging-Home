"use client"

import Link from "next/link"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useUser } from "@/contexts/user-context"

export function Header() {
  const { userProfile, isLoggedIn, logout } = useUser()
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="relative w-10 h-10">
            <Image 
              src="/smarthedginglogo.png" 
              alt="SmartHedging Logo" 
              fill
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">SmartHedging</h1>
            <p className="text-xs text-gray-500">for Banorte</p>
          </div>
        </Link>

        <nav className="flex items-center gap-8">
          <Link href="/saved" className="text-link hover:text-link-hover font-medium transition-colors">
            Saved Scenarios
          </Link>
          <Link href="/scenario" className="text-link hover:text-link-hover font-medium transition-colors">
            Scenario Builder
          </Link>
          <Link href="/settings" className="text-link hover:text-link-hover font-medium transition-colors">
            Business Settings
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {isLoggedIn && userProfile ? (
            <>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{userProfile.companyName}</p>
                <p className="text-xs text-gray-500">{userProfile.currency} • {userProfile.riskTolerance} risk</p>
              </div>
              <Avatar className="cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all">
                <AvatarImage src="/placeholder-user.png" />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {userProfile.companyName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button
                onClick={logout}
                variant="outline"
                className="rounded-full border-blue-500 text-blue-500 hover:bg-blue-50 bg-transparent transition-colors"
              >
                Log Out
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button
                variant="outline"
                className="rounded-full border-blue-500 text-blue-500 hover:bg-blue-50 bg-transparent transition-colors"
              >
                Log In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}