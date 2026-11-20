# Synapse

> A multi-model AI chat application — explore and chat with multiple AI models in one workspace.

Synapse is a full-stack AI chat platform built with **Next.js 16**, styled with **Tailwind CSS v4** and **shadcn/ui**, powered by **OpenRouter** for free multi-model access, and backed by **PostgreSQL** via **Prisma ORM 7**. It features persistent conversation memory, real-time streaming responses, OAuth authentication, and a fully responsive mobile-first UI.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?style=flat-square&logo=tailwindcss)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?style=flat-square&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql)

---

## Features

- **Multi-Model Chat** — Browse and select from all free models on OpenRouter (Llama, Gemma, Mistral, Qwen, DeepSeek, and more) in a single interface.
- **Persistent Memory** — Every conversation and message is saved to PostgreSQL. Resume any chat exactly where you left off.
- **Real-Time Streaming** — Responses stream token-by-token using the Vercel AI SDK with OpenRouter's streaming API.
- **Rich Markdown Rendering** — Assistant responses render with full Markdown, syntax-highlighted code blocks (via Shiki), LaTeX math (KaTeX), and Mermaid diagrams through the Streamdown library.
- **OAuth Authentication** — Sign in with Google or GitHub using Better Auth with Prisma adapter.
- **Dark / Light / System Theme** — Full theming support via `next-themes` with theme-aware scrollbars, selections, and UI.
- **Responsive Mobile-First UI** — Collapsible sidebar, sheet-based mobile navigation, responsive chat form, and touch-friendly interactions.
- **Chat Management** — Create, search, delete chats. Infinite-scroll sidebar with date-grouped history (Today, Yesterday, Older).
- **Model Details Inspector** — View architecture, context length, input/output modalities, tokenizer, and provider info for each model.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org) (App Router, Server Components, Server Actions) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **UI** | [React 19](https://react.dev), [Tailwind CSS v4](https://tailwindcss.com), [shadcn/ui](https://ui.shadcn.com) |
| **Component Library** | [Base UI (Radix)](https://base-ui.com), [Lucide Icons](https://lucide.dev) |
| **AI SDK** | [Vercel AI SDK v7](https://sdk.vercel.ai) (`ai`, `@ai-sdk/react`) |
| **LLM Provider** | [OpenRouter](https://openrouter.ai) (`@openrouter/ai-sdk-provider`) — free-tier models |
| **Markdown** | [Streamdown](https://streamdown.dev) + plugins (code, math, CJK, mermaid) |
| **Syntax Highlighting** | [Shiki](https://shiki.matsu.io/) |
| **Database** | [PostgreSQL](https://www.postgresql.org/) via [pg](https://node-postgres.com) driver |
| **ORM** | [Prisma 7](https://www.prisma.io/) with `@prisma/adapter-pg` driver adapter |
| **Authentication** | [Better Auth](https://www.better-auth.com/) with Prisma adapter (Google + GitHub OAuth) |
| **State Management** | [TanStack React Query v5](https://tanstack.com/query) (server state), React `useState` (local) |
| **Animations** | [Motion](https://motion.dev) (Framer Motion) |
| **Package Manager** | [Bun](https://bun.sh) |

---

## Schema & Relationships

The database schema is defined in [`prisma/schema.prisma`](prisma/schema.prisma):

```
┌───────────┐       ┌───────────┐       ┌──────────┐
│   User    │──1:N──│  Session   │       │ Account  │
│           │──1:N──│           │       │          │
│           │──1:N──│   Chat    │       │          │
└───────────┘       └───────────┘       └──────────┘
      │                                       │
      └───────────────────1:N─────────────────┘
                    │
                    │ 1:N
                    ▼
              ┌──────────┐
              │ Message  │
              └──────────┘
```

| Model | Purpose | Key Relations |
|---|---|---|
| **User** | Authenticated user record | Has many Sessions, Accounts, and Chats |
| **Session** | Active login session | Belongs to User (cascade delete) |
| **Account** | OAuth provider link (Google/GitHub) | Belongs to User (cascade delete) |
| **Verification** | Email/token verification records | Standalone, indexed by identifier |
| **Chat** | A conversation thread | Belongs to User, has many Messages |
| **Message** | A single message in a chat | Belongs to Chat (cascade delete), has role (USER/ASSISTANT/SYSTEM) and type (NORMAL/ERROR/TOOL_CALL) |

**Cascade deletes** ensure that deleting a user removes all sessions, accounts, and chats, and deleting a chat removes all its messages.

---

## Persistent Memory — How It Works

Synapse implements persistent conversation memory using a **database-backed message store** pattern:

1. **Chat Creation** — When a user sends their first message, a `Chat` record is created in PostgreSQL along with the initial `Message` (server action: `createChatWithMessage`). The user is redirected to `/chat/[chatId]?autoTrigger=true`.

2. **Message Streaming & Saving** — The `POST /api/chat` route receives all messages, streams the AI response via OpenRouter, and in the `onFinish` callback persists both the user message and assistant response as `Message` records with `prisma.message.createMany`.

3. **Conversation Restoration** — When a user navigates to `/chat/[chatId]`, the server component fetches the chat with all messages via `getChatById`, serializes them, and passes them as `initialMessages` to the AI SDK's `useChat` hook. The conversation resumes seamlessly.

4. **Auto-Trigger** — On new chat creation, the `autoTrigger` search param tells the client to immediately fire a `sendMessage()` call so the AI responds to the initial message without the user clicking Send again.

5. **Multi-Part Storage** — Messages are stored as JSON-serialized part arrays (`[{ type: "text", text: "..." }]`), preserving the full structure for faithful restoration of multi-part messages.

```
User types → createChatWithMessage (Server Action)
  → Chat + first Message saved to DB
  → Redirect to /chat/[chatId]?autoTrigger=true
  → useChat loads initialMessages from DB
  → Auto-sends to POST /api/chat
  → streamText via OpenRouter
  → onFinish saves user + assistant Messages to DB
  → Next message: same cycle (without redirect)
```

---

## Project Structure

```
synapse/
├── app/
│   ├── (auth)/              # Auth layout (sign-in, guards unauthenticated)
│   │   └── sign-in/         # OAuth sign-in page (Google + GitHub)
│   ├── (root)/              # Main app layout (sidebar, requires auth)
│   │   ├── page.tsx         # Home — welcome screen + new chat form
│   │   └── chat/[chatId]/   # Conversation view for a specific chat
│   ├── api/
│   │   ├── auth/[...all]/   # Better Auth API routes
│   │   ├── chat/            # AI chat streaming endpoint
│   │   └── ai/get-model/    # Free model list from OpenRouter
│   ├── globals.css          # Theme variables, scrollbar styles
│   ├── layout.tsx           # Root layout with fonts + providers
│   └── not-found.tsx        # Custom 404 page
├── components/
│   ├── ai-elements/         # AI chat UI primitives (message, conversation, etc.)
│   ├── providers/           # Theme, Query, Tooltip providers
│   └── ui/                  # shadcn/ui component library
├── hooks/                   # Shared hooks (useIsMobile, etc.)
├── lib/
│   ├── auth.ts              # Better Auth server config
│   ├── auth-client.ts       # Better Auth client
│   ├── db.ts                # Prisma client singleton with pg adapter
│   ├── prompts.ts           # System prompt for Synapse AI persona
│   └── generated/prisma/    # Prisma generated client
├── modules/
│   ├── authentication/      # Auth actions, components (UserButton, AuthToast)
│   └── chat/                # Chat feature module
│       ├── actions/         # Server actions (CRUD for chats)
│       ├── components/      # Chat UI (sidebar, form, message list, model selector)
│       ├── hooks/           # React Query hooks (useChats, useChatMessages, useAiModels)
│       ├── constants/       # Welcome tab prompt suggestions
│       └── types.ts         # FreeModel type definitions
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── migrations/          # Migration history
└── public/                  # Static assets (logo, OAuth provider icons)
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 20+ (or [Bun](https://bun.sh) 1.4+)
- [PostgreSQL](https://www.postgresql.org/) database
- OAuth credentials for [Google](https://console.cloud.google.com/) and/or [GitHub](https://github.com/settings/developers)
- [OpenRouter](https://openrouter.ai/) API key (free tier works)

### 1. Clone & Install

```bash
git clone https://github.com/Pritam70080/synapse.git
cd synapse
bun install
```

### 2. Configure Environment

Copy the example env file and fill in your credentials:

```bash
cp .env.example .env
```

```env
DATABASE_URL=postgresql://user:password@localhost:5432/synapse

BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:3000

GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

OPENROUTER_API_KEY=your-openrouter-api-key
```

### 3. Set Up Database

```bash
bunx prisma generate
bunx prisma migrate deploy
```

### 4. Run Development Server

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Key Design Decisions

- **OpenRouter Free Tier** — Rather than locking users into a single model, Synapse fetches all free models from OpenRouter and lets users switch between them per-conversation.
- **Server Actions + API Routes** — CRUD operations (create/delete chat, list chats) use Next.js Server Actions for simplicity; the streaming chat endpoint uses a traditional API route for compatibility with the AI SDK's transport layer.
- **Prisma Driver Adapter** — Uses `@prisma/adapter-pg` with the `pg` driver pool for direct PostgreSQL connections, enabling advanced connection pooling.
- **Streamdown** — Renders streaming Markdown with plugins for code (Shiki highlighting), math (KaTeX), CJK typography, and Mermaid diagrams — all in real-time as tokens arrive.
- **Module-based Architecture** — Features are organized into `modules/` (authentication, chat) with co-located actions, components, hooks, and types for clean separation of concerns.

---

## License

This project is for educational purposes.
