// Every option lives here so the UI, scoring, violations, URL params and
// participation code all stay in sync.

export const MODES = {
  individual: { label: 'Individual', limit: 5 },
  group: { label: 'Group', limit: 8 },
};

export const choiceLimit = (o) => (MODES[o.mode] || MODES.individual).limit;

export const DEFAULT_OPTS = {
  mode: 'individual',
  // Free
  slices: 5,
  colors: 'default',
  rotation: 0,
  // Bad (each costs one choice)
  threeD: false,
  explode: false,
  shadow: false,
  outline: false,
  gloss: false,
  hatch: false,
  gridlines: false,
  spin: false,
  clipart: false,
  comicSans: false,
  labels: 'normal', // normal | hidden | tiny | random | lowContrast
  legendHunt: false,
  background: 'none', // none | checkered | houndstooth | rainbow | stock
  badMath: false,
  cherryPick: false,
  clickbait: false,
  // Good (free)
  donut: false,
  largeFont: false,
  textDescription: false,
  sortSlices: false,
  directLabels: false,
  groupOther: false,
};

// Short URL keys. Original keys (s, 3d, e, c, r, sh, ol, bg, d, lf, td) are kept
// so old shared links still work.
export const URL_KEYS = {
  mode: 'm', slices: 's', colors: 'c', rotation: 'r', threeD: '3d', explode: 'e',
  shadow: 'sh', outline: 'ol', gloss: 'gl', hatch: 'ha', gridlines: 'gr',
  spin: 'sp', clipart: 'ca', comicSans: 'cs', labels: 'lb', legendHunt: 'lh',
  background: 'bg', badMath: 'bm', cherryPick: 'cp', clickbait: 'cb',
  donut: 'd', largeFont: 'lf', textDescription: 'td', sortSlices: 'ss',
  directLabels: 'dl', groupOther: 'go',
};

// Bad options shown as toggles. `weight` feeds the destruction meter.
export const BAD_TOGGLES = [
  { key: 'threeD', group: 'Distort', label: '3D extrusion', weight: 3,
    violation: 'The Third Dimension — tilting the pie makes front slices look bigger than back slices with the same value.' },
  { key: 'explode', group: 'Distort', label: 'Explode slices', weight: 2,
    violation: 'Explosive Elements — gaps break the circle, so you can no longer compare angles or arc lengths.' },
  { key: 'spin', group: 'Distort', label: 'Spin forever', weight: 3,
    violation: 'Motion Sickness — animation that carries no data makes the chart impossible to read.' },
  { key: 'shadow', group: 'Chartjunk', label: 'Dramatic drop shadow', weight: 1,
    violation: 'Decorative Disaster — shadows are ink that carries no data (poor data-ink ratio).' },
  { key: 'outline', group: 'Chartjunk', label: 'Thick outlines', weight: 1,
    violation: 'Heavy Outlines — thick borders shrink small slices and pull the eye away from the data.' },
  { key: 'gloss', group: 'Chartjunk', label: 'Glossy gradients', weight: 2,
    violation: 'Glossy Gradients — shading changes color within a slice, so the same category no longer looks like one value.' },
  { key: 'hatch', group: 'Chartjunk', label: 'Moiré hatching', weight: 2,
    violation: 'Moiré Vibration — dense hatch patterns shimmer and fatigue the eye (Tufte’s classic chartjunk).' },
  { key: 'gridlines', group: 'Chartjunk', label: 'Pointless gridlines', weight: 1,
    violation: 'Unnecessary Gridlines — a pie has no axes, so gridlines are pure noise.' },
  { key: 'clipart', group: 'Chartjunk', label: 'Clip art & stickers', weight: 2,
    violation: 'Clip Art Overload — decorations compete with the data for attention.' },
  { key: 'comicSans', group: 'Text', label: 'Novelty font', weight: 1,
    violation: 'Novelty Typography — decorative fonts reduce legibility and credibility.' },
  { key: 'legendHunt', group: 'Text', label: 'Legend scavenger hunt', weight: 2,
    violation: 'Legend Scavenger Hunt — a shuffled legend forces readers to match colors back and forth.' },
  { key: 'badMath', group: 'Mislead', label: 'Percentages that don’t add up', weight: 3,
    violation: 'Broken Math — the labeled percentages don’t sum to 100%, destroying the part-to-whole relationship.' },
  { key: 'cherryPick', group: 'Mislead', label: 'Cherry-pick the data', weight: 3,
    violation: 'Cherry-Picking — the smallest companies were quietly dropped, inflating everyone else’s share.' },
  { key: 'clickbait', group: 'Mislead', label: 'Clickbait title', weight: 2,
    violation: 'Editorializing Title — the headline tells readers what to conclude instead of what the chart shows.' },
];

