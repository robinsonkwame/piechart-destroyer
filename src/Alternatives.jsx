import React, { useState } from 'react';

// Okabe-Ito-style colorblind-safe palette
const SAFE = ['#0173B2', '#DE8F05', '#029E73', '#CC78BC', '#CA9161', '#949494'];

const TABS = [
  {
    id: 'bar',
    label: 'Sorted bar',
    blurb: 'Bars share a common baseline, so we compare lengths — something our eyes do far more accurately than angles or areas.',
  },
  {
    id: 'stacked',
    label: 'Stacked bar',
    blurb: 'Keeps the part-to-whole relationship (segments add to 100%) while using length instead of angle.',
  },
  {
    id: 'waffle',
    label: 'Waffle',
    blurb: '100 squares, one per percentage point. Discrete counts are easy to read and compare.',
  },
  {
    id: 'donut',
    label: 'Donut',
    blurb: 'If you must use a circle: fewer slices, sorted, labeled directly, with the total in the middle.',
  },
];

const pctText = (p) => `${Math.round(p * 100)}%`;

// Honest version of the data: every company, sorted, at most 6 categories.
const tidy = (raw) => {
  const total = raw.reduce((t, d) => t + d.value, 0);
  const sorted = [...raw].sort((a, b) => b.value - a.value);
  const top = sorted.length > 6 ? sorted.slice(0, 5) : sorted;
  const rest = sorted.slice(top.length);
  const rows = top.map((d) => ({ name: d.name, pct: d.value / total }));
  if (rest.length) {
    rows.push({ name: `Other (${rest.length})`, pct: rest.reduce((t, d) => t + d.value, 0) / total });
  }
  return rows.map((r, i) => ({ ...r, color: SAFE[i] }));
};

const SortedBar = ({ rows }) => (
  <div className="space-y-2">
    {rows.map((r) => (
      <div key={r.name} className="flex items-center gap-3 text-sm">
        <span className="w-28 shrink-0 text-right text-slate-700">{r.name}</span>
        <div className="flex-1 bg-slate-100 rounded h-6">
          <div
            className="h-6 rounded alt-grow"
            style={{ width: `${(r.pct / rows[0].pct) * 100}%`, background: '#0173B2' }}
          />
        </div>
        <span className="w-10 font-semibold text-slate-800">{pctText(r.pct)}</span>
      </div>
    ))}
  </div>
);

const Stacked = ({ rows }) => (
  <div>
    <div className="flex h-12 rounded overflow-hidden">
      {rows.map((r) => (
        <div
          key={r.name}
          className="alt-grow flex items-center justify-center text-white text-xs font-semibold border-r-2 border-white last:border-r-0"
          style={{ width: `${r.pct * 100}%`, background: r.color }}
          title={`${r.name}: ${pctText(r.pct)}`}
        >
          {r.pct > 0.07 && pctText(r.pct)}
        </div>
      ))}
    </div>
    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-sm text-slate-700">
      {rows.map((r) => (
        <span key={r.name} className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ background: r.color }} />
          {r.name} {pctText(r.pct)}
        </span>
      ))}
    </div>
  </div>
);

const Waffle = ({ rows }) => {
  // Largest-remainder rounding so the squares total exactly 100
  const exact = rows.map((r) => r.pct * 100);
  const counts = exact.map(Math.floor);
  let left = 100 - counts.reduce((a, b) => a + b, 0);
  exact
    .map((e, i) => [e - Math.floor(e), i])
    .sort((a, b) => b[0] - a[0])
    .slice(0, left)
    .forEach(([, i]) => counts[i]++);
  const cells = counts.flatMap((c, i) => Array(c).fill(rows[i]));
  return (
    <div className="flex flex-col sm:flex-row gap-6 items-start">
      <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(10, 1.25rem)' }}>
        {cells.map((r, i) => (
          <div
            key={i}
            className="w-5 h-5 rounded-sm alt-pop"
            style={{ background: r.color, animationDelay: `${i * 6}ms` }}
            title={r.name}
          />
        ))}
      </div>
      <ul className="text-sm text-slate-700 space-y-1">
        {rows.map((r, i) => (
          <li key={r.name} className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-sm" style={{ background: r.color }} />
            {r.name}: <strong>{counts[i]}</strong> of 100
          </li>
        ))}
      </ul>
    </div>
  );
};

const Donut = ({ rows }) => {
  const R = 80;
  const r = 50;
  let a = -Math.PI / 2;
  const arcs = rows.map((row) => {
    const a0 = a;
    const a1 = (a += row.pct * Math.PI * 2);
    const large = a1 - a0 > Math.PI ? 1 : 0;
    const p = (ang, rr) => `${100 + rr * Math.cos(ang)} ${100 + rr * Math.sin(ang)}`;
    return {
      ...row,
      d: `M ${p(a0, R)} A ${R} ${R} 0 ${large} 1 ${p(a1, R)} L ${p(a1, r)} A ${r} ${r} 0 ${large} 0 ${p(a0, r)} Z`,
    };
  });
  return (
    <div className="flex flex-col sm:flex-row gap-6 items-center">
      <svg viewBox="0 0 200 200" width="200" height="200">
        {arcs.map((x) => (
          <path key={x.name} d={x.d} fill={x.color} stroke="#fff" strokeWidth="2" />
        ))}
        <text x="100" y="94" textAnchor="middle" fontSize="12" fill="#475569">Leader</text>
        <text x="100" y="112" textAnchor="middle" fontSize="18" fontWeight="700" fill="#0f172a">
          {pctText(rows[0].pct)}
        </text>
      </svg>
      <ul className="text-sm text-slate-700 space-y-1">
        {rows.map((x) => (
          <li key={x.name} className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-sm" style={{ background: x.color }} />
            {x.name} <strong>{pctText(x.pct)}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
};

const Alternatives = ({ rawData }) => {
  const [tab, setTab] = useState('bar');
  const rows = tidy(rawData);
  const active = TABS.find((t) => t.id === tab);
  const View = { bar: SortedBar, stacked: Stacked, waffle: Waffle, donut: Donut }[tab];

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold text-slate-800 mb-1">Same data, done right</h2>
      <p className="text-slate-600 mb-4">
        Your chart uses the exact same numbers. These alternatives keep the part-to-whole
        story with a better data-ink ratio — and none of your sabotage applies here.
      </p>
      <div className="flex flex-wrap gap-2 mb-4" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              tab === t.id ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <p className="text-sm text-slate-600 mb-4">{active.blurb}</p>
      <div key={tab + rows.length}>
        <View rows={rows} />
      </div>
    </div>
  );
};

export default Alternatives;
