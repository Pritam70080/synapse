"use client"

import type { UIMessage } from "ai"
import { MessageSquareText } from "lucide-react"
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation"
import { Shimmer } from "@/components/ai-elements/shimmer"
import { ChatMessage } from "./chat-message"

type ChatMessageListProps = {
  messages: UIMessage[]
  onRetry: () => void
  canRetry: boolean
  isThinking?: boolean
}

export function ChatMessageList({
  messages,
  onRetry,
  canRetry,
  isThinking = false,
}: ChatMessageListProps) {
  const lastAssistantIndex = messages.findLastIndex(
    (message) => message.role === "assistant",
  )

  return (
    <Conversation className="min-h-0">
      <ConversationContent className="mx-auto w-full min-w-0 max-w-3xl gap-6 px-3 pb-36 pt-4 sm:px-6 sm:pb-40 sm:pt-8">
        {messages.length === 0 ? (
          <ConversationEmptyState
            icon={<MessageSquareText className="size-10" />}
            title="Start a conversation"
            description="Send a message to begin chatting."
          />
        ) : (
          <>
            {messages.map((message, index) => (
              <ChatMessage
                key={message.id}
                message={message}
                isLastAssistantMessage={
                  message.role === "assistant" && index === lastAssistantIndex
                }
                onRetry={onRetry}
                canRetry={canRetry}
              />
            ))}
            {isThinking ? (
              <div className="w-full" aria-live="polite">
                <Shimmer className="text-sm font-medium">
                  Synapse is thinking
                </Shimmer>
              </div>
            ) : null}
          </>
        )}
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  )
}
