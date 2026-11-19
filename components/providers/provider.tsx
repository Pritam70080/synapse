import * as React from "react"
import { ThemeProvider } from "./theme-provider"
import { TooltipProvider } from "../ui/tooltip"
import QueryProvider from "./query-provider"


export function Provider({
    children,

}: { children: React.ReactNode }) {
    return (
        <QueryProvider>
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
        </QueryProvider>
    )
}