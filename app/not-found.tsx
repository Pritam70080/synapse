import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Page not found",
}

export default function NotFoundPage() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-6 py-16">
      <div className="flex w-full max-w-md flex-col items-center text-center">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.webp"
            alt=""
            width={40}
            height={40}
            className="size-10 object-contain"
          />
          <span className="font-heading text-xl font-bold tracking-tight">
            Synapse
          </span>
        </Link>

        <p className="mt-12 font-heading text-8xl font-bold tracking-tight text-muted-foreground/30">
          404
        </p>
        <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight">
          Page not found
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          We couldn&apos;t find the page you&apos;re looking for. It may have
          moved or no longer exists.
        </p>
        <Button
          nativeButton={false}
          render={<Link href="/" />}
          className="mt-8 gap-2"
        >
          <ArrowLeft aria-hidden="true" />
          Back to home
        </Button>
      </div>
    </main>
  )
}