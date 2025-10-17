import type React from "react"
import type { Metadata } from "next"
import { Ubuntu } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const ubuntu = Ubuntu({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-ubuntu",
})

export const metadata: Metadata = {
  title: "MyBB - Telegram Bot Builder",
  description: "Create and manage Telegram bots with ease",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // Important: silence hydration diff (the theme class will be added/changed by the client)
    <html lang="en" suppressHydrationWarning>
      <body className={`${ubuntu.variable} font-ubuntu antialiased`}>
        <ThemeProvider
          attribute="class"
          /** Force a stable SSR theme */
          defaultTheme="light"
          enableSystem={false}
          /** Prevent next-themes from adding inline color-scheme on SSR */
          enableColorScheme={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
