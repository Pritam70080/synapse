"use client"

import Image from "next/image"
import Link from "next/link"
import { isToday, isYesterday } from "date-fns"
import { EllipsisVertical, LoaderCircle, MessageSquareText, Plus, Search, Trash2, X } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { usePathname } from "next/navigation"
import { toast } from "sonner"
import { ThemeToggler } from "@/components/theme-toggler"
import { Button } from "@/components/ui/button"
import { useDeleteChat, useGetChats } from "@/modules/chat/hooks/use-chats"
import { UserButton } from "@/modules/authentication/components/user-button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

function getDateCategory(date: Date) {
  if (isToday(date)) return "Today"
  if (isYesterday(date)) return "Yesterday"
  return "Older"
}

type SidebarChat = {
  id: string
  title: string
  updatedAt: Date
}

export function ChatSidebar() {
  const [query, setQuery] = useState("")
  const { isMobile, setOpenMobile } = useSidebar()
  const pathname = usePathname()
  const {
    data: chatPages,
    isPending,
    isFetchingNextPage,
    hasNextPage,
    isFetchNextPageError,
    fetchNextPage,
  } = useGetChats()
  const lastPage = chatPages?.pages[chatPages.pages.length - 1]
  const failedToLoadMoreChats =
    isFetchNextPageError ||
    (chatPages !== undefined &&
      chatPages.pages.length > 1 &&
      lastPage?.success === false)

  useEffect(() => {
    if (failedToLoadMoreChats) {
      toast.error("Could not load more chats.")
    }
  }, [failedToLoadMoreChats])

  const chatGroups = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase()
    const loadedChats: SidebarChat[] =
      chatPages?.pages.flatMap((page) =>
        page.success && page.data ? page.data : [],
      ) ?? []
    const chats = loadedChats
    const filteredChats = chats
      .filter((chat) =>
        chat.title.toLocaleLowerCase().includes(normalizedQuery),
      )
      .sort(
        (first, second) =>
          second.updatedAt.getTime() - first.updatedAt.getTime(),
      )

    const groups = new Map<string, typeof chats>()

    for (const chat of filteredChats) {
      const category = getDateCategory(chat.updatedAt)
      const chats = groups.get(category) ?? []
      chats.push(chat)
      groups.set(category, chats)
    }

    return Array.from(groups.entries())
  }, [chatPages, query])

  return (
    <Sidebar>
      <SidebarHeader className="px-4 pb-4 pt-5">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.webp"
            alt="Logo"
            width={36}
            height={36}
            className="size-9 object-contain"
          />
          <span className="font-heading text-xl font-bold tracking-tight text-sidebar-foreground">
            Synapse
          </span>
        </Link>
      </SidebarHeader>

      <div className="space-y-3 px-4 pb-3">
        <Button
          nativeButton={false}
          render={<Link href="/" />}
          className="w-full justify-start gap-2"
          onClick={() => {
            if (isMobile) setOpenMobile(false)
          }}
        >
          <Plus aria-hidden="true" />
          New chat
        </Button>
        <form
          role="search"
          onSubmit={(event) => event.preventDefault()}
          className="relative"
        >
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <SidebarInput
            type="search"
            aria-label="Search chats"
            placeholder="Search chats"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-10 rounded-xl pl-9 pr-10 [&::-webkit-search-cancel-button]:hidden"
          />
          {query ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label="Clear chat search"
              onClick={() => setQuery("")}
              className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X aria-hidden="true" />
            </Button>
          ) : null}
        </form>
      </div>

      <SidebarContent className="px-2">
        {chatGroups.length ? (
          chatGroups.map(([category, chats]) => (
            <SidebarGroup key={category} className="px-2 py-1">
              <SidebarGroupLabel className="px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {category}
              </SidebarGroupLabel>
              <SidebarMenu>
                {chats.map((chat) => (
                  <SidebarChatLink
                    key={chat.id}
                    chat={chat}
                    isActive={pathname === `/chat/${chat.id}`}
                    onNavigate={() => {
                      if (isMobile) setOpenMobile(false)
                    }}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroup>
          ))
        ) : (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            {isPending
              ? "Loading chats..."
              : chatPages?.pages[0]?.success === false
                ? "Failed to load chats."
                : "No chats found."}
          </p>
        )}
        {hasNextPage && (
          <Button
            type="button"
            variant="ghost"
            className="mx-auto my-2 flex"
            disabled={isFetchingNextPage}
            onClick={() => {
              void fetchNextPage()
            }}
          >
            {isFetchingNextPage ? (
              <>
                <LoaderCircle aria-hidden="true" className="animate-spin" />
                Loading more...
              </>
            ) : (
              "Show more"
            )}
          </Button>
        )}
      </SidebarContent>

      <div className="flex items-center justify-between border-t border-sidebar-border px-4 py-3">
        <span className="text-sm text-muted-foreground">Theme</span>
        <ThemeToggler />
      </div>

      <SidebarFooter className="p-3 pt-0">
        <UserButton align="start" className="w-full" />
      </SidebarFooter>
    </Sidebar>
  )
}

function SidebarChatLink({
  chat,
  isActive,
  onNavigate,
}: {
  chat: SidebarChat
  isActive: boolean
  onNavigate: () => void
}) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const deleteChat = useDeleteChat()

  return (
    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <SidebarMenuItem>
        <SidebarMenuButton
          render={<Link href={`/chat/${chat.id}`} />}
          isActive={isActive}
          onClick={onNavigate}
          className="h-9 rounded-xl px-3 pr-9 text-sidebar-foreground/80"
          tooltip={chat.title}
        >
          <MessageSquareText aria-hidden="true" />
          <span>{chat.title}</span>
        </SidebarMenuButton>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label={`Actions for ${chat.title}`}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 text-sidebar-foreground/70 hover:text-sidebar-foreground"
                onClick={(event) => event.stopPropagation()}
              />
            }
          >
            <EllipsisVertical aria-hidden="true" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={6}>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 aria-hidden="true" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete chat?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete &ldquo;{chat.title}&rdquo; and its messages.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={deleteChat.isPending}
            onClick={() => {
              deleteChat.mutate(chat.id, {
                onSuccess: (result) => {
                  if (result.success) setDeleteDialogOpen(false)
                },
              })
            }}
          >
            {deleteChat.isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
