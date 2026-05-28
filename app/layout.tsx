import type { Metadata } from "next"
import localFont from "next/font/local"
import "./globals.css"
import { Sidebar } from "@/components/layout/Sidebar"

import { DemoMode } from "@/components/shared/DemoMode"
import { DemoModeProvider } from "@/lib/demo-context"
import { TooltipProvider } from "@/components/ui/tooltip"

const geist = localFont({
  src: [
    {
      path: "./fonts/GeistVF.woff",
      weight: "100 900",
      style: "normal",
    },
  ],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "Sandra AI — Intelligence Layer for Prembly",
  description:
    "Sandra AI is the intelligent operating layer for Prembly's trust infrastructure. Powering KYC, AML, fraud detection, and compliance across emerging markets.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.variable}>
      <body className="flex h-screen overflow-hidden bg-[#0A0A0A] text-[#EAEAEA]">
        <DemoModeProvider>
          <TooltipProvider>
            <Sidebar />

            <div className="flex-1 flex overflow-hidden min-w-0">
              <main className="flex-1 overflow-hidden min-w-0">
                {children}
              </main>
            </div>

            <DemoMode />
          </TooltipProvider>
        </DemoModeProvider>
      </body>
    </html>
  )
}
