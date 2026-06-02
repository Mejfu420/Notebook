import type { Metadata } from 'next'
import { ClerkProvider, Show, UserButton } from '@clerk/nextjs'
import { Geist, Geist_Mono } from 'next/font/google'
import '@/styles/globals.scss'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'RedNotes - Cloud Native Notebook',
  description: 'Secure and lightweight space for your thoughts.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ClerkProvider>

          <Show when="signed-in">
            <header className="main-header">
              <div className="logo-brand">
                Red<span className="highlight">Notes</span>
              </div>
              <UserButton afterSignOutUrl="/" />
            </header>
          </Show>

          {children}

        </ClerkProvider>
      </body>
    </html>
  )
}