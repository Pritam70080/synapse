import { notFound } from "next/navigation"
import { MessageSquareText } from "lucide-react"
import { demoChats } from "@/modules/chat/data/demo-chats"

export default async function ChatPage({
  params,
}: {
  params: Promise<{ chatId: string }>
}) {
  const { chatId } = await params
  const chat = demoChats.find((item) => item.id === chatId)

  if (!chat) notFound()

  return (
    <section className="flex flex-1 items-center justify-center px-6 py-12">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <MessageSquareText aria-hidden="true" className="size-5" />
        </div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {chat.title}
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          This demo conversation is ready. Chat messages will appear here.
        </p>
      </div>
    </section>
  )
}
