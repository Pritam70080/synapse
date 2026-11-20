"use client"

import { useState } from "react"
import { ChatMessageForm } from "@/modules/chat/components/chat-message-form"
import { ChatWelcomeTabs } from "@/modules/chat/components/chat-welcome-tabs"

type ChatMessageViewProps = {
  userName: string | null | undefined
}

export function ChatMessageView({ userName }: ChatMessageViewProps) {
  const [message, setMessage] = useState("")

  return (
    <div className="mx-auto w-full max-w-3xl space-y-16 sm:space-y-32">
      <ChatWelcomeTabs
        userName={userName}
        onMessageSelect={setMessage}
      />
      <ChatMessageForm message={message} onMessageChange={setMessage} />
    </div>
  )
}

