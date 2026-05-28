"use client"

import React, { createContext, useContext, useState, useCallback } from "react"
import type { DemoStep } from "@/lib/types"

const demoSteps: DemoStep[] = [
  {
    id: 1,
    title: "Start here — Operational Queue",
    description: "See Sandra's pre-sorted KYC queue with 14 items already analysed.",
    page: "operations",
    autoSelectQueue: "KYC Queue",
  },
  {
    id: 2,
    title: "Sandra's pre-assessment",
    description: "Notice the AI Summary column — Sandra has already done the compliance work.",
    page: "operations",
    highlightElement: "ai-summary-column",
  },
  {
    id: 3,
    title: "Investigate a high-risk entity",
    description: "Click the top-risk item to see Sandra's full assessment in the detail panel.",
    page: "operations",
    autoSelectItem: 0,
  },
  {
    id: 4,
    title: "Ask Sandra directly",
    description: "Switch to Chat and run an AML screening on Greenfield.",
    page: "chat",
    chatMessage: "Run AML on Greenfield Commodity Trading Ltd",
  },
  {
    id: 5,
    title: "AML hit + Compliance reasoning",
    description: "Watch Sandra invoke the Compliance Agent and surface regulatory citations.",
    page: "chat",
    chatMessage: "Run AML on Greenfield Commodity Trading Ltd",
  },
  {
    id: 6,
    title: "Open a case",
    description: "Ask Sandra to open a case and assign it.",
    page: "chat",
    chatMessage: "Open a case for Greenfield and assign to Tokunbo",
  },
  {
    id: 7,
    title: "Switch to Alerts",
    description: "Navigate to the Alerts interface — Sandra surfaces this proactively.",
    page: "alerts",
    autoSelectAlert: 0,
  },
  {
    id: 8,
    title: "Sandra's reasoning",
    description: "See the full reasoning panel for the critical fraud pattern alert.",
    page: "alerts",
    autoSelectAlert: 0,
  },
  {
    id: 9,
    title: "Multi-jurisdiction compliance",
    description: "Ask Sandra the cross-border payment compliance question.",
    page: "chat",
    chatMessage: "Is it legal for a Nigerian business to receive payments from EU customers?",
  },
  {
    id: 10,
    title: "The full picture",
    description: "Return to Operations — the Greenfield item now has a case attached.",
    page: "operations",
    autoSelectQueue: "AML Queue",
  },
]

interface DemoModeContextValue {
  isActive: boolean
  currentStep: number
  steps: DemoStep[]
  activateDemo: () => void
  deactivateDemo: () => void
  setStep: (step: number) => void
  currentStepData: DemoStep | null
}

const DemoModeContext = createContext<DemoModeContextValue | null>(null)

export function DemoModeProvider({ children }: { children: React.ReactNode }) {
  const [isActive, setIsActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)

  const activateDemo = useCallback(() => {
    setIsActive(true)
    setCurrentStep(1)
  }, [])

  const deactivateDemo = useCallback(() => {
    setIsActive(false)
  }, [])

  const setStep = useCallback((step: number) => {
    setCurrentStep(step)
  }, [])

  const currentStepData = isActive ? (demoSteps.find((s) => s.id === currentStep) ?? null) : null

  return (
    <DemoModeContext.Provider
      value={{ isActive, currentStep, steps: demoSteps, activateDemo, deactivateDemo, setStep, currentStepData }}
    >
      {children}
    </DemoModeContext.Provider>
  )
}

export function useDemoMode(): DemoModeContextValue {
  const ctx = useContext(DemoModeContext)
  if (!ctx) throw new Error("useDemoMode must be used within DemoModeProvider")
  return ctx
}
