export default function AtsScoreGauge({ score = 87, label = "ATS Score", size = 180 }) {
  // Clamp score between 0 and 100
  const normalizedScore = Math.max(0, Math.min(100, Math.round(score || 0)));
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  let matchStatus = 'Excellent Match';
  let badgeClass = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  if (normalizedScore < 60) {
    matchStatus = 'Needs Attention';
    badgeClass = 'text-rose-400 bg-rose-500/10 border-rose-500/30';
  } else if (normalizedScore < 80) {
    matchStatus = 'Good Match';
    badgeClass = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
  }

  return (
    <div className="flex flex-col items-center justify-center text-center p-4">
      <div
        className="ats-circular-gauge"
        style={{ width: size, height: size }}
      >
        <div className="ats-gauge-glow" />
        <svg
          viewBox="0 0 160 160"
          className="ats-gauge-svg"
        >
          <defs>
            <linearGradient id="atsGoldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFE071" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
          </defs>
          <circle
            cx="80"
            cy="80"
            r={radius}
            className="ats-gauge-bg-circle"
          />
          <circle
            cx="80"
            cy="80"
            r={radius}
            className="ats-gauge-progress-circle"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>

        <div className="ats-gauge-center-content">
          <div className="ats-gauge-score-val">{normalizedScore}</div>
          <div className="ats-gauge-score-out-of">/100</div>
        </div>
      </div>

      <div className="ats-gauge-title">{label}</div>
      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badgeClass}`}>
        <span>✓</span>
        <span>{matchStatus}</span>
      </div>
    </div>
  );
}
