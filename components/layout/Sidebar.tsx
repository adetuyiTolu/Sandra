"use client"

import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import {
  Bell,
  Cpu,
  ChevronDown,
  ChevronRight,
  Circle,
  Command,
  DollarSign,
  FileText,
  LayoutGrid,
  MessageSquare,
  Settings,
  ShieldCheck,
  Zap,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

type NavItem = {
  label: string
  href?: string
  icon?: any
  badge?: string
  collapsible?: boolean
  count?: number // for Connected Agents
  isAgent?: boolean
  children?: NavItem[]
}

type NavSection = {
  title?: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    items: [
      { label: "Home", href: "/home", icon: Command }
    ]
  },
  {
    title: "SANDRA AI",
    items: [
      { label: "Chat", href: "/chat", icon: MessageSquare },
      { label: "Operations", href: "/operations", icon: LayoutGrid },
      { label: "Alerts", href: "/alerts", icon: Bell, badge: "3" },
      { label: "Customer 360", href: "/customer-360", icon: Cpu },
      {
        label: "Connected Agents",
        isAgent: true,
        collapsible: true,
        count: 2,
        children: [
          { label: "Compliance Agent", badge: "NG · KE · US · EU" },
          { label: "Fraud Intelligence", badge: "Pattern analysis · bank graph" },
        ]
      }
    ]
  },
  {
    title: "TOOLS",
    items: [
      {
        label: "Verification",
        icon: ShieldCheck,
        collapsible: true,
        children: [
          { label: "KYC", href: "/verification/kyc" },
          { label: "KYB", href: "/verification/kyb" },
          { label: "AML Screening", href: "/verification/aml" },
          { label: "Background check", href: "/verification/background" },
        ]
      },
      {
        label: "Fraud Detection",
        icon: Zap,
        collapsible: true,
        children: [
          { label: "Fraud Bank", href: "/fraud/bank" },
          { label: "Fraud Scan", href: "/fraud/scan" },
          {
            label: "Transaction Monitoring",
            collapsible: true,
            children: [
              { label: "Overview", href: "/fraud/tm/overview" },
              { label: "History", href: "/fraud/tm/history" },
              { label: "Data", href: "/fraud/tm/data" },
            ]
          }
        ]
      },
      {
        label: "Case Management",
        icon: FileText,
        collapsible: true,
        children: [
          { label: "Overview", href: "/cases/overview" },
          { label: "Cases", href: "/cases/list" },
        ]
      },
      {
        label: "Reports & Finance",
        icon: DollarSign,
        collapsible: true,
        children: [
          { label: "Verification Reports", href: "/reports/verification" },
          { label: "SDK Reports", href: "/reports/sdk" },
          { label: "Billing", href: "/finance/billing" },
        ]
      }
    ]
  },
  {
    title: "CONFIGURE",
    items: [
      { label: "Workflows", href: "/workflows", icon: Zap },
      { label: "SDK Flow", href: "/sdk-flow", icon: FileText },
      {
        label: "Fraud Rules",
        icon: ShieldCheck,
        collapsible: true,
        children: [
          { label: "Rules", href: "/fraud-rules/rules" },
          { label: "Escalation Configs", href: "/fraud-rules/escalation" },
        ]
      },
      {
        label: "AML Configuration",
        icon: ShieldCheck,
        collapsible: true,
        children: [
          { label: "Rules", href: "/aml/rules" },
          { label: "Rule Groups", href: "/aml/rule-groups" },
          { label: "Scoring Threshold", href: "/aml/scoring" },
          { label: "Upload Records", href: "/aml/upload" },
        ]
      }
    ]
  },
  {
    title: "PLATFORM",
    items: [
      { label: "API Integrations", href: "/platform/api", icon: Command },
      { label: "API Status", href: "/platform/status", icon: Zap },
    ]
  }
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set())
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  useEffect(() => {
    const handleToggle = () => setIsMobileOpen(prev => !prev)
    window.addEventListener('sandra:toggle-menu', handleToggle)
    return () => window.removeEventListener('sandra:toggle-menu', handleToggle)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    setOpenCategories(prev => {
      const newOpen = new Set(prev)
      let changed = false

      const traverse = (items: NavItem[], parentLabels: string[]) => {
        for (const item of items) {
          if (item.href && (pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`)))) {
            parentLabels.forEach(l => {
              if (!newOpen.has(l)) {
                newOpen.add(l)
                changed = true
              }
            })
          }
          if (item.children) {
            traverse(item.children, [...parentLabels, item.label])
          }
        }
      }

      navSections.forEach(section => traverse(section.items, []))

      return changed ? newOpen : prev
    })
  }, [pathname])

  function toggleCategory(cat: string) {
    setOpenCategories((prev) => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }

  const renderNavItem = (item: NavItem, depth = 0) => {
    if (!item.collapsible && depth === 0) {
      const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`))
      const Icon = item.icon || Command
      return (
        <button
          key={item.href || item.label}
          onClick={() => item.href && router.push(item.href)}
          className={cn(
            "flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors w-full text-left",
            active
              ? "glass-panel shadow-premium text-white border border-white/5"
              : "hover:bg-white/5 text-[#888888] hover:text-[#EAEAEA]"
          )}
        >
          <Icon size={16} className={active ? "text-[#37b7ab]" : "text-[#858585]"} />
          <span className="font-medium">{item.label}</span>
          {item.badge && (
            <span className="ml-auto text-[10px] font-bold bg-[#37b7ab] text-white rounded-full px-1.5 py-0.5 leading-none">
              {item.badge}
            </span>
          )}
        </button>
      )
    }

    if (item.collapsible) {
      const isOpen = openCategories.has(item.label)
      
      if (item.isAgent) {
        return (
          <div key={item.label}>
            <button
              onClick={() => toggleCategory(item.label)}
              className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md w-full text-left text-[#a3a3a3] hover:text-white hover:bg-white/5 transition-colors"
            >
              <Circle size={8} className="fill-[#37b7ab] text-[#37b7ab] pulse-dot" />
              <span className="text-xs font-medium flex-1">{item.label}</span>
              {item.count && <span className="text-[10px] text-[#707070] font-mono">{item.count}</span>}
              {isOpen ? <ChevronDown size={12} className="text-[#777]" /> : <ChevronRight size={12} className="text-[#777]" />}
            </button>
            {isOpen && item.children && (
              <div className="ml-7 my-1 flex flex-col gap-2 py-1">
                {item.children.map((child) => (
                  <div key={child.label}>
                    <div className="flex items-center gap-2">
                      <Circle size={7} className="fill-[#37b7ab] text-[#37b7ab] pulse-dot" />
                      <span className="text-xs text-[#d6d6d6]">{child.label}</span>
                    </div>
                    <div className="ml-4 mt-0.5 text-[10px] text-[#777] font-mono">{child.badge}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      }

      const Icon = item.icon
      return (
        <div key={item.label}>
          <button
            onClick={() => toggleCategory(item.label)}
            className={cn(
              "flex items-center gap-2.5 px-2.5 py-1.5 rounded-md w-full text-left transition-colors",
              depth === 0 ? "text-[#a3a3a3] hover:text-white hover:bg-white/5" : "text-[#858585] hover:text-[#dcdcdc] hover:bg-white/5"
            )}
          >
            {Icon && depth === 0 && <Icon size={14} className={isOpen ? "text-[#37b7ab]" : "text-[#777]"} />}
            <span className={cn(
              "flex-1", 
              depth === 0 ? "text-xs font-medium" : "text-[11px] font-mono"
            )}>{item.label}</span>
            {isOpen ? <ChevronDown size={12} className="text-[#777]" /> : <ChevronRight size={12} className="text-[#777]" />}
          </button>
          {isOpen && item.children && (
            <div className={cn("my-1 flex flex-col gap-0.5", depth === 0 ? "ml-7" : "ml-2")}>
              {item.children.map((child) => renderNavItem(child, depth + 1))}
            </div>
          )}
        </div>
      )
    }

    if (item.href && !item.collapsible && depth > 0) {
      const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`))
      return (
        <button
          key={item.href || item.label}
          onClick={() => item.href && router.push(item.href)}
          className={cn(
            "px-2 py-1 text-[11px] font-mono rounded text-left transition-colors",
            active
              ? "text-[#37b7ab] bg-white/5 border border-white/5"
              : "text-[#858585] hover:text-[#dcdcdc] hover:bg-white/5"
          )}
        >
          {item.label}
        </button>
      )
    }

    return null
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside className={cn(
        "fixed md:static inset-y-0 left-0 z-50 w-[260px] shrink-0 h-screen flex flex-col overflow-hidden bg-[#050505] border-r border-white/5 text-[#EAEAEA] transition-transform duration-300 ease-in-out",
        isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="px-3 py-4 flex items-center justify-between">
          <div className="flex items-center rounded-md px-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 5813.7 1796.3" style={{ height: "22px", width: "71px" }} aria-label="Prembly">
            <g><path fill="#37b7ab" d="M1132.3,606.3c-9.5-221.7-260.8-418.1-547-427.6H65.2l-20.4-24.9h-12.8v452.5c0,231.2,254.5,418.1,550.1,427.6,289.4-9.5,540.7-205.7,550.2-427.6Z"></path><path fill="#37b7ab" d="M307.8,1584.4c-111.2-6.1-208.4-132.3-211.4-274.9l3.1-261.3-7.9-8v-6.3l222.7,2.6c116.1,1.4,208.4,129.2,211.4,276.5-6.5,144.1-106.6,268-217.9,271.4Z"></path></g>
            <path fill="#37b7ab" d="M2031.8,701c24.5,47.1,36.8,102.3,36.8,165.6s-12.3,116.1-36.8,163.2c-22.9,45.3-58.4,83.2-102.1,109.1-43.5,25.7-92.9,38.6-148.3,38.5-45.1,0-84.3-8.3-117.5-24.9-31.8-15.4-59.2-38.7-79.5-67.6v322.6h-128.3v-844.8h111.6l15.5,90.2c49.1-64.9,115.2-97.4,198.3-97.4,55.4,0,104.8,12.5,148.3,37.4,43.8,25.3,79.3,62.9,102,108.1ZM1938.1,866.5c0-60.1-16.4-108.8-49.3-146-32.8-37.2-75.8-55.8-128.7-55.9-53,0-95.8,18.4-128.2,55.2-32.4,36.8-48.6,84.9-48.5,144.4,0,61,16.2,110.4,48.6,148.3s75.1,56.9,128.2,57c53,0,95.9-19,128.7-57,32.9-38,49.3-86.6,49.2-146Z"></path>
            <path fill="#37b7ab" d="M2478.1,682.8h-56.9c-53,0-91.4,17.2-115.1,51.7-23.7,34.4-35.6,78.1-35.6,131.1v305h-128.1v-607.9h113.9l14.2,91.4c16.6-27.7,39.9-50.7,67.7-67.1,27.7-16.2,64.8-24.3,111.6-24.3h28.4l-.1,120.1Z"></path>
            <path fill="#37b7ab" d="M2621.1,594.2c44.7-25.7,95.9-38.6,153.7-38.6s110.2,11.9,154.9,35.6c44,23,80.6,57.9,105.7,100.7,25.7,43.5,38.9,94.6,39.7,153.1,0,16.3-1.2,32.6-3.5,48.7h-458.1v7.3c3,53,19.7,94.9,50,125.8s70.2,46.3,119.8,46.3c39.6,0,72.8-9.3,99.7-27.9,27-18.7,46-46.9,53.4-78.9h128.1c-10,60-42,114.1-89.6,151.9-48.7,39.4-109.4,59.1-182.2,59.1-63.3,0-118.5-12.8-165.5-38.5-46.1-24.9-84-62.6-109.1-108.6-25.7-46.7-38.5-100.9-38.5-162.6s12.5-117.2,37.4-164.3c23.5-45.7,59.6-83.5,104.1-109.1ZM2891.7,696.4c-29.7-25-67.1-37.4-112.2-37.4-39.7-.8-78.3,12.9-108.6,38.6-30.4,25.7-48,59.9-52.8,102.7h326.4c-5.6-44.4-23.2-79-52.8-103.9Z"></path>
            <path fill="#37b7ab" d="M4075.4,827.4v343h-128.1v-341.8c0-53-10.7-93.4-32-121.1-21.4-27.7-53-41.5-94.9-41.5-44.3,0-79.3,15.6-105.1,46.9-25.8,31.2-38.6,74.2-38.5,129v328.7h-129.4v-342c0-53.8-10.9-94.4-32.6-121.7-21.8-27.3-53.6-40.9-95.4-40.9s-78.1,16.2-103.8,48.7c-25.7,32.4-38.6,76-38.6,130.5v325.2h-128.2v-607.7h111.6l14.3,79.5c43.5-57,102.8-85.9,178-86.7,42.7,0,80.3,9.1,112.7,27.3s57.4,45.9,74.8,83.1c20.5-34,49.6-62,84.3-81.3,34.8-19.4,76.7-29.1,125.8-29.1,66.5,0,120.7,21.6,162.6,64.7,41.6,43.2,62.6,112.3,62.5,207.2Z"></path>
            <path fill="#37b7ab" d="M4737.7,700.4c24.5,46.7,36.8,102,36.8,166.1s-12.3,115-36.8,162c-23,45.5-58.4,83.5-102.1,109.8-43.5,26.1-93,39.1-148.4,39.1-45.1,0-84.2-8.5-117.5-25.5-32.2-16.1-59.9-39.9-80.7-69.3l-15.4,87.8h-111.6V339.6h128.1v313.4c48.3-64.9,113.9-97.4,197-97.4,55.4,0,104.8,12.5,148.4,37.4,43.8,25.1,79.3,62.4,102.2,107.4ZM4643.9,866.5c0-59.3-16.4-107.8-49.3-145.4-32.8-37.7-75.8-56.5-128.8-56.5s-95.7,18.6-128.1,55.8-48.7,85.4-48.7,144.8,16.2,109.2,48.7,147.1c32.4,38,75.2,57,128.1,57s96-18.8,128.8-56.3c32.9-37.6,49.3-86.4,49.3-146.5h0Z"></path>
            <path fill="#37b7ab" d="M4976.2,339.6v830.8h-128.2V339.6h128.2Z"></path>
            <path fill="#37b7ab" d="M5341.5,1031.5l165-468.7h136.3l-275.3,702.6c-10.7,28.9-23.8,56.9-39.1,83.7-10.6,18.2-25.8,33.3-43.9,43.9-17.4,9.9-40.7,14.9-70,14.9h-137.7v-112.9h90.2c24.5,0,41.6-3.8,51-11.3,9.5-7.5,19.4-24.3,29.7-50.4l24.9-58.2-237.4-612.3h136.3l170,468.7Z"></path>
          </svg>
        </div>
        <button 
          className="md:hidden text-[#888] hover:text-[#EAEAEA] p-1 transition-colors"
          onClick={() => setIsMobileOpen(false)}
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto sidebar-scrollbar px-3 py-3 flex flex-col gap-1">
        {navSections.map((section, idx) => (
          <div key={idx} className={cn("flex flex-col gap-1", idx > 0 && section.title ? "mt-4" : "")}>
            {section.title && (
              <div className="px-2.5 mb-1 text-[11px] font-semibold text-[#777] uppercase tracking-wider">
                {section.title}
              </div>
            )}
            <div className="flex flex-col gap-0.5">
               {section.items.map(item => renderNavItem(item))}
            </div>
          </div>
        ))}
      </div>

      <div className="px-3 py-3 border-t border-white/5 flex flex-col gap-1">
        <button className="flex items-center gap-2.5 px-2.5 py-2 text-[#a3a3a3] hover:text-white hover:bg-white/5 rounded-md transition-colors w-full text-sm">
          <Settings size={15} className="text-[#858585]" />
          <span>Settings</span>
        </button>
        <button className="flex items-center gap-2.5 px-2.5 py-2 text-[#a3a3a3] hover:text-white hover:bg-white/5 rounded-md transition-colors w-full text-sm">
          <div className="w-[15px]" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
    </>
  )
}
