import type React from "react"
import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ScenarioProvider } from "@/contexts/scenario-context"
import { UserProvider } from "@/contexts/user-context"
import "./globals.css"

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
})

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
      <body className={`${poppins.className} antialiased`}>
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
