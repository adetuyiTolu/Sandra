"use client"

import "./globals.css"

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body className="bg-[#f4f5f4]">
        <main className="flex min-h-screen items-center justify-center p-6">
          <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-5 shadow-premium">
            <div className="text-base font-semibold text-gray-950">Sandra could not load</div>
            <p className="mt-2 text-sm text-gray-600">
              A top-level rendering error interrupted the app shell.
            </p>
            <button
              onClick={reset}
              className="mt-5 rounded-md bg-[#37b7ab] px-3 py-2 text-xs font-semibold text-white hover:bg-[#37b7ab]/90"
            >
              Retry
            </button>
          </div>
        </main>
      </body>
    </html>
  )
}
