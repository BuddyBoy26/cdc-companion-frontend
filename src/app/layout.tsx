// app/layout.tsx
import './globals.css'
import { AuthProvider } from '../context/AuthContext'

export const metadata = {
  title: 'Communiqué | CDC Companion',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {/* Wrap everything (or at least your pages) in AuthProvider */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
