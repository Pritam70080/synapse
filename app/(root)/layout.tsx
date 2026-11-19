import { Suspense } from "react"
import { requireAuth } from "@/modules/authentication/actions"
import { LoadingState } from "@/components/loading-state"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { ChatSidebar } from "@/modules/chat/components/chat-sidebar"
import type { ReactNode } from "react"

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <LoadingState label="Loading your workspace..." fullScreen />
      }
    >
      <AuthenticatedLayout>{children}</AuthenticatedLayout>
    </Suspense>
  )
}

async function AuthenticatedLayout({ children }: { children: ReactNode }) {
  await requireAuth();

  return (
    <SidebarProvider>
      <ChatSidebar />
      <SidebarInset className="min-h-svh">
        <header className="flex h-14 items-center gap-3 border-b px-4 md:hidden">
          <SidebarTrigger aria-label="Open chat sidebar" />
          <span className="font-heading text-base font-bold tracking-tight">
            Synapse
          </span>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}