interface ScoreRingProps {
  score: number
  verdict: string
}

export default function ScoreRing({ score, verdict }: ScoreRingProps) {
  const radius = 54
  const circumference = 2 * Math.PI * radius

  const color =
    score >= 80 ? '#1D9E75' :
    score >= 60 ? '#185FA5' :
    score >= 40 ? '#BA7517' : '#A32D2D'

  const bgColor =
    score >= 80 ? '#E1F5EE' :
    score >= 60 ? '#E6F1FB' :
    score >= 40 ? '#FAEEDA' : '#FCEBEB'

  const offset = circumference * (1 - score / 100)

  return (
    <div style={{ textAlign: 'center' }}>
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={radius} fill={bgColor} />
        <circle
          cx="70" cy="70" r={radius}
          fill="none"
          stroke="#fff"
          strokeWidth="12"
        />
        <circle
          cx="70" cy="70" r={radius}
          fill="none"
          stroke="#f1f0ec"
          strokeWidth="10"
        />
        <circle
          cx="70" cy="70" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 70 70)"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
        <text
          x="70" y="65"
          textAnchor="middle"
          fontSize="28"
          fontWeight="500"
          fill={color}
        >
          {score}%
        </text>
        <text
          x="70" y="83"
          textAnchor="middle"
          fontSize="11"
          fill="#888"
        >
          {verdict}
        </text>
      </svg>
    </div>
  )
}
