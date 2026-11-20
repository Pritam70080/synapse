"use client"

import { useEffect, useMemo, useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, type UIMessage } from "ai"
import { toast } from "sonner"

type UseChatMessagesOptions = {
  chatId: string
  model: string
  initialMessages: UIMessage[]
  autoTrigger?: boolean
}

type ChatPostVariables = {
  input: RequestInfo | URL
  init?: RequestInit
}

export function useChatMessages({
  chatId,
  model,
  initialMessages,
  autoTrigger = false,
}: UseChatMessagesOptions) {
  const [shouldAutoTrigger, setShouldAutoTrigger] = useState(autoTrigger)
  const [skipUserMessage, setSkipUserMessage] = useState(autoTrigger)
  const chatMutation = useMutation({
    mutationKey: ["chat", chatId],
    mutationFn: ({ input, init }: ChatPostVariables) =>
      fetch(input, init),
  })

  const transport = useMemo(
    () =>
      new DefaultChatTransport<UIMessage>({
        api: "/api/chat",
        fetch: (input, init) =>
          chatMutation.mutateAsync({ input, init }),
        prepareSendMessagesRequest: ({ messages }) => ({
          body: {
            chatId,
            messages,
            model,
            skipUserMessage,
          },
        }),
      }),
    [chatId, chatMutation, model, skipUserMessage],
  )

  const chat = useChat({
    id: chatId,
    messages: initialMessages,
    transport,
    throttle: 50,
    onError: () => {
      toast.error("Couldn't generate a response. Please try again.")
    },
  })
  const { sendMessage, status } = chat

  useEffect(() => {
    if (!shouldAutoTrigger || status !== "ready") return

    void sendMessage().finally(() => {
      setSkipUserMessage(false)
      setShouldAutoTrigger(false)
    })
  }, [sendMessage, shouldAutoTrigger, status])

  return chat
}
