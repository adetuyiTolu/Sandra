"use client"

import { useState } from "react"
import { Search, Filter, MoreHorizontal, X } from "lucide-react"
import { Customer360Profile } from "@/lib/types"
import { Customer360Card } from "@/components/customers/Customer360Card"

// Mock data for the directory
const mockCustomers: Customer360Profile[] = [
  {
    customer_id: "CUST-88392",
    name: "Greenfield Corp",
    type: "BUSINESS",
    global_risk_score: 82,
    ai_synthesis: "Greenfield Corp shows a high risk score due to a recent AML watchlist hit (Medium Confidence) and 3 suspicious transactions flagged for velocity anomalies in the last 48 hours. Enhanced Due Diligence (EDD) is strongly recommended.",
    products: {
      identity: { status: "GREEN", last_verified: "2023-10-12" },
      background: { status: "AMBER", last_verified: "2023-10-13" },
      fraud: { status: "RED", last_verified: "2023-10-15" },
      txn_monitoring: { status: "RED", last_verified: "2023-10-15" },
      aml: { status: "AMBER", last_verified: "2023-10-14" },
      vault: { status: "GREEN", last_verified: "2023-10-12" },
    }
  },
  {
    customer_id: "CUST-99201",
    name: "Adebayo Johnson",
    type: "INDIVIDUAL",
    global_risk_score: 12,
    ai_synthesis: "Customer has a low risk profile. Identity and background checks passed successfully. Transaction patterns are consistent with expected behavior for this account type.",
    products: {
      identity: { status: "GREEN", last_verified: "2023-11-01" },
      background: { status: "GREEN", last_verified: "2023-11-01" },
      fraud: { status: "GREEN", last_verified: "2023-11-05" },
      txn_monitoring: { status: "GREEN", last_verified: "2023-11-05" },
      aml: { status: "GREEN", last_verified: "2023-11-01" },
      vault: { status: "GREEN", last_verified: "2023-11-01" },
    }
  },
  {
    customer_id: "CUST-44102",
    name: "Nexa Tech Solutions",
    type: "BUSINESS",
    global_risk_score: 45,
    ai_synthesis: "Moderate risk profile. Some company directors have missing documentation in the Vault, and background checks are pending completion. Operational volume is normal.",
    products: {
      identity: { status: "GREEN", last_verified: "2023-09-20" },
      background: { status: "AMBER", last_verified: "2023-09-22" },
      fraud: { status: "GREEN", last_verified: "2023-10-01" },
      txn_monitoring: { status: "GREEN", last_verified: "2023-10-01" },
      aml: { status: "GREEN", last_verified: "2023-09-21" },
      vault: { status: "AMBER", last_verified: "2023-09-25" },
    }
  }
]

export default function Customer360Directory() {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer360Profile | null>(null)
  
  const getRiskScoreColor = (score: number) => {
    if (score < 30) return "text-emerald-400 border border-emerald-500/20 bg-emerald-500/10"
    if (score < 70) return "text-amber-400 border border-amber-500/20 bg-amber-500/10"
    return "text-rose-400 border border-rose-500/20 bg-rose-500/10"
  }

  const getActionText = (score: number) => {
    if (score < 30) return "No Action Needed"
    if (score < 70) return "Awaiting Vault Docs"
    return "Review AML Hit"
  }

  return (
    <div className="flex h-screen bg-[#050505] text-[#EAEAEA] overflow-hidden relative">
      <main className="flex-1 flex flex-col min-w-0">
        
        <header className="px-6 py-4 border-b border-[#222222] flex items-center justify-between shrink-0 bg-[#0A0A0A]">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Customer Directory</h1>
            <p className="text-sm text-[#888888] mt-0.5">Manage and view 360 profiles for all enrolled customers.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#777]" />
              <input 
                type="text" 
                placeholder="Search customers..." 
                className="w-64 bg-[#141414] border border-[#222222] rounded-md py-1.5 pl-9 pr-3 text-sm text-white placeholder:text-[#666] focus:outline-none focus:border-[#444] transition-colors"
              />
            </div>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-[#141414] border border-[#222222] rounded-md text-sm hover:bg-[#1A1A1A] transition-colors">
              <Filter size={14} className="text-[#888]" />
              Filter
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6">
          <div className="rounded-xl border border-[#222222] overflow-hidden bg-[#0A0A0A] shadow-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#111] border-b border-[#222]">
                  <th className="px-5 py-3 text-xs font-semibold text-[#888] uppercase tracking-wider">Customer / Entity</th>
                  <th className="px-5 py-3 text-xs font-semibold text-[#888] uppercase tracking-wider">Type</th>
                  <th className="px-5 py-3 text-xs font-semibold text-[#888] uppercase tracking-wider">Risk Score</th>
                  <th className="px-5 py-3 text-xs font-semibold text-[#888] uppercase tracking-wider">Next Action</th>
                  <th className="px-5 py-3 text-xs font-semibold text-[#888] uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222]">
                {mockCustomers.map((customer, i) => (
                  <tr key={customer.customer_id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-white">{customer.name}</div>
                      <div className="text-xs text-[#777] mt-0.5 font-mono">{customer.customer_id}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-[11px] font-bold px-2 py-1 rounded bg-white/5 border border-white/10 text-[#AAA]">
                        {customer.type}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-bold ${getRiskScoreColor(customer.global_risk_score)}`}>
                        {customer.global_risk_score}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-[#CCC]">
                        {getActionText(customer.global_risk_score)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button 
                        onClick={() => setSelectedCustomer(customer)}
                        className="px-3 py-1.5 bg-[#37b7ab]/10 border border-[#37b7ab]/20 text-[#37b7ab] text-xs font-semibold rounded hover:bg-[#37b7ab]/20 transition-colors"
                      >
                        View 360
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Slide-over panel for Customer 360 */}
      <div 
        className={`absolute inset-y-0 right-0 w-[500px] bg-[#0A0A0A] border-l border-[#222] shadow-2xl transform transition-transform duration-300 ease-in-out z-50 flex flex-col ${
          selectedCustomer ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {selectedCustomer && (
          <>
            <div className="px-6 py-4 border-b border-[#222] flex items-center justify-between bg-[#111]">
              <h2 className="text-lg font-bold text-white tracking-tight">Customer 360 View</h2>
              <button 
                onClick={() => setSelectedCustomer(null)}
                className="p-1.5 rounded-md hover:bg-white/10 text-[#888] hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 sidebar-scrollbar">
              <Customer360Card data={selectedCustomer} />
            </div>
          </>
        )}
      </div>

      {/* Backdrop */}
      {selectedCustomer && (
        <div 
          className="absolute inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={() => setSelectedCustomer(null)}
        />
      )}
    </div>
  )
}
