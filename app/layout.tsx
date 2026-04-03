import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { Providers } from '@/components/providers'
import './globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: true,
  themeColor: '#5a8bb3',
}

export const metadata: Metadata = {
  title: 'ConnectX - Modern Dating & Social Platform',
  description: 'A safe, inclusive platform for dating, hookups, relationships, and meaningful connections',
  generator: 'v0.app',
  applicationName: 'ConnectX',
  keywords: ['dating', 'social', 'connections', 'matching', 'relationships'],
  authors: [{ name: 'Connect Team' }],
  icons: {
    icon: '/connectx-logo.png',
    shortcut: '/connectx-logo.png',
    apple: '/connectx-logo.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <Providers>
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
