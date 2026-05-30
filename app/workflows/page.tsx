"use client"

import { useState } from "react"
import { SandraHeader } from "@/components/layout/SandraHeader"
import { Cpu, FileJson, FileText, Play, Upload, MessageSquare, CheckCircle2, Loader2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { demoInputText, ngSummaryText, ngConfigJson, keSummaryText, keConfigJson, openItemsText } from "@/lib/mock/workflows"

type Tab = "summary_ng" | "json_ng" | "summary_ke" | "json_ke" | "open_items"

export default function WorkflowsPage() {
  const [inputText, setInputText] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasGenerated, setHasGenerated] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>("summary_ng")

  // State to hold dynamic outputs
  const [dynamicOutputs, setDynamicOutputs] = useState({
    summaryNg: ngSummaryText,
    jsonNg: ngConfigJson,
    summaryKe: keSummaryText,
    jsonKe: keConfigJson,
    openItems: openItemsText
  })

  const handleLoadDemo = () => {
    setInputText(demoInputText)
    setHasGenerated(false)
  }

  const handleGenerate = () => {
    let textToProcess = inputText
    if (!textToProcess.trim()) {
      textToProcess = demoInputText
      setInputText(demoInputText)
    }
    
    setIsGenerating(true)
    setHasGenerated(false)
    
    // Simulate AI processing delays
    setTimeout(() => {
      // Parse inputs dynamically to make it feel like a real generation
      let instName = "Savanna Pay"
      let tierRaw = "Tier 2"
      
      const lines = textToProcess.split("\n")
      for (const line of lines) {
        if (line.toLowerCase().startsWith("institution:")) {
          instName = line.substring(12).trim() || instName
        } else if (line.toLowerCase().startsWith("customer tier:")) {
          tierRaw = line.substring(14).trim() || tierRaw
        }
      }
      
      const tierId = tierRaw.toLowerCase().replace(/ /g, "_")
      const safeId = instName.toLowerCase().replace(/[^a-z0-9]/g, "")
      
      // Update the mock texts with user's specific inputs
      const replaceVars = (text: string) => {
        return text
          .replace(/Savanna Pay/g, instName)
          .replace(/savannapay/g, safeId)
          .replace(/tier_2/g, tierId)
          .replace(/Tier 2/g, tierRaw)
      }
      
      setDynamicOutputs({
        summaryNg: replaceVars(ngSummaryText),
        jsonNg: replaceVars(ngConfigJson),
        summaryKe: replaceVars(keSummaryText),
        jsonKe: replaceVars(keConfigJson),
        openItems: replaceVars(openItemsText)
      })

      setIsGenerating(false)
      setHasGenerated(true)
      setActiveTab("summary_ng")
    }, 2500)
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#050505]">
      <SandraHeader 
        title="Workflow Builder" 
        subtitle="AI Agent for generating market-specific compliance configurations"
      />

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        
        {/* Left Panel: Prompt Editor */}
        <div className="w-full md:w-[400px] shrink-0 border-r border-[#222] bg-[#0A0A0A] flex flex-col">
          <div className="px-4 py-3 border-b border-[#222] flex items-center justify-between bg-[#111]">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#EAEAEA]">
              <MessageSquare size={14} className="text-[#37b7ab]" />
              Agent Prompt
            </div>
            <button 
              onClick={handleLoadDemo}
              className="text-[10px] font-semibold uppercase tracking-wider text-[#37b7ab] hover:text-[#2da096] bg-[#37b7ab]/10 hover:bg-[#37b7ab]/20 px-2 py-1 rounded transition-colors"
            >
              Load Demo Input
            </button>
          </div>
          
          <div className="flex-1 p-4 flex flex-col gap-3">
            <p className="text-xs text-[#888]">
              Paste institution requirements here. Sandra will extract the parameters, apply jurisdiction rules, and build the compliance templates.
            </p>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-[#111] border border-[#333] rounded-xl p-3 text-sm text-[#EAEAEA] placeholder:text-[#555] focus:outline-none focus:border-[#37b7ab]/50 focus:ring-1 focus:ring-[#37b7ab]/50 transition-all resize-none font-mono"
              placeholder="E.g. Institution: Savanna Pay, Markets: Nigeria..."
            />
          </div>

          <div className="p-4 border-t border-[#222] bg-[#111]">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#EAEAEA] text-[#0A0A0A] font-bold rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Generating Configs...
                </>
              ) : (
                <>
                  <Cpu size={16} />
                  Run Workflow Agent
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Panel: Output Artifacts */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#050505]">
          {!hasGenerated && !isGenerating ? (
            <div className="flex-1 flex flex-col items-center justify-center text-[#555] p-8 text-center">
              <Cpu size={48} className="mb-4 opacity-20" />
              <h3 className="text-[#EAEAEA] font-semibold mb-2">Awaiting Instructions</h3>
              <p className="text-sm max-w-sm">
                Provide institution requirements in the left panel to generate market-specific JSON configs and workflow summaries.
              </p>
            </div>
          ) : isGenerating ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              <div className="relative w-16 h-16 mb-6">
                <div className="absolute inset-0 border-2 border-transparent border-t-[#37b7ab] border-r-[#37b7ab] rounded-full animate-spin" />
                <div className="absolute inset-2 border-2 border-transparent border-l-[#888] border-b-[#888] rounded-full animate-spin-reverse" />
                <Cpu size={20} className="absolute inset-0 m-auto text-[#EAEAEA]" />
              </div>
              <div className="text-sm font-semibold text-[#EAEAEA] mb-1">Applying Market Rules</div>
              <div className="text-xs text-[#888] animate-pulse">Cross-referencing CBN and CBK regulations...</div>
            </div>
          ) : (
            <>
              {/* Tab Navigation */}
              <div className="flex items-center gap-1 border-b border-[#222] px-4 pt-3 bg-[#0A0A0A] overflow-x-auto no-scrollbar">
                <TabButton 
                  active={activeTab === "summary_ng"} 
                  onClick={() => setActiveTab("summary_ng")}
                  icon={<FileText size={14} />}
                  label="Summary (NG)"
                />
                <TabButton 
                  active={activeTab === "json_ng"} 
                  onClick={() => setActiveTab("json_ng")}
                  icon={<FileJson size={14} />}
                  label="Config (NG)"
                />
                <div className="w-px h-4 bg-[#333] mx-2" />
                <TabButton 
                  active={activeTab === "summary_ke"} 
                  onClick={() => setActiveTab("summary_ke")}
                  icon={<FileText size={14} />}
                  label="Summary (KE)"
                />
                <TabButton 
                  active={activeTab === "json_ke"} 
                  onClick={() => setActiveTab("json_ke")}
                  icon={<FileJson size={14} />}
                  label="Config (KE)"
                />
                <div className="w-px h-4 bg-[#333] mx-2" />
                <TabButton 
                  active={activeTab === "open_items"} 
                  onClick={() => setActiveTab("open_items")}
                  icon={<AlertCircle size={14} />}
                  label="Open Items"
                  isAlert
                />
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-hidden bg-[#0A0A0A] p-4 relative">
                <div className="absolute top-4 right-4 text-[10px] uppercase font-bold tracking-wider text-[#37b7ab] flex items-center gap-1.5 border border-[#37b7ab]/20 bg-[#37b7ab]/10 px-2 py-1 rounded">
                  <CheckCircle2 size={12} />
                  Agent Output Complete
                </div>

                {activeTab === "summary_ng" && (
                  <pre className="h-full overflow-y-auto text-sm text-[#A1A1AA] font-mono whitespace-pre-wrap sidebar-scrollbar pt-8 pb-4 px-2">
                    {dynamicOutputs.summaryNg}
                  </pre>
                )}
                {activeTab === "json_ng" && (
                  <pre className="h-full overflow-y-auto text-sm text-[#EAEAEA] font-mono whitespace-pre-wrap sidebar-scrollbar pt-8 pb-4 px-2">
                    {dynamicOutputs.jsonNg}
                  </pre>
                )}
                {activeTab === "summary_ke" && (
                  <pre className="h-full overflow-y-auto text-sm text-[#A1A1AA] font-mono whitespace-pre-wrap sidebar-scrollbar pt-8 pb-4 px-2">
                    {dynamicOutputs.summaryKe}
                  </pre>
                )}
                {activeTab === "json_ke" && (
                  <pre className="h-full overflow-y-auto text-sm text-[#EAEAEA] font-mono whitespace-pre-wrap sidebar-scrollbar pt-8 pb-4 px-2">
                    {dynamicOutputs.jsonKe}
                  </pre>
                )}
                {activeTab === "open_items" && (
                  <div className="h-full overflow-y-auto pt-8 pb-4 px-2">
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-5">
                      <div className="flex items-center gap-2 text-amber-500 font-bold mb-3">
                        <AlertCircle size={18} />
                        Action Required Before Deployment
                      </div>
                      <pre className="text-sm text-amber-500/80 font-mono whitespace-pre-wrap">
                        {dynamicOutputs.openItems}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  )
}

function TabButton({ active, onClick, icon, label, isAlert }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, isAlert?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors",
        active 
          ? isAlert 
            ? "border-amber-500 text-amber-500 bg-amber-500/5" 
            : "border-[#37b7ab] text-[#EAEAEA] bg-white/5"
          : "border-transparent text-[#888] hover:text-[#EAEAEA] hover:bg-white/[0.02]"
      )}
    >
      {icon}
      {label}
    </button>
  )
}
