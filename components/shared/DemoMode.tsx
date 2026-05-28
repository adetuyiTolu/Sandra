// Sandra AI — DemoMode [SHARED]
//
// Component classification: SHARED (floating overlay on all pages)
// The DemoMode widget is Sandra's guided tour controller. It renders as a
// floating bottom-right overlay when demo mode is active, showing the
// step sequence and allowing the presenter to navigate forward/backward.
//
// HOW IT CONNECTS TO THE BROADER ARCHITECTURE:
//
// DemoMode reads from useDemoMode() context (lib/demo-context.tsx) which
// provides: the list of 8 steps, the current step ID, and navigation handlers.
// When the presenter clicks "Next", DemoMode:
//   1. Calls setStep(next) to update the context
//   2. Calls router.push(`/${step.page}`) to navigate to the correct page
//   3. If the step has a chatMessage, it's pre-filled into ChatWindow's input
//      via the initialMessage prop (passed through page props)
//
// The pre-typed message preview (the "Pre-typed message" section) shows exactly
// what Sandra will say when the presenter hits Enter. This lets the presenter
// know what's coming without actually triggering the API call prematurely.
//
// WHY A FLOATING WIDGET INSTEAD OF A HEADER/MODAL:
// The demo is often shown during screen-share. The floating widget doesn't
// obstruct the main interface content — it occupies the bottom-right corner
// which is conventionally safe space (tooltips, toasts, chatbots all use it).
// The presenter can advance the demo without moving the mouse far from the
// main content area.
//
// WHY CHECKMARKS APPEAR ON COMPLETED STEPS:
// The green checkmarks (currentStep > step.id) give the presenter a clear
// visual confirmation of where they are in the flow. This is especially
// useful when resuming a demo after a question has interrupted the flow.

"use client"

import { useRouter } from "next/navigation"
import { useDemoMode } from "@/lib/demo-context"
import { cn } from "@/lib/utils"
import { ChevronRight, ChevronLeft, X } from "lucide-react"
import { dispatchSandraAsk } from "@/lib/sandra-events"

export function DemoMode() {
  const { isActive, currentStep, steps, deactivateDemo, setStep, currentStepData } = useDemoMode()
  const router = useRouter()

  if (!isActive) return null

  function executeStep(stepId: number) {
    const step = steps.find((s) => s.id === stepId)
    if (!step) return

    setStep(stepId)

    // Navigate to correct page
    router.push(`/${step.page}`)
  }

  function handleNext() {
    const next = Math.min(currentStep + 1, steps.length)
    executeStep(next)
  }

  function handlePrev() {
    const prev = Math.max(currentStep - 1, 1)
    executeStep(prev)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 glass-panel shadow-premium border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/40 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#37b7ab] pulse-dot shadow-[0_0_8px_rgba(55,183,171,0.8)]" />
          <span className="text-sm font-semibold text-[#EAEAEA]">Demo Mode</span>
          <span className="text-xs text-[#888] font-mono">{currentStep}/{steps.length}</span>
        </div>
        <button
          onClick={deactivateDemo}
          className="text-[#888] hover:text-[#EAEAEA] transition-all-150"
          aria-label="Exit demo mode"
        >
          <X size={14} />
        </button>
      </div>

      {/* Steps list */}
      <div className="max-h-64 overflow-y-auto sidebar-scrollbar p-2">
        {steps.map((step) => (
          <button
            key={step.id}
            onClick={() => executeStep(step.id)}
            className={cn(
              "w-full flex items-start gap-3 p-2.5 rounded-xl transition-all-300 text-left",
              currentStep === step.id
                ? "bg-white/5 border border-white/10"
                : "hover:bg-white/5 border border-transparent opacity-60 hover:opacity-100"
            )}
          >
            <span
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 transition-all-300",
                currentStep === step.id
                  ? "bg-[#37b7ab] text-white shadow-[0_0_10px_rgba(55,183,171,0.3)]"
                  : currentStep > step.id
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                    : "bg-white/5 text-[#555]"
              )}
            >
              {currentStep > step.id ? "✓" : step.id}
            </span>
            <div>
              <div className={cn("text-xs font-semibold leading-tight mb-0.5", currentStep === step.id ? "text-[#EAEAEA]" : "text-[#A0A0A0]")}>
                {step.title}
              </div>
              <div className="text-[11px] text-[#777] leading-tight">{step.description}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Current step chat message preview */}
      {currentStepData?.chatMessage && (
        <button 
          onClick={() => {
            if (window.location.pathname !== '/chat') {
              router.push('/chat')
              setTimeout(() => {
                dispatchSandraAsk({ message: currentStepData.chatMessage as string, submit: true })
              }, 400)
            } else {
              dispatchSandraAsk({ message: currentStepData.chatMessage as string, submit: true })
            }
          }}
          className="w-full text-left px-4 py-3 bg-black/40 border-t border-white/5 hover:bg-white/5 transition-colors group cursor-pointer block"
        >
          <div className="text-[10px] text-[#37b7ab] font-medium uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
             <div className="w-1.5 h-1.5 rounded-full bg-[#37b7ab] animate-pulse"></div>
             Auto-fill message
             <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[#888] ml-auto">Click to send</span>
          </div>
          <div className="text-xs text-[#EAEAEA] font-mono bg-[#0A0A0A] rounded-lg px-3 py-2.5 border border-white/5 leading-relaxed">
            &quot;{currentStepData.chatMessage}&quot;
          </div>
        </button>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/60 border-t border-white/5">
        <button
          onClick={handlePrev}
          disabled={currentStep === 1}
          className="flex items-center gap-1 text-xs font-medium text-[#888] hover:text-[#EAEAEA] disabled:opacity-30 disabled:cursor-not-allowed transition-all-150"
        >
          <ChevronLeft size={14} />
          Previous
        </button>
        <button
          onClick={handleNext}
          disabled={currentStep === steps.length}
          className="flex items-center gap-1 text-xs font-semibold text-[#37b7ab] hover:text-[#45d4c6] disabled:opacity-30 disabled:cursor-not-allowed transition-all-150"
        >
          Next
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}
