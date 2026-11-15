import * as React from "react"
import { ThemeProvider } from "./theme-provider"
import { TooltipProvider } from "../ui/tooltip"


export function Provider({
    children,

}: { children: React.ReactNode }) {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <TooltipProvider>
                {children}
            </TooltipProvider>
        </ThemeProvider>
    )
}