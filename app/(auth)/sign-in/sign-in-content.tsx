"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { LoaderCircle } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { SIGN_IN_PENDING_KEY } from "@/modules/authentication/components/auth-toast"

type SocialProvider = "google" | "github"

export function SignInContent() {
  const [pendingProvider, setPendingProvider] = useState<SocialProvider | null>(
    null,
  )

  useEffect(() => {
    sessionStorage.removeItem(SIGN_IN_PENDING_KEY)
  }, [])

  async function handleSignIn(provider: SocialProvider) {
    setPendingProvider(provider)
    sessionStorage.setItem(SIGN_IN_PENDING_KEY, "true")

    try {
      const { error } = await authClient.signIn.social({
        provider,
        callbackURL: "/",
      })

      if (error) {
        sessionStorage.removeItem(SIGN_IN_PENDING_KEY)
        toast.error(error.message || "Please try again in a moment.")
      }
    } catch {
      sessionStorage.removeItem(SIGN_IN_PENDING_KEY)
      toast.error(
        "We couldn't start sign-in. Check your connection and try again.",
      )
    } finally {
      setPendingProvider(null)
    }
  }

  return (
    <main className="flex min-h-screen flex-1 items-center justify-center px-4 py-12">
      <section
        aria-labelledby="sign-in-heading"
        className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8"
      >
        <div className="mb-6 flex justify-center">
          <Image
            src="/logo.webp"
            alt="Synapse logo"
            width={56}
            height={56}
            className="size-14 object-contain"
          />
        </div>

        <div className="text-center">
          <h1
            id="sign-in-heading"
            className="font-heading text-2xl font-semibold tracking-tight text-card-foreground"
          >
            Welcome to Synapse
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Chat with multiple AI models in one simple workspace.
          </p>
        </div>

        <div className="mt-7 space-y-2">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="h-12 w-full justify-center gap-3 bg-background font-medium"
            disabled={pendingProvider !== null}
            onClick={() => handleSignIn("google")}
          >
            {pendingProvider === "google" ? (
              <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
            ) : (
              <Image
                src="/google.svg"
                alt=""
                width={20}
                height={20}
                className="size-4"
              />
            )}
            Continue with Google
          </Button>

          <div className="flex items-center gap-3 py-1">
            <span aria-hidden="true" className="h-px flex-1 bg-border" />
            <span className="text-xs font-medium text-muted-foreground">OR</span>
            <span aria-hidden="true" className="h-px flex-1 bg-border" />
          </div>

          <Button
            type="button"
            variant="outline"
            size="lg"
            className="h-12 w-full justify-center gap-3 bg-background font-medium"
            disabled={pendingProvider !== null}
            onClick={() => handleSignIn("github")}
          >
            {pendingProvider === "github" ? (
              <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
            ) : (
              <Image
                src="/github.svg"
                alt=""
                width={20}
                height={20}
                className="size-5 dark:invert"
              />
            )}
            Continue with GitHub
          </Button>
        </div>

        <p className="mt-6 text-center text-xs leading-5 text-muted-foreground">
          Secure sign-in with your existing account.
        </p>
      </section>
    </main>
  )
}
