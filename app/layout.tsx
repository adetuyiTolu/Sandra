import type { Metadata } from "next"
import localFont from "next/font/local"
import "./globals.css"
import { ClientLayout } from "@/components/layout/ClientLayout"

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
            <ClientLayout>{children}</ClientLayout>
          </TooltipProvider>
        </DemoModeProvider>
      </body>
    </html>
  )
}
