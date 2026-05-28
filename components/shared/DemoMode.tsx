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
    <div className="fixed bottom-6 right-6 z-50 w-72 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-amber-50 border-b border-amber-100">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-500 pulse-dot" />
          <span className="text-sm font-semibold text-amber-900">Demo Mode</span>
          <span className="text-xs text-amber-600 font-mono">{currentStep}/{steps.length}</span>
        </div>
        <button
          onClick={deactivateDemo}
          className="text-amber-600 hover:text-amber-800 transition-all-150"
          aria-label="Exit demo mode"
        >
          <X size={14} />
        </button>
      </div>

      {/* Steps list */}
      <div className="max-h-64 overflow-y-auto">
        {steps.map((step) => (
          <button
            key={step.id}
            onClick={() => executeStep(step.id)}
            className={cn(
              "flex items-start gap-3 p-3 rounded-xl transition-all-300",
              currentStep === step.id
                ? "bg-[#37b7ab]/5"
                : "hover:bg-gray-50 opacity-60 hover:opacity-100"
            )}
          >
            <span
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 transition-all-300",
                currentStep === step.id
                  ? "bg-[#37b7ab] text-white"
                  : currentStep > step.id
                    ? "bg-emerald-500 text-white"
                    : "bg-gray-200 text-gray-500"
              )}
            >
              {currentStep > step.id ? "✓" : step.id}
            </span>
            <div>
              <div className={cn("text-xs font-semibold leading-tight", currentStep === step.id ? "text-[#37b7ab]" : "text-gray-700")}>
                {step.title}
              </div>
              <div className="text-[11px] text-gray-400 mt-0.5 leading-tight">{step.description}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Current step chat message preview */}
      {currentStepData?.chatMessage && (
        <div className="px-4 py-2.5 bg-[#37b7ab]/5 border-t border-[#37b7ab]/10">
          <div className="text-[10px] text-[#37b7ab] font-medium uppercase tracking-wide mb-1">Pre-typed message</div>
          <div className="text-xs text-gray-700 font-mono bg-white rounded-lg px-2.5 py-2 border border-[#37b7ab]/10">
            &quot;{currentStepData.chatMessage}&quot;
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-100">
        <button
          onClick={handlePrev}
          disabled={currentStep === 1}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all-150"
        >
          <ChevronLeft size={14} />
          Previous
        </button>
        <button
          onClick={handleNext}
          disabled={currentStep === steps.length}
          className="flex items-center gap-1 text-xs font-semibold text-[#37b7ab] hover:text-[#37b7ab]/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all-150"
        >
          Next
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}
