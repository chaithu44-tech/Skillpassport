// SVG-based dynamic score meters and progress gauges

export function renderRadialGauge({ score, size = 160, strokeWidth = 12, label = 'Readiness Score', sublabel = '' }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference;

  let strokeColor = '#7C5CFC';
  if (score >= 80) strokeColor = '#22C55E';
  else if (score >= 60) strokeColor = '#22D3EE';
  else if (score >= 40) strokeColor = '#F59E0B';
  else strokeColor = '#EF4444';

  return `
    <div class="relative flex flex-col items-center justify-center" style="width: ${size}px; height: ${size}px;">
      <svg class="w-full h-full transform -rotate-90" viewBox="0 0 ${size} ${size}">
        <!-- Background Track -->
        <circle
          cx="${size / 2}"
          cy="${size / 2}"
          r="${radius}"
          stroke="rgba(255, 255, 255, 0.08)"
          stroke-width="${strokeWidth}"
          fill="transparent"
        />
        <!-- Active Progress -->
        <circle
          class="progress-ring__circle"
          cx="${size / 2}"
          cy="${size / 2}"
          r="${radius}"
          stroke="${strokeColor}"
          stroke-width="${strokeWidth}"
          stroke-dasharray="${circumference}"
          stroke-dashoffset="${strokeDashoffset}"
          stroke-linecap="round"
          fill="transparent"
        />
      </svg>
      <!-- Center Text -->
      <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span class="text-3xl font-extrabold text-white tracking-tight font-mono">${Math.round(score)}%</span>
        <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">${sublabel || label}</span>
      </div>
    </div>
  `;
}

export function renderProgressBar({ percentage, height = 'h-2.5', color = 'bg-[#7C5CFC]' }) {
  const pct = Math.min(100, Math.max(0, percentage));
  return `
    <div class="w-full bg-slate-800/80 rounded-full overflow-hidden ${height}">
      <div class="${color} ${height} rounded-full transition-all duration-700 ease-out" style="width: ${pct}%"></div>
    </div>
  `;
}
