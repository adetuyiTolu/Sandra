// Sandra AI — SandraHeader [LAYOUT]
//
// Component classification: LAYOUT (appears at the top of each page)
// SandraHeader renders the page title, subtitle, and the Demo Mode toggle button.
//
// WHY DEMO MODE IS IN THE HEADER (not a separate page):
// Demo Mode is a meta-layer on top of the normal interface, not a separate
// mode that hides the real UI. The toggle in the header makes it clear that
// what you're seeing IS the product — demo mode just adds a guided navigation
// overlay on top of the live interface. This is intentional: investors and
// prospects should see the real product first, then optionally use demo mode
// as a tour guide.
//
// useDemoMode() context: the header reads isActive to know which button to
// show (Demo Mode vs. Exit Demo Mode). The context lives in lib/demo-context.tsx
// and is provided at the root layout level so all pages share the same
// demo mode state.
//
// The h1 tag here is the primary heading for each page (SEO/accessibility).
// Each page passes a unique title prop, ensuring there's one h1 per page.

"use client"

import { useDemoMode } from "@/lib/demo-context"
import { cn } from "@/lib/utils"
import { Play, X } from "lucide-react"

interface SandraHeaderProps {
  title: string
  subtitle?: string
}

export function SandraHeader({ title, subtitle }: SandraHeaderProps) {
  const { isActive, activateDemo, deactivateDemo } = useDemoMode()

  return (
    <div className="flex items-center justify-between px-5 py-3 bg-[#0A0A0A]/90 backdrop-blur border-b border-white/5">
      <div>
        <h1 className="text-[15px] font-semibold text-[#EAEAEA]">{title}</h1>
        {subtitle && <p className="text-xs text-[#888888] mt-0.5">{subtitle}</p>}
      </div>

      <button
        onClick={isActive ? deactivateDemo : activateDemo}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all-150 border",
          isActive
            ? "bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20"
            : "bg-[#37b7ab]/10 text-[#37b7ab] border-[#37b7ab]/20 hover:bg-[#37b7ab]/20"
        )}
      >
        {isActive ? (
          <>
            <X size={14} />
            Exit Demo Mode
          </>
        ) : (
          <>
            <Play size={14} />
            Demo Mode
          </>
        )}
      </button>
    </div>
  )
}
