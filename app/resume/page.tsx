'use client'

import { useAuth } from '@clerk/nextjs'
import { useState, useCallback } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ai-agentic-freelance-workflow.onrender.com'

interface ResumeResult {
  id: string
  optimized_text: string
  ats_score: number
  improvements: string[]
}

export default function ResumePage() {
  const { getToken } = useAuth()
  const [inputText, setInputText] = useState('')
  const [targetRole, setTargetRole] = useState('')
  const [result, setResult] = useState<ResumeResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const authFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    const token = await getToken()
    return fetch(`${API_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    })
  }, [getToken])

  const handleGenerate = async () => {
    if (!inputText.trim()) {
      setError('Please paste your current resume or background text first.')
      return
    }
    setError('')
    setLoading(true)
    setResult(null)
    try {
      const res = await authFetch('/api/v1/resume/generate', {
        method: 'POST',
        body: JSON.stringify({ input_text: inputText, target_role: targetRole }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Resume generation failed. Please try again.')
        return
      }
      setResult(data)
    } catch (e) {
      console.error('Resume generation error:', e)
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (result?.optimized_text) {
      navigator.clipboard.writeText(result.optimized_text)
    }
  }

  const atsColor = (score: number) => {
    if (score >= 80) return '#22c55e'
    if (score >= 60) return '#f59e0b'
    return '#ef4444'
  }

  return (
    <div className="container">
      <div style={{ marginTop: '2rem', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.3rem' }}>
          Resume Optimizer
        </h1>
        <p style={{ color: '#7b7f96', fontSize: '0.9rem' }}>
          Paste your resume or background — get an ATS-optimized rewrite with a compatibility score.
        </p>
      </div>

      <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="input-group">
            <label className="input-label">Target Role (optional)</label>
            <input
              className="input-field"
              value={targetRole}
              onChange={e => setTargetRole(e.target.value)}
              placeholder="e.g. Senior Python Developer"
              maxLength={120}
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <label className="input-label">
              Your Current Resume / Background ({inputText.length}/1500)
            </label>
            <textarea
              className="input-field"
              value={inputText}
              onChange={e => setInputText(e.target.value.slice(0, 1500))}
              placeholder="Paste your current resume text, work history, or a summary of your background and skills..."
              rows={10}
              disabled={loading}
              style={{ resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }}
            />
          </div>

          <button
            className="btn btn-primary"
            onClick={handleGenerate}
            disabled={loading}
            style={{ alignSelf: 'flex-start', padding: '0.6rem 1.5rem' }}
          >
            {loading ? '⏳ Optimizing…' : '✨ Optimize Resume'}
          </button>

          {error && <div className="error-box">{error}</div>}
        </div>
      </div>

      {result && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #2a2d3e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>Optimized Resume</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span className="badge" style={{
                background: `${atsColor(result.ats_score)}20`,
                borderColor: atsColor(result.ats_score),
                color: atsColor(result.ats_score),
              }}>
                ATS Score: {result.ats_score}/100
              </span>
              <button
                className="btn"
                onClick={handleCopy}
                style={{
                  background: '#1e2130',
                  color: '#7b7f96',
                  borderColor: '#2a2d3e',
                  fontSize: '0.8rem',
                }}
              >
                📋 Copy
              </button>
            </div>
          </div>

          {result.improvements?.length > 0 && (
            <div style={{
              padding: '1rem 1.5rem',
              background: 'rgba(91,106,240,0.07)',
              borderBottom: '1px solid #2a2d3e',
            }}>
              <p style={{ fontSize: '0.78rem', fontWeight: 600, color: '#5b6af0', marginBottom: '0.5rem' }}>
                💡 Improvements Made
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                {result.improvements.map((imp, i) => (
                  <li key={i} style={{
                    fontSize: '0.82rem',
                    color: '#7b7f96',
                    paddingLeft: '0.9rem',
                    position: 'relative',
                  }}>
                    <span style={{ position: 'absolute', left: 0, color: '#5b6af0' }}>•</span>
                    {imp}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div style={{ padding: '1.5rem' }}>
            <p style={{
              fontSize: '0.875rem',
              color: '#e4e6f0',
              lineHeight: 1.8,
              whiteSpace: 'pre-line',
            }}>
              {result.optimized_text}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