export const LABEL_MODES = [
  { value: 'normal', label: 'Normal labels' },
  { value: 'hidden', label: 'Hide labels', violation: 'Information Vandalism — without labels there is no context.' },
  { value: 'tiny', label: 'Tiny labels', violation: 'Illegible Labels — tiny text can’t be read from the back of the room.' },
  { value: 'random', label: 'Random label sizes', violation: 'Inconsistent Typography — random sizes imply importance that isn’t in the data.' },
  { value: 'lowContrast', label: 'Low-contrast labels', violation: 'Low Contrast — pale text fails luminance contrast and accessibility.' },
];

export const BACKGROUNDS = [
  { value: 'none', label: 'None' },
  { value: 'checkered', label: 'Checkered' },
  { value: 'houndstooth', label: 'Houndstooth' },
  { value: 'rainbow', label: 'Rainbow gradient' },
  { value: 'stock', label: '"Business" stock photo vibes' },
];

export const COLOR_SCHEMES = [
  { value: 'default', label: 'Default' },
  { value: 'colorsafe', label: 'Colorblind Safe (Good!)' },
  { value: 'ugly', label: 'Ugly Clashing Colors (Bad!)' },
  { value: 'random', label: 'Random (Bad!)' },
  { value: 'similar', label: 'Nearly Identical Blues (Bad!)' },
  { value: 'neon', label: 'Neon (Bad!)' },
  { value: 'redgreen', label: 'Red/Green Only (Bad!)' },
];

export const GOOD_TOGGLES = [
  { key: 'sortSlices', label: 'Sort slices largest-first from 12 o’clock',
    good: 'Sorted slices — ordering by size makes ranking readable at a glance.' },
  { key: 'groupOther', label: 'Group small slices into "Other"',
    good: 'Grouped "Other" — at most 5 categories keeps the pie readable.' },
  { key: 'directLabels', label: 'Direct labels with percentages',
    good: 'Direct labels — values on the chart mean nobody has to estimate angles.' },
  { key: 'donut', label: 'Make it a donut chart',
    good: 'Donut — less ink in the center, and room for a total.' },
  { key: 'largeFont', label: 'Larger font',
    good: 'Larger font — use bigger text than you think you need.' },
  { key: 'textDescription', label: 'Include text description',
    good: 'Text description — states the takeaway and makes the data accessible.' },
];

const BAD_COLOR_SCHEMES = {
  random: 'Color Chaos — random colors have no meaning and may be indistinguishable.',
  similar: 'Indistinguishable Colors — nearly identical hues make slices impossible to tell apart.',
  neon: 'Neon Glare — saturated neon vibrates and strains the eyes.',
  ugly: 'Clashing Colors — clashing hues distract from the data.',
  redgreen: 'Red/Green Palette — about 1 in 12 men can’t tell these slices apart.',
};

export const countChoices = (o) =>
  BAD_TOGGLES.filter((t) => o[t.key]).length +
  (o.labels !== 'normal' ? 1 : 0) +
  (o.background !== 'none' ? 1 : 0);

