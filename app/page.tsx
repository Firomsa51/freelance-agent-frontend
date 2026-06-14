import { SignInButton, SignUpButton, SignedIn, SignedOut } from '@clerk/nextjs'
import Link from 'next/link'

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Hero */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '6rem 1.5rem 4rem',
        textAlign: 'center',
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'rgba(91,106,240,0.12)',
          border: '1px solid rgba(91,106,240,0.3)',
          borderRadius: '20px',
          padding: '0.3rem 0.9rem',
          fontSize: '0.8rem',
          color: '#5b6af0',
          marginBottom: '2rem',
          fontWeight: 600,
        }}>
          ⚡ Powered by CrewAI + Groq
        </div>

        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
          marginBottom: '1.5rem',
          color: '#e4e6f0',
        }}>
          Your AI Freelance
          <span style={{ color: '#5b6af0' }}> Copilot</span>
        </h1>

        <p style={{
          fontSize: '1.1rem',
          color: '#7b7f96',
          maxWidth: '560px',
          margin: '0 auto 2.5rem',
          lineHeight: 1.7,
        }}>
          Automatically discovers freelance jobs, scores opportunities,
          and writes tailored proposals — so you can focus on doing
          great work, not searching for it.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <SignedOut>
            <SignUpButton mode="modal">
              <button className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}>
                Get Started Free →
              </button>
            </SignUpButton>
            <SignInButton mode="modal">
              <button className="btn" style={{
                background: 'transparent',
                border: '1px solid #2a2d3e',
                color: '#7b7f96',
                padding: '0.75rem 2rem',
                fontSize: '1rem',
              }}>
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard" className="btn btn-primary"
              style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}>
              Go to Dashboard →
            </Link>
          </SignedIn>
        </div>
      </div>

      {/* Features */}
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '0 1.5rem 6rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem',
      }}>
        {[
          {
            icon: '🔍',
            title: 'Smart Job Discovery',
            desc: 'Scout Agent scans WeWorkRemotely, RemoteOK and more to find the best-matched opportunities for your skills.',
          },
          {
            icon: '📊',
            title: 'AI Opportunity Scoring',
            desc: 'Analyst Agent scores every job on skill match, pay, ease of implementation, and time-to-completion.',
          },
          {
            icon: '🎯',
            title: 'Strategic Filtering',
            desc: 'Strategist Agent calculates win probability, competition level, and gives Apply/Skip recommendations.',
          },
          {
            icon: '✍️',
            title: 'Tailored Proposals',
            desc: 'Writer Agent generates professional, personalized proposals based on your real skills and experience.',
          },
          {
            icon: '👤',
            title: 'Human-in-the-Loop',
            desc: 'Review, edit, approve or reject every proposal before it goes anywhere. You stay in full control.',
          },
          {
            icon: '📧',
            title: 'One-Click Email',
            desc: 'Send approved proposals directly to clients via email without leaving the dashboard.',
          },
        ].map((f) => (
          <div key={f.title} className="card" style={{ padding: '1.5rem' }}>
            <div style={{ fontSize: '1.8rem', marginBottom: '0.75rem' }}>{f.icon}</div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#e4e6f0' }}>
              {f.title}
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#7b7f96', lineHeight: 1.6 }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </main>
  )
}
