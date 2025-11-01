import type React from "react"
import type { Metadata } from "next"
import { Ubuntu } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { NetworkStatus } from "@/components/NetworkStatus"

const ubuntu = Ubuntu({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-ubuntu",
})

export const metadata: Metadata = {
  title: "Bots.Business - Telegram Bot Builder",
  description: "Create and manage Telegram bots with ease",
  icons: {
    icon: "/favicon.ico",
  },
  generator: "v0.app",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${ubuntu.variable} font-ubuntu antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={true}
          enableColorScheme={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <NetworkStatus />
      </body>
    </html>
  )
}