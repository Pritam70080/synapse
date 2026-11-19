"use client"

import { useState } from "react"
import { ArrowUp, LoaderCircle } from "lucide-react"
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

type ChatMessageFormProps = {
  message: string
  onMessageChange: (message: string) => void
}

export function ChatMessageForm({
  message,
  onMessageChange,
}: ChatMessageFormProps) {
  const [selectedModel, setSelectedModel] = useState("")
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
    !createChat.isPending

  return (
    <div
      className="pointer-events-none fixed right-0 bottom-0 z-20 px-4 pb-8 pt-10 sm:px-8"
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
          className="chat-message-textarea min-h-9 max-h-[40vh] overflow-y-auto rounded-2xl border-0 bg-transparent px-3 py-1 text-base shadow-none focus-visible:ring-0 dark:bg-transparent"
        />

        <div className="mt-1 flex items-center justify-between gap-3">
          <ModelSelector
            value={selectedModel}
            onValueChange={setSelectedModel}
          />

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="submit"
                  size="icon"
                  disabled={!canSend}
                  aria-label={
                    createChat.isPending ? "Creating chat" : "Send message"
                  }
                >
                  {createChat.isPending ? (
                    <LoaderCircle
                      className="animate-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    <ArrowUp aria-hidden="true" />
                  )}
                </Button>
              }
            />
            <TooltipContent side="top">
              {createChat.isPending ? "Creating chat..." : "Send message"}
            </TooltipContent>
          </Tooltip>
        </div>
      </form>
    </div>
  )
}