export const detectViolations = (o) => {
  const v = [];
  if (o.slices > 7 && !o.groupOther) {
    v.push({ text: `Slice Overload — ${o.slices} slices make comparison nearly impossible.`, weight: o.slices > 12 ? 3 : 2 });
  }
  if (BAD_COLOR_SCHEMES[o.colors]) v.push({ text: BAD_COLOR_SCHEMES[o.colors], weight: 2 });
  if (o.rotation % 360 !== 0 && !o.spin) v.push({ text: 'Arbitrary Rotation — starting away from 12 o’clock makes slices harder to compare.', weight: 1 });
  const lm = LABEL_MODES.find((m) => m.value === o.labels);
  if (lm?.violation) v.push({ text: lm.violation, weight: 2 });
  if (o.background !== 'none') v.push({ text: 'Busy Background — patterns behind data reduce contrast and add noise.', weight: 2 });
  BAD_TOGGLES.forEach((t) => o[t.key] && v.push({ text: t.violation, weight: t.weight }));
  return v;
};

export const detectGoodChoices = (o) => {
  const g = GOOD_TOGGLES.filter((t) => o[t.key]).map((t) => t.good);
  if (o.colors === 'colorsafe') g.push('Colorblind-safe palette — distinguishable for most color-vision deficiencies.');
  return g;
};

// Tiers are fractions of the best score reachable in the current mode,
// so a full meter is always achievable within the choice limit.
export const DESTRUCTION_LEVELS = [
  { min: 0, name: 'Disappointingly Functional', color: '#16a34a' },
  { min: 0.2, name: 'Mildly Misleading', color: '#ca8a04' },
  { min: 0.4, name: 'Chartjunk Enthusiast', color: '#ea580c' },
  { min: 0.65, name: 'Tufte Is Weeping', color: '#dc2626' },
  { min: 0.9, name: 'PIE CHART DESTROYER', color: '#7c3aed' },
];

// Brute-force the best combination of `limit` bad choices, with the free
// options set as destructively as possible. Small enough to run at load.
const bestScore = (limit) => {
  const items = [
    ...BAD_TOGGLES.map((t) => ({ [t.key]: true })),
    { labels: 'tiny' },
    { background: 'checkered' },
  ];
  const free = { ...DEFAULT_OPTS, slices: 20, colors: 'random' };
  let best = 0;
  const walk = (start, picked) => {
    if (picked.length === limit) {
      [0, 90].forEach((rotation) => {
        const o = Object.assign({ ...free, rotation }, ...picked);
        best = Math.max(best, detectViolations(o).reduce((t, v) => t + v.weight, 0));
      });
      return;
    }
    for (let i = start; i < items.length; i++) walk(i + 1, [...picked, items[i]]);
  };
  walk(0, []);
  return best;
};

export const MAX_SCORES = Object.fromEntries(
  Object.entries(MODES).map(([k, m]) => [k, bestScore(m.limit)])
);

export const maxScore = (o) => MAX_SCORES[o.mode] || MAX_SCORES.individual;

export const destructionLevel = (score, max) =>
  [...DESTRUCTION_LEVELS].reverse().find((l) => score >= l.min * max);

export const readOptsFromUrl = () => {
  const p = new URLSearchParams(window.location.search);
  if (!p.toString()) return DEFAULT_OPTS;
  const o = { ...DEFAULT_OPTS };
  Object.entries(URL_KEYS).forEach(([key, k]) => {
    if (!p.has(k)) return;
    const raw = p.get(k);
    const def = DEFAULT_OPTS[key];
    if (typeof def === 'boolean') o[key] = raw === '1';
    else if (typeof def === 'number') o[key] = parseInt(raw) || def;
    else o[key] = raw || def;
  });
  // Legacy label flags from older links
  if (p.get('hl') === '1') o.labels = 'hidden';
  else if (p.get('rls') === '1') o.labels = 'random';
  else if (p.get('tl') === '1') o.labels = 'tiny';
  return o;
};

export const optsToQuery = (o) =>
  Object.entries(URL_KEYS)
    .filter(([key]) => o[key] !== DEFAULT_OPTS[key])
    .map(([key, k]) => `${k}=${typeof o[key] === 'boolean' ? (o[key] ? 1 : 0) : encodeURIComponent(o[key])}`)
    .join('&');
