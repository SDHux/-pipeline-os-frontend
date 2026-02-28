import type { Metadata } from 'next'
import '../styles/globals.css'

export const metadata: Metadata = {
  title: 'Pipeline OS — Mark Huckins',
  description: 'Enterprise Sales Prospecting Intelligence Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-obsidian text-white antialiased">
        {children}
      </body>
    </html>
  )
}
