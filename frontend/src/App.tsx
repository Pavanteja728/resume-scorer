import { useState } from 'react'
import axios from 'axios'
import { API } from './config'
import ScoreRing from './components/ScoreRing'
import KeywordGaps from './components/KeywordGaps'
import SectionChecklist from './components/SectionChecklist'

interface ScoreResult {
  score: number
  verdict: string
  missing_keywords: string[]
  matched_keywords: string[]
  sections: {
    summary: boolean
    experience: boolean
    education: boolean
    skills: boolean
    projects: boolean
    quantified_metrics: boolean
  }
  resume_word_count: number
  jd_word_count: number
}

type Tab = 'gaps' | 'sections' | 'suggestions' | 'rewrite'

export default function App() {
  const [resume, setResume] = useState('')
  const [jd, setJd] = useState('')
  const [result, setResult] = useState<ScoreResult | null>(null)
  const [suggestions, setSuggestions] = useState('')
  const [rewrite, setRewrite] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingAI, setLoadingAI] = useState<'suggestions' | 'rewrite' | null>(null)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<Tab>('gaps')

  const handleScore = async () => {
    if (!resume.trim() || !jd.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    setSuggestions('')
    setRewrite('')
    try {
      const { data } = await axios.post(`${API}/score`, {
        resume,
        job_description: jd,
      })
      setResult(data)
      setActiveTab('gaps')
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Something went wrong. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  const handleSuggestions = async () => {
    setLoadingAI('suggestions')
    try {
      const { data } = await axios.post(`${API}/suggestions`, {
        resume,
        job_description: jd,
      })
      setSuggestions(data.suggestions)
      setActiveTab('suggestions')
    } catch {
      setError('Failed to get suggestions.')
    } finally {
      setLoadingAI(null)
    }
  }

  const handleRewrite = async () => {
    setLoadingAI('rewrite')
    try {
      const { data } = await axios.post(`${API}/rewrite-summary`, {
        resume,
        job_description: jd,
      })
      setRewrite(data.summary)
      setActiveTab('rewrite')
    } catch {
      setError('Failed to rewrite summary.')
    } finally {
      setLoadingAI(null)
    }
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'gaps', label: 'Keyword gaps' },
    { key: 'sections', label: 'Sections' },
    { key: 'suggestions', label: 'AI suggestions' },
    { key: 'rewrite', label: 'Rewritten summary' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#f8f8f6', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: 24, fontWeight: 500, marginBottom: 4 }}>
            Resume Match Scorer
          </h1>
          <p style={{ fontSize: 14, color: '#888' }}>
            Paste your resume and a job description — get an AI match score, keyword gaps, and rewrite suggestions
          </p>
        </div>

        {/* Input grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>
              Your resume
            </label>
            <textarea
              rows={16}
              value={resume}
              onChange={e => setResume(e.target.value)}
              placeholder="Paste your full resume text here..."
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 8,
                border: '0.5px solid #D3D1C7', fontSize: 13, lineHeight: 1.65,
                background: '#fff',
              }}
            />
            <p style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>
              {resume.split(/\s+/).filter(Boolean).length} words
            </p>
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>
              Job description
            </label>
            <textarea
              rows={16}
              value={jd}
              onChange={e => setJd(e.target.value)}
              placeholder="Paste the full job description here..."
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 8,
                border: '0.5px solid #D3D1C7', fontSize: 13, lineHeight: 1.65,
                background: '#fff',
              }}
            />
            <p style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>
              {jd.split(/\s+/).filter(Boolean).length} words
            </p>
          </div>
        </div>

        {/* Analyse button */}
        <button
          onClick={handleScore}
          disabled={!resume.trim() || !jd.trim() || loading}
          style={{
            padding: '11px 28px', borderRadius: 8, border: 'none',
            background: !resume.trim() || !jd.trim() || loading ? '#B5D4F4' : '#185FA5',
            color: '#fff', fontSize: 14, fontWeight: 500,
            marginBottom: '1.5rem',
          }}
        >
          {loading ? 'Analysing...' : 'Analyse match'}
        </button>

        {error && (
          <div style={{
            background: '#FCEBEB', border: '0.5px solid #F09595',
            borderRadius: 8, padding: '10px 14px', marginBottom: 16,
            fontSize: 13, color: '#791F1F',
          }}>
            {error}
          </div>
        )}

        {/* Results panel */}
        {result && (
          <div style={{
            background: '#fff', border: '0.5px solid #D3D1C7',
            borderRadius: 12, overflow: 'hidden', marginBottom: 16,
          }}>
            {/* Score header */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'auto 1fr',
              gap: 24, padding: '1.5rem', alignItems: 'center',
              borderBottom: '0.5px solid #D3D1C7',
            }}>
              <ScoreRing score={result.score} verdict={result.verdict} />

              <div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
                  {[
                    { label: 'Match score', value: `${result.score}%` },
                    { label: 'Missing keywords', value: result.missing_keywords.length },
                    { label: 'Matched keywords', value: result.matched_keywords.length },
                    { label: 'Resume words', value: result.resume_word_count },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      style={{
                        background: '#f8f8f6', borderRadius: 8,
                        padding: '10px 14px', minWidth: 110,
                      }}
                    >
                      <p style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>{label}</p>
                      <p style={{ fontSize: 20, fontWeight: 500 }}>{value}</p>
                    </div>
                  ))}
                </div>

                {/* AI action buttons */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    onClick={handleSuggestions}
                    disabled={loadingAI !== null}
                    style={{
                      padding: '8px 16px', borderRadius: 8,
                      border: '0.5px solid #D3D1C7', background: 'transparent',
                      fontSize: 13,
                    }}
                  >
                    {loadingAI === 'suggestions' ? 'Getting suggestions...' : 'Get AI suggestions'}
                  </button>
                  <button
                    onClick={handleRewrite}
                    disabled={loadingAI !== null}
                    style={{
                      padding: '8px 16px', borderRadius: 8,
                      border: '0.5px solid #185FA5', background: '#E6F1FB',
                      color: '#0C447C', fontSize: 13, fontWeight: 500,
                    }}
                  >
                    {loadingAI === 'rewrite' ? 'Rewriting...' : 'Rewrite my summary'}
                  </button>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div style={{
              display: 'flex', borderBottom: '0.5px solid #D3D1C7',
              padding: '0 1.5rem',
            }}>
              {tabs.map(t => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  style={{
                    padding: '10px 16px', border: 'none', background: 'transparent',
                    fontSize: 13, cursor: 'pointer',
                    color: activeTab === t.key ? '#185FA5' : '#888',
                    borderBottom: activeTab === t.key ? '2px solid #185FA5' : '2px solid transparent',
                    fontWeight: activeTab === t.key ? 500 : 400,
                    marginBottom: -1,
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div style={{ padding: '1.5rem' }}>
              {activeTab === 'gaps' && (
                <KeywordGaps
                  missing={result.missing_keywords}
                  matched={result.matched_keywords}
                />
              )}

              {activeTab === 'sections' && (
                <SectionChecklist sections={result.sections} />
              )}

              {activeTab === 'suggestions' && (
                suggestions ? (
                  <div style={{
                    background: '#E1F5EE', borderRadius: 8,
                    padding: '1rem 1.25rem',
                  }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: '#085041', marginBottom: 8 }}>
                      AI improvement suggestions
                    </p>
                    <p style={{ fontSize: 13, color: '#0F6E56', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>
                      {suggestions}
                    </p>
                  </div>
                ) : (
                  <p style={{ fontSize: 13, color: '#888' }}>
                    Click "Get AI suggestions" above to generate improvements.
                  </p>
                )
              )}

              {activeTab === 'rewrite' && (
                rewrite ? (
                  <div>
                    <div style={{
                      background: '#E6F1FB', borderRadius: 8,
                      padding: '1rem 1.25rem', marginBottom: 12,
                    }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: '#0C447C', marginBottom: 8 }}>
                        AI-rewritten professional summary
                      </p>
                      <p style={{ fontSize: 13, color: '#185FA5', lineHeight: 1.75 }}>
                        {rewrite}
                      </p>
                    </div>
                    <button
                      onClick={() => navigator.clipboard.writeText(rewrite)}
                      style={{
                        padding: '7px 14px', borderRadius: 8,
                        border: '0.5px solid #D3D1C7', background: 'transparent',
                        fontSize: 12, cursor: 'pointer',
                      }}
                    >
                      Copy to clipboard
                    </button>
                  </div>
                ) : (
                  <p style={{ fontSize: 13, color: '#888' }}>
                    Click "Rewrite my summary" above to generate an optimised version.
                  </p>
                )
              )}
            </div>
          </div>
        )}

        <p style={{ fontSize: 12, color: '#bbb', textAlign: 'center' }}>
          Powered by HuggingFace sentence-transformers + Groq LLM
        </p>
      </div>
    </div>
  )
}
