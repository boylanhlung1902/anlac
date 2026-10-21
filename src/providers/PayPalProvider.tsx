'use client'

import { PayPalScriptProvider } from '@paypal/react-paypal-js'

const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'test'

const initialOptions = {
  clientId: paypalClientId,
  currency: 'USD',
  intent: 'capture',
}

export default function PayPalProvider({ children }: { children: React.ReactNode }) {
  return (
    <PayPalScriptProvider options={initialOptions}>
      {children}
    </PayPalScriptProvider>
  )
} 