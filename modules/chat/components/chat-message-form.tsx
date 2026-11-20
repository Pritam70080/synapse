"use client"

import { useState } from "react"
import { ArrowUp, LoaderCircle, Square } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/ui/sidebar"
import { Textarea } from "@/components/ui/textarea"
import { ModelSelector } from "@/modules/chat/components/model-selector"
import { useCreateChat } from "@/modules/chat/hooks/use-chats"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { ChatStatus } from "ai"

type ChatMessageFormProps = {
  message: string
  onMessageChange: (message: string) => void
  chatId?: string
  initialModel?: string
  onModelChange?: (model: string) => void
  onSendMessage?: (message: string, model: string) => Promise<void>
  onStopMessage?: () => void
  status?: ChatStatus
}

export function ChatMessageForm({
  message,
  onMessageChange,
  chatId,
  initialModel = "",
  onModelChange,
  onSendMessage,
  onStopMessage,
  status = "ready",
}: ChatMessageFormProps) {
  const [selectedModel, setSelectedModel] = useState(initialModel)
  const { isMobile, state } = useSidebar()
  const createChat = useCreateChat()
  const left = !isMobile && state === "expanded" ? "var(--sidebar-width)" : "0px"

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const content = message.trim()
    if (!content || createChat.isPending) return

    if (!selectedModel) {
      return
    }

    if (chatId && onSendMessage) {
      void onSendMessage(content, selectedModel).then(() => {
        onMessageChange("")
      })
      return
    }

    createChat.mutate(
      { model: selectedModel, content },
      {
        onSuccess: (result) => {
          if (result.success) onMessageChange("")
        },
      },
    )
  }

  const canSend =
    message.trim().length > 0 &&
    !createChat.isPending &&
    (chatId ? status === "ready" : true)
  const isChatActive =
    chatId && (status === "submitted" || status === "streaming")

  return (
    <div
      className="pointer-events-none fixed right-0 bottom-0 z-20 max-w-full px-3 pb-4 pt-6 sm:px-8 sm:pb-8 sm:pt-10"
      style={{ left }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-t from-background via-background/90 to-transparent"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 5%, black 95%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 5%, black 95%, transparent)",
        }}
      />
      <form
        aria-label="Start a chat"
        onSubmit={handleSubmit}
        className="pointer-events-auto mx-auto max-w-3xl rounded-3xl border border-border bg-card/90 p-2 shadow-lg backdrop-blur-xl"
      >
        <Textarea
          aria-label="Message"
          placeholder="Message Synapse..."
          rows={1}
          value={message}
          onChange={(event) => onMessageChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault()
              event.currentTarget.form?.requestSubmit()
            }
          }}
          className="chat-message-textarea min-h-9 max-h-[40vh] overflow-y-auto rounded-2xl border-0 bg-transparent px-3 py-1 text-base shadow-none focus-visible:ring-0 dark:bg-transparent"
        />

        <div className="mt-1 flex items-center justify-between gap-3">
          <ModelSelector
            value={selectedModel}
            onValueChange={(model) => {
              setSelectedModel(model)
              onModelChange?.(model)
            }}
          />

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type={isChatActive ? "button" : "submit"}
                  size="icon"
                  disabled={isChatActive ? false : !canSend}
                  onClick={
                    isChatActive
                      ? (event) => {
                          event.preventDefault()
                          onStopMessage?.()
                        }
                      : undefined
                  }
                  aria-label={
                    createChat.isPending
                      ? "Creating chat"
                      : isChatActive
                        ? "Stop generating"
                      : "Send message"
                  }
                >
                  {createChat.isPending ? (
                    <LoaderCircle
                      className="animate-spin"
                      aria-hidden="true"
                    />
                  ) : isChatActive ? (
                    <Square className="size-3.5 fill-current" aria-hidden="true" />
                  ) : (
                    <ArrowUp aria-hidden="true" />
                  )}
                </Button>
              }
            />
            <TooltipContent side="top">
              {createChat.isPending
                ? "Creating chat..."
                : isChatActive
                  ? "Stop generating"
                : "Send message"}
            </TooltipContent>
          </Tooltip>
        </div>
      </form>
    </div>
  )
}
