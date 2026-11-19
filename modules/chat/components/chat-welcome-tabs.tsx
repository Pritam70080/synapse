"use client"

import { useState } from "react"
import { ArrowUpRight } from "lucide-react"
import { LayoutGroup, motion } from "motion/react"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { CHAT_TAB_MESSAGES } from "@/modules/chat/constants"

type ChatWelcomeTabsProps = {
  userName: string | null | undefined
  onMessageSelect: (message: string) => void
}

export function ChatWelcomeTabs({
  userName,
  onMessageSelect,
}: ChatWelcomeTabsProps) {
  const displayName = userName?.trim() || "there"
  const [activeTab, setActiveTab] = useState(CHAT_TAB_MESSAGES[0].tab)

  return (
    <section className="space-y-7">
      <div className="text-center">
        <p className="text-sm font-medium text-muted-foreground">
          Welcome back, {displayName}
        </p>
        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          What would you like to explore?
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Pick a starting point or ask anything.
        </p>
      </div>

      <LayoutGroup id="chat-prompt-tabs">
        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            if (typeof value === "string") setActiveTab(value)
          }}
          className="min-w-0"
          aria-label="Prompt ideas"
        >
          <TabsList className="w-full justify-start overflow-x-auto scrollbar-none">
            {CHAT_TAB_MESSAGES.map(({ tab, icon: Icon }) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="relative isolate flex-none rounded-full px-3 data-active:bg-transparent dark:data-active:bg-transparent"
              >
                {activeTab === tab ? (
                  <motion.span
                    layoutId="chat-tab-active-pill"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-background shadow-sm"
                  />
                ) : null}
                <span className="relative z-10 inline-flex items-center gap-2">
                  <Icon aria-hidden="true" />
                  {tab}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          {CHAT_TAB_MESSAGES.map(({ tab, messages }) => (
            <TabsContent key={tab} value={tab} className="mt-4">
              <div className="grid gap-3 sm:grid-cols-2">
                {messages.map((message) => (
                  <button
                    key={message}
                    type="button"
                    onClick={() => onMessageSelect(message)}
                    className="group flex min-h-16 items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-left text-sm text-card-foreground shadow-sm transition-colors hover:border-primary/25 hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring"
                  >
                    <span>{message}</span>
                    <ArrowUpRight
                      aria-hidden="true"
                      className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
                    />
                  </button>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </LayoutGroup>
    </section>
  )
}
