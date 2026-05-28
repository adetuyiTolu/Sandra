"use client"

import { AlertTriangle, RotateCcw } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex h-full items-center justify-center bg-[#f4f5f4] p-6">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-5 shadow-premium">
        <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-md bg-red-50 text-red-600">
          <AlertTriangle size={18} />
        </div>
        <h2 className="text-base font-semibold text-gray-950">Sandra hit a rendering issue</h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          The workspace could not finish loading. Try refreshing this view.
        </p>
        {error.digest && (
          <p className="mt-3 text-xs font-mono text-gray-400">Digest: {error.digest}</p>
        )}
        <button
          onClick={reset}
          className="mt-5 inline-flex items-center gap-2 rounded-md bg-[#37b7ab] px-3 py-2 text-xs font-semibold text-white hover:bg-[#37b7ab]/90"
        >
          <RotateCcw size={14} />
          Retry
        </button>
      </div>
    </div>
  )
}
