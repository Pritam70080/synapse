"use client"

import Image from "next/image"
import { useState } from "react"
import { LoaderCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"

type SocialProvider = "google" | "github"

export function SignInContent() {
  const [pendingProvider, setPendingProvider] = useState<SocialProvider | null>(
    null,
  )
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function handleSignIn(provider: SocialProvider) {
    setPendingProvider(provider)
    setErrorMessage(null)

    try {
      const { error } = await authClient.signIn.social({
        provider,
        callbackURL: "/",
      })

      if (error) {
        setErrorMessage(error.message || "Please try again in a moment.")
      }
    } catch {
      setErrorMessage(
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
          <div
            aria-hidden="true"
            className="flex size-11 items-center justify-center rounded-xl bg-primary font-heading text-lg font-semibold text-primary-foreground"
          >
            S
          </div>
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

        <div className="mt-7 space-y-3">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="h-12 w-full justify-center gap-3 rounded-lg bg-background font-medium"
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
                className="size-5 dark:invert"
              />
            )}
            Continue with Google
          </Button>

          <Button
            type="button"
            variant="outline"
            size="lg"
            className="h-12 w-full justify-center gap-3 rounded-lg bg-background font-medium"
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

        {errorMessage ? (
          <p
            className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
            role="alert"
          >
            {errorMessage}
          </p>
        ) : null}

        <p className="mt-6 text-center text-xs leading-5 text-muted-foreground">
          Secure sign-in with your existing account.
        </p>
      </section>
    </main>
  )
}
