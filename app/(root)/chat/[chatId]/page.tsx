import { Suspense } from "react"
import { notFound } from "next/navigation"
import { getChatById } from "@/modules/chat/actions"
import { LoadingState } from "@/components/loading-state"
import {
  ChatConversationView,
  type StoredChatMessage,
} from "@/modules/chat/components/chat-conversation-view"

export default function ChatPage({
  params,
  searchParams,
}: {
  params: Promise<{ chatId: string }>
  searchParams: Promise<{ autoTrigger?: string | string[] }>
}) {
  return (
    <section className="flex min-h-0 w-full flex-1 overflow-hidden">
      <Suspense
        fallback={
          <LoadingState
            label="Loading your conversation..."
            className="flex-1"
          />
        }
      >
        <ChatPageContent params={params} searchParams={searchParams} />
      </Suspense>
    </section>
  )
}

async function ChatPageContent({
  params,
  searchParams,
}: {
  params: Promise<{ chatId: string }>
  searchParams: Promise<{ autoTrigger?: string | string[] }>
}) {
  const [{ chatId }, query] = await Promise.all([params, searchParams])
  const autoTrigger =
    (Array.isArray(query.autoTrigger)
      ? query.autoTrigger[0]
      : query.autoTrigger) === "true"
  const result = await getChatById(chatId)

  if (!result.success || !result.data) notFound()

  const storedMessages: StoredChatMessage[] = result.data.messages.map(
    (message) => ({
      id: message.id,
      messageRole: message.messageRole,
      content: message.content,
      createdAt: message.createdAt.toISOString(),
    }),
  )

  return (
    <ChatConversationView
      chatId={chatId}
      model={result.data.model}
      messages={storedMessages}
      autoTrigger={autoTrigger}
    />
  )
}
