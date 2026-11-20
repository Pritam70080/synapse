"use client"

import { useEffect } from "react"
import { toast } from "sonner"

export const SIGN_IN_PENDING_KEY = "synapse-sign-in-pending"

export function AuthToast() {
  useEffect(() => {
    if (sessionStorage.getItem(SIGN_IN_PENDING_KEY)) {
      sessionStorage.removeItem(SIGN_IN_PENDING_KEY)
      toast.success("Signed in successfully.")
    }
  }, [])

  return null
}
