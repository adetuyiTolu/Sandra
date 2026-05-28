export default function Loading() {
  return (
    <div className="flex h-full items-center justify-center bg-[#0A0A0A] animate-in fade-in duration-300">
      <div className="glass-panel px-6 py-4 rounded-2xl flex flex-col items-center gap-3 shadow-premium border border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex space-x-1.5">
            <div className="w-2 h-2 rounded-full bg-[#37b7ab] animate-pulse shadow-[0_0_8px_rgba(55,183,171,0.8)]" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-[#37b7ab] animate-pulse shadow-[0_0_8px_rgba(55,183,171,0.8)]" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 rounded-full bg-[#37b7ab] animate-pulse shadow-[0_0_8px_rgba(55,183,171,0.8)]" style={{ animationDelay: '300ms' }} />
          </div>
          <span className="text-sm font-semibold text-[#EAEAEA] tracking-tight">Sandra Workspace</span>
        </div>
        <div className="text-[10px] text-[#555555] font-mono tracking-widest uppercase">Connecting to Intelligence Layer</div>
      </div>
    </div>
  )
}
