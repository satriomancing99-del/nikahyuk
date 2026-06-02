/**
 * Utility to generate custom wedding couple illustrations in SVG format
 * and convert them to Base64 Data URIs for template thumbnails.
 * The illustrations are custom-tailored to each category (Classic, Rustic,
 * Minimalist, Islamic, Floral, Typography) and price tier (Silver, Gold, Platinum).
 */

interface SvgOptions {
  background: string;
  bgDecorations?: string;
  groomSkin?: string;
  groomHairType: 'peci' | 'hair' | 'none';
  groomHairColor?: string;
  groomSuitColor: string;
  groomVestColor: string;
  groomShirtColor: string;
  groomBoutonniere: string;
  brideSkin?: string;
  brideHijabColor?: string; // If undefined, she has modern hair
  brideDressColor: string;
  brideVeilColor: string;
  brideCrown: string;
  brideBouquet: string;
  extraForeGround?: string;
  isTypographyLineArt?: boolean;
}

const svgToBase64 = (svgStr: string): string => {
  try {
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgStr)))}`;
  } catch (e) {
    console.error('Failed to convert SVG to base64:', e);
    return '';
  }
};

// Cute cartoon couple illustration generator
const createCoupleSvg = (options: SvgOptions): string => {
  const {
    background,
    bgDecorations = '',
    groomSkin = '#fde5d9',
    groomHairType,
    groomHairColor = '#2d2d2d',
    groomSuitColor,
    groomVestColor,
    groomShirtColor,
    groomBoutonniere,
    brideSkin = '#fde5d9',
    brideHijabColor,
    brideDressColor,
    brideVeilColor,
    brideCrown,
    brideBouquet,
    extraForeGround = '',
    isTypographyLineArt = false
  } = options;

  if (isTypographyLineArt) {
    // Pure typographic abstract line-art illustration (luxurious and elegant)
    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%">
        <defs>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#dfba73" />
            <stop offset="50%" stop-color="#c5a059" />
            <stop offset="100%" stop-color="#9e7b3b" />
          </linearGradient>
          <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#faf9f5" />
            <stop offset="100%" stop-color="#f3f1e9" />
          </linearGradient>
        </defs>
        
        <!-- Background -->
        <rect width="800" height="450" fill="url(#bgGrad)" />
        
        <!-- Elegant Border Frame -->
        <rect x="30" y="30" width="740" height="390" fill="none" stroke="url(#goldGrad)" stroke-width="1.5" rx="15" />
        <rect x="36" y="36" width="728" height="378" fill="none" stroke="url(#goldGrad)" stroke-width="0.5" opacity="0.6" rx="12" />
        
        <!-- Abstract Botanical Lines -->
        <path d="M 60 370 Q 100 375 140 340 T 200 350" stroke="url(#goldGrad)" stroke-width="1.5" fill="none" opacity="0.7"/>
        <path d="M 60 370 Q 50 310 90 280 T 110 200" stroke="url(#goldGrad)" stroke-width="1" fill="none" opacity="0.5"/>
        <path d="M 740 80 Q 700 75 660 110 T 600 100" stroke="url(#goldGrad)" stroke-width="1.5" fill="none" opacity="0.7"/>
        
        <!-- Minimal Line Art Couple Silhouette -->
        <g transform="translate(180, 20)" stroke="url(#goldGrad)" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <!-- Groom Silhouette -->
          <path d="M 120 380 L 130 260 C 140 210, 180 190, 210 195 C 220 198, 235 210, 240 260 L 245 380" />
          <path d="M 180 190 C 180 150, 210 130, 210 130 C 210 130, 240 150, 240 190" />
          
          <!-- Bride Silhouette with flowing veil -->
          <path d="M 230 380 L 235 270 C 240 220, 290 210, 310 210 C 330 210, 380 220, 390 290 L 400 380" />
          <path d="M 290 210 C 270 170, 310 140, 310 140 C 310 140, 350 170, 330 210" />
          <!-- Sheer Veil Lines -->
          <path d="M 310 140 C 280 170, 260 250, 250 380" opacity="0.5" stroke-width="1" />
          <path d="M 310 140 C 340 170, 370 250, 390 380" opacity="0.5" stroke-width="1" />
          
          <!-- Intersecting Love Heart -->
          <path d="M 220 150 C 210 135, 230 120, 240 135 C 250 120, 270 135, 260 150 L 240 170 Z" stroke-width="1" fill="url(#goldGrad)" fill-opacity="0.15" />
        </g>

        <!-- Elegant Calligraphy Text Overlay -->
        <text x="400" y="320" font-family="'Playfair Display', 'Didot', 'Georgia', serif" font-size="26" font-weight="bold" fill="#755a29" text-anchor="middle" letter-spacing="4">THE WEDDING</text>
        <text x="400" y="355" font-family="'Alex Brush', 'Great Vibes', 'Bickham Script Pro', cursive, serif" font-size="34" fill="#a48444" text-anchor="middle">Aditya &amp; Aulia</text>
        <line x1="330" y1="380" x2="470" y2="380" stroke="url(#goldGrad)" stroke-width="1" opacity="0.6" />
      </svg>
    `;
  }

  // Generate groom hair elements
  let groomHairSvg = '';
  if (groomHairType === 'peci') {
    groomHairSvg = `
      <!-- Peci / Songkok -->
      <path d="M 270 95 L 370 95 L 360 40 C 330 38, 300 38, 280 40 Z" fill="#1a1a1a" />
      <path d="M 270 95 C 300 97, 340 97, 370 95 L 370 91 C 340 93, 300 93, 270 91 Z" fill="#333333" opacity="0.4" />
    `;
  } else if (groomHairType === 'hair') {
    groomHairSvg = `
      <!-- Groom Cute Hair cut -->
      <path d="M 260 110 C 255 80, 280 50, 320 48 C 360 46, 385 70, 380 110 C 375 110, 360 85, 340 85 C 320 85, 305 105, 285 105 C 275 105, 265 110, 260 110 Z" fill="${groomHairColor}" />
    `;
  }

  // Generate bride hair/hijab elements
  let brideHijabSvg = '';
  if (brideHijabColor) {
    brideHijabSvg = `
      <!-- Bride Hijab Drape -->
      <!-- Back Hijab cover -->
      <path d="M 405 130 C 400 70, 540 60, 555 130 C 565 170, 560 280, 545 340 C 530 380, 480 380, 460 380 C 420 380, 410 330, 405 280 Z" fill="${brideHijabColor}" />
      
      <!-- Inner Bonnet (Ciput) -->
      <path d="M 445 108 C 460 100, 480 100, 495 108 L 490 100 C 475 94, 460 94, 450 100 Z" fill="#d1dbe5" opacity="0.7" />
      
      <!-- Front Hijab Frame draping around face -->
      <path d="M 430 120 C 420 160, 440 220, 470 230 C 500 220, 520 160, 510 120 C 510 80, 430 80, 430 120 Z" fill="none" stroke="${brideHijabColor}" stroke-width="16" stroke-linecap="round" />
      <path d="M 426 120 C 415 160, 438 223, 470 233 C 502 223, 525 160, 514 120 C 505 85, 435 85, 426 120 Z" fill="${brideHijabColor}" />
      
      <!-- Hijab folds around neck -->
      <path d="M 435 210 C 450 240, 490 240, 505 210 C 515 235, 525 285, 500 320 C 480 340, 460 340, 440 320 C 420 280, 425 235, 435 210 Z" fill="${brideHijabColor}" opacity="0.95" />
    `;
  } else {
    // Non-hijab Modern Hair with soft curls/bun
    brideHijabSvg = `
      <!-- Bride Hair Bun -->
      <circle cx="470" cy="70" r="30" fill="${groomHairColor}" />
      <!-- Main Hair -->
      <path d="M 410 120 C 405 80, 430 50, 470 48 C 510 50, 535 80, 530 120 C 520 120, 510 95, 470 95 C 430 95, 420 120, 410 120 Z" fill="${groomHairColor}" />
      <!-- Side Swept curls -->
      <path d="M 412 110 C 410 140, 425 180, 430 180 C 435 180, 430 140, 428 110 Z" fill="${groomHairColor}" />
      <path d="M 528 110 C 530 140, 515 180, 510 180 C 505 180, 510 140, 512 110 Z" fill="${groomHairColor}" />
    `;
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%">
      <defs>
        <!-- Gradients -->
        <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#d4e6f1" />
          <stop offset="60%" stop-color="#edf2f7" />
          <stop offset="100%" stop-color="#ffffff" />
        </linearGradient>
        <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0f3017" />
          <stop offset="50%" stop-color="#194d26" />
          <stop offset="100%" stop-color="#0d2613" />
        </linearGradient>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f3e5ab" />
          <stop offset="50%" stop-color="#d4af37" />
          <stop offset="100%" stop-color="#aa7c11" />
        </linearGradient>
        <linearGradient id="silverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f8f9fa" />
          <stop offset="50%" stop-color="#cfd8dc" />
          <stop offset="100%" stop-color="#90a4ae" />
        </linearGradient>
        <linearGradient id="lavenderGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#e8e3f5" />
          <stop offset="100%" stop-color="#fcfbfe" />
        </linearGradient>
        <linearGradient id="roseGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#ffebeb" />
          <stop offset="100%" stop-color="#fffafd" />
        </linearGradient>
        <linearGradient id="woodGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ecd9c6" />
          <stop offset="100%" stop-color="#c6a682" />
        </linearGradient>
        <linearGradient id="obsidianGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#1c1c1f" />
          <stop offset="100%" stop-color="#0d0d0f" />
        </linearGradient>
        <linearGradient id="pineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#2d3a2e" />
          <stop offset="100%" stop-color="#141c15" />
        </linearGradient>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="2" dy="4" stdDeviation="4" flood-opacity="0.15" />
        </filter>
        <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      <!-- Background -->
      ${background}

      <!-- Background Decorations (arches, trees, etc.) -->
      ${bgDecorations}

      <g filter="url(#shadow)">
        <!-- =================== GROOM (LEFT) =================== -->
        <!-- Groom Torso / Suit -->
        <g>
          <!-- Shoulders/Coat -->
          <path d="M 180 450 L 195 295 C 210 230, 290 220, 320 220 C 350 220, 400 235, 410 320 L 420 450 Z" fill="${groomSuitColor}" />
          
          <!-- Shirt Collar -->
          <path d="M 290 220 L 320 255 L 350 220 L 335 200 L 305 200 Z" fill="${groomShirtColor}" />
          <!-- Inner Vest -->
          <path d="M 295 220 L 320 270 L 345 220 Z" fill="${groomVestColor}" />
          <line x1="320" y1="230" x2="320" y2="265" stroke="${groomSuitColor}" stroke-width="3" stroke-linecap="round" opacity="0.8" />
          
          <!-- Tie / BowTie if classic -->
          ${groomSuitColor === '#000000' || groomSuitColor === '#212529' ? `
            <!-- Bowtie -->
            <path d="M 310 205 L 330 205 L 325 212 L 330 219 L 310 219 L 315 212 Z" fill="#111" />
            <circle cx="320" cy="212" r="2.5" fill="#fff" />
          ` : ''}

          <!-- Collar Lines -->
          <path d="M 295 220 L 320 250" stroke="#000" stroke-width="1.5" opacity="0.15" />
          <path d="M 345 220 L 320 250" stroke="#000" stroke-width="1.5" opacity="0.15" />
          
          <!-- Boutonniere (Corsage) -->
          ${groomBoutonniere}
        </g>

        <!-- Groom Head & Face -->
        <g>
          <!-- Neck -->
          <path d="M 295 220 C 295 190, 345 190, 345 220 Z" fill="${groomSkin}" />
          <path d="M 295 205 C 305 215, 335 215, 345 205 Z" fill="#000" opacity="0.08" />
          
          <!-- Ears -->
          <circle cx="256" cy="145" r="13" fill="${groomSkin}" />
          <circle cx="384" cy="145" r="13" fill="${groomSkin}" />
          
          <!-- Head Base -->
          <circle cx="320" cy="145" r="58" fill="${groomSkin}" />
          
          <!-- Groom Hair -->
          ${groomHairSvg}

          <!-- Cute Minimalist Eyes & Blush & Smile -->
          <!-- Blushing cheeks -->
          <ellipse cx="288" cy="160" rx="13" ry="8" fill="#ffa099" opacity="0.6" />
          <ellipse cx="352" cy="160" rx="13" ry="8" fill="#ffa099" opacity="0.6" />
          
          <!-- Smiling Closed Eyes (Happy ^ ^) -->
          <path d="M 282 147 Q 292 138 302 147" stroke="#704e46" stroke-width="3" stroke-linecap="round" fill="none" />
          <path d="M 338 147 Q 348 138 358 147" stroke="#704e46" stroke-width="3" stroke-linecap="round" fill="none" />
          
          <!-- Curved Smile -->
          <path d="M 312 170 Q 320 178 328 170" stroke="#704e46" stroke-width="3" stroke-linecap="round" fill="none" />
        </g>

        <!-- =================== BRIDE (RIGHT) =================== -->
        <!-- Sheer Veil behind Bride -->
        <path d="M 420 180 C 370 240, 360 380, 380 450 L 580 450 C 600 380, 590 240, 540 180 Z" fill="${brideVeilColor}" opacity="0.65" />
        <path d="M 420 180 C 370 240, 360 380, 380 450 C 382 450, 372 245, 422 185 Z" fill="#ffffff" opacity="0.4" />

        <!-- Bride Torso / Dress -->
        <g>
          <path d="M 385 450 L 395 315 C 410 240, 460 230, 480 230 C 500 230, 560 240, 575 315 L 585 450 Z" fill="${brideDressColor}" />
          <!-- Lace collar trim -->
          <path d="M 430 235 C 450 250, 510 250, 530 235 C 510 242, 450 242, 430 235 Z" fill="#ffffff" opacity="0.9" />
          <path d="M 440 238 C 455 260, 505 260, 520 238" stroke="#ffffff" stroke-width="2.5" stroke-dasharray="1,4" stroke-linecap="round" fill="none" opacity="0.8" />
        </g>

        <!-- Bride Head & Face -->
        <g>
          <!-- Neck -->
          <path d="M 450 230 C 450 195, 510 195, 510 230 Z" fill="${brideSkin}" />
          
          <!-- Head Base -->
          <circle cx="480" cy="145" r="54" fill="${brideSkin}" />

          <!-- Hijab (drapes over head and neck if applicable) -->
          ${brideHijabSvg}

          <!-- Cute Minimalist Eyes & Blush & Smile -->
          <!-- Blushing cheeks -->
          <ellipse cx="452" cy="160" rx="12" ry="8" fill="#ffa099" opacity="0.6" />
          <ellipse cx="508" cy="160" rx="12" ry="8" fill="#ffa099" opacity="0.6" />
          
          <!-- Smiling Closed Eyes (Happy ^ ^) -->
          <path d="M 444 148 Q 452 140 460 148" stroke="#704e46" stroke-width="3" stroke-linecap="round" fill="none" />
          <path d="M 500 148 Q 508 140 516 148" stroke="#704e46" stroke-width="3" stroke-linecap="round" fill="none" />
          
          <!-- Curved Smile -->
          <path d="M 473 170 Q 480 178 487 170" stroke="#704e46" stroke-width="3" stroke-linecap="round" fill="none" />

          <!-- Bride Floral Crown / Tiara -->
          ${brideCrown}
        </g>

        <!-- Groom & Bride arm overlapping / hugging -->
        <!-- Groom Arm holding bouquet / bride -->
        <path d="M 380 340 Q 405 380, 440 375 C 448 373, 448 357, 440 355 C 415 350, 395 320, 380 300 Z" fill="${groomSuitColor}" opacity="0.95"/>
        <circle cx="442" cy="365" r="7" fill="${groomSkin}" /> <!-- groom hand -->
        
        <!-- Bride Arm holding bouquet -->
        <path d="M 545 340 Q 510 380, 470 370 C 462 368, 465 352, 475 350 C 510 345, 530 320, 545 300 Z" fill="${brideDressColor}" opacity="0.95"/>
        <circle cx="468" cy="360" r="6.5" fill="${brideSkin}" /> <!-- bride hand -->

        <!-- Bride Bouquet of Flowers -->
        ${brideBouquet}
      </g>

      <!-- Foreground Floating elements (birds, hearts, sparkles) -->
      ${extraForeGround}
    </svg>
  `;
};

// =================== DEFINE THEMATIC SVG CHUNKS ===================

// --- 1. CLASSIC THEME ELEMENTS ---
const classicBg = (tier: string) => {
  if (tier === 'silver') {
    return `<rect width="800" height="450" fill="url(#silverGrad)" />`;
  } else if (tier === 'gold') {
    return `<rect width="800" height="450" fill="#faf6eb" />`;
  } else {
    // Platinum Obsidian Velvet
    return `<rect width="800" height="450" fill="url(#obsidianGrad)" />`;
  }
};

const classicDecorations = (tier: string) => {
  let archStroke = 'url(#silverGrad)';
  let particleColor = '#ffffff';
  let opacity = '0.15';
  
  if (tier === 'gold') {
    archStroke = 'url(#goldGrad)';
    particleColor = '#d4af37';
    opacity = '0.25';
  } else if (tier === 'platinum') {
    archStroke = 'url(#goldGrad)';
    particleColor = '#f3e5ab';
    opacity = '0.4';
  }

  const frameArch = `
    <!-- Royal Baroque Arch Silhouette -->
    <path d="M 120 450 L 120 220 C 120 100, 680 100, 680 220 L 680 450" fill="none" stroke="${archStroke}" stroke-width="4" opacity="${opacity}" />
    <path d="M 140 450 L 140 220 C 140 120, 660 120, 660 220 L 660 450" fill="none" stroke="${archStroke}" stroke-width="1.5" stroke-dasharray="8,4" opacity="${opacity}" />
    <circle cx="400" cy="80" r="10" fill="none" stroke="${archStroke}" stroke-width="2" opacity="${opacity}" />
    <path d="M 390 80 L 410 80 M 400 70 L 400 90" stroke="${archStroke}" stroke-width="2" opacity="${opacity}" />
  `;

  const sparkles = `
    <!-- Floating Luxury Sparkles -->
    <g fill="${particleColor}" opacity="0.6" filter="url(#softGlow)">
      <path d="M 100 120 L 105 130 L 115 132 L 105 134 L 100 144 L 95 134 L 85 132 L 95 130 Z" />
      <path d="M 700 280 L 703 285 L 710 286 L 703 287 L 700 292 L 697 287 L 690 286 L 697 285 Z" transform="scale(0.8) translate(150, -50)" />
      <path d="M 200 80 L 202 85 L 208 86 L 202 87 L 200 92 L 198 87 L 192 86 L 198 85 Z" transform="scale(0.6) translate(-50, 40)" />
      <path d="M 620 100 L 624 108 L 634 110 L 624 112 L 620 120 L 616 112 L 606 110 L 616 108 Z" />
      <circle cx="150" cy="200" r="3" opacity="0.4" />
      <circle cx="650" cy="180" r="2.5" opacity="0.4" />
      <circle cx="280" cy="80" r="2" opacity="0.3" />
      <circle cx="520" cy="60" r="4" opacity="0.5" />
    </g>
  `;

  return frameArch + sparkles;
};

// --- 2. RUSTIC THEME ELEMENTS ---
const rusticBg = (tier: string) => {
  if (tier === 'silver') {
    return `<rect width="800" height="450" fill="#f4efe6" />`; // Sand Warm
  } else if (tier === 'gold') {
    return `<rect width="800" height="450" fill="#efebe4" />`; // Beige Kraft
  } else {
    // Platinum Whispering Pines
    return `<rect width="800" height="450" fill="url(#pineGrad)" />`;
  }
};

const rusticDecorations = (tier: string) => {
  let pineConeColor = '#8d6e63';
  let needleColor = '#556b2f';
  let lampGlow = '#ffe082';

  if (tier === 'platinum') {
    pineConeColor = '#a1887f';
    needleColor = '#3b5323';
    lampGlow = '#fff59d';
  }

  // Hanging warm Edison light bulbs
  const lightBulbs = `
    <!-- Hanging Vintage Lights -->
    <g stroke="#6d4c41" stroke-width="1.5" fill="none">
      <line x1="150" y1="0" x2="150" y2="90" />
      <line x1="250" y1="0" x2="250" y2="50" />
      <line x1="550" y1="0" x2="550" y2="60" />
      <line x1="650" y1="0" x2="650" y2="100" />
    </g>
    <g filter="url(#softGlow)">
      <!-- Bulbs glowing -->
      <circle cx="150" cy="100" r="10" fill="${lampGlow}" opacity="0.8" />
      <circle cx="150" cy="100" r="18" fill="${lampGlow}" opacity="0.3" />
      <circle cx="250" cy="60" r="8" fill="${lampGlow}" opacity="0.8" />
      <circle cx="250" cy="60" r="14" fill="${lampGlow}" opacity="0.3" />
      <circle cx="550" cy="70" r="9" fill="${lampGlow}" opacity="0.8" />
      <circle cx="550" cy="70" r="16" fill="${lampGlow}" opacity="0.3" />
      <circle cx="650" cy="110" r="11" fill="${lampGlow}" opacity="0.8" />
      <circle cx="650" cy="110" r="20" fill="${lampGlow}" opacity="0.3" />
    </g>
  `;

  // Autumn dried leaves or pine branches hanging from corners
  const dryLeaves = `
    <!-- Botanical Corner Swags -->
    <g fill="none" stroke-linecap="round" stroke-linejoin="round">
      <!-- Left side foliage -->
      <path d="M 0 0 C 80 20, 100 120, 80 180" stroke="${needleColor}" stroke-width="2" opacity="0.5" />
      <path d="M 0 30 Q 50 60, 60 110" stroke="${needleColor}" stroke-width="1.5" opacity="0.4" />
      <!-- Eucalyptus leaf shapes -->
      <ellipse cx="40" cy="35" rx="10" ry="14" transform="rotate(-20, 40, 35)" fill="${needleColor}" fill-opacity="0.3" stroke="${needleColor}" stroke-width="1" />
      <ellipse cx="65" cy="80" rx="12" ry="16" transform="rotate(15, 65, 80)" fill="${needleColor}" fill-opacity="0.35" stroke="${needleColor}" stroke-width="1" />
      <ellipse cx="80" cy="135" rx="11" ry="15" transform="rotate(-10, 80, 135)" fill="${needleColor}" fill-opacity="0.3" stroke="${needleColor}" stroke-width="1" />

      <!-- Right side foliage -->
      <path d="M 800 0 C 720 20, 700 120, 720 180" stroke="${needleColor}" stroke-width="2" opacity="0.5" />
      <ellipse cx="760" cy="35" rx="10" ry="14" transform="rotate(20, 760, 35)" fill="${needleColor}" fill-opacity="0.3" stroke="${needleColor}" stroke-width="1" />
      <ellipse cx="735" cy="80" rx="12" ry="16" transform="rotate(-15, 735, 80)" fill="${needleColor}" fill-opacity="0.35" stroke="${needleColor}" stroke-width="1" />
      <ellipse cx="720" cy="135" rx="11" ry="15" transform="rotate(10, 720, 135)" fill="${needleColor}" fill-opacity="0.3" stroke="${needleColor}" stroke-width="1" />
    </g>
  `;

  return lightBulbs + dryLeaves;
};

// --- 3. MINIMALIST THEME ELEMENTS ---
const minimalistBg = (tier: string) => {
  if (tier === 'silver') {
    return `<rect width="800" height="450" fill="#f3f3f6" />`;
  } else if (tier === 'gold') {
    return `<rect width="800" height="450" fill="#f5e6e0" />`; // Pale Terracotta / Peach
  } else {
    // Platinum Minimalist Gold Premium
    return `<rect width="800" height="450" fill="#1e1e1e" />`;
  }
};

const minimalistDecorations = (tier: string) => {
  if (tier === 'silver') {
    // Pure clean lines, light circle frame
    return `
      <circle cx="400" cy="225" r="190" fill="none" stroke="#ffffff" stroke-width="3" opacity="0.8" />
      <circle cx="400" cy="225" r="182" fill="none" stroke="#ffffff" stroke-width="1" opacity="0.5" />
    `;
  } else if (tier === 'gold') {
    // Bento grid styled modern abstract shapes
    return `
      <!-- Abstract Terracotta Bento elements -->
      <g fill="#e5bfae" opacity="0.4">
        <rect x="50" y="50" width="120" height="120" rx="20" />
        <path d="M 680 80 A 60 60 0 0 0 620 140 L 740 140 A 60 60 0 0 0 680 80 Z" />
        <circle cx="120" cy="330" r="50" />
        <rect x="630" y="260" width="100" height="150" rx="50" />
      </g>
      <circle cx="400" cy="225" r="190" fill="none" stroke="#e5bfae" stroke-width="1.5" opacity="0.5" />
    `;
  } else {
    // Platinum: Sleek double border and fine gold coordinates
    return `
      <rect x="40" y="40" width="720" height="370" fill="none" stroke="url(#goldGrad)" stroke-width="1.5" rx="8" opacity="0.4" />
      <rect x="48" y="48" width="704" height="354" fill="none" stroke="url(#goldGrad)" stroke-width="0.5" rx="6" opacity="0.2" />
      <!-- Minimal vector line path -->
      <path d="M 100 225 L 700 225" stroke="url(#goldGrad)" stroke-width="0.5" opacity="0.15" />
      <path d="M 400 50 L 400 400" stroke="url(#goldGrad)" stroke-width="0.5" opacity="0.15" />
    `;
  }
};

// --- 4. ISLAMIC THEME ELEMENTS ---
const islamicBg = (tier: string) => {
  if (tier === 'silver') {
    return `<rect width="800" height="450" fill="#ebf5ee" />`; // Mint Jasmine
  } else if (tier === 'gold') {
    return `<rect width="800" height="450" fill="#fdf2ee" />`; // Sakura Peach
  } else {
    // Platinum Emerald Arch
    return `<rect width="800" height="450" fill="url(#emeraldGrad)" />`;
  }
};

const islamicDecorations = (tier: string) => {
  let archColor = '#2e6031';
  let patternColor = '#3e7d43';
  let opac = '0.12';

  if (tier === 'gold') {
    archColor = '#cda250';
    patternColor = '#dfba73';
    opac = '0.2';
  } else if (tier === 'platinum') {
    archColor = 'url(#goldGrad)';
    patternColor = '#f3e5ab';
    opac = '0.35';
  }

  // Arabesque / Mosque Dome Arches silhouette
  const arches = `
    <!-- Arabesque Mosque dome backdrop line art -->
    <g stroke="${archColor}" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="${opac}">
      <!-- Outer Dome -->
      <path d="M 150 450 L 150 250 C 150 180, 220 150, 400 90 C 580 150, 650 180, 650 250 L 650 450" stroke-width="3" />
      <!-- Inner Dome -->
      <path d="M 175 450 L 175 260 C 175 200, 240 170, 400 115 C 560 170, 625 200, 625 260 L 625 450" stroke-width="1" stroke-dasharray="6,4" />
      
      <!-- Islamic Geometric star outlines -->
      <path d="M 400 30 L 407 43 L 420 40 L 413 52 L 423 62 L 409 63 L 400 75 L 391 63 L 377 62 L 387 52 L 380 40 L 393 43 Z" stroke-width="1.5" />
      <path d="M 150 100 L 155 109 L 165 107 L 160 116 L 167 124 L 157 125 L 150 134 L 143 125 L 133 124 L 140 116 L 135 107 L 145 109 Z" stroke-width="1" transform="scale(0.7) translate(100, 50)" />
      <path d="M 700 100 L 705 109 L 715 107 L 710 116 L 717 124 L 707 125 L 700 134 L 693 125 L 683 124 L 690 116 L 685 107 L 695 109 Z" stroke-width="1" transform="scale(0.7) translate(800, 50)" />
    </g>
  `;

  // Jasmine petals or Sakura flowers floating
  let flowers = '';
  if (tier === 'silver') {
    // Floating white jasmine blossoms
    flowers = `
      <g fill="#ffffff" stroke="#ceddd1" stroke-width="0.5" opacity="0.7">
        <circle cx="100" cy="150" r="6" />
        <circle cx="112" cy="150" r="6" />
        <circle cx="106" cy="140" r="6" />
        <circle cx="106" cy="160" r="6" />
        <circle cx="106" cy="150" r="3" fill="#ebf5ee" />
        
        <g transform="translate(580, 220) scale(0.7)">
          <circle cx="100" cy="150" r="6" />
          <circle cx="112" cy="150" r="6" />
          <circle cx="106" cy="140" r="6" />
          <circle cx="106" cy="160" r="6" />
          <circle cx="106" cy="150" r="3" fill="#ebf5ee" />
        </g>
      </g>
    `;
  } else if (tier === 'gold') {
    // Sakura pink petals
    flowers = `
      <g fill="#ffcdd2" opacity="0.6">
        <path d="M 120 80 Q 130 65, 140 80 Q 130 95, 120 80 Z" transform="rotate(15, 130, 80)"/>
        <path d="M 680 200 Q 690 185, 700 200 Q 690 215, 680 200 Z" transform="rotate(-30, 690, 200)"/>
        <path d="M 230 300 Q 240 285, 250 300 Q 240 315, 230 300 Z" transform="rotate(45, 240, 300) scale(0.8)"/>
      </g>
    `;
  }

  return arches + flowers;
};

// --- 5. FLORAL THEME ELEMENTS ---
const floralBg = (tier: string) => {
  if (tier === 'silver') {
    return `<rect width="800" height="450" fill="url(#lavenderGrad)" />`;
  } else if (tier === 'gold') {
    return `<rect width="800" height="450" fill="url(#roseGrad)" />`;
  } else {
    // Platinum: Teal soft gradient
    return `<rect width="800" height="450" fill="url(#skyGrad)" />`;
  }
};

const floralDecorations = (tier: string) => {
  let flowerOutline = '#d8b4fe';
  let flowerFill = '#f3e8ff';
  let leavesColor = '#c084fc';
  
  if (tier === 'gold') {
    flowerOutline = '#fecdd3';
    flowerFill = '#fff1f2';
    leavesColor = '#fda4af';
  } else if (tier === 'platinum') {
    flowerOutline = '#93c5fd';
    flowerFill = '#eff6ff';
    leavesColor = '#a7f3d0';
  }

  // A complete circular wreath around the couple
  return `
    <!-- Floral Wreath backdrop frame -->
    <g fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.4">
      <circle cx="400" cy="225" r="200" stroke="${flowerOutline}" stroke-width="1.5" stroke-dasharray="4,8" />
      <circle cx="400" cy="225" r="192" stroke="${flowerOutline}" stroke-width="0.5" />
    </g>
    <g filter="url(#shadow)" opacity="0.75">
      <!-- Top Left Floral Swag -->
      <path d="M 120 100 Q 150 90, 180 110" stroke="${leavesColor}" stroke-width="2" fill="none" />
      <circle cx="150" cy="100" r="10" fill="${flowerFill}" stroke="${flowerOutline}" stroke-width="1.5" />
      <circle cx="150" cy="100" r="3" fill="${flowerOutline}" />
      <ellipse cx="130" cy="95" rx="6" ry="10" transform="rotate(-30, 130, 95)" fill="${leavesColor}" />
      <ellipse cx="170" cy="105" rx="6" ry="10" transform="rotate(30, 170, 105)" fill="${leavesColor}" />

      <!-- Top Right Floral Swag -->
      <path d="M 680 100 Q 650 90, 620 110" stroke="${leavesColor}" stroke-width="2" fill="none" />
      <circle cx="650" cy="100" r="10" fill="${flowerFill}" stroke="${flowerOutline}" stroke-width="1.5" />
      <circle cx="650" cy="100" r="3" fill="${flowerOutline}" />
      <ellipse cx="670" cy="95" rx="6" ry="10" transform="rotate(30, 670, 95)" fill="${leavesColor}" />
      <ellipse cx="630" cy="105" rx="6" ry="10" transform="rotate(-30, 630, 105)" fill="${leavesColor}" />
      
      <!-- Tiny scattered flowers in background -->
      <g stroke="${flowerOutline}" stroke-width="1" fill="${flowerFill}">
        <circle cx="210" cy="80" r="5" />
        <circle cx="590" cy="80" r="5" />
        <circle cx="140" cy="280" r="4" />
        <circle cx="660" cy="280" r="4" />
      </g>
    </g>
  `;
};

// --- FOREGROUND FLOATERS (BIRDS / HEARTS / SPARKS) ---
const coupleFloaters = (heartColor = '#fda4af') => {
  return `
    <!-- Floating birds & little floating hearts -->
    <g fill="${heartColor}" opacity="0.8">
      <!-- Floating Hearts -->
      <path d="M 400 135 C 395 125, 405 115, 400 125 C 395 115, 405 125, 400 135 Z" transform="scale(0.8) translate(100, -30)" />
      <path d="M 400 135 C 395 125, 405 115, 400 125 C 395 115, 405 125, 400 135 Z" transform="scale(0.5) translate(400, 120)" />
      <path d="M 400 135 C 395 125, 405 115, 400 125 C 395 115, 405 125, 400 135 Z" transform="scale(0.6) translate(140, 20)" />
    </g>
    
    <!-- Cartoon Silhouette Birds -->
    <g stroke="#ffffff" stroke-width="2" fill="none" opacity="0.6" stroke-linecap="round">
      <path d="M 90 90 Q 95 85, 100 90 Q 105 85, 110 90" />
      <path d="M 690 120 Q 694 116, 698 120 Q 702 116, 706 120" transform="scale(0.8) translate(150, 20)" />
    </g>
  `;
};

// --- CROWNS & BOUQUETS ---

// 1. Classic Crowns & Bouquets
const classicCrown = (tier: string) => {
  const crownColor = tier === 'silver' ? 'url(#silverGrad)' : 'url(#goldGrad)';
  const stoneColor = tier === 'silver' ? '#cfd8dc' : '#d4af37';
  
  return `
    <!-- Royal Tiara/Crown -->
    <g transform="translate(480, 95)" fill="none" stroke="${crownColor}" stroke-linecap="round" stroke-linejoin="round">
      <path d="M -30 0 C -15 -25, 15 -25, 30 0 Z" stroke-width="2" />
      <path d="M -30 0 L -15 -18 L 0 -32 L 15 -18 L 30 0" stroke-width="2.5" />
      <!-- Jewels -->
      <circle cx="0" cy="-34" r="3.5" fill="${stoneColor}" stroke="none" />
      <circle cx="-15" cy="-20" r="2.5" fill="${stoneColor}" stroke="none" />
      <circle cx="15" cy="-20" r="2.5" fill="${stoneColor}" stroke="none" />
    </g>
  `;
};

const classicBouquet = (tier: string) => {
  const roseColor = tier === 'platinum' ? '#e91e63' : tier === 'gold' ? '#f50057' : '#cfd8dc';
  const leafColor = '#4caf50';
  
  return `
    <!-- Flower Bouquet -->
    <g transform="translate(455, 345)" filter="url(#shadow)">
      <!-- Green Leaves base -->
      <path d="M -20 15 Q -40 25, -25 35 Q -30 50, -10 40 Q 20 50, 15 35 Q 30 25, 10 15 Z" fill="${leafColor}" opacity="0.8" />
      <path d="M -30 0 Q -10 -20, 20 -15 Q 40 10, 30 25 Q 10 35, -20 15 Z" fill="${leafColor}" />
      
      <!-- Roses cluster -->
      <circle cx="0" cy="10" r="14" fill="${roseColor}" />
      <circle cx="-15" cy="20" r="12" fill="${roseColor}" opacity="0.9" />
      <circle cx="15" cy="20" r="12" fill="${roseColor}" opacity="0.9" />
      <circle cx="-5" cy="30" r="10" fill="${roseColor}" opacity="0.95" />
      <circle cx="12" cy="30" r="10" fill="${roseColor}" opacity="0.95" />
      
      <!-- Flower swirls inside circles to represent roses -->
      <path d="M -5 10 A 5 5 0 0 1 5 10 A 5 5 0 0 1 -5 10" stroke="#fff" stroke-width="1.5" fill="none" opacity="0.7" />
      <path d="M -20 20 A 4 4 0 0 1 -12 20 A 4 4 0 0 1 -20 20" stroke="#fff" stroke-width="1.2" fill="none" opacity="0.7" />
      <path d="M 10 20 A 4 4 0 0 1 18 20 A 4 4 0 0 1 10 20" stroke="#fff" stroke-width="1.2" fill="none" opacity="0.7" />
      
      <!-- Wrapping Bow Ribbon -->
      <path d="M -8 40 L 8 40 L 15 55 L 5 48 L -5 48 L -15 55 Z" fill="#ffffff" />
      <ellipse cx="0" cy="40" rx="8" ry="4" fill="#fafafa" stroke="#eeeeee" stroke-width="1" />
    </g>
  `;
};

// 2. Rustic Crowns & Bouquets
const rusticCrown = () => {
  return `
    <!-- Wild Flower and Wheat Botanical Wreath crown -->
    <g transform="translate(480, 102)" fill="none" stroke-linecap="round">
      <path d="M -32 0 Q 0 -12, 32 0" stroke="#a1887f" stroke-width="2.5" />
      <!-- Small wildflowers along arc -->
      <g fill="#ffb74d" stroke="#f57c00" stroke-width="0.5">
        <circle cx="-20" cy="-6" r="3.5" />
        <circle cx="0" cy="-8" r="4" />
        <circle cx="20" cy="-6" r="3.5" />
      </g>
      <!-- Small green leaves -->
      <g fill="#81c784">
        <path d="M -28 -2 Q -30 -10, -24 -8 Z" />
        <path d="M -10 -8 Q -12 -16, -6 -14 Z" />
        <path d="M 10 -8 Q 12 -16, 6 -14 Z" />
        <path d="M 28 -2 Q 30 -10, 24 -8 Z" />
      </g>
    </g>
  `;
};

const rusticBouquet = () => {
  const leafColor = '#7cb342';
  const wheatColor = '#ffe082';
  
  return `
    <!-- Rustic Bouquet of Wheat & Wildflowers -->
    <g transform="translate(455, 345)" filter="url(#shadow)">
      <!-- Green ferns background -->
      <path d="M -30 20 L 30 20 L 0 50 Z" fill="${leafColor}" opacity="0.7" />
      <!-- Wheat sticks -->
      <g stroke="${wheatColor}" stroke-width="2" fill="none">
        <line x1="-15" y1="10" x2="-25" y2="-15" />
        <line x1="0" y1="10" x2="0" y2="-20" />
        <line x1="15" y1="10" x2="25" y2="-15" />
      </g>
      <g fill="${wheatColor}">
        <!-- Wheat kernels -->
        <circle cx="-25" cy="-15" r="2.5" /><circle cx="-23" cy="-10" r="2.5" />
        <circle cx="0" cy="-20" r="3" /><circle cx="3" cy="-15" r="2.5" /><circle cx="-3" cy="-15" r="2.5" />
        <circle cx="25" cy="-15" r="2.5" /><circle cx="23" cy="-10" r="2.5" />
      </g>
      <!-- Wildflowers -->
      <circle cx="-10" cy="15" r="8" fill="#ffe082" stroke="#ffb300" stroke-width="1.5" />
      <circle cx="10" cy="15" r="8" fill="#ffb74d" stroke="#f57c00" stroke-width="1.5" />
      <circle cx="0" cy="25" r="9" fill="#e8f5e9" stroke="#81c784" stroke-width="1.5" />
      <circle cx="0" cy="25" r="3" fill="#81c784" />
      
      <!-- Rustic Twine Ribbon -->
      <path d="M -5 38 Q 0 45, 5 38 Q 15 48, 2 52 L -2 52 Q -15 48, -5 38 Z" fill="#b0afac" stroke="#8d8c89" stroke-width="1" />
    </g>
  `;
};

// 3. Minimalist Crowns & Bouquets
const minimalistCrown = (tier: string) => {
  const strokeColor = tier === 'platinum' ? 'url(#goldGrad)' : '#90a4ae';
  
  return `
    <!-- Minimalist Hair Band -->
    <path d="M 452 108 Q 480 96, 508 108" fill="none" stroke="${strokeColor}" stroke-width="2" stroke-linecap="round" />
  `;
};

const minimalistBouquet = () => {
  return `
    <!-- Sleek Minimalist Single Calla Lily bouquet -->
    <g transform="translate(455, 345)" filter="url(#shadow)">
      <!-- Single Calla Lily stem and leaf -->
      <path d="M -10 10 Q -25 25, 0 50" stroke="#81c784" stroke-width="2" fill="none" stroke-linecap="round" />
      <path d="M -5 15 Q 15 25, 20 45" stroke="#81c784" stroke-width="1.5" fill="none" opacity="0.6" />
      
      <!-- Flower Cup -->
      <path d="M -12 12 Q -22 -5, -2 -12 C 5 -15, 10 -5, -3 22 Z" fill="#ffffff" stroke="#e0e0e0" stroke-width="1" />
      <!-- Yellow spadix -->
      <path d="M -10 -2 L -5 -7" stroke="#ffeb3b" stroke-width="3" stroke-linecap="round" />
    </g>
  `;
};

// 4. Islamic Crowns & Bouquets
const islamicCrown = (tier: string) => {
  if (tier === 'silver') {
    // Jasmine flower band
    return `
      <g transform="translate(480, 102)">
        <path d="M -30 0 Q 0 -10, 30 0" stroke="#ceddd1" stroke-width="1.5" fill="none" />
        <circle cx="-20" cy="-4" r="4.5" fill="#fff" stroke="#9bbba2" stroke-width="1" />
        <circle cx="0" cy="-7" r="5" fill="#fff" stroke="#9bbba2" stroke-width="1" />
        <circle cx="20" cy="-4" r="4.5" fill="#fff" stroke="#9bbba2" stroke-width="1" />
      </g>
    `;
  } else if (tier === 'gold') {
    // Sakura blossom band
    return `
      <g transform="translate(480, 102)">
        <path d="M -30 0 Q 0 -10, 30 0" stroke="#ffcdd2" stroke-width="2" fill="none" />
        <circle cx="-20" cy="-4" r="5.5" fill="#ffebee" stroke="#ffcdd2" stroke-width="1" />
        <circle cx="0" cy="-7" r="6" fill="#ffebee" stroke="#ffcdd2" stroke-width="1" />
        <circle cx="20" cy="-4" r="5.5" fill="#ffebee" stroke="#ffcdd2" stroke-width="1" />
      </g>
    `;
  } else {
    // Platinum Emerald Arch Gold Tiara
    return `
      <g transform="translate(480, 95)" fill="none" stroke="url(#goldGrad)" stroke-linecap="round" stroke-linejoin="round">
        <path d="M -32 0 C -15 -25, 15 -25, 32 0 Z" stroke-width="2" />
        <path d="M -25 -2 L -12 -18 L 0 -28 L 12 -18 L 25 -2" stroke-width="2" />
        <!-- Emerald Jewel dots -->
        <circle cx="0" cy="-30" r="3.5" fill="#1b5e20" stroke="none" />
        <circle cx="-12" cy="-20" r="2.5" fill="#1b5e20" stroke="none" />
        <circle cx="12" cy="-20" r="2.5" fill="#1b5e20" stroke="none" />
      </g>
    `;
  }
};

const islamicBouquet = (tier: string) => {
  let mainColor = '#ffffff';
  let accentColor = '#9bbba2';
  
  if (tier === 'gold') {
    mainColor = '#ffebee';
    accentColor = '#ffcdd2';
  } else if (tier === 'platinum') {
    mainColor = '#f5f5f5';
    accentColor = 'url(#goldGrad)';
  }

  return `
    <!-- Jasmine/Sakura bouquet of roses -->
    <g transform="translate(455, 345)" filter="url(#shadow)">
      <path d="M -20 15 Q -40 25, -25 35 Q -30 50, -10 40 Q 20 50, 15 35 Q 30 25, 10 15 Z" fill="#7cb342" opacity="0.8" />
      <path d="M -30 0 Q -10 -20, 20 -15 Q 40 10, 30 25 Q 10 35, -20 15 Z" fill="#7cb342" />
      
      <!-- Blossoms -->
      <circle cx="0" cy="10" r="13" fill="${mainColor}" stroke="${accentColor}" stroke-width="1.5" />
      <circle cx="-15" cy="20" r="11" fill="${mainColor}" stroke="${accentColor}" stroke-width="1.5" />
      <circle cx="15" cy="20" r="11" fill="${mainColor}" stroke="${accentColor}" stroke-width="1.5" />
      <circle cx="-5" cy="30" r="10" fill="${mainColor}" stroke="${accentColor}" stroke-width="1.5" />
      <circle cx="12" cy="30" r="10" fill="${mainColor}" stroke="${accentColor}" stroke-width="1.5" />
      
      <circle cx="0" cy="10" r="3" fill="#ffb700" stroke="none" />
      <circle cx="-15" cy="20" r="2.5" fill="#ffb700" stroke="none" />
      <circle cx="15" cy="20" r="2.5" fill="#ffb700" stroke="none" />
      
      <!-- Wrapping ribbon -->
      <path d="M -8 40 L 8 40 L 15 55 L 5 48 L -5 48 L -15 55 Z" fill="#ffffff" />
      <ellipse cx="0" cy="40" rx="8" ry="4" fill="#fafafa" stroke="#eeeeee" stroke-width="1" />
    </g>
  `;
};

// 5. Floral Crowns & Bouquets
const floralCrown = (tier: string) => {
  let flowerStroke = '#d8b4fe';
  let flowerFill = '#f3e8ff';
  
  if (tier === 'gold') {
    flowerStroke = '#fecdd3';
    flowerFill = '#fff1f2';
  } else if (tier === 'platinum') {
    flowerStroke = '#93c5fd';
    flowerFill = '#eff6ff';
  }

  return `
    <!-- Large colorful flower wreath crown -->
    <g transform="translate(480, 102)" fill="none" stroke-linecap="round">
      <path d="M -30 0 Q 0 -12, 30 0" stroke="${flowerStroke}" stroke-width="2" />
      <!-- Blossoms -->
      <circle cx="-20" cy="-4" r="6" fill="${flowerFill}" stroke="${flowerStroke}" stroke-width="1.5" />
      <circle cx="-20" cy="-4" r="2" fill="${flowerStroke}" />
      
      <circle cx="0" cy="-8" r="7" fill="${flowerFill}" stroke="${flowerStroke}" stroke-width="1.5" />
      <circle cx="0" cy="-8" r="2.5" fill="${flowerStroke}" />
      
      <circle cx="20" cy="-4" r="6" fill="${flowerFill}" stroke="${flowerStroke}" stroke-width="1.5" />
      <circle cx="20" cy="-4" r="2" fill="${flowerStroke}" />
    </g>
  `;
};

const floralBouquet = (tier: string) => {
  let c1 = '#d8b4fe'; // purple
  let c2 = '#fecdd3'; // pink
  let c3 = '#93c5fd'; // blue

  if (tier === 'gold') {
    c1 = '#f43f5e';
    c2 = '#fda4af';
    c3 = '#fecdd3';
  } else if (tier === 'platinum') {
    c1 = '#e0f2fe';
    c2 = '#fbcfe8';
    c3 = '#c084fc';
  }

  return `
    <!-- Flourishing Mixed Flower Bouquet -->
    <g transform="translate(455, 345)" filter="url(#shadow)">
      <path d="M -25 15 Q -45 25, -30 35 Q -35 50, -10 40 Q 20 50, 15 35 Q 35 25, 10 15 Z" fill="#81c784" opacity="0.8" />
      
      <!-- Flower balls -->
      <circle cx="0" cy="8" r="14" fill="${c1}" />
      <circle cx="-16" cy="18" r="12" fill="${c2}" />
      <circle cx="16" cy="18" r="12" fill="${c3}" />
      <circle cx="-6" cy="28" r="11" fill="${c3}" />
      <circle cx="10" cy="28" r="11" fill="${c2}" />
      
      <!-- Flower centers -->
      <circle cx="0" cy="8" r="3.5" fill="#fff" opacity="0.8" />
      <circle cx="-16" cy="18" r="3" fill="#fff" opacity="0.8" />
      <circle cx="16" cy="18" r="3" fill="#fff" opacity="0.8" />
      
      <!-- Ribbon bow -->
      <path d="M -8 38 L 8 38 L 15 55 L 5 48 L -5 48 L -15 55 Z" fill="#ffffff" />
      <ellipse cx="0" cy="38" rx="8" ry="4" fill="#fafafa" />
    </g>
  `;
};

// =================== TEMPLATE CONSTRUCTORS ===================

export const getTemplateThumbnail = (slug: string, category?: string, price?: number): string => {
  const lowerSlug = (slug || '').toLowerCase();
  
  // Resolve category
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
  } else {
    cat = 'classic';
  }

  // Resolve tier (price)
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
    } else if (lowerSlug.includes('gold') || lowerSlug === 'rustic' || lowerSlug === 'islamic' || lowerSlug === 'minimalist' || lowerSlug === 'floral') {
      tier = 'gold';
    } else {
      tier = 'silver';
    }
  }

  // Check if it's already a known slug
  const KNOWN_SLUGS = [
    'classic-silver', 'classic-gold', 'classic-platinum',
    'rustic-silver', 'rustic', 'rustic-gold', 'rustic-platinum',
    'minimalist-silver', 'minimalist-gold', 'minimalist', 'minimalist-platinum',
    'islamic-silver', 'islamic', 'islamic-gold', 'islamic-platinum',
    'floral-silver', 'floral-gold', 'floral', 'floral-platinum',
    'elegance-typique'
  ];

  let resolvedSlug = slug;
  if (!KNOWN_SLUGS.includes(slug)) {
    if (cat === 'typography') {
      resolvedSlug = 'elegance-typique';
    } else if (cat === 'classic') {
      resolvedSlug = `classic-${tier}`;
    } else if (cat === 'rustic') {
      resolvedSlug = tier === 'gold' ? 'rustic' : `rustic-${tier}`;
    } else if (cat === 'minimalist') {
      resolvedSlug = tier === 'platinum' ? 'minimalist' : `minimalist-${tier}`;
    } else if (cat === 'islamic') {
      resolvedSlug = tier === 'gold' ? 'islamic' : `islamic-${tier}`;
    } else if (cat === 'floral') {
      resolvedSlug = tier === 'platinum' ? 'floral' : `floral-${tier}`;
    } else {
      resolvedSlug = `classic-${tier}`;
    }
  }

  const baseOptions: Partial<SvgOptions> = {
    groomSkin: '#fde5d9',
    groomHairType: 'peci',
    groomShirtColor: '#ffffff',
    brideSkin: '#fde5d9',
    brideHijabColor: '#ffffff',
    brideDressColor: '#ffffff',
    brideVeilColor: '#ffffff',
    extraForeGround: coupleFloaters(),
  };

  switch (resolvedSlug) {
    // --- CLASSIC CATEGORY ---
    case 'classic-silver':
      return svgToBase64(createCoupleSvg({
        ...baseOptions,
        background: classicBg('silver'),
        bgDecorations: classicDecorations('silver'),
        groomHairType: 'hair',
        groomSuitColor: '#4f5d75', // Silver-greyish blue suit
        groomVestColor: '#2d3748',
        groomBoutonniere: `<circle cx="225" cy="280" r="5" fill="#ffffff" /><path d="M 220 285 L 225 292" stroke="#4caf50" stroke-width="2" />`,
        brideCrown: classicCrown('silver'),
        brideBouquet: classicBouquet('silver'),
      } as SvgOptions));

    case 'classic-gold':
      return svgToBase64(createCoupleSvg({
        ...baseOptions,
        background: classicBg('gold'),
        bgDecorations: classicDecorations('gold'),
        groomHairType: 'hair',
        groomSuitColor: '#1d3557', // Royal navy blue suit
        groomVestColor: '#b8943a', // Gold vest
        groomBoutonniere: `<circle cx="225" cy="280" r="6" fill="#d4af37" /><path d="M 220 285 L 225 292" stroke="#4caf50" stroke-width="2" />`,
        brideCrown: classicCrown('gold'),
        brideBouquet: classicBouquet('gold'),
      } as SvgOptions));

    case 'classic-platinum':
      return svgToBase64(createCoupleSvg({
        ...baseOptions,
        background: classicBg('platinum'),
        bgDecorations: classicDecorations('platinum'),
        groomHairType: 'hair',
        groomSuitColor: '#1a1a1a', // Obsidian black tuxedo
        groomVestColor: '#3a1e2b', // Burgundy vest
        groomBoutonniere: `<circle cx="225" cy="280" r="6" fill="#e91e63" /><path d="M 220 285 L 225 292" stroke="#4caf50" stroke-width="2" />`,
        brideCrown: classicCrown('gold'),
        brideBouquet: classicBouquet('platinum'),
      } as SvgOptions));

    // --- RUSTIC CATEGORY ---
    case 'rustic-silver':
      return svgToBase64(createCoupleSvg({
        ...baseOptions,
        background: rusticBg('silver'),
        bgDecorations: rusticDecorations('silver'),
        groomHairType: 'hair',
        groomSuitColor: '#8d6e63', // Sandy brown tweed vest/suit
        groomVestColor: '#ab8f7e',
        groomBoutonniere: `<circle cx="225" cy="280" r="5" fill="#ffe082" /><path d="M 220 285 L 225 292" stroke="#ffb300" stroke-width="2" />`,
        brideHijabColor: undefined, // modern hair
        brideDressColor: '#fcf8f2', // off-white
        brideCrown: rusticCrown(),
        brideBouquet: rusticBouquet(),
      } as SvgOptions));

    case 'rustic':
    case 'rustic-gold':
      return svgToBase64(createCoupleSvg({
        ...baseOptions,
        background: rusticBg('gold'),
        bgDecorations: rusticDecorations('gold'),
        groomHairType: 'hair',
        groomSuitColor: '#556b2f', // Olive green suit
        groomVestColor: '#c6a682',
        groomBoutonniere: `<circle cx="225" cy="280" r="6" fill="#ffffff" /><path d="M 220 285 L 225 292" stroke="#81c784" stroke-width="2" />`,
        brideHijabColor: undefined, // modern hair
        brideDressColor: '#fbf9f4',
        brideCrown: rusticCrown(),
        brideBouquet: rusticBouquet(),
      } as SvgOptions));

    case 'rustic-platinum':
      return svgToBase64(createCoupleSvg({
        ...baseOptions,
        background: rusticBg('platinum'),
        bgDecorations: rusticDecorations('platinum'),
        groomHairType: 'hair',
        groomSuitColor: '#2d5a27', // Deep forest green suit
        groomVestColor: '#4e3629',
        groomBoutonniere: `<circle cx="225" cy="280" r="6" fill="#f44336" /><path d="M 220 285 L 225 292" stroke="#3b5323" stroke-width="2" />`,
        brideHijabColor: undefined, // modern hair
        brideDressColor: '#f7f4ec',
        brideCrown: rusticCrown(),
        brideBouquet: rusticBouquet(),
      } as SvgOptions));

    // --- MINIMALIST CATEGORY ---
    case 'minimalist-silver':
      return svgToBase64(createCoupleSvg({
        ...baseOptions,
        background: minimalistBg('silver'),
        bgDecorations: minimalistDecorations('silver'),
        groomHairType: 'hair',
        groomSuitColor: '#bdc3c7', // Simple grey blazer
        groomVestColor: '#ffffff',
        groomBoutonniere: `<circle cx="225" cy="280" r="4" fill="#ffffff" /><path d="M 220 285 L 225 290" stroke="#bdc3c7" stroke-width="1.5" />`,
        brideHijabColor: undefined, // modern sleek hair
        brideCrown: minimalistCrown('silver'),
        brideBouquet: minimalistBouquet(),
      } as SvgOptions));

    case 'minimalist-gold':
      return svgToBase64(createCoupleSvg({
        ...baseOptions,
        background: minimalistBg('gold'),
        bgDecorations: minimalistDecorations('gold'),
        groomHairType: 'hair',
        groomSuitColor: '#dfd5cd', // Sandy linen blazer
        groomVestColor: '#ffffff',
        groomBoutonniere: `<circle cx="225" cy="280" r="5" fill="#fbc02d" /><path d="M 220 285 L 225 290" stroke="#fbc02d" stroke-width="1.5" />`,
        brideHijabColor: undefined, // modern hair
        brideDressColor: '#fefefe',
        brideCrown: minimalistCrown('gold'),
        brideBouquet: minimalistBouquet(),
      } as SvgOptions));

    case 'minimalist':
    case 'minimalist-platinum':
      return svgToBase64(createCoupleSvg({
        ...baseOptions,
        background: minimalistBg('platinum'),
        bgDecorations: minimalistDecorations('platinum'),
        groomHairType: 'hair',
        groomSuitColor: '#1e1e1e', // Matte black modern suit
        groomVestColor: '#121212',
        groomBoutonniere: `<circle cx="225" cy="280" r="5" fill="#d4af37" /><path d="M 220 285 L 225 290" stroke="#d4af37" stroke-width="1.5" />`,
        brideHijabColor: undefined, // modern hair
        brideDressColor: '#fdfdfd',
        brideCrown: minimalistCrown('platinum'),
        brideBouquet: minimalistBouquet(),
      } as SvgOptions));

    // --- ISLAMIC CATEGORY ---
    case 'islamic-silver':
      return svgToBase64(createCoupleSvg({
        ...baseOptions,
        background: islamicBg('silver'),
        bgDecorations: islamicDecorations('silver'),
        groomHairType: 'peci',
        groomSuitColor: '#78909c', // Silver-grey koko/suit
        groomVestColor: '#ffffff',
        groomBoutonniere: `<circle cx="225" cy="280" r="5" fill="#e8f5ee" /><path d="M 220 285 L 225 292" stroke="#2e6031" stroke-width="2" />`,
        brideCrown: islamicCrown('silver'),
        brideBouquet: islamicBouquet('silver'),
      } as SvgOptions));

    case 'islamic':
    case 'islamic-gold':
      return svgToBase64(createCoupleSvg({
        ...baseOptions,
        background: islamicBg('gold'),
        bgDecorations: islamicDecorations('gold'),
        groomHairType: 'peci',
        groomSuitColor: '#b89f8d', // Sand brown suit
        groomVestColor: '#ab8f7e',
        groomBoutonniere: `<circle cx="225" cy="280" r="5" fill="#ffe082" /><path d="M 220 285 L 225 292" stroke="#ffb300" stroke-width="2" />`,
        brideCrown: islamicCrown('gold'),
        brideBouquet: islamicBouquet('gold'),
      } as SvgOptions));

    case 'islamic-platinum':
      return svgToBase64(createCoupleSvg({
        ...baseOptions,
        background: islamicBg('platinum'),
        bgDecorations: islamicDecorations('platinum'),
        groomHairType: 'peci',
        groomSuitColor: '#102e1a', // Deep emerald green/black suit
        groomVestColor: '#b8943a',
        groomBoutonniere: `<circle cx="225" cy="280" r="6" fill="#d4af37" /><path d="M 220 285 L 225 292" stroke="#d4af37" stroke-width="2" />`,
        brideCrown: islamicCrown('platinum'),
        brideBouquet: islamicBouquet('platinum'),
      } as SvgOptions));

    // --- FLORAL CATEGORY ---
    case 'floral-silver':
      return svgToBase64(createCoupleSvg({
        ...baseOptions,
        background: floralBg('silver'),
        bgDecorations: floralDecorations('silver'),
        groomHairType: 'hair',
        groomSuitColor: '#b39ddb', // Lavender suit
        groomVestColor: '#ffffff',
        groomBoutonniere: `<circle cx="225" cy="280" r="5" fill="#d1c4e9" /><path d="M 220 285 L 225 292" stroke="#b39ddb" stroke-width="2" />`,
        brideHijabColor: undefined,
        brideDressColor: '#fdfbff',
        brideCrown: floralCrown('silver'),
        brideBouquet: floralBouquet('silver'),
      } as SvgOptions));

    case 'floral-gold':
      return svgToBase64(createCoupleSvg({
        ...baseOptions,
        background: floralBg('gold'),
        bgDecorations: floralDecorations('gold'),
        groomHairType: 'hair',
        groomSuitColor: '#d7ccc8', // Warm tan suit
        groomVestColor: '#ffcdd2',
        groomBoutonniere: `<circle cx="225" cy="280" r="5" fill="#e91e63" /><path d="M 220 285 L 225 292" stroke="#e91e63" stroke-width="2" />`,
        brideHijabColor: undefined,
        brideDressColor: '#fffafa',
        brideCrown: floralCrown('gold'),
        brideBouquet: floralBouquet('gold'),
      } as SvgOptions));

    case 'floral':
    case 'floral-platinum':
      return svgToBase64(createCoupleSvg({
        ...baseOptions,
        background: floralBg('platinum'),
        bgDecorations: floralDecorations('platinum'),
        groomHairType: 'hair',
        groomSuitColor: '#bbdefb', // Sky blue suit
        groomVestColor: '#f8bbd0',
        groomBoutonniere: `<circle cx="225" cy="280" r="5" fill="#93c5fd" /><path d="M 220 285 L 225 292" stroke="#93c5fd" stroke-width="2" />`,
        brideHijabColor: undefined,
        brideDressColor: '#f6faff',
        brideCrown: floralCrown('platinum'),
        brideBouquet: floralBouquet('platinum'),
      } as SvgOptions));

    // --- TYPOGRAPHY CATEGORY ---
    case 'elegance-typique':
      return svgToBase64(createCoupleSvg({
        isTypographyLineArt: true,
      } as unknown as SvgOptions));

    default:
      return '';
  }
};
