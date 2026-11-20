"use client"

import { CopyIcon, RefreshCcwIcon } from "lucide-react"
import type { UIMessage } from "ai"
import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message"

type ChatMessageProps = {
  message: UIMessage
  isLastAssistantMessage: boolean
  onRetry: () => void
  canRetry: boolean
}

export function ChatMessage({
  message,
  isLastAssistantMessage,
  onRetry,
  canRetry,
}: ChatMessageProps) {
  const text = message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("")

  return (
    <div className="w-full">
      <Message
        from={message.role}
        className={
          message.role === "assistant"
            ? "max-w-full"
            : "max-w-[92%] sm:max-w-[85%]"
        }
      >
        <MessageContent className="max-w-full min-w-0 break-words">
          {text ? (
            <MessageResponse isAnimating={false}>
              {text}
            </MessageResponse>
          ) : null}
        </MessageContent>
      </Message>

      {message.role === "assistant" && isLastAssistantMessage && text ? (
        <MessageActions className="mt-1">
          <MessageAction
            tooltip="Retry"
            label="Retry"
            onClick={onRetry}
            disabled={!canRetry}
          >
            <RefreshCcwIcon />
          </MessageAction>
          <MessageAction
            tooltip="Copy"
            label="Copy"
            onClick={() => void navigator.clipboard.writeText(text)}
          >
            <CopyIcon />
          </MessageAction>
        </MessageActions>
      ) : null}
    </div>
  )
}
