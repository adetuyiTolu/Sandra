"use client"

import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/layout/Sidebar"
import { DemoMode } from "@/components/shared/DemoMode"

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // The expansion-plan presentation should take up the full screen
  if (pathname === "/expansion-plan") {
    return <main className="flex-1 w-full h-full">{children}</main>
  }

  return (
    <>
      <Sidebar />
      <div className="flex-1 flex overflow-hidden min-w-0">
        <main className="flex-1 overflow-hidden min-w-0">
          {children}
        </main>
      </div>
      <DemoMode />
    </>
  )
}
