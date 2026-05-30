"use client"

import { useState, useEffect, useMemo } from "react"
import { Menu, Play, Code, Box, Check, Copy, ExternalLink, ChevronDown, CheckSquare, Square, MoreHorizontal, ArrowDown, User, FileText, Scan, Camera, Upload, ShieldCheck, Clock, GitBranch, Info, ShieldAlert, MapPin, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { useDemoMode } from "@/lib/demo-context"
import { AlertCircle } from "lucide-react"

const MARKET_MAP: Record<string, string> = { 
  "NG": "Nigeria", "KE": "Kenya", "ZA": "South Africa", "GH": "Ghana", 
  "UG": "Uganda", "RW": "Rwanda", "EG": "Egypt", "Global": "Global (All)" 
}
const FRAMEWORK_MAP: Record<string, string> = { 
  "NG": "CBN KYC 2023", "KE": "CBK Guidelines 2022", "ZA": "FICA 2001", 
  "GH": "BOG Guidelines", "UG": "BOU Framework", "RW": "BNR KYC", 
  "EG": "CBE Regulations", "Global": "FATF Recommendations" 
}

export default function WorkflowsPage() {
  const { isActive: isDemoMode } = useDemoMode()
  const [activeTab, setActiveTab] = useState<"preview" | "visual" | "code">("preview")
  const [activeSetupTab, setActiveSetupTab] = useState<"profile" | "identity" | "security" | "scoring">("profile")
  const [institutionName, setInstitutionName] = useState("Zeta Microfinance")
  const [brandColor, setBrandColor] = useState("#818cf8")
  const [redirectUrl, setRedirectUrl] = useState("https://your-app.com/callback")
  const [threshold, setThreshold] = useState(80)
  const [declineThreshold, setDeclineThreshold] = useState(30)
  const [license, setLicense] = useState("Microfinance Banking License")
  const [faceConfidence, setFaceConfidence] = useState(85)
  const [customerType, setCustomerType] = useState("Individual")
  
  // Advanced Routing State
  const [markets, setMarkets] = useState<string[]>(["NG", "Global"])
  const [routingConfig, setRoutingConfig] = useState<Record<string, string>>({
    "NG": "BVN",
    "Global": "Passport"
  })
  
  // Add Region State
  const [isAddingRegion, setIsAddingRegion] = useState(false)
  const [visibleRegionIds, setVisibleRegionIds] = useState<string[]>(["NG", "KE", "ZA", "Global"])

  // Centralized Workflow Feature State
  const [features, setFeatures] = useState({
    liveness: true,
    documentOcr: true,
    addressVerification: false,
    backgroundCheck: false,
    addressVerificationMethod: "document",
    digitalPingFrequency: "one_time",
    collectDirectorsInfo: false,
    verifyDirectors: false,
    fraudScan: true,
    fraudLensManualReview: false,
    pepScreening: true,
    adverseMedia: true,
    ongoingMonitoring: true,
    hardBlockSanctions: true,
    velocityAlerts: true,
    structuringDetection: true,
    sarAutoDraft: true
  })

  // Centralized List State
  const [lists, setLists] = useState<{
    globalDocs: string[],
    sanctions: string[],
    stepUpDocs: string[],
    additionalDocs: string[]
  }>({
    globalDocs: ["Passport", "Driver's licence", "NIN slip", "Voter's card"],
    sanctions: ["OFAC", "UN", "EU", "CBN watchlist"],
    stepUpDocs: ["Utility bill", "Bank statement"],
    additionalDocs: []
  })

  const [backgroundPackage, setBackgroundPackage] = useState("standard")

  // Interactive Scoring State
  const [scoreWeights, setScoreWeights] = useState({
    identity: 30,
    address: 0,
    background: 0,
    liveness: 20,
    document: 20,
    fraud: 20,
    director: 0
  })

  // Auto-balancer for default score allocation
  useEffect(() => {
    let count = 1 // Identity is always active
    if (features.addressVerification) count++
    if (features.backgroundCheck) count++
    if (features.liveness) count++
    if (features.documentOcr) count++
    if (features.fraudScan) count++
    if (customerType === "Business" && features.collectDirectorsInfo && features.verifyDirectors) count++
    
    const base = Math.floor(100 / count)
    let remainder = 100 - (base * count)
    
    setScoreWeights({
      identity: base + remainder,
      address: features.addressVerification ? base : 0,
      background: features.backgroundCheck ? base : 0,
      liveness: features.liveness ? base : 0,
      document: features.documentOcr ? base : 0,
      fraud: features.fraudScan ? base : 0,
      director: (customerType === "Business" && features.collectDirectorsInfo && features.verifyDirectors) ? base : 0
    })
  }, [
    features.addressVerification, 
    features.backgroundCheck,
    features.liveness, 
    features.documentOcr, 
    features.fraudScan, 
    features.collectDirectorsInfo, 
    features.verifyDirectors,
    customerType
  ])

  const toggleFeature = (key: keyof typeof features) => {
    setFeatures(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const toggleList = (listName: keyof typeof lists, item: string) => {
    setLists(prev => {
      const arr = prev[listName]
      return {
        ...prev,
        [listName]: arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item]
      }
    })
  }

  // Derived calculations based on sliders
  const manualReviewFloor = declineThreshold
  const configId = "cfg_multi_market_v1"

  const toggleMarket = (m: string) => {
    setMarkets(prev => {
      if (prev.includes(m)) {
        if (prev.length === 1) return prev // Prevent deselecting all
        const newMarkets = prev.filter(x => x !== m)
        // Cleanup routing config
        const newRouting = { ...routingConfig }
        delete newRouting[m]
        setRoutingConfig(newRouting)
        return newMarkets
      }
      // Add market with a default anchor
      const defaultAnchor = customerType === "Individual" 
        ? (m === "NG" ? "BVN" : m === "KE" ? "IPRS" : m === "ZA" ? "HANIS" : m === "GH" ? "GhanaCard" : "Passport")
        : (m === "NG" ? "CAC" : m === "KE" ? "BRS" : m === "ZA" ? "CIPC" : m === "GH" ? "RGD" : "CertOfInc")
      setRoutingConfig(prevRouting => ({ ...prevRouting, [m]: defaultAnchor }))
      return [...prev, m]
    })
  }

  const handleCustomerTypeChange = (newType: string) => {
    setCustomerType(newType)
    
    // Auto-update the routing config for all active markets to the new default
    const newRouting: Record<string, string> = {}
    markets.forEach(m => {
      if (newType === "Individual") {
         newRouting[m] = m === "NG" ? "BVN" : m === "KE" ? "IPRS" : m === "ZA" ? "HANIS" : m === "GH" ? "GhanaCard" : "Passport"
      } else {
         newRouting[m] = m === "NG" ? "CAC" : m === "KE" ? "BRS" : m === "ZA" ? "CIPC" : m === "GH" ? "RGD" : "CertOfInc"
      }
    })
    setRoutingConfig(newRouting)
  }

  const updateRouting = (m: string, val: string) => {
    setRoutingConfig(prev => ({ ...prev, [m]: val }))
  }

  const activeFrameworks = markets.map(m => FRAMEWORK_MAP[m]).join(", ")

  const routingStepsJson = markets.map(m => {
    const anchor = routingConfig[m] || "document"
    let provider = "global_doc"
    if (customerType === "Individual") {
      provider = anchor === "BVN" ? "nibss" : anchor === "IPRS" ? "iprs" : anchor === "HANIS" ? "dha" : anchor === "GhanaCard" ? "nia" : "global_doc"
    } else {
      provider = anchor === "CAC" ? "cac" : anchor === "BRS" ? "ecitizen" : anchor === "CIPC" ? "cipc" : anchor === "RGD" ? "rgd" : "global_registry"
    }
    
    if (m === "Global") return `        { "condition": "default", "action": "require_id", "anchor": "${anchor}", "provider": "${provider}" }`;
    return `        { "condition": "user.country == '${m}'", "action": "require_id", "anchor": "${anchor}", "provider": "${provider}" }`;
  }).join(",\n");

  const activeAdditionalDocs = lists.additionalDocs;

  const configJson = useMemo(() => {
    const obj = {
      api_version: "2026-05-30",
      environment: "production",
      webhook_url: redirectUrl,
      institution: {
        id: configId,
        name: institutionName,
        tier: "Tier_2",
        operating_license: license === 'No license (Sector-based)' ? 'unlicensed' : license.toLowerCase().replace(/ /g, '_')
      },
      workflow: {
        target_entity: customerType.toLowerCase(),
        supported_regions: markets,
        regulatory_frameworks: markets.map(m => FRAMEWORK_MAP[m]),
        routing_logic: markets.reduce((acc, m) => {
          const anchor = routingConfig[m] || "document";
          let provider = "global_doc";
          if (customerType === "Individual") {
            provider = anchor === "BVN" ? "nibss" : anchor === "IPRS" ? "iprs" : anchor === "HANIS" ? "dha" : anchor === "GhanaCard" ? "nia" : "global_doc";
          } else {
            provider = anchor === "CAC" ? "cac" : anchor === "BRS" ? "ecitizen" : anchor === "CIPC" ? "cipc" : anchor === "RGD" ? "rgd" : "global_registry";
          }
          acc[m] = { primary_anchor: anchor, provider_engine: provider };
          return acc;
        }, {} as Record<string, any>)
      },
      verification_engine: {
        document_ocr: features.documentOcr,
        liveness: features.liveness ? { enabled: true, minimum_confidence_score: faceConfidence } : { enabled: false },
        address_verification: features.addressVerification ? {
          enabled: true,
          method: features.addressVerificationMethod,
          ...(features.addressVerificationMethod === 'digital' ? { ping_frequency: features.digitalPingFrequency } : {})
        } : { enabled: false },
        background_screening: features.backgroundCheck ? { enabled: true, package: backgroundPackage } : { enabled: false },
        directors_ubo: (customerType === "Business" && features.collectDirectorsInfo) ? {
          collect_info: true, verify_identities: features.verifyDirectors
        } : { collect_info: false }
      },
      security_and_aml: {
        fraud_lens: features.fraudScan ? { enabled: true, force_manual_review_on_hit: features.fraudLensManualReview } : { enabled: false },
        aml_screening: (features.pepScreening || features.adverseMedia || lists.sanctions.length > 0) ? {
          enabled: true, watchlists: lists.sanctions, pep_check: features.pepScreening,
          adverse_media: features.adverseMedia, ongoing_monitoring: features.ongoingMonitoring
        } : { enabled: false },
        transaction_monitoring: {
          velocity_alerts: features.velocityAlerts, structuring_detection: features.structuringDetection, sar_auto_draft: features.sarAutoDraft
        }
      },
      decision_matrix: {
        auto_approve_threshold: threshold,
        manual_review_floor: manualReviewFloor,
        auto_decline_ceiling: manualReviewFloor - 1,
        hard_block_sanctions: features.hardBlockSanctions,
        score_weights: {
          identity_anchor: scoreWeights.identity,
          ...(features.addressVerification && { address: scoreWeights.address }),
          ...(features.backgroundCheck && { background: scoreWeights.background }),
          ...(features.liveness && { liveness: scoreWeights.liveness }),
          ...(features.documentOcr && { document_ocr: scoreWeights.document }),
          ...(features.fraudScan && { fraudlens: scoreWeights.fraud }),
          ...((customerType === "Business" && features.collectDirectorsInfo && features.verifyDirectors) && { director_kyc: scoreWeights.director })
        }
      }
    };
    return JSON.stringify(obj, null, 2);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [redirectUrl, configId, institutionName, license, customerType, markets, routingConfig, features, faceConfidence, backgroundPackage, lists.sanctions, threshold, manualReviewFloor, scoreWeights]);

  const totalScore = Object.values(scoreWeights).reduce((a, b) => a + b, 0)
  const isScoreValid = totalScore === 100

  return (
    <div className="flex-1 flex flex-col h-full bg-[#050505] text-[#EAEAEA] min-h-0 font-sans">
      
      {/* Header */}
      <header className="px-6 py-4 border-b border-[#222] flex items-center justify-between bg-[#0A0A0A] shrink-0">
        <div>
          <h1 className="text-[15px] font-semibold text-white">Workflow builder</h1>
          <p className="text-[11px] text-[#888] mt-1">{customerType} onboarding — Tier 2 ({markets.length > 1 ? "Multi-Market" : markets[0]}) · Last saved 2 min ago</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-1.5 border border-[#333] rounded-lg text-[11px] font-medium hover:bg-[#111] transition-colors">
            Preview flow
          </button>
          <button 
            onClick={() => setActiveTab("code")}
            className="flex items-center gap-2 px-3 py-1.5 border border-[#333] rounded-lg text-[11px] font-medium hover:bg-[#111] transition-colors"
          >
            View code
          </button>
          <button 
            disabled={!isScoreValid}
            className={cn("flex items-center gap-2 px-3 py-1.5 border rounded-lg text-[11px] font-medium transition-colors",
              isScoreValid ? "border-[#37b7ab]/30 rounded-lg text-[#37b7ab] bg-[#37b7ab]/5 hover:bg-[#37b7ab]/10" : "border-[#333] text-[#666] bg-[#111] cursor-not-allowed opacity-50"
            )}
          >
            <Box size={14} />
            Deploy
          </button>
          <button className="flex items-center justify-center w-8 h-[30px] border border-[#333] rounded-lg text-[#888] hover:bg-[#111] transition-colors ml-1">
            <MoreHorizontal size={14} />
          </button>
        </div>
      </header>

      {/* Main Content Split */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Panel: Steps */}
        <div className="w-[450px] bg-[#0A0A0A] border-r border-[#222] flex flex-col shrink-0">
          <div className="p-5 flex-1 overflow-y-auto custom-scrollbar">
            
            {/* Segmented Control Tabs */}
            <div className="flex bg-[#111] p-1 rounded-lg mb-6 border border-[#222]">
              <button 
                onClick={() => setActiveSetupTab("profile")}
                className={cn("flex-1 py-1.5 text-[11px] font-bold rounded-md transition-all", activeSetupTab === "profile" ? "bg-[#222] text-white shadow-sm" : "text-[#888] hover:text-[#EAEAEA]")}
              >
                1. Profile
              </button>
              <button 
                onClick={() => setActiveSetupTab("identity")}
                className={cn("flex-1 py-1.5 text-[11px] font-bold rounded-md transition-all", activeSetupTab === "identity" ? "bg-[#222] text-white shadow-sm" : "text-[#888] hover:text-[#EAEAEA]")}
              >
                2. Identity
              </button>
              <button 
                onClick={() => setActiveSetupTab("security")}
                className={cn("flex-1 py-1.5 text-[11px] font-bold rounded-md transition-all", activeSetupTab === "security" ? "bg-[#222] text-white shadow-sm" : "text-[#888] hover:text-[#EAEAEA]")}
              >
                3. Security
              </button>
              <button 
                onClick={() => setActiveSetupTab("scoring")}
                className={cn("flex-1 py-1.5 text-[11px] font-bold rounded-md transition-all flex items-center justify-center gap-1.5", activeSetupTab === "scoring" ? "bg-[#37b7ab]/10 text-[#37b7ab] shadow-sm" : "text-[#888] hover:text-[#EAEAEA]")}
              >
                <div className={cn("w-1.5 h-1.5 rounded-full", isScoreValid ? "bg-[#37b7ab]" : "bg-red-400")} />
                4. Scoring
              </button>
            </div>

            <div className="space-y-6">
              
              {/* TAB 1: PROFILE SETUP */}
              {activeSetupTab === "profile" && (
                <ConfigCard title="Institution setup" description="Core details of the workflow">
                  <div className="flex gap-4 mb-4">
                    <div className="flex-[2]">
                      <label className="block text-[11px] text-[#888] mb-1.5 font-bold">Institution name</label>
                      <input 
                        type="text" 
                        value={institutionName}
                        onChange={(e) => setInstitutionName(e.target.value)}
                        className="w-full bg-[#0A0A0A] border border-[#333] rounded-md px-3 py-2 text-[13px] text-white focus:outline-none focus:border-[#37b7ab] font-medium"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[11px] text-[#888] mb-1.5 font-bold">Brand color</label>
                      <div className="flex items-center gap-2 bg-[#0A0A0A] border border-[#333] rounded-md px-2 py-1.5 focus-within:border-[#37b7ab] transition-colors">
                        <input 
                          type="color" 
                          value={brandColor}
                          onChange={(e) => setBrandColor(e.target.value)}
                          className="w-6 h-6 rounded cursor-pointer bg-transparent border-0 p-0 shrink-0"
                        />
                        <input
                          type="text"
                          value={brandColor}
                          onChange={(e) => {
                            const v = e.target.value
                            if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) setBrandColor(v)
                          }}
                          className="w-full bg-transparent text-[12px] text-white font-mono focus:outline-none"
                          maxLength={7}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-[11px] text-[#888] mb-1.5 font-bold">Success Redirect URL</label>
                    <input 
                      type="url" 
                      value={redirectUrl}
                      onChange={(e) => setRedirectUrl(e.target.value)}
                      placeholder="https://your-app.com/callback"
                      className="w-full bg-[#0A0A0A] border border-[#333] rounded-md px-3 py-2 text-[13px] text-white focus:outline-none focus:border-[#37b7ab] font-medium"
                    />
                    <p className="text-[10px] text-[#666] mt-1.5">Where users are sent after completing the flow.</p>
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#888] mb-2 font-bold flex justify-between relative">
                      <span>Markets / Regions</span>
                      <span 
                        className="text-[#37b7ab] font-normal cursor-pointer hover:underline"
                        onClick={() => setIsAddingRegion(!isAddingRegion)}
                      >
                        + Add region
                      </span>

                      {isAddingRegion && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-[#111] border border-[#333] rounded-md shadow-xl z-50 py-1">
                          {Object.keys(MARKET_MAP).filter(id => !visibleRegionIds.includes(id)).map(id => (
                            <div 
                              key={id} 
                              className="px-3 py-1.5 text-[12px] text-[#EAEAEA] hover:bg-[#37b7ab]/20 hover:text-[#37b7ab] cursor-pointer transition-colors"
                              onClick={() => {
                                setVisibleRegionIds(prev => [...prev, id])
                                if (!markets.includes(id)) toggleMarket(id)
                                setIsAddingRegion(false)
                              }}
                            >
                              {MARKET_MAP[id]}
                            </div>
                          ))}
                          {Object.keys(MARKET_MAP).filter(id => !visibleRegionIds.includes(id)).length === 0 && (
                            <div className="px-3 py-2 text-[11px] text-[#888] italic">All supported regions added.</div>
                          )}
                        </div>
                      )}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {visibleRegionIds.map(id => (
                        <StatefulMarketPill 
                          key={id} 
                          label={MARKET_MAP[id]} 
                          active={markets.includes(id)} 
                          onClick={() => toggleMarket(id)} 
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-[11px] text-[#888] mb-1.5 font-bold">Customer type</label>
                      <div className="relative">
                        <select 
                          value={customerType}
                          onChange={(e) => handleCustomerTypeChange(e.target.value)}
                          className="w-full bg-[#0A0A0A] border border-[#333] rounded-md pl-3 pr-8 py-2 text-[13px] text-[#37b7ab] font-bold appearance-none focus:outline-none focus:border-[#37b7ab]"
                        >
                          <option value="Individual">Individual</option>
                          <option value="Business">Business</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888] pointer-events-none" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className="block text-[11px] text-[#888] mb-1.5 font-bold">Customer tier</label>
                      <div className="relative">
                        <select className="w-full bg-[#0A0A0A] border border-[#333] rounded-md pl-3 pr-8 py-2 text-[13px] text-white appearance-none focus:outline-none focus:border-[#37b7ab] font-medium">
                          <option>Tier 2</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888] pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#888] mb-1.5 font-bold">Operating license</label>
                    <div className="relative">
                      <select 
                        value={license}
                        onChange={(e) => setLicense(e.target.value)}
                        className="w-full bg-[#0A0A0A] border border-[#333] rounded-md pl-3 pr-8 py-2 text-[13px] text-white appearance-none focus:outline-none focus:border-[#37b7ab] font-medium"
                      >
                        <option>Commercial Banking License</option>
                        <option>Microfinance Banking License</option>
                        <option>Mobile Money Operator (MMO)</option>
                        <option>Payment Service Provider (PSP)</option>
                        <option>No license (Sector-based)</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888] pointer-events-none" />
                    </div>
                  </div>

                  {license === "No license (Sector-based)" && (
                    <div>
                      <label className="block text-[11px] text-[#888] mb-1.5 font-bold">Industry Sector</label>
                      <div className="relative">
                        <select className="w-full bg-[#0A0A0A] border border-[#333] rounded-md pl-3 pr-8 py-2 text-[13px] text-white appearance-none focus:outline-none focus:border-[#37b7ab] font-medium">
                          <option>E-commerce & Retail</option>
                          <option>Real Estate</option>
                          <option>Crypto & Web3</option>
                          <option>Lending & Credit</option>
                          <option>General Services</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888] pointer-events-none" />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] text-[#888] mb-1.5 font-bold">Regulatory frameworks applied</label>
                    <div className="w-full bg-[#111] border border-[#222] rounded-md px-3 py-2 text-[12px] text-[#A1A1AA] font-medium leading-relaxed">
                      {activeFrameworks}
                    </div>
                  </div>
                </ConfigCard>
              )}

              {/* TAB 2: IDENTITY VERIFICATION */}
              {activeSetupTab === "identity" && (
                <ConfigCard title="Identity verification logic" description="Configure core KYC requirements">
                  <div className="space-y-3 mb-6">
                    <p className="text-[11px] text-[#888] mb-3 leading-relaxed">Configure the primary identity anchor for each selected market. Users are routed dynamically.</p>
                    
                    {markets.map(m => (
                      <div key={m} className="border border-[#222] rounded-lg p-3 bg-[#0A0A0A]">
                        <h4 className="text-[11px] font-bold text-[#EAEAEA] uppercase tracking-wider mb-2 flex items-center justify-between">
                          <span>{MARKET_MAP[m]}</span>
                          {m === "Global" && <span className="text-[9px] bg-[#333] px-1.5 py-0.5 rounded text-[#A1A1AA]">FALLBACK</span>}
                        </h4>
                        <div className="relative">
                          <select 
                            value={routingConfig[m] || ""}
                            onChange={(e) => updateRouting(m, e.target.value)}
                            className="w-full bg-[#141414] border border-[#333] rounded-md pl-3 pr-8 py-2 text-[13px] text-[#37b7ab] appearance-none focus:outline-none focus:border-[#37b7ab]/50 font-semibold"
                          >
                            {customerType === "Individual" ? (
                              <>
                                {m === "NG" && <><option value="BVN">BVN (Bank Verification Number)</option><option value="NIN">NIN (National Identity Number)</option></>}
                                {m === "KE" && <option value="IPRS">National ID (IPRS)</option>}
                                {m === "ZA" && <option value="HANIS">National ID (HANIS)</option>}
                                {m === "GH" && <option value="GhanaCard">Ghana Card (NIA)</option>}
                                {m === "UG" && <option value="NIRA">National ID (NIRA)</option>}
                                {m === "RW" && <option value="NIDA">National ID (NIDA)</option>}
                                {m === "EG" && <option value="NID">National ID Card</option>}
                                {m === "Global" && <><option value="Passport">International Passport</option><option value="DriverLicense">Driver's License</option></>}
                                <option value="DocumentOnly">ID Document Upload Only</option>
                              </>
                            ) : (
                              <>
                                {m === "NG" && <><option value="CAC">CAC (Corporate Affairs Commission)</option><option value="TIN">TIN (Tax Identification Number)</option></>}
                                {m === "KE" && <><option value="BRS">BRS (Business Registration Service)</option><option value="KRAPIN">KRA PIN</option></>}
                                {m === "ZA" && <><option value="CIPC">CIPC Registry</option><option value="SARS">SARS Tax PIN</option></>}
                                {m === "GH" && <option value="RGD">RGD (Registrar General's Dept)</option>}
                                {m === "UG" && <option value="URSB">URSB Registry</option>}
                                {m === "RW" && <option value="RDB">RDB (Rwanda Dev Board)</option>}
                                {m === "EG" && <option value="GAFI">GAFI Registration</option>}
                                {m === "Global" && <><option value="CertOfInc">Certificate of Incorporation</option><option value="TaxID">Tax ID Number</option></>}
                                <option value="DocumentOnly">Company Document Upload Only</option>
                              </>
                            )}
                          </select>
                          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888] pointer-events-none" />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-[#222] mb-4">
                    <label className="block text-[11px] text-[#888] mb-2 font-bold">Global verification checks</label>
                    <Toggle label="Address verification" checked={features.addressVerification} onChange={() => toggleFeature("addressVerification")} />
                    {features.addressVerification && (
                      <div className="pl-4 ml-2 border-l-2 border-[#333] mb-2 mt-1 space-y-3">
                        <div>
                          <label className="block text-[11px] text-[#888] mb-1.5 font-bold">Verification method</label>
                          <div className="relative">
                            <select 
                              value={features.addressVerificationMethod}
                              onChange={(e) => setFeatures(prev => ({...prev, addressVerificationMethod: e.target.value}))}
                              className="w-full bg-[#0A0A0A] border border-[#333] rounded-md pl-3 pr-8 py-2 text-[13px] text-[#37b7ab] font-bold appearance-none focus:outline-none focus:border-[#37b7ab]"
                            >
                              <option value="document">Document upload (Utility bill, etc.)</option>
                              <option value="digital">Digital (Database match / Geo-IP)</option>
                              <option value="physical">Physical (Agent visit)</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888] pointer-events-none" />
                          </div>
                        </div>

                        {features.addressVerificationMethod === "digital" && (
                          <div>
                            <label className="block text-[11px] text-[#888] mb-1.5 font-bold">Geo-IP Ping frequency</label>
                            <div className="relative">
                              <select 
                                value={features.digitalPingFrequency}
                                onChange={(e) => setFeatures(prev => ({...prev, digitalPingFrequency: e.target.value}))}
                                className="w-full bg-[#111] border border-[#333] rounded-md pl-3 pr-8 py-2 text-[13px] text-[#EAEAEA] appearance-none focus:outline-none focus:border-[#37b7ab]"
                              >
                                <option value="one_time">One-time (at onboarding)</option>
                                <option value="per_transaction">Every transaction</option>
                                <option value="daily">Daily background check</option>
                                <option value="weekly">Weekly background check</option>
                                <option value="monthly">Monthly background check</option>
                              </select>
                              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888] pointer-events-none" />
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <Toggle label="Comprehensive background check" checked={features.backgroundCheck} onChange={() => toggleFeature("backgroundCheck")} />
                    {features.backgroundCheck && (
                      <div className="pl-4 ml-2 border-l-2 border-[#333] mb-2 mt-1 space-y-3">
                        <div>
                          <label className="block text-[11px] text-[#888] mb-1.5 font-bold">Screening Package</label>
                          <div className="relative">
                            <select 
                              value={backgroundPackage}
                              onChange={(e) => setBackgroundPackage(e.target.value)}
                              className="w-full bg-[#0A0A0A] border border-[#333] rounded-md pl-3 pr-8 py-2 text-[13px] text-[#37b7ab] font-bold appearance-none focus:outline-none focus:border-[#37b7ab]"
                            >
                              <option value="standard">Standard (Criminal & Credit)</option>
                              <option value="executive">Executive Deep Dive</option>
                              <option value="create_new">+ Create new package</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888] pointer-events-none" />
                          </div>
                        </div>

                        {backgroundPackage === "create_new" && (
                          <div className="bg-[#111] border border-[#333] p-3 rounded-md flex items-start gap-2">
                            <Info size={14} className="text-[#37b7ab] mt-0.5 shrink-0" />
                            <p className="text-[11px] text-[#888] leading-relaxed">
                              To build a custom background package without disrupting your active workflow setup, please save your progress and navigate to the <strong className="text-[#EAEAEA]">Packages Studio</strong> in the main dashboard.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    <Toggle label="Document OCR cross-check" checked={features.documentOcr} onChange={() => toggleFeature("documentOcr")} />
                    <Toggle label="Liveness / selfie check" checked={features.liveness} onChange={() => toggleFeature("liveness")} />
                    {features.liveness && (
                      <div className="pl-4 ml-2 border-l-2 border-[#333] mb-2 mt-2">
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-[11px] text-[#888] font-bold">Face Confidence level</label>
                          <span className="text-[11px] text-[#37b7ab] font-medium">&ge; {faceConfidence}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={faceConfidence}
                          onChange={(e) => setFaceConfidence(parseInt(e.target.value))}
                          className="w-full h-1 bg-[#333] rounded-lg appearance-none cursor-pointer accent-[#37b7ab] mb-2 mt-2"
                        />
                      </div>
                    )}
                  </div>

                  {customerType === "Business" && (
                    <div className="pt-4 border-t border-[#222]">
                      <label className="block text-[11px] text-[#888] mb-2 font-bold">Director & UBO verification</label>
                      <div className="flex flex-col">
                        <Toggle label="Collect Director(s) Information" checked={features.collectDirectorsInfo} onChange={() => toggleFeature("collectDirectorsInfo")} />
                        {features.collectDirectorsInfo && (
                          <div className="pl-4 ml-2 border-l-2 border-[#333]">
                            <Toggle label="Verify Director Identity (Affects Score)" checked={features.verifyDirectors} onChange={() => toggleFeature("verifyDirectors")} />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-[#222]">
                    <label className="block text-[11px] text-[#888] mb-2 font-bold">Accepted document types (Global)</label>
                    <div className="flex flex-wrap gap-2">
                      <Pill label="NIN slip" active={lists.globalDocs.includes("NIN slip")} onClick={() => toggleList("globalDocs", "NIN slip")} />
                      <Pill label="Passport" active={lists.globalDocs.includes("Passport")} onClick={() => toggleList("globalDocs", "Passport")} />
                      <Pill label="Driver's licence" active={lists.globalDocs.includes("Driver's licence")} onClick={() => toggleList("globalDocs", "Driver's licence")} />
                      <Pill label="Voter's card" active={lists.globalDocs.includes("Voter's card")} onClick={() => toggleList("globalDocs", "Voter's card")} />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#222]">
                    <label className="block text-[11px] text-[#888] mb-2 font-bold">Additional documents to collect</label>
                    <div className="flex flex-wrap gap-2">
                      <Pill label="Source of Funds" active={lists.additionalDocs.includes("Source of Funds")} onClick={() => toggleList("additionalDocs", "Source of Funds")} />
                      <Pill label="Tax Clearance" active={lists.additionalDocs.includes("Tax Clearance")} onClick={() => toggleList("additionalDocs", "Tax Clearance")} />
                      <Pill label="Bank Statement" active={lists.additionalDocs.includes("Bank Statement")} onClick={() => toggleList("additionalDocs", "Bank Statement")} />
                      <Pill label="MemArt (MoA)" active={lists.additionalDocs.includes("MemArt (MoA)")} onClick={() => toggleList("additionalDocs", "MemArt (MoA)")} />
                      <Pill label="Board Resolution" active={lists.additionalDocs.includes("Board Resolution")} onClick={() => toggleList("additionalDocs", "Board Resolution")} />
                      <Pill label="Financial Statements" active={lists.additionalDocs.includes("Financial Statements")} onClick={() => toggleList("additionalDocs", "Financial Statements")} />
                      <Pill label="Director's ID" active={lists.additionalDocs.includes("Director's ID")} onClick={() => toggleList("additionalDocs", "Director's ID")} />
                    </div>
                    <p className="text-[10px] text-[#666] mt-2">These are collected for compliance records and do not affect the automated risk score.</p>
                  </div>
                </ConfigCard>
              )}

              {/* TAB 3: SECURITY & AML */}
              {activeSetupTab === "security" && (
                <>
                  <ConfigCard 
                    title="FraudLens" 
                    description="Passive behavioral biometrics"
                    badge={<span className="text-[9px] bg-[#818cf8]/20 text-[#818cf8] px-2 py-0.5 rounded uppercase font-bold tracking-wider">Advanced Screening</span>}
                  >
                    <div>
                      <div className="flex flex-col">
                        <Toggle label="Fraud Scan" checked={features.fraudScan} onChange={() => toggleFeature("fraudScan")} />
                        
                        {features.fraudScan && (
                          <div className="pl-4 ml-2 border-l-2 border-[#333] mt-2 flex flex-col gap-3">
                            <Toggle label="Force manual review on fraud hit" checked={features.fraudLensManualReview} onChange={() => toggleFeature("fraudLensManualReview")} />
                            
                            <div className="group relative w-fit">
                              <div className="flex items-center gap-1.5 text-[11px] text-[#37b7ab] font-medium cursor-help">
                                <Info size={14} />
                                <span>How does this work?</span>
                              </div>
                              
                              {/* Tooltip */}
                              <div className="absolute left-0 bottom-full mb-2 w-72 bg-[#1A1A1A] border border-[#333] rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-50 shadow-2xl">
                                <p className="text-[11px] text-[#EAEAEA] leading-relaxed">
                                  FraudLens runs silently in the background during onboarding. It analyzes device intelligence, behavioral biometrics (typing cadence & navigation patterns), and network velocity. Additionally, it instantly cross-references the user against a global shared fraud consortium database to accurately detect and block high-risk actors without adding friction to legitimate users.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </ConfigCard>

                  <ConfigCard title="AML & risk screening" description="Global watchlists and monitoring">
                    <div>
                      <label className="block text-[11px] text-[#888] mb-2 font-bold">Active lists</label>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Pill label="OFAC" active={lists.sanctions.includes("OFAC")} onClick={() => toggleList("sanctions", "OFAC")} />
                        <Pill label="UN Security Council" active={lists.sanctions.includes("UN Security Council")} onClick={() => toggleList("sanctions", "UN Security Council")} />
                        <Pill label="EU Sanctions" active={lists.sanctions.includes("EU Sanctions")} onClick={() => toggleList("sanctions", "EU Sanctions")} />
                        <Pill label="HMT (UK)" active={lists.sanctions.includes("HMT (UK)")} onClick={() => toggleList("sanctions", "HMT (UK)")} />
                      </div>

                      <label className="block text-[11px] text-[#888] mb-2 font-bold">Screening configuration</label>
                      <div className="flex flex-col">
                        <Toggle label="PEP Screening" checked={features.pepScreening} onChange={() => toggleFeature("pepScreening")} />
                        <Toggle label="Adverse Media" checked={features.adverseMedia} onChange={() => toggleFeature("adverseMedia")} />
                        <Toggle label="Ongoing Monitoring (Daily)" checked={features.ongoingMonitoring} onChange={() => toggleFeature("ongoingMonitoring")} />
                      </div>
                    </div>
                  </ConfigCard>

                  <ConfigCard title="Step-up & transaction monitoring" description="Conditional triggers and ongoing security">
                    <div>
                      <label className="block text-[11px] text-[#888] mb-2 font-bold">Step-up document options</label>
                      <div className="flex flex-col items-start gap-2 mb-4">
                        <Pill label="Utility bill" active={lists.stepUpDocs.includes("Utility bill")} onClick={() => toggleList("stepUpDocs", "Utility bill")} />
                        <Pill label="Bank statement" active={lists.stepUpDocs.includes("Bank statement")} onClick={() => toggleList("stepUpDocs", "Bank statement")} />
                        <Pill label="Tenancy agreement" active={lists.stepUpDocs.includes("Tenancy agreement")} onClick={() => toggleList("stepUpDocs", "Tenancy agreement")} />
                      </div>

                      <label className="block text-[11px] text-[#888] mb-1.5 font-bold">Step-up expiry (hours)</label>
                      <input 
                        type="text" 
                        defaultValue="48" 
                        className="w-24 bg-[#0A0A0A] border border-[#333] rounded-md px-3 py-2 text-[13px] text-white focus:outline-none focus:border-[#37b7ab] font-medium mb-4"
                      />

                      <div className="pt-4 border-t border-[#222]">
                        <label className="block text-[11px] text-[#888] mb-2 font-bold">Transaction monitoring</label>
                        <div className="flex flex-col">
                          <Toggle label="Velocity alerts" checked={features.velocityAlerts} onChange={() => toggleFeature("velocityAlerts")} />
                          <Toggle label="Structuring detection" checked={features.structuringDetection} onChange={() => toggleFeature("structuringDetection")} />
                          <Toggle label="SAR auto-draft" checked={features.sarAutoDraft} onChange={() => toggleFeature("sarAutoDraft")} />
                        </div>
                      </div>
                    </div>
                  </ConfigCard>
                </>
              )}

              {/* TAB 4: SCORING ENGINE */}
              {activeSetupTab === "scoring" && (
                <>
                  <ConfigCard title="Interactive Scoring Weights" description="Distribute a total of 100 points across active verification checks.">
                    <div className="mb-4">
                      <h3 className="text-[13px] font-bold text-white mb-1 flex justify-between items-center">
                        Score impact
                        {!isScoreValid && <span className="text-[10px] text-red-400 uppercase tracking-wider bg-red-400/10 px-2 py-0.5 rounded">Must equal 100</span>}
                      </h3>
                      <p className="text-[11px] text-[#888] mb-6">Manually adjust weights. Features toggled OFF in Step 2 will be hidden.</p>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center text-[13px]">
                          <span className="text-[#EAEAEA]">Identity anchor match</span>
                          <input 
                            type="number"
                            value={scoreWeights.identity}
                            onChange={(e) => setScoreWeights(p => ({...p, identity: parseInt(e.target.value) || 0}))}
                            className="w-16 bg-[#1A1A1A] border border-[#333] rounded px-2 py-1.5 text-[#37b7ab] font-medium text-right focus:outline-none focus:border-[#37b7ab]" 
                          />
                        </div>
                        {features.addressVerification && (
                          <div className="flex justify-between items-center text-[13px]">
                            <span className="text-[#EAEAEA]">Address verified</span>
                            <input 
                              type="number"
                              value={scoreWeights.address}
                              onChange={(e) => setScoreWeights(p => ({...p, address: parseInt(e.target.value) || 0}))}
                              className="w-16 bg-[#1A1A1A] border border-[#333] rounded px-2 py-1.5 text-[#37b7ab] font-medium text-right focus:outline-none focus:border-[#37b7ab]" 
                            />
                          </div>
                        )}
                        {features.backgroundCheck && (
                          <div className="flex justify-between items-center text-[13px]">
                            <span className="text-[#EAEAEA]">Background check passed</span>
                            <input 
                              type="number"
                              value={scoreWeights.background}
                              onChange={(e) => setScoreWeights(p => ({...p, background: parseInt(e.target.value) || 0}))}
                              className="w-16 bg-[#1A1A1A] border border-[#333] rounded px-2 py-1.5 text-[#37b7ab] font-medium text-right focus:outline-none focus:border-[#37b7ab]" 
                            />
                          </div>
                        )}
                        {customerType === "Business" && features.collectDirectorsInfo && features.verifyDirectors && (
                          <div className="flex justify-between items-center text-[13px]">
                            <span className="text-[#EAEAEA]">Director KYC verified</span>
                            <input 
                              type="number"
                              value={scoreWeights.director}
                              onChange={(e) => setScoreWeights(p => ({...p, director: parseInt(e.target.value) || 0}))}
                              className="w-16 bg-[#1A1A1A] border border-[#333] rounded px-2 py-1.5 text-[#37b7ab] font-medium text-right focus:outline-none focus:border-[#37b7ab]" 
                            />
                          </div>
                        )}
                        {features.liveness && (
                          <div className="flex justify-between items-center text-[13px]">
                            <span className="text-[#EAEAEA]">Liveness passed</span>
                            <input 
                              type="number"
                              value={scoreWeights.liveness}
                              onChange={(e) => setScoreWeights(p => ({...p, liveness: parseInt(e.target.value) || 0}))}
                              className="w-16 bg-[#1A1A1A] border border-[#333] rounded px-2 py-1.5 text-[#37b7ab] font-medium text-right focus:outline-none focus:border-[#37b7ab]" 
                            />
                          </div>
                        )}
                        {features.documentOcr && (
                          <div className="flex justify-between items-center text-[13px]">
                            <span className="text-[#EAEAEA]">Document OCR match</span>
                            <input 
                              type="number"
                              value={scoreWeights.document}
                              onChange={(e) => setScoreWeights(p => ({...p, document: parseInt(e.target.value) || 0}))}
                              className="w-16 bg-[#1A1A1A] border border-[#333] rounded px-2 py-1.5 text-[#37b7ab] font-medium text-right focus:outline-none focus:border-[#37b7ab]" 
                            />
                          </div>
                        )}
                        {features.fraudScan && (
                          <div className="flex justify-between items-center text-[13px]">
                            <span className="text-[#EAEAEA]">Fraud Scan passed</span>
                            <input 
                              type="number"
                              value={scoreWeights.fraud}
                              onChange={(e) => setScoreWeights(p => ({...p, fraud: parseInt(e.target.value) || 0}))}
                              className="w-16 bg-[#1A1A1A] border border-[#333] rounded px-2 py-1.5 text-[#818cf8] font-medium text-right focus:outline-none focus:border-[#818cf8]" 
                            />
                          </div>
                        )}
                        
                        <div className="h-px w-full bg-[#333] my-4" />
                        
                        <div className="flex justify-between text-[14px] font-bold items-center bg-[#111] p-3 rounded-lg border border-[#222]">
                          <span className="text-white">Running total</span>
                          <span className={cn(isScoreValid ? "text-[#37b7ab]" : "text-red-400")}>{totalScore} / 100</span>
                        </div>
                      </div>
                    </div>
                  </ConfigCard>

                  <ConfigCard title="Scoring thresholds" description="Configure routing logic based on total score">
                    <div className="relative">
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-[13px] text-[#EAEAEA] font-bold">Auto-approve above</label>
                      </div>
                      <p className="text-[12px] text-[#888] mb-2 font-medium">Score &ge; {threshold}</p>
                      <input 
                        type="range" 
                        min={declineThreshold + 1} 
                        max="100" 
                        value={threshold}
                        onChange={(e) => setThreshold(parseInt(e.target.value))}
                        className="w-full h-1 bg-[#333] rounded-lg appearance-none cursor-pointer accent-[#37b7ab] mb-4"
                      />

                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-[13px] text-[#EAEAEA] font-bold">Manual review range</label>
                      </div>
                      <p className="text-[12px] text-[#888] mb-4 font-medium">{manualReviewFloor} – {threshold - 1}</p>

                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-[13px] text-[#EAEAEA] font-bold">Auto-decline below</label>
                      </div>
                      <p className="text-[12px] text-[#888] mb-2 font-medium">Score &lt; {manualReviewFloor}</p>
                      <input 
                        type="range" 
                        min="0" 
                        max={threshold - 1} 
                        value={declineThreshold}
                        onChange={(e) => setDeclineThreshold(parseInt(e.target.value))}
                        className="w-full h-1 bg-[#333] rounded-lg appearance-none cursor-pointer accent-[#888] mb-4"
                      />
                    </div>

                    <div className="pt-4 border-t border-[#222]">
                      <Toggle label="Hard block on any sanctions hit" checked={features.hardBlockSanctions} onChange={() => toggleFeature("hardBlockSanctions")} />
                    </div>
                  </ConfigCard>
                </>
              )}

            </div>
          </div>
        </div>

        {/* Right Panel: Flow visualization / Code */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#0A0A0A]">
          
          {/* Tabs */}
          <div className="flex border-b border-[#222] px-6 shrink-0 bg-[#050505]">
            <button 
              onClick={() => setActiveTab("preview")}
              className={cn(
                "px-6 py-4 text-[13px] font-medium border-b-2 transition-colors",
                activeTab === "preview" ? "border-[#37b7ab] text-[#37b7ab]" : "border-transparent text-[#888] hover:text-[#EAEAEA]"
              )}
            >
              Live preview
            </button>
            <button 
              onClick={() => setActiveTab("visual")}
              className={cn(
                "px-6 py-4 text-[13px] font-medium border-b-2 transition-colors",
                activeTab === "visual" ? "border-[#37b7ab] text-[#37b7ab]" : "border-transparent text-[#888] hover:text-[#EAEAEA]"
              )}
            >
              Customer flow
            </button>
            <button 
              onClick={() => setActiveTab("code")}
              className={cn(
                "px-6 py-4 text-[13px] font-medium border-b-2 transition-colors",
                activeTab === "code" ? "border-[#37b7ab] text-[#37b7ab]" : "border-transparent text-[#888] hover:text-[#EAEAEA]"
              )}
            >
              Config code
            </button>
          </div>

          <div className="flex-1 overflow-y-auto sidebar-scrollbar relative">
            
            {activeTab === "preview" && (
              <div className="min-h-full flex flex-col items-center justify-center p-10 relative">
                
                {/* Background Decor */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#37b7ab] opacity-5 rounded-full blur-[100px]"></div>
                  <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#818cf8] opacity-5 rounded-full blur-[100px]"></div>
                </div>

                <div className="mb-6 flex flex-col items-center z-10">
                  <h2 className="text-[14px] font-bold text-white tracking-wide">End-User Experience</h2>
                  <p className="text-[12px] text-[#888]">This is what your customers will see on mobile.</p>
                </div>

                {/* Mobile Device Simulator */}
                <div className="w-[340px] h-[680px] bg-white rounded-[40px] border-[8px] border-[#222] overflow-hidden shadow-2xl relative flex flex-col z-10">
                  {/* Dynamic Island / Notch area */}
                  <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-50">
                    <div className="w-32 h-5 bg-[#222] rounded-b-xl"></div>
                  </div>

                  {/* Brand Color Status Bar accent */}
                  <div className="h-1 w-full transition-colors duration-300 shrink-0" style={{ backgroundColor: brandColor }} />

                  {/* App Header */}
                  <div className="px-6 pt-8 pb-4 border-b border-gray-100 flex items-center gap-3 bg-white z-10 shadow-sm transition-all duration-300">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm transition-colors duration-300" style={{ backgroundColor: brandColor }}>
                      {institutionName ? institutionName.charAt(0).toUpperCase() : "Z"}
                    </div>
                    <span className="font-bold text-gray-900 text-sm truncate">{institutionName || "Your Institution"}</span>
                  </div>

                  {/* App Body - Contextual based on activeSetupTab */}
                  
                  {activeSetupTab === "profile" && (
                    <div className="flex-1 bg-[#FAFAFA] p-6 flex flex-col justify-center text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
                       <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-2xl font-bold shadow-lg transition-colors duration-300" style={{ backgroundColor: brandColor }}>
                         {institutionName ? institutionName.charAt(0).toUpperCase() : "Z"}
                       </div>
                       <h1 className="text-2xl font-extrabold text-gray-900 mb-3 leading-tight">Welcome to <br/> {institutionName || "Your Institution"}</h1>
                       <p className="text-[14px] text-gray-500 mb-10 leading-relaxed">
                         Set up your {customerType === "Business" ? "business" : "personal"} account in just a few minutes. Fast, secure, and fully compliant.
                       </p>
                       <div className="mt-auto pb-6">
                         <button className="w-full text-white rounded-xl py-3.5 font-bold text-sm shadow-md transition-all duration-300 hover:opacity-90" style={{ backgroundColor: brandColor }}>
                           Get Started
                         </button>
                         <p className="text-center text-[10px] text-gray-400 mt-4 font-medium uppercase tracking-widest flex items-center justify-center gap-1">
                            Powered by <span className="font-bold text-gray-600">Prembly</span>
                         </p>
                       </div>
                    </div>
                  )}

                  {activeSetupTab === "identity" && (
                    <div className="flex-1 bg-[#FAFAFA] p-6 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-right-4 duration-300">
                      <h1 className="text-xl font-extrabold text-gray-900 mb-2 leading-tight">
                        {customerType === 'Business' ? 'Verify your business' : 'Verify your identity'}
                      </h1>
                      <p className="text-[13px] text-gray-500 mb-8 leading-relaxed">
                        To comply with regulations and keep your account secure, we need to collect a few details.
                      </p>

                      {/* Dynamic Checklist based on active features */}
                      <div className="space-y-3">
                        {/* Step 1: Base details */}
                        <PreviewStep 
                          icon={<User size={16} />} 
                          title={customerType === 'Business' ? "Business details" : "Personal details"} 
                          desc="Basic information and profile setup" 
                        />
                        
                        {/* Step 2: Routing anchor (e.g. BVN) */}
                        <PreviewStep 
                          icon={<Scan size={16} />} 
                          title="Identity verification" 
                          desc={`Using your ${routingConfig[markets[0] || "Global"] || "ID"}`} 
                        />

                        {features.documentOcr && (
                          <PreviewStep 
                            icon={<FileText size={16} />} 
                            title="Identity Document" 
                            desc="Upload a clear photo of your ID" 
                          />
                        )}

                        {features.liveness && (
                          <PreviewStep 
                            icon={<Camera size={16} />} 
                            title="Liveness Check" 
                            desc="Record a quick selfie video" 
                          />
                        )}

                        {features.addressVerification && (
                          <PreviewStep 
                            icon={<MapPin size={16} />} 
                            title="Address Verification" 
                            desc={features.addressVerificationMethod === 'digital' ? 'Automatic location check' : features.addressVerificationMethod === 'physical' ? 'Schedule an agent visit' : 'Upload a utility bill'} 
                          />
                        )}
                        
                        {features.backgroundCheck && (
                          <PreviewStep 
                            icon={<Search size={16} />} 
                            title="Background Screening" 
                            desc="Automated compliance check" 
                          />
                        )}

                        {customerType === "Business" && features.collectDirectorsInfo && (
                          <PreviewStep 
                            icon={<User size={16} />} 
                            title="Director Details" 
                            desc="Provide UBO & director information" 
                          />
                        )}

                        {activeAdditionalDocs.length > 0 && (
                          <PreviewStep 
                            icon={<FileText size={16} />} 
                            title="Additional Documents" 
                            desc={`Upload ${activeAdditionalDocs.length} requested document(s)`} 
                          />
                        )}
                      </div>

                      <div className="mt-10 pb-6">
                        <button className="w-full text-white rounded-xl py-3.5 font-bold text-sm shadow-md transition-all duration-300 hover:opacity-90" style={{ backgroundColor: brandColor }}>
                          Start Verification
                        </button>
                        <p className="text-center text-[10px] text-gray-400 mt-4 font-medium uppercase tracking-widest flex items-center justify-center gap-1">
                          Powered by <span className="font-bold text-gray-600">Prembly</span>
                        </p>
                      </div>
                    </div>
                  )}

                  {activeSetupTab === "security" && (
                    <div className="flex-1 bg-[#FAFAFA] p-6 flex flex-col justify-center animate-in fade-in slide-in-from-right-4 duration-300">
                       <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 mx-auto mb-6 flex items-center justify-center shadow-sm">
                         <ShieldAlert size={24} />
                       </div>
                       <h1 className="text-xl font-extrabold text-gray-900 mb-2 text-center leading-tight">Security Verification</h1>
                       <p className="text-[13px] text-gray-500 mb-8 text-center leading-relaxed">
                         For your security, we require an additional document to proceed.
                       </p>
                       
                       <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm text-center border-dashed mb-4">
                         <Upload size={24} className="mx-auto text-gray-400 mb-3" />
                         <span className="text-sm font-bold text-gray-700 block">Upload {lists.stepUpDocs.length > 0 ? lists.stepUpDocs[0] : "Utility Bill"}</span>
                         <span className="text-xs text-gray-400">PDF, JPG, or PNG</span>
                       </div>

                       <div className="mt-auto pb-6">
                         <button className="w-full text-white rounded-xl py-3.5 font-bold text-sm shadow-md opacity-50 cursor-not-allowed transition-all duration-300" style={{ backgroundColor: brandColor }}>
                           Submit Document
                         </button>
                         <p className="text-center text-[10px] text-gray-400 mt-4 font-medium uppercase tracking-widest flex items-center justify-center gap-1">
                            Powered by <span className="font-bold text-gray-600">Prembly</span>
                         </p>
                       </div>
                    </div>
                  )}

                  {activeSetupTab === "scoring" && (
                    <div className="flex-1 bg-[#FAFAFA] p-6 flex flex-col justify-center text-center animate-in fade-in slide-in-from-right-4 duration-300">
                       <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center text-white shadow-lg relative transition-colors duration-300" style={{ backgroundColor: brandColor }}>
                         <Check size={32} />
                         <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm">
                           <div className="w-3.5 h-3.5 rounded-full bg-green-500" />
                         </div>
                       </div>
                       <h1 className="text-2xl font-extrabold text-gray-900 mb-3 leading-tight">Verification<br/>Complete</h1>
                       <p className="text-[14px] text-gray-500 mb-10 leading-relaxed">
                         Your profile has been successfully verified and approved. You are ready to go!
                       </p>
                       <div className="mt-auto pb-6">
                         <button className="w-full text-white rounded-xl py-3.5 font-bold text-sm shadow-md transition-all duration-300 hover:opacity-90" style={{ backgroundColor: brandColor }}>
                           Continue to Dashboard
                         </button>
                         <p className="text-center text-[10px] text-gray-400 mt-4 font-medium uppercase tracking-widest flex items-center justify-center gap-1">
                            Powered by <span className="font-bold text-gray-600">Prembly</span>
                         </p>
                       </div>
                    </div>
                  )}

                </div>
              </div>
            )}

            {activeTab === "visual" && (
              <div className="p-8">
                <h2 className="text-[11px] font-bold tracking-widest text-[#888] uppercase mb-6">Customer sees this journey</h2>
                
                <div className="space-y-1 mb-10 max-w-lg">
                  <FlowNode label={customerType === 'Business' ? "Business details" : "Personal details"} icon="user" state="success" />
                  <FlowArrow />
                  
                  {/* Visual Router Node */}
                  <div className="flex gap-4">
                    <div className="w-0.5 bg-[#333] ml-6 opacity-30" />
                    <div className="flex-1 space-y-2 py-2">
                      {markets.map(m => (
                        <div key={m} className="flex items-center gap-3">
                          <div className="w-6 h-px bg-[#333]" />
                          <div className="flex-1">
                            <FlowNode 
                              label={`${routingConfig[m]} entry`} 
                              badge={m === "Global" ? "Fallback" : MARKET_MAP[m]} 
                              icon="id" 
                              state="active" 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {features.documentOcr && (
                    <>
                      <FlowArrow />
                      <FlowNode label="Document OCR extraction" icon="scan" state="active" />
                    </>
                  )}
                  
                  {features.addressVerification && (
                    <>
                      <FlowArrow />
                      <FlowNode 
                        label={features.addressVerificationMethod === 'document' ? 'Proof of address upload' : features.addressVerificationMethod === 'digital' ? `Digital Geo-IP match (${features.digitalPingFrequency.replace('_', ' ')})` : 'Physical agent visit'} 
                        icon={features.addressVerificationMethod === 'document' ? 'file-text' : 'map-pin'} 
                        state="active" 
                      />
                    </>
                  )}

                  {features.backgroundCheck && (
                    <>
                      <FlowArrow />
                      <FlowNode label={`Background Check (${backgroundPackage})`} icon="search" state="active" badge="KYC" />
                    </>
                  )}

                  {activeAdditionalDocs.length > 0 && (
                    <>
                      <FlowArrow />
                      <FlowNode 
                        label={`Additional docs (${activeAdditionalDocs.length})`} 
                        icon="file-text" 
                        state="active" 
                      />
                    </>
                  )}

                  {features.liveness && (
                    <>
                      <FlowArrow />
                      <FlowNode label={`Liveness check (≥${faceConfidence}%)`} icon="camera" state="active" />
                    </>
                  )}

                  {customerType === "Business" && features.collectDirectorsInfo && (
                    <>
                      <FlowArrow />
                      <FlowNode label="Director & UBO details" icon="users" state="active" />
                    </>
                  )}
                  
                  {customerType === "Business" && features.collectDirectorsInfo && features.verifyDirectors && (
                    <>
                      <FlowArrow />
                      <FlowNode label="Director KYC verification" icon="shield-check" state="active" />
                    </>
                  )}

                  {features.fraudScan && (
                    <>
                      <FlowArrow />
                      <FlowNode label="FraudLens Behavioral Scan" icon="shield-alert" state="active" badge="Passive" />
                      {features.fraudLensManualReview && (
                        <div className="ml-10 mt-2 mb-2 flex items-center gap-2 border-l-2 border-amber-500/30 pl-2">
                           <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider bg-amber-400/10 px-2 py-0.5 rounded border border-amber-500/20">
                             Triggers Manual Review on hit
                           </span>
                        </div>
                      )}
                    </>
                  )}

                  {lists.sanctions.length > 0 && (
                    <>
                      <FlowArrow />
                      <FlowNode label={`AML Screening (${lists.sanctions.length} lists)`} icon="globe" state="active" badge="Security" />
                      {features.hardBlockSanctions && (
                        <div className="ml-10 mt-2 mb-2 flex items-center gap-2 border-l-2 border-red-500/30 pl-2">
                           <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider bg-red-400/10 px-2 py-0.5 rounded border border-red-500/20">
                             Hard blocks on sanctions hit
                           </span>
                        </div>
                      )}
                    </>
                  )}
                  
                  <FlowArrow />
                  <FlowNode label="Risk engine decision" icon="box" state="inactive" />
                  
                  {/* Decision Logic Branch */}
                  <div className="flex gap-4 mt-1">
                    <div className="w-0.5 bg-[#333] ml-6 opacity-30" />
                    <div className="flex-1 space-y-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-px bg-[#333]" />
                          <div className="flex-1 flex items-center justify-between bg-[#111] border border-green-500/30 rounded-lg p-3">
                             <div className="text-[12px] font-bold text-green-400">Auto-Approve</div>
                             <div className="text-[11px] text-[#888]">Score ≥ {threshold}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-px bg-[#333]" />
                          <div className="flex-1 flex items-center justify-between bg-[#111] border border-amber-500/30 rounded-lg p-3">
                             <div className="text-[12px] font-bold text-amber-400">Manual Review</div>
                             <div className="text-[11px] text-[#888]">{manualReviewFloor} – {threshold - 1}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-px bg-[#333]" />
                          <div className="flex-1 flex items-center justify-between bg-[#111] border border-red-500/30 rounded-lg p-3">
                             <div className="text-[12px] font-bold text-red-400">Auto-Decline</div>
                             <div className="text-[11px] text-[#888]">Score &lt; {manualReviewFloor}</div>
                          </div>
                        </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {activeTab === "code" && (
              <div className="p-8 h-full pb-20">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[11px] font-bold tracking-widest text-[#888] uppercase">Web SDK Integration</h2>
                  <button className="text-xs text-[#37b7ab] font-medium flex items-center gap-1.5 hover:text-[#2da096]">
                    <Copy size={12} />
                    Copy Code
                  </button>
                </div>
                <div className="bg-[#111] border border-[#222] rounded-xl p-5 overflow-x-auto mb-8">
                  <pre className="text-sm font-mono text-[#A1A1AA] leading-relaxed">
                    <code>
{`<script>
 function startVerification(userData) {
      console.log('Starting verification with data:', userData);

      IdentityKYC.verify({
        // Widget credentials
        widget_id: "${configId}",
        widget_key: "live_scodeabhdhfhfhffg",
        
        // User information
        first_name: userData.firstName,
        last_name: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        
        // Callback function to handle verification results
        callback: (response) => console.log(response)
      });
 }
</script>`}
                    </code>
                  </pre>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[11px] font-bold tracking-widest text-[#888] uppercase">Generated JSON Object</h2>
                  <button className="text-xs text-[#37b7ab] font-medium flex items-center gap-1.5 hover:text-[#2da096]">
                    <Copy size={12} />
                    Copy JSON
                  </button>
                </div>
                <div className="bg-[#111] border border-[#222] rounded-xl p-5 overflow-x-auto">
                  <pre className="text-sm font-mono text-[#A1A1AA] leading-relaxed">
                    <code dangerouslySetInnerHTML={{
                      __html: configJson
                        // Extremely basic syntax highlighting for JSON
                        .replace(/"([^"]+)":/g, '<span class="text-[#888]">"$1"</span>:')
                        .replace(/"([^"]+)"/g, '<span class="text-[#37b7ab]">"$1"</span>')
                        .replace(/([0-9]+)/g, '<span class="text-amber-500">$1</span>')
                        .replace(/true|false/g, '<span class="text-purple-400">$&</span>')
                    }} />
                  </pre>
                </div>

                <div className="mt-8 p-4 rounded-lg bg-[#6366f1]/10 border border-[#6366f1]/20 text-sm text-[#818cf8] flex gap-3">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <p>
                    Live identity routing active. Your JSON code and Web SDK implement dynamic logic handling to support any selected combination of markets natively inside your app's workflow.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ConfigCard({ 
  number, 
  title, 
  titleContent,
  badge,
  description,
  isDone,
  customIconColor,
  customIconBg,
  defaultExpanded = true,
  children 
}: { 
  number?: number, 
  title?: string, 
  titleContent?: React.ReactNode,
  badge?: React.ReactNode,
  description?: string,
  isDone?: boolean,
  customIconColor?: string,
  customIconBg?: string,
  defaultExpanded?: boolean,
  children: React.ReactNode 
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <div className="relative z-10 bg-[#141414] border border-[#333] rounded-xl mb-6 transition-all duration-200">
      <div 
        className="px-4 py-3 flex items-center justify-between border-b border-[#222] bg-[#0A0A0A] cursor-pointer hover:bg-[#111] transition-colors rounded-t-xl"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          {isDone ? (
            <div className="w-6 h-6 rounded-full bg-[#1E361A] flex items-center justify-center text-[#4ADE80]">
              <Check size={14} strokeWidth={3} />
            </div>
          ) : (
            <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold", customIconBg || "bg-[#222]", customIconColor || "text-[#888]", !customIconBg && "border border-[#333]")}>
              {number}
            </div>
          )}
          
          {titleContent ? titleContent : <span className="text-[13px] font-semibold text-[#EAEAEA]">{title}</span>}
        </div>
        <div className="flex items-center gap-3">
          {badge}
          <div className="w-6 h-6 rounded flex items-center justify-center hover:bg-[#222] transition-colors">
            <ChevronDown size={14} className={cn("text-[#666] transition-transform duration-200", isExpanded ? "rotate-180" : "")} />
          </div>
        </div>
      </div>
      
      {isExpanded && (
        <div className="p-4 space-y-5 bg-[#141414] rounded-b-xl border-t border-[#222]">
          {children}
        </div>
      )}
    </div>
  )
}

function Toggle({ label, checked, onChange }: { label: string, checked?: boolean, onChange?: (c: boolean) => void }) {
  // Use internal state ONLY if onChange is not provided, making it adaptable
  const [internalChecked, setInternalChecked] = useState(checked ?? true)
  const isChecked = onChange ? checked : internalChecked;

  const handleClick = () => {
    if (onChange) {
      onChange(!isChecked)
    } else {
      setInternalChecked(!internalChecked)
    }
  }
  
  return (
    <div 
      className="flex justify-between items-center py-2.5 border-b border-[#222] last:border-0 cursor-pointer"
      onClick={handleClick}
    >
      <span className="text-[13px] text-[#EAEAEA] font-medium select-none">{label}</span>
      <div className={cn("w-9 h-5 rounded-full flex items-center px-0.5 transition-colors", isChecked ? "bg-[#37b7ab]" : "bg-[#333]")}>
        <div className={cn("w-4 h-4 bg-white rounded-full shadow-sm transition-transform", isChecked ? "translate-x-4" : "translate-x-0")} />
      </div>
    </div>
  )
}

function Pill({ label, active, onClick }: { label: string, active?: boolean, onClick?: () => void }) {
  // Similar to Toggle, adapt if onClick isn't provided
  const [internalActive, setInternalActive] = useState(active ?? false)
  const isActive = onClick ? active : internalActive;

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      setInternalActive(!internalActive)
    }
  }

  return (
    <button 
      onClick={handleClick}
      className={cn(
      "px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors border select-none",
      isActive 
        ? "bg-[#37b7ab]/10 border-[#37b7ab]/30 text-[#37b7ab]" 
        : "bg-transparent border-[#333] text-[#888] hover:text-[#EAEAEA]"
    )}>
      {label}
    </button>
  )
}

function StatefulMarketPill({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
      "px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors border select-none",
      active 
        ? "bg-[#37b7ab]/10 border-[#37b7ab]/30 text-[#37b7ab]" 
        : "bg-transparent border-[#333] text-[#888] hover:text-[#EAEAEA]"
    )}>
      {label}
    </button>
  )
}

function FlowNode({ label, state, icon, badge }: { label: string, state: "success" | "active" | "inactive", icon?: string, badge?: string }) {
  const isSuccess = state === "success"
  const isActive = state === "active"
  
  let IconComponent = Square
  if (icon === "user") IconComponent = User
  if (icon === "id") IconComponent = FileText
  if (icon === "scan") IconComponent = Scan
  if (icon === "camera") IconComponent = Camera
  if (icon === "upload") IconComponent = Upload
  if (icon === "check") IconComponent = ShieldCheck
  if (icon === "clock") IconComponent = Clock
  if (icon === "file-text") IconComponent = FileText
  if (icon === "map-pin") IconComponent = MapPin
  if (icon === "search") IconComponent = Search

  return (
    <div className={cn(
      "px-3 py-3 rounded-lg flex items-center justify-between border transition-colors",
      isSuccess && "bg-[#1E361A] border-[#2E5227] text-[#4ADE80]",
      isActive && "bg-[#253965] border-[#314A83] text-[#85A5F2]",
      !isSuccess && !isActive && "bg-[#1A1A1A] border-[#222] text-[#888]"
    )}>
      <div className="flex items-center gap-3 text-[13px] font-medium">
        <IconComponent size={14} className="opacity-70" />
        {label}
      </div>
      {badge && (
        <span className={cn("text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded font-bold", badge === "ADVANCED" ? "bg-[#6366f1]/20 text-[#818cf8]" : "bg-black/30 text-[#EAEAEA]")}>
          {badge}
        </span>
      )}
    </div>
  )
}

function FlowArrow({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-1">
      <ArrowDown size={14} className="text-[#666]" />
      {label && <div className="text-[10px] text-[#666] mt-0.5">{label}</div>}
    </div>
  )
}

// Helper component for the Live Preview tab
function PreviewStep({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="bg-white p-3.5 rounded-xl border border-gray-100 flex items-start gap-3 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] hover:border-gray-200 transition-colors">
      <div className="w-9 h-9 rounded-full bg-[#FAFAFA] border border-gray-100 text-[#555] flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <h4 className="text-[13px] font-bold text-gray-900 leading-tight mb-0.5">{title}</h4>
        <p className="text-[11px] text-gray-500 leading-snug">{desc}</p>
      </div>
    </div>
  )
}
