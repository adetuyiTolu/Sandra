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
import { Play, X, Menu, Cpu } from "lucide-react"

interface SandraHeaderProps {
  title: string
  subtitle?: string
}

export function SandraHeader({ title, subtitle }: SandraHeaderProps) {
  const { isActive, activateDemo, deactivateDemo, isSandraEnabled, toggleSandra } = useDemoMode()

  return (
    <div className="flex items-center justify-between px-5 py-3 bg-[#0A0A0A]/90 backdrop-blur border-b border-white/5">
      <div className="flex items-center gap-3">
        <button 
          onClick={() => window.dispatchEvent(new Event('sandra:toggle-menu'))}
          className="md:hidden text-[#888] hover:text-[#EAEAEA] transition-colors"
          aria-label="Toggle menu"
        >
          <Menu size={18} />
        </button>
        <div>
          <h1 className="text-[15px] font-semibold text-[#EAEAEA]">{title}</h1>
          {subtitle && <p className="text-xs text-[#888888] mt-0.5 hidden sm:block">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={toggleSandra}
          className="flex items-center gap-2 px-2.5 py-1.5 text-[#a3a3a3] hover:text-white hover:bg-white/5 rounded-md transition-colors text-xs font-medium"
        >
          <Cpu size={14} className={isSandraEnabled ? "text-[#37b7ab]" : "text-[#858585]"} />
          <span className="hidden sm:inline">{isSandraEnabled ? "Sandra AI On" : "Sandra AI Off"}</span>
          <div className={cn("ml-1 w-7 h-3.5 rounded-full flex items-center p-0.5 transition-colors shrink-0", isSandraEnabled ? "bg-[#37b7ab]" : "bg-[#333]")}>
            <div className={cn("w-2.5 h-2.5 bg-white rounded-full transition-transform shadow-sm", isSandraEnabled ? "translate-x-3.5" : "translate-x-0")} />
          </div>
        </button>

        <button
          onClick={isActive ? deactivateDemo : activateDemo}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all-150 border",
            isActive
              ? "bg-[#37b7ab]/10 text-[#37b7ab] border-[#37b7ab]/30 shadow-[0_0_10px_rgba(55,183,171,0.15)] hover:bg-[#37b7ab]/20"
              : "bg-transparent text-[#EAEAEA] border-white/10 hover:border-white/20 hover:bg-white/5"
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
    </div>
  )
}
