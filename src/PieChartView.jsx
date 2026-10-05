import React from 'react';

const W = 520;
const DEPTH = 40; // 3D extrusion height in px
const TILT = 0.5; // vertical squash for the 3D view

const rad = (deg) => (deg * Math.PI) / 180;

// Lighten (amt > 0) or darken (amt < 0) any CSS color we generate.
const shade = (color, amt) => {
  if (color.startsWith('hsl')) {
    const [h, s, l] = color.match(/[\d.]+/g).map(Number);
    return `hsl(${h}, ${s}%, ${Math.max(0, Math.min(100, l + amt * 50))}%)`;
  }
  let hex = color.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
  const n = parseInt(hex.padStart(6, '0'), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) =>
    Math.round(amt < 0 ? c * (1 + amt) : c + (255 - c) * amt)
  );
  return `rgb(${ch.join(',')})`;
};

const CLIPART = [
  { e: '💰', x: 40, y: 70, s: 44, r: -15 },
  { e: '🚀', x: 470, y: 90, s: 48, r: 20 },
  { e: '📈', x: 60, y: 330, s: 40, r: 10 },
  { e: '🔥', x: 455, y: 340, s: 46, r: -10 },
  { e: '✨', x: 300, y: 150, s: 34, r: 0 },
  { e: '💯', x: 200, y: 260, s: 38, r: -20 },
  { e: '🏆', x: 120, y: 190, s: 36, r: 12 },
];

