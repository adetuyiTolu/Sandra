import type { Metadata } from "next"
import { SandraHeader } from "@/components/layout/SandraHeader"
import { ChatWindow } from "@/components/chat/ChatWindow"

export const metadata: Metadata = {
  title: "Conversations — Sandra AI",
  description: "Converse with Sandra AI for KYC investigations, AML screening, compliance reasoning, and fraud analysis.",
}

export default function ChatPage() {
  return (
    <div className="flex flex-col h-full">
      <SandraHeader
        title="Conversations"
        subtitle="Ask Sandra anything about your verification, compliance, or fraud stack"
      />
      <div className="flex-1 overflow-hidden">
        <ChatWindow />
      </div>
    </div>
  )
}
