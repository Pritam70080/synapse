"use client"

import Link from "next/link"
import { useState } from "react"
import {
  CreditCard,
  LoaderCircle,
  LogOut,
  Settings,
  UserRound,
  ChevronsUpDown,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

export type UserButtonProps = {
  align?: "start" | "center" | "end"
  className?: string
  onBilling?: () => void | Promise<void>
  onLogout?: () => void | Promise<void>
  onProfile?: () => void | Promise<void>
  onSettings?: () => void | Promise<void>
  showEmail?: boolean
  variant?: "default" | "compact"
}

export function UserButton({
  align = "end",
  className,
  onBilling,
  onLogout,
  onProfile,
  onSettings,
  showEmail = true,
  variant = "default",
}: UserButtonProps) {
  const { data: session, isPending, error: sessionError } = authClient.useSession()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [signOutError, setSignOutError] = useState<string | null>(null)
  const router = useRouter()

  if (isPending) {
    return (
      <Button
        variant="ghost"
        size={variant === "compact" ? "icon" : "default"}
        className={cn("text-muted-foreground", className)}
        disabled
        aria-label="Loading account"
      >
        <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
      </Button>
    )
  }

  const user = session?.user

  if (!user) {
    return (
      <div className="flex flex-col items-start gap-1">
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href="/sign-in" />}
          className={className}
        >
          Sign in
        </Button>
        {sessionError ? (
          <span className="text-xs text-destructive" role="alert">
            Could not load your account.
          </span>
        ) : null}
      </div>
    )
  }

  const displayName = user.name?.trim() || user.email
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()

  async function handleSignOut() {
    setIsSigningOut(true)
    setSignOutError(null)

    try {
      const { error } = await authClient.signOut()
      if (error) {
        setSignOutError(error.message || "Please try again.")
        return
      }

      await onLogout?.()
      router.push("/sign-in")
      router.refresh()
    } catch (error) {
      setSignOutError(
        error instanceof Error
          ? error.message
          : "We couldn't sign you out. Please try again.",
      )
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className={cn(
              "h-auto min-w-0 justify-start gap-3 rounded-xl p-2 text-left hover:bg-muted/70",
              variant === "compact" && "size-10 min-w-10 justify-center p-0",
              className,
            )}
            aria-label={`Open ${displayName}'s account menu`}
          >
            <Avatar className="size-9">
              <AvatarImage
                src={user.image ?? undefined}
                alt=""
              />
              <AvatarFallback className="bg-primary/10 font-medium text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            {variant === "default" ? (
              <>
                <span className="grid min-w-0 flex-1">
                  <span className="truncate text-sm font-medium text-foreground">
                    {displayName}
                  </span>
                  {showEmail ? (
                    <span className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  ) : null}
                </span>
                <ChevronsUpDown
                  className="size-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
              </>
            ) : null}
          </Button>
        }
      />
      <DropdownMenuContent
        align={align}
        className="w-64"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center gap-3 px-3 py-3 font-normal">
            <Avatar className="size-10">
              <AvatarImage
                src={user.image ?? undefined}
                alt=""
              />
              <AvatarFallback className="bg-primary/10 font-medium text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="grid min-w-0">
              <span className="truncate text-sm font-medium text-foreground">
                {displayName}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {user.email}
              </span>
            </span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        {onProfile || onSettings || onBilling ? (
          <>
            <DropdownMenuSeparator />
            {onProfile ? (
              <DropdownMenuItem onClick={onProfile}>
                <UserRound aria-hidden="true" />
                Profile
              </DropdownMenuItem>
            ) : null}
            {onSettings ? (
              <DropdownMenuItem onClick={onSettings}>
                <Settings aria-hidden="true" />
                Settings
              </DropdownMenuItem>
            ) : null}
            {onBilling ? (
              <DropdownMenuItem onClick={onBilling}>
                <CreditCard aria-hidden="true" />
                Billing
              </DropdownMenuItem>
            ) : null}
          </>
        ) : null}

        <DropdownMenuSeparator />
        {signOutError ? (
          <p className="px-3 py-2 text-xs text-destructive" role="alert">
            {signOutError}
          </p>
        ) : null}
        <DropdownMenuItem
          variant="destructive"
          disabled={isSigningOut}
          onClick={handleSignOut}
        >
          {isSigningOut ? (
            <LoaderCircle className="animate-spin" aria-hidden="true" />
          ) : (
            <LogOut aria-hidden="true" />
          )}
          {isSigningOut ? "Signing out..." : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