const PieChartView = ({ data, opts, rotation }) => {
  const threeD = opts.threeD;
  const tilt = threeD ? TILT : 1;
  const depth = threeD ? DEPTH : 0;
  const H = threeD ? 360 : 420;
  const showLabels = opts.labels !== 'hidden';
  const R = showLabels ? 130 : 160;
  const inner = opts.donut ? R * 0.5 : 0;
  const cx = W / 2;
  const cy = H / 2 - depth / 2;

  const pt = (a, r, ox = 0, oy = 0, dz = 0) => [
    cx + ox + r * Math.cos(rad(a)),
    cy + oy + r * Math.sin(rad(a)) * tilt + dz,
  ];

  // Lay out slices clockwise from 12 o'clock (plus rotation)
  let angle = -90 + rotation;
  const slices = data.map((d, i) => {
    const sweep = d.pct * 360;
    const a0 = angle;
    const a1 = angle + sweep;
    angle = a1;
    const mid = (a0 + a1) / 2;
    const dist = opts.explode ? 14 + ((i * 11) % 30) : 0;
    return {
      ...d, i, a0, a1, mid, sweep,
      ox: dist * Math.cos(rad(mid)),
      oy: dist * Math.sin(rad(mid)) * tilt,
    };
  });

  const slicePath = (s, dz = 0) => {
    const large = s.sweep > 180 ? 1 : 0;
    const [x0, y0] = pt(s.a0, R, s.ox, s.oy, dz);
    const [x1, y1] = pt(s.a1, R, s.ox, s.oy, dz);
    let p = `M ${x0} ${y0} A ${R} ${R * tilt} 0 ${large} 1 ${x1} ${y1}`;
    if (inner > 0) {
      const [ix1, iy1] = pt(s.a1, inner, s.ox, s.oy, dz);
      const [ix0, iy0] = pt(s.a0, inner, s.ox, s.oy, dz);
      p += ` L ${ix1} ${iy1} A ${inner} ${inner * tilt} 0 ${large} 0 ${ix0} ${iy0} Z`;
    } else {
      const [px, py] = pt(0, 0, s.ox, s.oy, dz);
      p += ` L ${px} ${py} Z`;
    }
    return p;
  };

  const fillFor = (s) => {
    if (opts.hatch) return `url(#hatch-${s.i})`;
    if (opts.gloss) return `url(#gloss-${s.i})`;
    return s.color;
  };

  const stroke = opts.outline ? '#000' : '#fff';
  const strokeWidth = opts.outline ? 6 : 1.5;

  // Label styling
  const baseSize = opts.largeFont ? 16 : 12;
  const randomSizes = opts.largeFont ? [14, 26, 16, 30, 12, 22] : [6, 18, 9, 24, 11, 15];
  const labelSize = (i) =>
    opts.labels === 'tiny' ? 6 : opts.labels === 'random' ? randomSizes[i % randomSizes.length] : baseSize;
  const labelFill = opts.labels === 'lowContrast' ? '#e2e8f0' : '#1e293b';
  const showPct = opts.directLabels || opts.badMath;

  // Painter's order for 3D extrusion: draw side layers bottom-up, tops last
  const layers = [];
  for (let z = depth; z > 0; z -= 2) layers.push(z);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      role="img"
      aria-label="Pie chart of market share"
      style={{ display: 'block', overflow: 'visible' }}
    >
      <defs>
        <filter id="dropshadow" x="-30%" y="-30%" width="160%" height="170%">
          <feDropShadow dx="14" dy="22" stdDeviation="9" floodColor="#000" floodOpacity="0.65" />
        </filter>
        {slices.map((s) => (
          <radialGradient key={`g${s.i}`} id={`gloss-${s.i}`} cx="35%" cy="25%" r="85%">
            <stop offset="0%" stopColor={shade(s.color, 0.75)} />
            <stop offset="45%" stopColor={s.color} />
            <stop offset="100%" stopColor={shade(s.color, -0.55)} />
          </radialGradient>
        ))}
        {slices.map((s) => (
          <pattern
            key={`h${s.i}`}
            id={`hatch-${s.i}`}
            width={4 + (s.i % 3)}
            height={4 + (s.i % 3)}
            patternUnits="userSpaceOnUse"
            patternTransform={`rotate(${(s.i * 37) % 180})`}
          >
            <rect width="10" height="10" fill={s.color} />
            <line x1="0" y1="0" x2="0" y2="10" stroke={s.i % 2 ? '#000' : '#fff'} strokeWidth="2" />
          </pattern>
        ))}
        <radialGradient id="shine" cx="40%" cy="20%" r="60%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {opts.gridlines && (
        <g stroke="#94a3b8" strokeWidth="1" opacity="0.7">
          {Array.from({ length: Math.ceil(W / 20) + 1 }, (_, i) => (
            <line key={`v${i}`} x1={i * 20} y1={0} x2={i * 20} y2={H} />
          ))}
          {Array.from({ length: Math.ceil(H / 20) + 1 }, (_, i) => (
            <line key={`h${i}`} x1={0} y1={i * 20} x2={W} y2={i * 20} />
          ))}
        </g>
      )}

      <g filter={opts.shadow ? 'url(#dropshadow)' : undefined}>
        {layers.map((z) => (
          <g key={`layer${z}`}>
            {slices.map((s) => (
              <path
                key={s.i}
                d={slicePath(s, z)}
                fill={shade(s.color, -0.35 - (z / depth) * 0.2)}
                stroke={z === depth && opts.outline ? '#000' : 'none'}
                strokeWidth={z === depth && opts.outline ? strokeWidth : 0}
              />
            ))}
          </g>
        ))}
        {slices.map((s) => (
          <path
            key={`top${s.i}`}
            d={slicePath(s)}
            fill={fillFor(s)}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          >
            <title>{`${s.name}: ${(s.pct * 100).toFixed(1)}%`}</title>
          </path>
        ))}
        {opts.gloss && (
          <ellipse
            cx={cx - R * 0.15}
            cy={cy - R * 0.35 * tilt}
            rx={R * 0.75}
            ry={R * 0.45 * tilt}
            fill="url(#shine)"
            pointerEvents="none"
          />
        )}
      </g>

      {opts.donut && !threeD && (
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central"
          fontSize={opts.largeFont ? 20 : 16} fontWeight="700" fill="#334155">
          {opts.badMath
            ? `${Math.round(data.reduce((t, d) => t + d.displayPct, 0) * 100)}%`
            : `${data.length} companies`}
        </text>
      )}

      {showLabels &&
        slices.map((s) => {
          const front = Math.sin(rad(s.mid)) > 0 ? depth : 0;
          const [ex, ey] = pt(s.mid, R, s.ox, s.oy, front);
          const [kx, ky] = pt(s.mid, R + 14, s.ox, s.oy, front);
          const right = Math.cos(rad(s.mid)) >= 0;
          const tx = kx + (right ? 10 : -10);
          const text = showPct ? `${s.name} ${Math.round(s.displayPct * 100)}%` : s.name;
          return (
            <g key={`lbl${s.i}`}>
              <polyline
                points={`${ex},${ey} ${kx},${ky} ${tx},${ky}`}
                fill="none"
                stroke={opts.labels === 'lowContrast' ? '#e2e8f0' : '#64748b'}
                strokeWidth="1"
              />
              <text
                x={tx + (right ? 3 : -3)}
                y={ky}
                textAnchor={right ? 'start' : 'end'}
                dominantBaseline="central"
                fontSize={labelSize(s.i)}
                fill={labelFill}
              >
                {text}
              </text>
            </g>
          );
        })}

      {opts.clipart && (
        <g pointerEvents="none">
          {CLIPART.map((c, i) => (
            <text key={i} x={c.x} y={c.y} fontSize={c.s} textAnchor="middle"
              dominantBaseline="central" transform={`rotate(${c.r} ${c.x} ${c.y})`}>
              {c.e}
            </text>
          ))}
          <g transform={`translate(${W - 70} ${H - 60}) rotate(-14)`}>
            <polygon
              points={Array.from({ length: 24 }, (_, i) => {
                const r = i % 2 ? 30 : 46;
                const a = (i / 24) * Math.PI * 2;
                return `${r * Math.cos(a)},${r * Math.sin(a)}`;
              }).join(' ')}
              fill="#facc15" stroke="#dc2626" strokeWidth="3"
            />
            <text textAnchor="middle" dominantBaseline="central" fontSize="18"
              fontWeight="900" fill="#dc2626">WOW!</text>
          </g>
        </g>
      )}
    </svg>
  );
};

export default PieChartView;
