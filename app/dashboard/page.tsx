'use client'

import { useAuth } from '@clerk/nextjs'
import { useEffect, useState, useCallback } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ai-agentic-freelance-workflow.onrender.com'

interface Proposal {
  id: string
  job_title: string
  company: string
  job_url: string
  job_score: number
  proposal_text: string
  timeline: string
  price_range: string
  key_skills_highlighted: string[]
  status: string
  recommendation: string
  win_probability: number
  competition_level: string
  skill_match_score: number
  opportunity_tier: string
  reasoning: string
  red_flags: string[]
  created_at: string
}

interface Analytics {
  total: number
  pending: number
  approved: number
  rejected: number
  high_match: number
  medium_match: number
  low_match: number
  approval_rate: number
  avg_win_probability: number
  high_value_opportunities: number
}

interface CrewStatus {
  running: boolean
  last_run: string | null
  last_error: string | null
  pending_count: number
}

export default function Dashboard() {
  const { getToken } = useAuth()
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [crewStatus, setCrewStatus] = useState<CrewStatus>({
    running: false, last_run: null, last_error: null, pending_count: 0,
  })
  const [keywords, setKeywords] = useState('AI automation freelance Python')
  const [loading, setLoading] = useState(true)
  const [runLoading, setRunLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending')

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

  const loadData = useCallback(async () => {
    try {
      const [propRes, analyticsRes, statusRes] = await Promise.all([
        authFetch('/api/v1/proposals'),
        authFetch('/api/v1/analytics'),
        authFetch('/api/v1/status'),
      ])
      if (propRes.ok) {
        const d = await propRes.json()
        setProposals(d.proposals || [])
      }
      if (analyticsRes.ok) setAnalytics(await analyticsRes.json())
      if (statusRes.ok) setCrewStatus(await statusRes.json())
    } catch (e) {
      console.error('Load failed:', e)
    } finally {
      setLoading(false)
    }
  }, [authFetch])

  useEffect(() => { loadData() }, [loadData])

  // Poll while running
  useEffect(() => {
    if (!crewStatus.running) return
    const interval = setInterval(async () => {
      const res = await authFetch('/api/v1/status')
      if (res.ok) {
        const s = await res.json()
        setCrewStatus(s)
        if (!s.running) { loadData() }
      }
    }, 4000)
    return () => clearInterval(interval)
  }, [crewStatus.running, authFetch, loadData])

  const handleRun = async () => {
    setRunLoading(true)
    try {
      const res = await authFetch('/api/v1/run', {
        method: 'POST',
        body: JSON.stringify({ keywords }),
      })
      if (res.ok) {
        setCrewStatus(s => ({ ...s, running: true }))
      }
    } catch (e) {
      console.error('Run failed:', e)
    } finally {
      setRunLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    await authFetch(`/api/v1/proposals/${id}/approve`, { method: 'POST' })
    loadData()
  }

  const handleReject = async (id: string) => {
    await authFetch(`/api/v1/proposals/${id}/reject`, { method: 'POST' })
    loadData()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this proposal?')) return
    await authFetch(`/api/v1/proposals/${id}`, { method: 'DELETE' })
    loadData()
  }

  const filtered = proposals.filter(p => p.status === activeTab)

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '60vh', color: '#7b7f96', fontSize: '0.9rem',
      }}>
        Loading your dashboard…
      </div>
    )
  }

  return (
    <div className="container">

      {/* Analytics Strip */}
      {analytics && (
        <div className="analytics-grid" style={{ marginTop: '2rem' }}>
          {[
            { label: 'Total', value: analytics.total, color: '#e4e6f0' },
            { label: 'Pending', value: analytics.pending, color: '#f59e0b' },
            { label: 'Approved', value: analytics.approved, color: '#22c55e' },
            { label: 'High Match', value: analytics.high_match, color: '#5b6af0' },
            { label: 'Win Rate', value: `${analytics.avg_win_probability}%`, color: '#a855f7' },
            { label: 'Approval Rate', value: `${analytics.approval_rate}%`, color: '#06b6d4' },
            { label: 'High Value', value: analytics.high_value_opportunities, color: '#eab308' },
            { label: 'Rejected', value: analytics.rejected, color: '#ef4444' },
          ].map(a => (
            <div key={a.label} className="analytics-card">
              <div className="analytics-value" style={{ color: a.color }}>{a.value}</div>
              <div className="analytics-label">{a.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Run Panel */}
      <div className="card run-card">
        <div className="run-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
            <span>🤖</span> Dispatch Agents
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            fontSize: '0.8rem', fontWeight: 500,
            color: crewStatus.running ? '#f59e0b' : '#7b7f96',
            background: crewStatus.running ? 'rgba(245,158,11,0.12)' : 'transparent',
            border: `1px solid ${crewStatus.running ? '#f59e0b' : '#2a2d3e'}`,
            padding: '0.25rem 0.75rem', borderRadius: '20px',
          }}>
            <span className="status-dot" />
            {crewStatus.running ? 'Running…' : 'Idle'}
          </div>
        </div>
        <div className="run-card-body">
          {/* Pipeline */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap',
          }}>
            {[
              { icon: '🔍', name: 'Scout', role: 'Finds Jobs', color: '#6366f1' },
              { icon: '📊', name: 'Analyst', role: 'Scores & Ranks', color: '#06b6d4' },
              { icon: '🎯', name: 'Strategist', role: 'Apply/Skip', color: '#f59e0b' },
              { icon: '✍️', name: 'Writer', role: 'Writes Proposals', color: '#a855f7' },
            ].map((agent, i, arr) => (
              <div key={agent.name} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
                  <div style={{
                    width: '52px', height: '52px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.4rem', border: `2px solid ${agent.color}`,
                    background: '#1e2130',
                  }}>{agent.icon}</div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{agent.name}</span>
                  <span style={{ fontSize: '0.72rem', color: '#7b7f96' }}>{agent.role}</span>
                </div>
                {i < arr.length - 1 && (
                  <span style={{ color: '#4a4e65', fontSize: '1.2rem' }}>→</span>
                )}
              </div>
            ))}
          </div>

          <div className="input-row">
            <div className="input-group">
              <label className="input-label">Search Keywords</label>
              <input
                className="input-field"
                value={keywords}
                onChange={e => setKeywords(e.target.value)}
                placeholder="e.g. AI automation freelance Python"
                disabled={crewStatus.running}
              />
            </div>
            <button
              className="btn btn-primary"
              onClick={handleRun}
              disabled={crewStatus.running || runLoading}
              style={{ whiteSpace: 'nowrap', minWidth: '150px', height: '42px' }}
            >
              {crewStatus.running ? '⏳ Running…' : '⚡ Run Agents'}
            </button>
          </div>

          {crewStatus.last_error && (
            <div className="error-box">
              <strong>Last error:</strong> {crewStatus.last_error}
            </div>
          )}
          {crewStatus.last_run && (
            <p style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#4a4e65' }}>
              Last run: {crewStatus.last_run}
            </p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {(['pending', 'approved', 'rejected'] as const).map(tab => {
          const count = proposals.filter(p => p.status === tab).length
          const colors: Record<string, string> = {
            pending: '#f59e0b', approved: '#22c55e', rejected: '#ef4444'
          }
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '0.4rem 1rem',
                borderRadius: '20px',
                border: `1px solid ${activeTab === tab ? colors[tab] : '#2a2d3e'}`,
                background: activeTab === tab ? `rgba(${tab === 'pending' ? '245,158,11' : tab === 'approved' ? '34,197,94' : '239,68,68'},0.12)` : 'transparent',
                color: activeTab === tab ? colors[tab] : '#7b7f96',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
                fontFamily: 'inherit',
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)} ({count})
            </button>
          )
        })}
      </div>

      {/* Proposals */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <p>No {activeTab} proposals. {activeTab === 'pending' && 'Run agents to generate new ones.'}</p>
        </div>
      ) : (
        <div className="proposals-list">
          {filtered.map(proposal => (
            <div key={proposal.id} className={`proposal-card ${proposal.status}`}>

              {/* Tier Banner */}
              {proposal.opportunity_tier && proposal.opportunity_tier !== 'Unknown' && (
                <div style={{
                  padding: '0.35rem 1.5rem',
                  fontSize: '0.75rem', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.04em',
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  background: proposal.opportunity_tier === 'High Value'
                    ? 'rgba(234,179,8,0.12)' : proposal.opportunity_tier === 'Medium Value'
                    ? 'rgba(245,158,11,0.12)' : '#1e2130',
                  color: proposal.opportunity_tier === 'High Value'
                    ? '#eab308' : proposal.opportunity_tier === 'Medium Value'
                    ? '#f59e0b' : '#7b7f96',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                }}>
                  {proposal.opportunity_tier === 'High Value' ? '🔥'
                    : proposal.opportunity_tier === 'Medium Value' ? '⚡' : '💡'}
                  {proposal.opportunity_tier}
                </div>
              )}

              <div className="proposal-header">
                <div className="proposal-meta">
                  <span className="proposal-company">{proposal.company || 'Unknown'}</span>
                  {proposal.job_score > 0 && (
                    <span className="badge" style={{
                      background: 'rgba(91,106,240,0.12)',
                      borderColor: '#5b6af0', color: '#5b6af0',
                    }}>
                      Score: {proposal.job_score}/100
                    </span>
                  )}
                  <span className={`badge badge-${proposal.status}`}>
                    {proposal.status}
                  </span>
                </div>
                <h3 className="proposal-title">{proposal.job_title || 'Untitled'}</h3>
                <div className="proposal-chips">
                  {proposal.price_range && <span className="chip">💰 {proposal.price_range}</span>}
                  {proposal.timeline && <span className="chip">⏱ {proposal.timeline}</span>}
                </div>
              </div>

              {/* Intelligence Row */}
              {(proposal.win_probability > 0 || proposal.competition_level) && (
                <div className="intelligence-row">
                  {proposal.recommendation && (
                    <span className={`badge badge-${proposal.recommendation.toLowerCase()}`}>
                      {proposal.recommendation === 'Apply' ? '✓ Apply' : '✗ Skip'}
                    </span>
                  )}
                  {proposal.win_probability > 0 && (
                    <span className="chip">🎯 Win: {proposal.win_probability}%</span>
                  )}
                  {proposal.competition_level && (
                    <span className="chip">👥 {proposal.competition_level} Competition</span>
                  )}
                  {proposal.skill_match_score > 0 && (
                    <span className="chip">🧠 Match: {proposal.skill_match_score}%</span>
                  )}
                </div>
              )}

              {/* Reasoning */}
              {proposal.reasoning && (
                <div className="reasoning-box">
                  <strong style={{ color: '#5b6af0' }}>💡 Strategy: </strong>
                  {proposal.reasoning}
                </div>
              )}

              <div className="proposal-body">
                <p className="proposal-text">{proposal.proposal_text}</p>
                {proposal.key_skills_highlighted?.length > 0 && (
                  <div className="skills-row">
                    {proposal.key_skills_highlighted.slice(0, 5).map(s => (
                      <span key={s} className="skill-tag">{s}</span>
                    ))}
                  </div>
                )}
                {proposal.job_url && proposal.job_url !== '#' && (
                  <a href={proposal.job_url} target="_blank" rel="noopener noreferrer" className="job-link">
                    View Original Job →
                  </a>
                )}
              </div>

              {proposal.status === 'pending' && (
                <div className="proposal-actions">
                  <button className="btn btn-approve" onClick={() => handleApprove(proposal.id)}>
                    ✓ Approve
                  </button>
                  <button className="btn btn-reject" onClick={() => handleReject(proposal.id)}>
                    ✗ Reject
                  </button>
                  <button className="btn btn-delete" onClick={() => handleDelete(proposal.id)}>
                    🗑 Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
