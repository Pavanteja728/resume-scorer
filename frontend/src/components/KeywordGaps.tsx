interface KeywordGapsProps {
  missing: string[]
  matched: string[]
}

export default function KeywordGaps({ missing, matched }: KeywordGapsProps) {
  return (
    <div>
      {matched.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: '#085041', marginBottom: 8 }}>
            Matched keywords ({matched.length})
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {matched.map(k => (
              <span
                key={k}
                style={{
                  fontSize: 12, padding: '3px 10px',
                  borderRadius: 20,
                  background: '#E1F5EE',
                  color: '#085041',
                  fontWeight: 500,
                }}
              >
                ✓ {k}
              </span>
            ))}
          </div>
        </div>
      )}

      {missing.length > 0 && (
        <div>
          <p style={{ fontSize: 13, fontWeight: 500, color: '#A32D2D', marginBottom: 8 }}>
            Missing keywords ({missing.length})
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {missing.map(k => (
              <span
                key={k}
                style={{
                  fontSize: 12, padding: '3px 10px',
                  borderRadius: 20,
                  background: '#FCEBEB',
                  color: '#A32D2D',
                  fontWeight: 500,
                }}
              >
                {k}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
