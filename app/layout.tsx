
import type { Metadata } from "next"
import "./globals.css"
import { Providers } from "@/components/layout/providers"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export const metadata: Metadata = {
  title: "Kḥesed-tek Church Management Systems",
  description: "Sistema completo de gestión para iglesias",
  manifest: "/manifest.json?v=2024",
  icons: {
    icon: "/logo.png?v=2025",
    apple: "/logo.png?v=2025",
    shortcut: "/logo.png?v=2025",
  },
  other: {
    'cache-control': 'no-cache, no-store, must-revalidate',
  },
}

export function generateViewport() {
  return {
    themeColor: "#3B82F6",
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="es" suppressHydrationWarning>
      <body className="font-sans">
        <Providers session={session}>
          {children}
        </Providers>
      </body>
    </html>
  )
}
