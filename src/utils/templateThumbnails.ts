/**
 * Template Thumbnail Generator — Phone Mockup Style
 *
 * Generates professional phone-mockup SVG thumbnails for wedding invitation
 * template cards. Each thumbnail displays:
 *   • A phone mockup with invitation preview (left side)
 *   • Category title and feature highlights (right side)
 *   • "by NikahYuk!" branding
 *
 * Every category (Classic, Rustic, Minimalist, Islamic, Floral, Typography)
 * and price tier (Silver, Gold, Platinum) has a unique color palette.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MockupTheme {
  line1: string;       // Category title line 1
  line2: string;       // Category title line 2
  bg1: string;         // Background gradient start
  bg2: string;         // Background gradient end
  accent: string;      // Primary accent colour
  accentLight: string; // Light tint for badges / circles
  phoneBorder: string; // Phone bezel colour
  screenBg: string;    // Phone screen background
  nameColor: string;   // Couple names on screen
  dateColor: string;   // Dates & subtle labels on screen
  btnBg: string;       // "Buka Undangan" button bg
  btnText: string;     // "Buka Undangan" button text
  leafColor: string;   // Decorative botanical leaf colour
  leafOp: number;      // Leaf opacity (0–1)
  headColor: string;   // Right-side heading colour
  subColor: string;    // Right-side subtitle / feature description
  iconBg: string;      // Feature icon square bg
  iconStroke: string;  // Feature icon stroke colour
  brandBg: string;     // Branding badge bg
  brandBorder: string; // Branding badge border
  brandText: string;   // Branding badge text
  screenDeco: string;  // Extra SVG inside phone screen
  bgDeco: string;      // Extra SVG in background
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const svgToBase64 = (svgStr: string): string => {
  try {
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgStr)))}`;
  } catch (e) {
    console.error('Failed to convert SVG to base64:', e);
    return '';
  }
};

/** Compact feature-icon SVG paths (rendered inside a 32×32 viewBox). */
const fIcon = (type: string, s: string): string => {
  const w = `stroke="${s}" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"`;
  switch (type) {
    case 'cal':
      return `<rect x="7" y="8" width="18" height="16" rx="2.5" ${w}/><line x1="7" y1="14" x2="25" y2="14" ${w}/><line x1="12" y1="5" x2="12" y2="10" ${w}/><line x1="20" y1="5" x2="20" y2="10" ${w}/>`;
    case 'ppl':
      return `<circle cx="12" cy="11" r="3.5" ${w}/><path d="M 5 25 C 5 19,19 19,19 25" ${w}/><circle cx="21" cy="11" r="3" ${w}/><path d="M 16 25 C 16 20,26 20,26 25" ${w}/>`;
    case 'img':
      return `<rect x="5" y="7" width="22" height="18" rx="3" ${w}/><circle cx="12" cy="14" r="2.5" ${w}/><path d="M 5 21 L 11 16 L 16 19 L 21 15 L 27 21" ${w}/>`;
    case 'mail':
      return `<rect x="4" y="9" width="24" height="14" rx="3" ${w}/><path d="M 4 9 L 16 18 L 28 9" ${w}/>`;
    case 'gift':
      return `<rect x="5" y="15" width="22" height="12" rx="2" ${w}/><rect x="7" y="11" width="18" height="6" rx="2" ${w}/><line x1="16" y1="11" x2="16" y2="27" ${w}/><path d="M 16 14 C 13 8,8 11,11 14" ${w}/><path d="M 16 14 C 19 8,24 11,21 14" ${w}/>`;
    default:
      return '';
  }
};

// ---------------------------------------------------------------------------
// Screen decorations — subtle per-category motifs rendered inside the phone
// ---------------------------------------------------------------------------

