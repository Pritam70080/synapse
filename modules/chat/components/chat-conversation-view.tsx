"use client"

import { useMemo, useState } from "react"
import type { UIMessage } from "ai"
import { useChatMessages } from "@/modules/chat/hooks/use-chat-messages"
import { ChatMessageList } from "@/modules/chat/components/message/chat-message-list"
import { ChatMessageForm } from "@/modules/chat/components/chat-message-form"

export type StoredChatMessage = {
  id: string
  messageRole: "USER" | "ASSISTANT" | "SYSTEM"
  content: string
  createdAt: string
}

type ChatConversationViewProps = {
  chatId: string
  model: string
  messages: StoredChatMessage[]
  autoTrigger: boolean
}

function storedMessageToUIMessage(message: StoredChatMessage): UIMessage {
  try {
    const parsed: unknown = JSON.parse(message.content)
    if (Array.isArray(parsed)) {
      const textParts = parsed.filter(
        (part): part is { type: "text"; text: string } =>
          typeof part === "object" &&
          part !== null &&
          "type" in part &&
          part.type === "text" &&
          "text" in part &&
          typeof part.text === "string",
      )
      if (textParts.length > 0) {
        return {
          id: message.id,
          role: message.messageRole.toLowerCase() as UIMessage["role"],
          parts: textParts,
        }
      }
    }
  } catch {
  }

  return {
    id: message.id,
    role: message.messageRole.toLowerCase() as UIMessage["role"],
    parts: [{ type: "text", text: message.content }],
  }
}

export function ChatConversationView({
  chatId,
  model: initialModel,
  messages,
  autoTrigger,
}: ChatConversationViewProps) {
  const [message, setMessage] = useState("")
  const [selectedModel, setSelectedModel] = useState(initialModel)
  const initialMessages = useMemo(
    () => messages.map(storedMessageToUIMessage),
    [messages],
  )

  const chat = useChatMessages({
    chatId,
    model: selectedModel,
    initialMessages,
    autoTrigger,
  })

  const sendMessage = async (text: string) => {
    await chat.sendMessage({ text })
  }

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden">
      <ChatMessageList
        messages={chat.messages}
        onRetry={() => void chat.regenerate()}
        canRetry={chat.status === "ready" || chat.status === "error"}
        isThinking={
          chat.status === "submitted" ||
          (chat.status === "streaming" &&
            !chat.messages.some(
              (message) =>
                message.role === "assistant" &&
                message.parts.some(
                  (part) => part.type === "text" && part.text.length > 0,
                ),
            ))
        }
      />
      <ChatMessageForm
        chatId={chatId}
        initialModel={selectedModel}
        message={message}
        onMessageChange={setMessage}
        onModelChange={setSelectedModel}
        onSendMessage={sendMessage}
        onStopMessage={chat.stop}
        status={chat.status}
      />
    </div>
  )
}
