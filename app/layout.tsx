import type { Metadata } from 'next'
import { ClerkProvider, SignInButton, SignUpButton, UserButton, SignedIn, SignedOut } from '@clerk/nextjs'
import './globals.css'

export const metadata: Metadata = {
  title: 'FreelanceAI Agent',
  description: 'AI-powered freelance proposal automation',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ClerkProvider>
          <nav style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 2rem',
            height: '56px',
            background: '#13151c',
            borderBottom: '1px solid #2a2d3e',
            position: 'sticky',
            top: 0,
            zIndex: 100,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.2rem' }}>⚡</span>
              <span style={{
                fontWeight: 700,
                fontSize: '0.95rem',
                color: '#e4e6f0',
                fontFamily: 'sans-serif',
              }}>
                FreelanceAI Agent
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <SignedOut>
                <SignInButton mode="modal">
                  <button style={{
                    background: 'transparent',
                    border: '1px solid #2a2d3e',
                    color: '#7b7f96',
                    padding: '0.35rem 0.8rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontFamily: 'sans-serif',
                  }}>
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button style={{
                    background: '#5b6af0',
                    border: '1px solid #5b6af0',
                    color: '#fff',
                    padding: '0.35rem 0.8rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontFamily: 'sans-serif',
                  }}>
                    Sign Up
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </div>
          </nav>
          {children}
        </ClerkProvider>
      </body>
    </html>
  )
}
