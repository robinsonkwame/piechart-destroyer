import React, { useState, useEffect, useMemo, useRef } from 'react';
import html2canvas from 'html2canvas';
import PieChartView from './PieChartView';
import Alternatives from './Alternatives';
import {
  MODES, choiceLimit, maxScore, DEFAULT_OPTS, BAD_TOGGLES, GOOD_TOGGLES, LABEL_MODES, BACKGROUNDS,
  COLOR_SCHEMES, countChoices, detectViolations, detectGoodChoices, destructionLevel,
  readOptsFromUrl,
} from './options';

const COMPANIES = ['Alpha Corp', 'Beta Inc', 'Gamma LLC', 'Delta Ltd', 'Epsilon Co',
  'Zeta Group', 'Eta Systems', 'Theta Tech', 'Iota Industries', 'Kappa Corp',
  'Lambda Ltd', 'Mu Inc', 'Nu Systems', 'Xi Corp', 'Omicron Co',
  'Pi Tech', 'Rho Industries', 'Sigma Group', 'Tau Ltd', 'Upsilon Inc'];

// Seeded RNG so the data stays put while you pile on effects
const rng = (seed) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const generateData = (numSlices, seed) => {
  const rand = rng(seed);
  return COMPANIES.slice(0, Math.min(numSlices, 20)).map((name) => ({
    name,
    value: parseFloat((rand() * 100 + 20).toFixed(2)),
  }));
};

const getColors = (scheme, n, seed) => {
  const rand = rng(seed * 7 + 1);
  const schemes = {
    default: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B6B', '#4ECDC4', '#45B7D1'],
    colorsafe: ['#0173B2', '#DE8F05', '#029E73', '#CC78BC', '#CA9161', '#949494', '#ECE133', '#56B4E9', '#F0E442', '#D55E00'],
    random: Array.from({ length: n }, () => `#${Math.floor(rand() * 16777215).toString(16).padStart(6, '0')}`),
    similar: Array.from({ length: n }, (_, i) => `hsl(205, 70%, ${48 + i * 1.2}%)`),
    ugly: ['#8B4513', '#FF1493', '#7FFF00', '#FF4500', '#9400D3', '#FFD700', '#FF69B4', '#00CED1', '#DC143C', '#ADFF2F'],
    neon: ['#FF00FF', '#00FFFF', '#FFFF00', '#FF0000', '#00FF00', '#0000FF', '#FF00AA', '#AAFF00', '#00AAFF', '#FF6600'],
    redgreen: Array.from({ length: n }, (_, i) => (i % 2 ? `hsl(${0 + i * 2}, 65%, ${45 + (i % 3) * 4}%)` : `hsl(${100 - i * 2}, 55%, ${42 + (i % 3) * 4}%)`)),
  };
  const base = schemes[scheme] || schemes.default;
  return Array.from({ length: n }, (_, i) => base[i % base.length]);
};

// What the rubber stamp says when each bad option lands
const STAMPS = {
  threeD: '3D?!', explode: 'KABOOM!', spin: 'WHEEE!', shadow: 'DRAMA!', outline: 'THICC!',
  gloss: 'SO SHINY!', hatch: 'MOIRÉ!', gridlines: 'GRIDLOCK!', clipart: 'CHARTJUNK!',
  comicSans: 'COMIC SANS!', legendHunt: 'WHERE IS IT?!', badMath: '137%?!',
  cherryPick: 'CHERRY-PICKED!', clickbait: 'CLICKBAIT!', labels: 'UNREADABLE!',
  background: 'TOO BUSY!', colors: 'EYE STRAIN!', slices: 'OVERLOAD!',
};

const BACKGROUND_STYLES = {
  checkered: {
    background: 'conic-gradient(#000 25%, #fff 0 50%, #000 0 75%, #fff 0)',
    backgroundSize: '24px 24px',
  },
  houndstooth: {
    background: 'conic-gradient(#5b7c8d 25%,transparent 0 50%,#edf6ee 0 75%,transparent 0), linear-gradient(135deg, #5b7c8d 0 12.5%,#edf6ee 0 25%, #5b7c8d 0 37.5%,#edf6ee 0 62.5%, #5b7c8d 0 75%,#edf6ee 0 87.5%, #5b7c8d 0)',
    backgroundSize: '60px 60px',
  },
  rainbow: {
    background: 'linear-gradient(135deg, #ff595e, #ffca3a, #8ac926, #1982c4, #6a4c93, #ff595e)',
  },
  stock: {
    background: `url("data:image/svg+xml,${encodeURIComponent(
      "<svg xmlns='http://www.w3.org/2000/svg' width='90' height='90'><text x='10' y='35' font-size='28' opacity='0.35'>💼</text><text x='50' y='80' font-size='28' opacity='0.35'>🤝</text><text x='55' y='30' font-size='22' opacity='0.3' fill='white'>$</text></svg>"
    )}"), linear-gradient(160deg, #1e3a8a, #38bdf8 60%, #f0f9ff)`,
  },
};