const sDeco = {
  classic: (c: string) =>
    `<path d="M 15 17 L 15 32 M 15 17 L 32 17" stroke="${c}" stroke-width="0.7" fill="none" opacity="0.2"/>` +
    `<path d="M 160 17 L 160 32 M 160 17 L 143 17" stroke="${c}" stroke-width="0.7" fill="none" opacity="0.2"/>` +
    `<path d="M 15 330 L 15 315 M 15 330 L 32 330" stroke="${c}" stroke-width="0.7" fill="none" opacity="0.2"/>` +
    `<path d="M 160 330 L 160 315 M 160 330 L 143 330" stroke="${c}" stroke-width="0.7" fill="none" opacity="0.2"/>`,

  rustic: (c: string) =>
    `<path d="M 20 16 Q 28 22,32 16 Q 30 28,26 38" stroke="${c}" stroke-width="0.7" fill="none" opacity="0.22"/>` +
    `<path d="M 24 21 Q 19 30,23 38" stroke="${c}" stroke-width="0.5" fill="none" opacity="0.18"/>` +
    `<path d="M 140 330 Q 148 324,155 330 Q 150 320,148 310" stroke="${c}" stroke-width="0.7" fill="none" opacity="0.22"/>`,

  minimalist: (c: string) =>
    `<circle cx="87" cy="180" r="78" stroke="${c}" stroke-width="0.5" fill="none" opacity="0.1"/>`,

  islamic: (c: string) =>
    `<path d="M 22 335 L 22 80 Q 87 28,153 80 L 153 335" stroke="${c}" stroke-width="0.8" fill="none" opacity="0.1"/>` +
    `<path d="M 30 335 L 30 90 Q 87 42,145 90 L 145 335" stroke="${c}" stroke-width="0.4" fill="none" opacity="0.07" stroke-dasharray="4,3"/>`,

  floral: (c: string) =>
    `<circle cx="25" cy="22" r="5" fill="${c}" opacity="0.12"/>` +
    `<circle cx="36" cy="17" r="3.5" fill="${c}" opacity="0.1"/>` +
    `<circle cx="20" cy="30" r="3" fill="${c}" opacity="0.08"/>` +
    `<circle cx="148" cy="325" r="5" fill="${c}" opacity="0.12"/>` +
    `<circle cx="137" cy="330" r="3.5" fill="${c}" opacity="0.1"/>` +
    `<circle cx="153" cy="318" r="3" fill="${c}" opacity="0.08"/>`,

  typography: (c: string) =>
    `<path d="M 18 16 L 18 32 M 18 16 L 34 16" stroke="${c}" stroke-width="1" fill="none" opacity="0.22"/>` +
    `<path d="M 157 16 L 157 32 M 157 16 L 141 16" stroke="${c}" stroke-width="1" fill="none" opacity="0.22"/>` +
    `<path d="M 18 330 L 18 314 M 18 330 L 34 330" stroke="${c}" stroke-width="1" fill="none" opacity="0.22"/>` +
    `<path d="M 157 330 L 157 314 M 157 330 L 141 330" stroke="${c}" stroke-width="1" fill="none" opacity="0.22"/>`,
};

// Background extras for select themes
const bDeco = {
  none: '',
  softCircles: (c: string) =>
    `<g fill="${c}" opacity="0.045"><circle cx="620" cy="110" r="85"/><circle cx="180" cy="390" r="65"/></g>`,
  islamicStars: (c: string) =>
    `<g stroke="${c}" stroke-width="0.6" fill="none" opacity="0.07">` +
    `<path d="M 650 80 L 655 90 L 665 92 L 657 97 L 658 108 L 650 102 L 642 108 L 643 97 L 635 92 L 645 90 Z"/>` +
    `<path d="M 320 400 L 323 406 L 330 407 L 325 411 L 326 418 L 320 414 L 314 418 L 315 411 L 310 407 L 317 406 Z"/>` +
    `</g>`,
};

// ---------------------------------------------------------------------------
// Core SVG builder
// ---------------------------------------------------------------------------

