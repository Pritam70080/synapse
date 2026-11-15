import React from "react"
import { ThemeToggler } from "@/components/theme-toggler"

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <div className="absolute right-4 top-4 z-10 sm:right-6 sm:top-6">
        <ThemeToggler />
      </div>
      {children}
    </div>
  )
}

export default AuthLayout