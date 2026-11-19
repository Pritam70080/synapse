import {
  Code2,
  Compass,
  GraduationCap,
  WandSparkles,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

type ChatTabMessages = {
  tab: string
  icon: LucideIcon
  messages: string[]
}

export const CHAT_TAB_MESSAGES = [
  {
    tab: "Create",
    icon: WandSparkles,
    messages: [
      "Help me brainstorm ideas for a new project",
      "Draft a clear and friendly email",
      "Create a simple plan for my week",
      "Turn this idea into a short story",
    ],
  },
  {
    tab: "Learn",
    icon: GraduationCap,
    messages: [
      "Explain how large language models work",
      "Teach me a new concept in five minutes",
      "Make a beginner-friendly study plan",
      "Summarize a complex topic in simple terms",
    ],
  },
  {
    tab: "Code",
    icon: Code2,
    messages: [
      "Help me debug a TypeScript error",
      "Review my code for clarity and edge cases",
      "Explain this code step by step",
      "Help me plan a small web app",
    ],
  },
  {
    tab: "Explore",
    icon: Compass,
    messages: [
      "Plan a relaxing weekend in Kyoto",
      "Compare two approaches to learning a language",
      "Suggest books based on my interests",
      "Give me a fresh perspective on a problem",
    ],
  },
] satisfies ChatTabMessages[]