const COUPLE_NAMES = [
  ['Aditya', 'Aulia'],
  ['Bimo', 'Nisa'],
  ['Rian', 'Sari'],
  ['Dimas', 'Laras'],
  ['Fajar', 'Dian'],
  ['Genta', 'Amel'],
  ['Hendra', 'Rini'],
  ['Indra', 'Gita'],
  ['Jaka', 'Wulan'],
  ['Kurnia', 'Dewi'],
  ['Rangga', 'Cinta'],
  ['Reza', 'Fitri'],
  ['Taufik', 'Hana'],
  ['Yusuf', 'Zahra']
];

const getHash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
};

const createMockupSvg = (t: MockupTheme, slug: string, name?: string): string => {
  const hash = getHash(slug + (name || ''));
  const couple = COUPLE_NAMES[hash % COUPLE_NAMES.length];
  const groomName = couple[0];
  const brideName = couple[1];

  const day = (hash % 28) + 1;
  const month = (hash % 12) + 1;
  const year = 2026 + (hash % 2);
  const dateStr = `${day.toString().padStart(2, '0')} . ${month.toString().padStart(2, '0')} . ${year}`;

  const cleanName = name ? (name.length > 20 ? name.substring(0, 17) + '...' : name) : t.line2;

  const extraCircleX = 200 + (hash % 400);
  const extraCircleY = 100 + (hash % 250);
  const extraCircleR = 30 + (hash % 50);
  const extraDeco = `<circle cx="${extraCircleX}" cy="${extraCircleY}" r="${extraCircleR}" fill="${t.accent}" opacity="0.035" />`;

  const leafTransform = (hash % 2 === 0) ? 'transform="scale(-1, 1) translate(-800, 0)"' : '';
  const leafGroup = `<g ${leafTransform} opacity="${t.leafOp}">
<path d="M 0 0 Q 32 55,12 110 Q 3 70,0 30 Z" fill="${t.leafColor}"/>
<path d="M 0 0 Q 58 28,42 75 Q 22 52,8 28 Z" fill="${t.leafColor}" opacity="0.6"/>
<path d="M 800 450 Q 768 395,788 340 Q 796 385,800 425 Z" fill="${t.leafColor}"/>
<path d="M 800 450 Q 742 422,758 372 Q 778 398,793 428 Z" fill="${t.leafColor}" opacity="0.6"/>
<path d="M 800 0 Q 752 38,768 88 Q 788 58,798 25 Z" fill="${t.leafColor}" opacity="0.3"/>
</g>`;

  const feats = [
    { ic: 'cal',  l: 'Countdown Timer',    s: 'Menuju hari bahagia' },
    { ic: 'ppl',  l: 'Informasi Acara',     s: 'Akad &amp; Resepsi' },
    { ic: 'img',  l: 'Galeri Foto',         s: 'Momen terbaik kami' },
    { ic: 'mail', l: 'RSVP &amp; Ucapan',   s: 'Konfirmasi &amp; Doa Restu' },
    { ic: 'gift', l: 'Kado Digital',        s: 'Kirim kado terbaikmu' },
  ];

  const featRows = feats.map((f, i) => {
    const y = 168 + i * 44;
    return (
      `<g transform="translate(370,${y})">` +
      `<rect x="0" y="0" width="32" height="32" rx="8" fill="${t.iconBg}"/>` +
      fIcon(f.ic, t.iconStroke) +
      `<text x="42" y="13" font-family="'Segoe UI',Helvetica,Arial,sans-serif" font-size="11.5" font-weight="700" fill="${t.headColor}">${f.l}</text>` +
      `<text x="42" y="26" font-family="'Segoe UI',Helvetica,Arial,sans-serif" font-size="9" fill="${t.subColor}">${f.s}</text>` +
      `</g>`
    );
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%">
<defs>
<linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${t.bg1}"/><stop offset="100%" stop-color="${t.bg2}"/></linearGradient>
<filter id="ps" x="-15%" y="-5%" width="130%" height="115%"><feDropShadow dx="3" dy="6" stdDeviation="10" flood-color="#000" flood-opacity="0.12"/></filter>
<clipPath id="sc"><rect x="10" y="10" width="155" height="330" rx="14"/></clipPath>
</defs>
<rect width="800" height="450" fill="url(#bg)"/>
${t.bgDeco}
${extraDeco}
${leafGroup}
<g transform="translate(78,48)" filter="url(#ps)">
<rect x="0" y="0" width="175" height="355" rx="22" fill="${t.phoneBorder}"/>
<rect x="4" y="4" width="167" height="347" rx="19" fill="${t.screenBg}"/>
<g clip-path="url(#sc)">
<rect x="10" y="10" width="155" height="330" fill="${t.screenBg}"/>
${t.screenDeco}
<text x="87" y="52" font-family="'Segoe UI',sans-serif" font-size="7" font-weight="600" fill="${t.dateColor}" text-anchor="middle" letter-spacing="2.5">THE WEDDING OF</text>
<text x="87" y="88" font-family="Georgia,'Times New Roman',serif" font-size="28" font-weight="700" fill="${t.nameColor}" text-anchor="middle">${groomName}</text>
<text x="87" y="114" font-family="Georgia,'Times New Roman',serif" font-size="20" font-style="italic" fill="${t.accent}" text-anchor="middle" opacity="0.85">&amp;</text>
<text x="87" y="144" font-family="Georgia,'Times New Roman',serif" font-size="28" font-weight="700" fill="${t.nameColor}" text-anchor="middle">${brideName}</text>
<text x="87" y="170" font-family="'Segoe UI',sans-serif" font-size="8.5" font-weight="500" fill="${t.dateColor}" text-anchor="middle" letter-spacing="2">${dateStr}</text>
<rect x="20" y="190" width="135" height="38" rx="10" fill="${t.accentLight}"/>
<text x="87" y="206" font-family="'Segoe UI',sans-serif" font-size="7" fill="${t.dateColor}" text-anchor="middle">Kepada Yth.</text>
<text x="87" y="221" font-family="'Segoe UI',sans-serif" font-size="11" font-weight="700" fill="${t.nameColor}" text-anchor="middle">Tamu Terhormat</text>
<circle cx="87" cy="270" r="35" fill="${t.accentLight}" opacity="0.45"/>
<circle cx="87" cy="270" r="24" fill="${t.accentLight}" opacity="0.25"/>
<rect x="30" y="296" width="115" height="28" rx="14" fill="${t.btnBg}"/>
<text x="87" y="314" font-family="'Segoe UI',sans-serif" font-size="9" font-weight="700" fill="${t.btnText}" text-anchor="middle">Buka Undangan</text>
</g>
<rect x="62" y="6" width="50" height="7" rx="3.5" fill="${t.phoneBorder}" opacity="0.35"/>
</g>
<text x="370" y="82" font-family="Georgia,'Times New Roman',serif" font-size="34" font-weight="700" fill="${t.headColor}">${t.line1}</text>
<text x="370" y="115" font-family="Georgia,'Times New Roman',serif" font-size="24" fill="${t.headColor}" opacity="0.78">${cleanName}</text>
<line x1="370" y1="137" x2="432" y2="137" stroke="${t.accent}" stroke-width="1" opacity="0.35"/>
<path d="M 442 134 C 440 130,436 128,436 131 C 436 134,442 138,442 138 C 442 138,448 134,448 131 C 448 128,444 130,442 134 Z" fill="${t.accent}" opacity="0.4"/>
<line x1="452" y1="137" x2="530" y2="137" stroke="${t.accent}" stroke-width="1" opacity="0.35"/>
${featRows}
<rect x="370" y="396" width="160" height="30" rx="15" fill="${t.brandBg}" stroke="${t.brandBorder}" stroke-width="1"/>
<text x="450" y="416" font-family="'Segoe UI',sans-serif" font-size="11" font-weight="700" fill="${t.brandText}" text-anchor="middle">by NikahYuk!</text>
</svg>`;
};

// ---------------------------------------------------------------------------
// Theme definitions
// ---------------------------------------------------------------------------

const THEMES: Record<string, MockupTheme> = {
  // ──────────── CLASSIC ────────────
  'classic-silver': {
    line1: 'Classic', line2: 'Wedding Invitation',
    bg1: '#e8eaee', bg2: '#f5f6f8', accent: '#6b7d92', accentLight: '#e8ecf0',
    phoneBorder: '#d0d4da', screenBg: '#fafbfc', nameColor: '#2c3e50', dateColor: '#8e99a4',
    btnBg: '#6b7d92', btnText: '#ffffff', leafColor: '#a8b5c5', leafOp: 0.28,
    headColor: '#2c3e50', subColor: '#8e99a4',
    iconBg: '#e8ecf0', iconStroke: '#6b7d92',
    brandBg: '#ffffff', brandBorder: '#dde0e5', brandText: '#6b7d92',
    screenDeco: sDeco.classic('#6b7d92'), bgDeco: '',
  },
  'classic-gold': {
    line1: 'Classic', line2: 'Wedding Invitation',
    bg1: '#f2ebe0', bg2: '#faf6ee', accent: '#b8943a', accentLight: '#f5eedf',
    phoneBorder: '#d5c9b4', screenBg: '#fffcf6', nameColor: '#3d2e18', dateColor: '#9e8e72',
    btnBg: '#b8943a', btnText: '#ffffff', leafColor: '#c9b48a', leafOp: 0.32,
    headColor: '#3d2e18', subColor: '#9e8e72',
    iconBg: '#f5eedf', iconStroke: '#b8943a',
    brandBg: '#fffdf7', brandBorder: '#e5dbc8', brandText: '#b8943a',
    screenDeco: sDeco.classic('#b8943a'), bgDeco: '',
  },
  'classic-platinum': {
    line1: 'Classic', line2: 'Wedding Invitation',
    bg1: '#28282c', bg2: '#1a1a1e', accent: '#d4af37', accentLight: '#2e2a22',
    phoneBorder: '#3a3a3e', screenBg: '#1e1e22', nameColor: '#f0e8d6', dateColor: '#8a8280',
    btnBg: '#d4af37', btnText: '#1a1a1e', leafColor: '#4a4640', leafOp: 0.4,
    headColor: '#f0e8d6', subColor: '#8a8280',
    iconBg: '#2e2a22', iconStroke: '#d4af37',
    brandBg: '#2e2a22', brandBorder: '#4a4640', brandText: '#d4af37',
    screenDeco: sDeco.classic('#d4af37'), bgDeco: bDeco.softCircles('#d4af37'),
  },

  // ──────────── RUSTIC ────────────
  'rustic-silver': {
    line1: 'Rustic', line2: 'Wedding Invitation',
    bg1: '#efe9de', bg2: '#f6f2ea', accent: '#8d6e63', accentLight: '#f0e8dd',
    phoneBorder: '#d4c4ad', screenBg: '#faf7f0', nameColor: '#4a3728', dateColor: '#a08e7a',
    btnBg: '#8d6e63', btnText: '#ffffff', leafColor: '#9aa06a', leafOp: 0.35,
    headColor: '#4a3728', subColor: '#a08e7a',
    iconBg: '#f0e8dd', iconStroke: '#8d6e63',
    brandBg: '#faf7f0', brandBorder: '#e0d5c2', brandText: '#8d6e63',
    screenDeco: sDeco.rustic('#8d6e63'), bgDeco: '',
  },
  'rustic-gold': {
    line1: 'Rustic', line2: 'Wedding Invitation',
    bg1: '#e8e2d4', bg2: '#f2efe6', accent: '#6b7c3e', accentLight: '#e8ead8',
    phoneBorder: '#cfc5ae', screenBg: '#faf8f2', nameColor: '#3a3520', dateColor: '#8e856e',
    btnBg: '#6b7c3e', btnText: '#ffffff', leafColor: '#8a9960', leafOp: 0.38,
    headColor: '#3a3520', subColor: '#8e856e',
    iconBg: '#e8ead8', iconStroke: '#6b7c3e',
    brandBg: '#faf8f2', brandBorder: '#d8d0be', brandText: '#6b7c3e',
    screenDeco: sDeco.rustic('#6b7c3e'), bgDeco: '',
  },
  'rustic-platinum': {
    line1: 'Rustic', line2: 'Wedding Invitation',
    bg1: '#1e2e1f', bg2: '#121c13', accent: '#c9a24c', accentLight: '#252e20',
    phoneBorder: '#3a4a3c', screenBg: '#1a241b', nameColor: '#e8dfc8', dateColor: '#7e8870',
    btnBg: '#c9a24c', btnText: '#1a241b', leafColor: '#3a5030', leafOp: 0.45,
    headColor: '#e8dfc8', subColor: '#7e8870',
    iconBg: '#252e20', iconStroke: '#c9a24c',
    brandBg: '#252e20', brandBorder: '#3a4a3c', brandText: '#c9a24c',
    screenDeco: sDeco.rustic('#c9a24c'), bgDeco: '',
  },

  // ──────────── MINIMALIST ────────────
  'minimalist-silver': {
    line1: 'Minimalist', line2: 'Wedding Invitation',
    bg1: '#edeff2', bg2: '#f6f7f8', accent: '#8e99a4', accentLight: '#e8eaee',
    phoneBorder: '#d5d8dd', screenBg: '#fafafa', nameColor: '#1a1a1a', dateColor: '#9ea7b1',
    btnBg: '#1a1a1a', btnText: '#ffffff', leafColor: '#c5cad0', leafOp: 0.2,
    headColor: '#1a1a1a', subColor: '#9ea7b1',
    iconBg: '#e8eaee', iconStroke: '#8e99a4',
    brandBg: '#ffffff', brandBorder: '#e2e4e8', brandText: '#8e99a4',
    screenDeco: sDeco.minimalist('#8e99a4'), bgDeco: '',
  },
  'minimalist-gold': {
    line1: 'Minimalist', line2: 'Wedding Invitation',
    bg1: '#f0e3d8', bg2: '#f8f0e8', accent: '#c47d5a', accentLight: '#f5e8dd',
    phoneBorder: '#dac4b0', screenBg: '#fdf9f4', nameColor: '#2a2018', dateColor: '#a89080',
    btnBg: '#c47d5a', btnText: '#ffffff', leafColor: '#d4b89a', leafOp: 0.3,
    headColor: '#2a2018', subColor: '#a89080',
    iconBg: '#f5e8dd', iconStroke: '#c47d5a',
    brandBg: '#fdf9f4', brandBorder: '#e8d8c5', brandText: '#c47d5a',
    screenDeco: sDeco.minimalist('#c47d5a'), bgDeco: '',
  },
  'minimalist-platinum': {
    line1: 'Minimalist', line2: 'Wedding Invitation',
    bg1: '#1a1a1a', bg2: '#111111', accent: '#d4af37', accentLight: '#252218',
    phoneBorder: '#333333', screenBg: '#1a1a1a', nameColor: '#f0f0f0', dateColor: '#777777',
    btnBg: '#d4af37', btnText: '#111111', leafColor: '#333333', leafOp: 0.35,
    headColor: '#f0f0f0', subColor: '#777777',
    iconBg: '#252218', iconStroke: '#d4af37',
    brandBg: '#252218', brandBorder: '#333333', brandText: '#d4af37',
    screenDeco: sDeco.minimalist('#d4af37'), bgDeco: '',
  },

  // ──────────── ISLAMIC ────────────
  'islamic-silver': {
    line1: 'Islamic', line2: 'Wedding Invitation',
    bg1: '#e0ede4', bg2: '#f0f7f2', accent: '#3d7a42', accentLight: '#dceade',
    phoneBorder: '#b8cebb', screenBg: '#f6faf7', nameColor: '#1e4620', dateColor: '#6e9872',
    btnBg: '#3d7a42', btnText: '#ffffff', leafColor: '#8ab88e', leafOp: 0.28,
    headColor: '#1e4620', subColor: '#6e9872',
    iconBg: '#dceade', iconStroke: '#3d7a42',
    brandBg: '#f6faf7', brandBorder: '#c8daca', brandText: '#3d7a42',
    screenDeco: sDeco.islamic('#3d7a42'), bgDeco: '',
  },
  'islamic-gold': {
    line1: 'Islamic', line2: 'Wedding Invitation',
    bg1: '#f0e6dd', bg2: '#faf2ec', accent: '#c4993d', accentLight: '#f5ebdd',
    phoneBorder: '#d8c5aa', screenBg: '#fdf8f2', nameColor: '#3e2e18', dateColor: '#a89070',
    btnBg: '#c4993d', btnText: '#ffffff', leafColor: '#c9b490', leafOp: 0.3,
    headColor: '#3e2e18', subColor: '#a89070',
    iconBg: '#f5ebdd', iconStroke: '#c4993d',
    brandBg: '#fdf8f2', brandBorder: '#e5d8c0', brandText: '#c4993d',
    screenDeco: sDeco.islamic('#c4993d'), bgDeco: '',
  },
  'islamic-platinum': {
    line1: 'Islamic', line2: 'Wedding Invitation',
    bg1: '#0f2818', bg2: '#0a1d10', accent: '#d4af37', accentLight: '#18301e',
    phoneBorder: '#264a2e', screenBg: '#122218', nameColor: '#e8dfc8', dateColor: '#6a8a6e',
    btnBg: '#d4af37', btnText: '#0a1d10', leafColor: '#1a3a22', leafOp: 0.5,
    headColor: '#e8dfc8', subColor: '#6a8a6e',
    iconBg: '#18301e', iconStroke: '#d4af37',
    brandBg: '#18301e', brandBorder: '#264a2e', brandText: '#d4af37',
    screenDeco: sDeco.islamic('#d4af37'), bgDeco: bDeco.islamicStars('#d4af37'),
  },

  // ──────────── FLORAL ────────────
  'floral-silver': {
    line1: 'Floral', line2: 'Wedding Invitation',
    bg1: '#e5def0', bg2: '#f4f0f8', accent: '#9b7ac7', accentLight: '#ece5f4',
    phoneBorder: '#cfc2e0', screenBg: '#fbf8ff', nameColor: '#3d2860', dateColor: '#9888b0',
    btnBg: '#9b7ac7', btnText: '#ffffff', leafColor: '#baa8d8', leafOp: 0.3,
    headColor: '#3d2860', subColor: '#9888b0',
    iconBg: '#ece5f4', iconStroke: '#9b7ac7',
    brandBg: '#fbf8ff', brandBorder: '#ddd4ea', brandText: '#9b7ac7',
    screenDeco: sDeco.floral('#9b7ac7'), bgDeco: '',
  },
  'floral-gold': {
    line1: 'Floral', line2: 'Wedding Invitation',
    bg1: '#f4dde2', bg2: '#fdf0f3', accent: '#d4627a', accentLight: '#fce8ed',
    phoneBorder: '#e0b8c0', screenBg: '#fffafb', nameColor: '#5a1830', dateColor: '#b08090',
    btnBg: '#d4627a', btnText: '#ffffff', leafColor: '#e0a0b0', leafOp: 0.3,
    headColor: '#5a1830', subColor: '#b08090',
    iconBg: '#fce8ed', iconStroke: '#d4627a',
    brandBg: '#fffafb', brandBorder: '#f0d0d8', brandText: '#d4627a',
    screenDeco: sDeco.floral('#d4627a'), bgDeco: '',
  },
  'floral-platinum': {
    line1: 'Floral', line2: 'Wedding Invitation',
    bg1: '#d8e8f4', bg2: '#edf4fa', accent: '#5a8ab5', accentLight: '#dfe9f2',
    phoneBorder: '#b0c8dd', screenBg: '#f7fbff', nameColor: '#1a3550', dateColor: '#7898b0',
    btnBg: '#5a8ab5', btnText: '#ffffff', leafColor: '#a0c0d8', leafOp: 0.3,
    headColor: '#1a3550', subColor: '#7898b0',
    iconBg: '#dfe9f2', iconStroke: '#5a8ab5',
    brandBg: '#f7fbff', brandBorder: '#c8dae8', brandText: '#5a8ab5',
    screenDeco: sDeco.floral('#5a8ab5'), bgDeco: '',
  },

  // ──────────── TYPOGRAPHY ────────────
  'elegance-typique': {
    line1: 'Typography', line2: 'Wedding Invitation',
    bg1: '#f2eee5', bg2: '#faf8f2', accent: '#9e7b3b', accentLight: '#f0e8d8',
    phoneBorder: '#d5c8aa', screenBg: '#faf7f0', nameColor: '#4a3820', dateColor: '#a09070',
    btnBg: '#9e7b3b', btnText: '#ffffff', leafColor: '#c8b890', leafOp: 0.3,
    headColor: '#4a3820', subColor: '#a09070',
    iconBg: '#f0e8d8', iconStroke: '#9e7b3b',
    brandBg: '#faf7f0', brandBorder: '#e0d4be', brandText: '#9e7b3b',
    screenDeco: sDeco.typography('#9e7b3b'), bgDeco: '',
  },
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export const getTemplateThumbnail = (slug: string, category?: string, price?: number, name?: string): string => {
  const lowerSlug = (slug || '').toLowerCase();

  // Resolve category from slug or explicit category
  let cat = 'classic';
  const lowerCat = (category || '').toLowerCase();
  if (lowerCat.includes('classic') || lowerSlug.includes('classic')) {
    cat = 'classic';
  } else if (lowerCat.includes('rustic') || lowerSlug.includes('rustic')) {
    cat = 'rustic';
  } else if (lowerCat.includes('minimalist') || lowerSlug.includes('minimalist')) {
    cat = 'minimalist';
  } else if (lowerCat.includes('islamic') || lowerSlug.includes('islamic')) {
    cat = 'islamic';
  } else if (lowerCat.includes('floral') || lowerSlug.includes('floral')) {
    cat = 'floral';
  } else if (lowerCat.includes('typography') || lowerSlug.includes('typography') || lowerSlug.includes('typique')) {
    cat = 'typography';
  } else if (lowerCat.includes('premium') || lowerSlug.includes('premium')) {
    cat = 'classic'; // Premium maps to classic styling
  } else if (lowerCat.includes('modern') || lowerSlug.includes('modern')) {
    cat = 'minimalist'; // Modern maps to minimalist styling
  }

  // Resolve tier from price or slug hints
  let tier: 'silver' | 'gold' | 'platinum' = 'silver';
  if (price !== undefined && price !== null) {
    const numPrice = Number(price);
    if (numPrice >= 140000) {
      tier = 'platinum';
    } else if (numPrice > 0) {
      tier = 'gold';
    } else {
      tier = 'silver';
    }
  } else {
    if (lowerSlug.includes('platinum')) {
      tier = 'platinum';
    } else if (
      lowerSlug.includes('gold') ||
      lowerSlug === 'rustic' || lowerSlug === 'islamic' ||
      lowerSlug === 'minimalist' || lowerSlug === 'floral'
    ) {
      tier = 'gold';
    } else {
      tier = 'silver';
    }
  }

  // Build theme key
  let themeKey: string;
  if (cat === 'typography') {
    themeKey = 'elegance-typique';
  } else {
    themeKey = `${cat}-${tier}`;
  }

  const theme = THEMES[themeKey] || THEMES['classic-silver'];
  return svgToBase64(createMockupSvg(theme, slug, name));
};
