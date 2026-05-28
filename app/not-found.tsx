import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex h-full items-center justify-center bg-[#f4f5f4] p-6">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-5 shadow-premium">
        <div className="text-sm font-semibold text-[#37b7ab]">404</div>
        <h2 className="mt-2 text-base font-semibold text-gray-950">Page not found</h2>
        <p className="mt-2 text-sm text-gray-600">
          This Sandra workspace route does not exist.
        </p>
        <Link
          href="/chat"
          className="mt-5 inline-flex rounded-md bg-[#37b7ab] px-3 py-2 text-xs font-semibold text-white hover:bg-[#37b7ab]/90"
        >
          Open control center
        </Link>
      </div>
    </div>
  )
}
