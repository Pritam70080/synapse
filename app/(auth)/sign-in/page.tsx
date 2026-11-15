import type { Metadata } from "next"
import { SignInContent } from "./sign-in-content"

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Sign in to Synapse, a multi-model AI chat app. Explore and chat with multiple AI models in one workspace.",
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: "Sign in to Synapse",
    description:
      "Sign in to Synapse, a multi-model AI chat app. Explore and chat with multiple AI models in one workspace.",
    type: "website",
  },
}

export default function SignInPage() {
  return <SignInContent />
}
