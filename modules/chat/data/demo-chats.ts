import { subDays, subHours } from "date-fns"

export type DemoChat = {
  id: string
  title: string
  updatedAt: Date
}

const now = new Date()

export const demoChats: DemoChat[] = [
  {
    id: "product-launch",
    title: "Planning the product launch",
    updatedAt: subHours(now, 2),
  },
  {
    id: "react-server-components",
    title: "Understanding React Server Components",
    updatedAt: subHours(now, 6),
  },
  {
    id: "weekend-recipes",
    title: "Easy recipes for the weekend",
    updatedAt: subDays(now, 1),
  },
  {
    id: "portfolio-feedback",
    title: "Portfolio design feedback",
    updatedAt: subDays(now, 4),
  },
  {
    id: "typescript-generics",
    title: "TypeScript generics explained",
    updatedAt: subDays(now, 10),
  },
  {
    id: "travel-itinerary",
    title: "A week in Kyoto",
    updatedAt: subDays(now, 22),
  },
  {
    id: "learning-plan",
    title: "Build a practical learning plan",
    updatedAt: subDays(now, 45),
  },
]
