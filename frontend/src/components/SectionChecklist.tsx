interface Sections {
  summary: boolean
  experience: boolean
  education: boolean
  skills: boolean
  projects: boolean
  quantified_metrics: boolean
}

interface SectionChecklistProps {
  sections: Sections
}

const labels: Record<keyof Sections, string> = {
  summary: 'Professional summary',
  experience: 'Work experience',
  education: 'Education',
  skills: 'Skills section',
  projects: 'Projects',
  quantified_metrics: 'Quantified metrics (numbers, %)',
}

export default function SectionChecklist({ sections }: SectionChecklistProps) {
  return (
    <div>
      <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 10 }}>
        Resume sections
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {(Object.keys(labels) as (keyof Sections)[]).map(key => (
          <div
            key={key}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <div
              style={{
                width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                background: sections[key] ? '#1D9E75' : '#F0997B',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, color: '#fff', fontWeight: 500,
              }}
            >
              {sections[key] ? '✓' : '✗'}
            </div>
            <span style={{ fontSize: 13, color: sections[key] ? '#1a1a1a' : '#888' }}>
              {labels[key]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
