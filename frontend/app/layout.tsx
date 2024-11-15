"use client"
import "@/styles/globals.css"
import { Inter } from "next/font/google"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"
import { QueryProvider } from "@/components/providers/query-provider"
import { SiteHeader } from "@/components/site-header"
import { ThirdwebProvider } from "thirdweb/react";
import { WagmiProvider, createConfig } from "wagmi";
import { wagmiConfig } from "@/config/wagmi.config"
import Head from "next/head"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <Head>
        <title>Multi Chain DeFI</title>
      </Head>
      <body className={cn("min-h-screen bg-background antialiased", inter.className)}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <WagmiProvider config={wagmiConfig}>
            <ThirdwebProvider>
              <QueryProvider>
                <div className="relative flex min-h-screen flex-col">
                  <SiteHeader />
                  <div className="flex-1">{children}</div>
                </div>
              </QueryProvider>
            </ThirdwebProvider>
          </WagmiProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}