import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ScenarioProvider } from "@/contexts/scenario-context"
import { UserProvider } from "@/contexts/user-context"
import "./globals.css"

const geist = Geist({ subsets: ["latin"] })
const geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SmartHedging - Currency Risk Analysis Platform",
  description: "AI-powered currency risk analysis with hedging strategies simulator and real-time macroeconomic news",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geist.className} antialiased`}>
        <UserProvider>
          <ScenarioProvider>
            {children}
          </ScenarioProvider>
        </UserProvider>
        <Analytics />
      </body>
    </html>
  )
}
