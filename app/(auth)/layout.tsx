import { Suspense } from "react"
import { ThemeToggler } from "@/components/theme-toggler"
import { LoadingState } from "@/components/loading-state"
import { requireNoAuth } from "@/modules/authentication/actions"

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Suspense fallback={<AuthLoading />}>
      <UnauthenticatedLayout>{children}</UnauthenticatedLayout>
    </Suspense>
  )
}

async function UnauthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireNoAuth()

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <div className="absolute right-4 top-4 z-10 sm:right-6 sm:top-6">
        <ThemeToggler />
      </div>
      {children}
    </div>
  )
}

function AuthLoading() {
  return <LoadingState label="Checking your session..." fullScreen />
}

export default AuthLayout