const PieChartDestroyer = () => {
  const [opts, setOpts] = useState(readOptsFromUrl);
  const [seed, setSeed] = useState(42);
  const [spinAngle, setSpinAngle] = useState(0);
  const [impact, setImpact] = useState(null);
  const [copied, setCopied] = useState('');
  const chartRef = useRef(null);

  const choiceCount = countChoices(opts);
  const violations = detectViolations(opts);
  const goodChoices = detectGoodChoices(opts);
  const score = violations.reduce((t, v) => t + v.weight, 0);
  const limit = choiceLimit(opts);
  const max = maxScore(opts);
  const level = destructionLevel(score, max);

  const fire = (text, kind = 'bad') => setImpact({ id: Date.now(), text, kind });

  // Central setter: enforces the choice limit and triggers the visual "impact"
  const set = (key, value) => {
    const next = { ...opts, [key]: value };
    const nextCount = countChoices(next);
    if (nextCount > limit) {
      fire(`${limit} / ${limit} — LIMIT!`, 'limit');
      return;
    }
    setOpts(next);
    const before = detectViolations(opts).length;
    const after = detectViolations(next).length;
    if (nextCount === limit && nextCount > choiceCount) fire('MAXIMUM DESTRUCTION', 'max');
    else if (after > before) fire(STAMPS[key] || 'YIKES!');
    else if (detectGoodChoices(next).length > detectGoodChoices(opts).length) fire('✓ BETTER', 'good');
  };

  useEffect(() => {
    if (!impact) return;
    const t = setTimeout(() => setImpact(null), 1700);
    return () => clearTimeout(t);
  }, [impact]);

  // Spin forever
  useEffect(() => {
    if (!opts.spin) return;
    let frame;
    let last = performance.now();
    const tick = (now) => {
      setSpinAngle((a) => (a + (now - last) * 0.09) % 360);
      last = now;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [opts.spin]);

  const raw = useMemo(() => generateData(opts.slices, seed + opts.slices), [opts.slices, seed]);

  const chartData = useMemo(() => {
    const palette = getColors(opts.colors, raw.length, seed);
    let rows = raw.map((d, i) => ({ ...d, color: palette[i] }));
    if (opts.cherryPick) {
      const keep = Math.max(2, Math.ceil(rows.length * 0.6));
      const cutoff = [...rows].sort((a, b) => b.value - a.value)[keep - 1].value;
      rows = rows.filter((r) => r.value >= cutoff);
    }
    if (opts.groupOther && rows.length > 5) {
      const sorted = [...rows].sort((a, b) => b.value - a.value);
      const rest = sorted.slice(4);
      rows = [...sorted.slice(0, 4), {
        name: `Other (${rest.length})`,
        value: rest.reduce((t, r) => t + r.value, 0),
        color: '#94a3b8',
      }];
    }
    if (opts.sortSlices) rows = [...rows].sort((a, b) => b.value - a.value);
    const total = rows.reduce((t, r) => t + r.value, 0);
    return rows.map((r, i) => ({
      ...r,
      pct: r.value / total,
      displayPct: (r.value / total) * (opts.badMath ? 1.15 + ((i * 37) % 45) / 100 : 1),
    }));
  }, [raw, seed, opts.colors, opts.cherryPick, opts.groupOther, opts.sortSlices, opts.badMath]);

  const leader = [...chartData].sort((a, b) => b.value - a.value)[0];

  const legendRows = opts.legendHunt
    ? chartData.map((r, i) => ({ r, k: (i * 7 + 3) % chartData.length })).sort((a, b) => a.k - b.k).map((x) => x.r)
    : chartData;

  const participationCode = useMemo(() => {
    const timestamp = Date.now().toString(36);
    const choices = JSON.stringify(opts);
    let hash = 0;
    for (let i = 0; i < choices.length; i++) {
      hash = ((hash << 5) - hash) + choices.charCodeAt(i);
      hash = hash & hash;
    }
    return (timestamp + Math.abs(hash).toString(36).toUpperCase()).slice(0, 7).toUpperCase();
  }, [opts]);

  const description = (() => {
    const total = raw.reduce((t, d) => t + d.value, 0);
    const s = [...raw].sort((a, b) => b.value - a.value);
    const p = (d) => `${Math.round((d.value / total) * 100)}%`;
    return `Across all ${raw.length} companies, ${s[0].name} leads with ${p(s[0])} of the market, followed by ${s[1].name} (${p(s[1])}). The smallest, ${s[s.length - 1].name}, holds ${p(s[s.length - 1])}.`;
  })();

  // Capture chart and copy to clipboard, falling back to download, then manual instructions
  const captureImage = async () => {
    try {
      if (chartRef.current) {
        const canvas = await html2canvas(chartRef.current, {
          backgroundColor: '#ffffff', scale: 2, logging: false, useCORS: true,
        });
        if (navigator.clipboard && window.ClipboardItem) {
          canvas.toBlob(async (blob) => {
            try {
              await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
              setCopied('Chart copied to clipboard!');
            } catch (clipboardError) {
              console.log('Clipboard failed, trying download...', clipboardError);
              downloadImage(canvas);
            }
          });
        } else {
          downloadImage(canvas);
        }
        return;
      }
    } catch (error) {
      console.log('html2canvas failed, showing manual instructions...', error);
    }
    showScreenshotInstructions();
  };

  const downloadImage = (canvas) => {
    try {
      const link = document.createElement('a');
      link.download = 'pie-chart-destroyer.png';
      link.href = canvas.toDataURL();
      link.click();
      setCopied('Chart saved to your Downloads folder!');
    } catch (error) {
      console.log('Download failed, showing manual instructions...', error);
      showScreenshotInstructions();
    }
  };

  const showScreenshotInstructions = () => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const instructions = isMac
      ? 'Mac: Press Cmd + Shift + 4, then drag to select your chart'
      : 'Windows: Press Windows + Shift + S, then drag to select your chart';
    alert(`Automatic capture failed. Please take a manual screenshot:\n\n${instructions}\n\nThen you can paste the image anywhere you need it!`);
  };

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(''), 2500);
    return () => clearTimeout(t);
  }, [copied]);

  const atLimit = choiceCount >= limit;

  // Switching to individual mode with more than 5 picks would break the limit
  const setMode = (mode) => {
    if (countChoices(opts) > MODES[mode].limit) {
      fire(`REMOVE ${countChoices(opts) - MODES[mode].limit} FIRST`, 'limit');
      return;
    }
    setOpts({ ...opts, mode });
  };
  const selectCls = 'w-full p-2 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none bg-white';
  const groups = [...new Set(BAD_TOGGLES.map((t) => t.group))];

  const stampColor = { bad: '#dc2626', limit: '#ea580c', max: '#7c3aed', good: '#16a34a' }[impact?.kind];
  const shakeClass = impact && impact.kind !== 'good' ? (impact.kind === 'max' ? 'shake-big' : 'shake') : '';

  const title = opts.clickbait
    ? `🚨 ${leader.name.toUpperCase()} CRUSHES THE COMPETITION!!! 🚨`
    : opts.cherryPick ? 'Market Share (All Companies)' : 'Market Share';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 mb-6">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Pie Chart Destroyer</h1>
          <p className="text-slate-600 mb-4">
            Create the worst pie chart. You can select up to {limit} bad options — choose wisely.
            Free options and good practices don&apos;t count against you.
          </p>

          <div className="mb-4 inline-flex rounded-lg border-2 border-slate-300 p-1 bg-slate-50" role="radiogroup" aria-label="Play mode">
            {Object.entries(MODES).map(([key, m]) => (
              <button key={key} role="radio" aria-checked={opts.mode === key} onClick={() => setMode(key)}
                className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                  opts.mode === key ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-200'
                }`}>
                {m.label} ({m.limit} picks)
              </button>
            ))}
          </div>

          <div className="mb-6 grid sm:grid-cols-2 gap-3">
            <div className="p-3 bg-amber-50 border-2 border-amber-300 rounded-lg">
              <p className="text-amber-800 font-semibold mb-2">Bad choices: {choiceCount} / {limit}</p>
              <div className="flex gap-1.5">
                {Array.from({ length: limit }, (_, i) => (
                  <div key={i} className={`h-3 flex-1 rounded-full transition-colors duration-300 ${i < choiceCount ? 'bg-red-500' : 'bg-amber-200'}`} />
                ))}
              </div>
            </div>
            <div className="p-3 bg-slate-50 border-2 border-slate-200 rounded-lg">
              <p className="font-semibold mb-2" style={{ color: level.color }}>
                Destruction level: {level.name}
                <span className="float-right text-slate-500 font-medium">{score} / {max}</span>
              </p>
              <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full rounded-full meter-fill"
                  style={{ width: `${Math.min(100, (score / max) * 100)}%`, backgroundColor: level.color }} />
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* ---------- Options ---------- */}
            <div>
              <h2 className="text-xl font-semibold text-slate-700 mb-4">Chart Options</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Number of Slices <span className="text-green-600 font-semibold">(FREE)</span>
                  </label>
                  <select value={opts.slices} onChange={(e) => set('slices', parseInt(e.target.value))} className={selectCls}>
                    {[3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20].map((n) => <option key={n} value={n}>{n} slices</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Color Scheme <span className="text-green-600 font-semibold">(FREE)</span>
                  </label>
                  <select value={opts.colors} onChange={(e) => set('colors', e.target.value)} className={selectCls}>
                    {COLOR_SCHEMES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Rotation: {opts.rotation}° <span className="text-green-600 font-semibold">(FREE)</span>
                  </label>
                  <input type="range" min="0" max="359" value={opts.rotation}
                    onChange={(e) => setOpts({ ...opts, rotation: parseInt(e.target.value) || 0 })}
                    className="w-full accent-blue-600" />
                </div>

                {groups.map((group) => (
                  <fieldset key={group} className="space-y-2">
                    <legend className="text-xs font-bold uppercase tracking-wider text-red-700 mb-1">{group}</legend>
                    {BAD_TOGGLES.filter((t) => t.group === group).map((t) => {
                      const disabled = !opts[t.key] && atLimit;
                      return (
                        <label key={t.key}
                          className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-colors ${
                            opts[t.key] ? 'bg-red-100 border-red-400' : 'bg-red-50 border-transparent hover:bg-red-100'
                          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                          <input type="checkbox" checked={opts[t.key]} disabled={disabled}
                            onChange={(e) => set(t.key, e.target.checked)} className="w-5 h-5 accent-red-600" />
                          <span className="text-sm font-medium text-slate-700">{t.label}</span>
                        </label>
                      );
                    })}
                    {group === 'Chartjunk' && (
                      <div className={`p-3 rounded-lg border-2 ${opts.background !== 'none' ? 'bg-red-100 border-red-400' : 'bg-red-50 border-transparent'}`}>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Background pattern</label>
                        <select value={opts.background} onChange={(e) => set('background', e.target.value)} className={selectCls}>
                          {BACKGROUNDS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
                        </select>
                      </div>
                    )}
                    {group === 'Text' && (
                      <div className={`p-3 rounded-lg border-2 ${opts.labels !== 'normal' ? 'bg-red-100 border-red-400' : 'bg-red-50 border-transparent'}`}>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Label sabotage</label>
                        <select value={opts.labels} onChange={(e) => set('labels', e.target.value)} className={selectCls}>
                          {LABEL_MODES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                        </select>
                      </div>
                    )}
                  </fieldset>
                ))}

                <fieldset className="space-y-2 pt-4 border-t-2 border-slate-200">
                  <legend className="text-xs font-bold uppercase tracking-wider text-green-700 mb-1 pt-4">
                    Good practices (free)
                  </legend>
                  {GOOD_TOGGLES.map((t) => (
                    <label key={t.key}
                      className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                        opts[t.key] ? 'bg-green-100 border-green-400' : 'bg-green-50 border-transparent hover:bg-green-100'
                      }`}>
                      <input type="checkbox" checked={opts[t.key]} onChange={(e) => set(t.key, e.target.checked)}
                        className="w-5 h-5 accent-green-600" />
                      <span className="text-sm font-medium text-slate-700">{t.label}</span>
                    </label>
                  ))}
                </fieldset>

                <button onClick={() => { setOpts({ ...DEFAULT_OPTS, mode: opts.mode }); setSpinAngle(0); }}
                  className="w-full py-2 rounded-lg border-2 border-slate-300 text-slate-600 font-semibold hover:bg-slate-50">
                  ↺ Reset everything
                </button>
              </div>
            </div>

            {/* ---------- Chart + feedback ---------- */}
            <div className="md:sticky md:top-4 self-start">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-semibold text-slate-700">Your Chart</h2>
                <button onClick={() => setSeed((s) => s + 1)}
                  className="text-sm px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium">
                  🎲 New data
                </button>
              </div>

              <div className="relative">
                {impact && (
                  <div key={`stamp-${impact.id}`} className="stamp" style={{ color: stampColor, fontSize: impact.kind === 'max' ? '1.6rem' : '2rem' }}>
                    {impact.text}
                  </div>
                )}
                <div
                  key={impact && impact.kind !== 'good' ? `chart-${impact.id}` : 'chart'}
                  ref={chartRef}
                  className={`rounded-lg border-2 border-slate-200 p-4 overflow-hidden ${shakeClass} ${impact?.kind === 'good' ? 'glow' : ''}`}
                  style={{
                    background: 'white',
                    ...(BACKGROUND_STYLES[opts.background] || {}),
                    fontFamily: opts.comicSans ? '"Comic Sans MS", "Comic Neue", "Chalkboard SE", cursive' : undefined,
                  }}
                >
                  <h3 className={`text-center font-bold mb-2 ${opts.clickbait ? 'text-xl text-red-600' : 'text-lg text-slate-800'}`}
                    style={opts.clickbait ? { textShadow: '2px 2px 0 #facc15' } : undefined}>
                    {title}
                  </h3>

                  <PieChartView data={chartData} opts={opts} rotation={opts.rotation + (opts.spin ? spinAngle : 0)} />

                  {opts.labels !== 'hidden' && (
                    <div className={`flex flex-wrap justify-center mt-2 ${opts.legendHunt ? 'gap-x-1 gap-y-0 text-[9px]' : 'gap-x-4 gap-y-1'}`}
                      style={{ fontSize: opts.legendHunt ? undefined : (opts.largeFont ? 15 : 12) }}>
                      {legendRows.map((r) => (
                        <span key={r.name} className={`flex items-center gap-1 ${opts.labels === 'lowContrast' ? 'text-slate-200' : 'text-slate-700'}`}>
                          <span className={`inline-block rounded-sm ${opts.legendHunt ? 'w-1.5 h-1.5' : 'w-3 h-3'}`} style={{ background: r.color }} />
                          {r.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {opts.textDescription && (
                    <div className="mt-4 p-3 bg-blue-50 rounded text-slate-700" style={{ fontSize: opts.largeFont ? 16 : 14 }}>
                      <strong>Description:</strong> {description}
                    </div>
                  )}
                </div>
              </div>

              {violations.length > 0 && (
                <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                  <h3 className="font-semibold text-red-800 mb-2">Rules Violated ({violations.length}):</h3>
                  <ul className="space-y-1 text-sm text-red-700">
                    {violations.map((v) => <li key={v.text}>• {v.text}</li>)}
                  </ul>
                </div>
              )}

              {goodChoices.length > 0 && (
                <div className="mt-4 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">Good Practices Applied:</h3>
                  <ul className="space-y-1 text-sm text-green-700">
                    {goodChoices.map((g) => <li key={g}>• {g}</li>)}
                  </ul>
                </div>
              )}

              {violations.length === 0 && goodChoices.length === 0 && (
                <div className="mt-4 p-4 bg-slate-50 border-2 border-slate-200 rounded-lg">
                  <p className="text-sm text-slate-600 italic">No rules violated - this chart is disappointingly functional.</p>
                </div>
              )}

              <div className="mt-4 space-y-3">
                <button onClick={captureImage}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
                  📸 Copy Chart to Clipboard
                </button>
                {copied && <p className="text-sm text-green-700 text-center font-medium" role="status">{copied}</p>}

                <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded-lg">
                  <h3 className="font-semibold text-purple-800 mb-2">Participation Code:</h3>
                  <code className="text-lg font-mono text-purple-700 bg-white px-3 py-2 rounded block text-center">
                    {participationCode}
                  </code>
                  <p className="text-xs text-purple-600 mt-2">Copy this code to submit as proof of participation</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Alternatives rawData={raw} />
      </div>
    </div>
  );
};

export default PieChartDestroyer;
