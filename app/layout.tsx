import type { Metadata } from 'next'
import { Archivo } from 'next/font/google'
import './globals.css'

const archivo = Archivo({
  subsets: ['latin'],
  variable: '--font-archivo',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'Summit Registration | Summit Salon Business Center',
  description: 'Register for The Summit Immersive - Transform your salon business',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={archivo.variable}>
      <body className="font-sans min-h-screen bg-zinc-50">
        {children}
      </body>
    </html>
  )
}
