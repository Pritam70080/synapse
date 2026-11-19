import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Provider } from "@/components/providers/provider";
import { Toaster } from "@/components/ui/sonner"

const interHeading = Inter({subsets:['latin'],variable:'--font-heading'});

const outfit = Outfit({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Synapse",
    template: "%s | Synapse",
  },
  description:
    "Synapse is a multi-model AI chat app. Explore and chat with multiple AI models in one workspace.",
  applicationName: "Synapse",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", outfit.variable, interHeading.variable)}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <Provider>
          {children}
          <Toaster 
          position="top-right"
          />
        </Provider>
      </body>
    </html>
  );
}
