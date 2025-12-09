import type { Metadata, Viewport } from 'next'
import { Crimson_Text, Inter } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/navbar'
import { AuthProfileCheck } from '@/components/auth-profile-check'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const crimsonText = Crimson_Text({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-crimson',
})

export const metadata: Metadata = {
  title: {
    default: 'Everloop — Canon Engine',
    template: '%s | Everloop',
  },
  description: 'A collaborative story universe where writers build within a living world — guided by AI, grounded in canon.',
  keywords: ['collaborative writing', 'shared universe', 'storytelling', 'canon', 'fiction'],
  authors: [{ name: 'Everloop' }],
  creator: 'Everloop',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Everloop',
    title: 'Everloop — Canon Engine',
    description: 'A collaborative story universe where writers build within a living world.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Everloop — Canon Engine',
    description: 'A collaborative story universe where writers build within a living world.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  themeColor: '#0f1419',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${crimsonText.variable}`}>
        <Navbar />
        <AuthProfileCheck />
        <main>{children}</main>
      </body>
    </html>
  )
}
