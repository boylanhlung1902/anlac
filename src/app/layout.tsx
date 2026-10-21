import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import BootstrapScript from '@/components/BootstrapScript'
import { CartProvider } from '@/contexts/CartContext'
import { WishlistProvider } from '@/contexts/WishlistContext'
import PayPalProvider from '@/providers/PayPalProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'An Lạc Stone - Đá Cảnh & Mỹ Nghệ',
  description: 'Chuyên cung cấp đá cảnh, đồ chế tác từ đá mỹ nghệ chất lượng cao. Từ đá phong thủy đến tượng đá nghệ thuật.',
  icons: {
    icon: [
      { url: '/images/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/images/favicon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/images/favicon.ico', sizes: 'any' },
    ],
    apple: [{ url: '/images/apple-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: ['/images/favicon.ico'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Questrial&family=Roboto:wght@100;200;300;400;500;700;900&display=swap" />
      </head>
      <body className={inter.className}>
        <PayPalProvider>
          <CartProvider>
            <WishlistProvider>
              <BootstrapScript />
              {children}
            </WishlistProvider>
          </CartProvider>
        </PayPalProvider>
      </body>
    </html>
  )
} 