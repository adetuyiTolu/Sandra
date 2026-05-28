import { Customer360Profile } from "@/lib/types"
import { ShieldCheck, UserCheck, AlertTriangle, Activity, FileText, Lock } from "lucide-react"

export function Customer360Card({ data }: { data: Customer360Profile }) {
  const getStatusColor = (status: "GREEN" | "AMBER" | "RED") => {
    switch (status) {
      case "GREEN": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      case "AMBER": return "bg-amber-500/10 text-amber-400 border-amber-500/20"
      case "RED": return "bg-rose-500/10 text-rose-400 border-rose-500/20"
    }
  }

  const getStatusDot = (status: "GREEN" | "AMBER" | "RED") => {
    switch (status) {
      case "GREEN": return "bg-emerald-400"
      case "AMBER": return "bg-amber-400"
      case "RED": return "bg-rose-400"
    }
  }

  const getRiskScoreColor = (score: number) => {
    if (score < 30) return "text-emerald-400 stroke-emerald-400"
    if (score < 70) return "text-amber-400 stroke-amber-400"
    return "text-rose-400 stroke-rose-400"
  }

  const products = [
    { key: "identity", label: "Identity Verification", icon: UserCheck, data: data.products.identity },
    { key: "background", label: "Background Check", icon: ShieldCheck, data: data.products.background },
    { key: "fraud", label: "Fraud Check", icon: AlertTriangle, data: data.products.fraud },
    { key: "txn_monitoring", label: "Transaction Monitoring", icon: Activity, data: data.products.txn_monitoring },
    { key: "aml", label: "AML Screening", icon: FileText, data: data.products.aml },
    { key: "vault", label: "Document Vault", icon: Lock, data: data.products.vault },
  ]

  const radius = 35
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (data.global_risk_score / 100) * circumference

  return (
    <div className="w-full bg-[#141414] border border-[#222222] rounded-xl overflow-hidden shadow-2xl">
      {/* Header section */}
      <div className="p-5 border-b border-[#222222] flex items-start gap-6 bg-gradient-to-br from-[#1C1C1E] to-[#141414]">
        
        {/* Risk Score Circle */}
        <div className="relative flex-shrink-0 w-24 h-24 flex items-center justify-center">
          <svg className="transform -rotate-90 w-24 h-24">
            <circle
              cx="48"
              cy="48"
              r={radius}
              className="stroke-[#2A2A2A] fill-none"
              strokeWidth="6"
            />
            <circle
              cx="48"
              cy="48"
              r={radius}
              className={`fill-none ${getRiskScoreColor(data.global_risk_score).split(" ")[1]} transition-all duration-1000 ease-out`}
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className={`text-2xl font-bold ${getRiskScoreColor(data.global_risk_score).split(" ")[0]}`}>
              {data.global_risk_score}
            </span>
            <span className="text-[10px] text-[#888] uppercase tracking-wider">Score</span>
          </div>
        </div>

        {/* Customer Details & AI Synthesis */}
        <div className="flex-1 pt-1">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">{data.name}</h2>
              <div className="text-xs text-[#888] mt-0.5 font-mono">
                {data.type} · ID: {data.customer_id}
              </div>
            </div>
            <div className="px-2.5 py-1 rounded bg-[#37b7ab]/10 border border-[#37b7ab]/20 text-[#37b7ab] text-[11px] font-bold uppercase tracking-wider">
              360 Profile
            </div>
          </div>
          
          <div className="mt-3 bg-[#111] border border-[#222] rounded-lg p-3 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#37b7ab] to-transparent opacity-50" />
            <p className="text-sm text-[#D1D1D1] leading-relaxed">
              {data.ai_synthesis}
            </p>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="p-5 grid grid-cols-2 gap-3 bg-[#0A0A0A]">
        {products.map((product) => {
          const Icon = product.icon
          const status = product.data.status
          return (
            <div 
              key={product.key}
              className="group p-4 rounded-xl bg-[#141414] border border-[#222] hover:border-[#333] hover:bg-white/[0.02] transition-all duration-300 relative overflow-hidden"
            >
              {/* Subtle hover gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-[#EAEAEA]">
                  <Icon size={16} className="text-[#888] group-hover:text-[#AAA] transition-colors" />
                  <span className="text-sm font-medium">{product.label}</span>
                </div>
                
                <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded border text-[10px] font-bold tracking-wide ${getStatusColor(status)}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${getStatusDot(status)} animate-pulse`} />
                  {status}
                </div>
              </div>
              
              <div className="relative flex items-center justify-between mt-2 pt-2 border-t border-white/[0.05]">
                <span className="text-[11px] text-[#666]">Last Verified</span>
                <span className="text-xs text-[#AAA] font-mono">{product.data.last_verified}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
