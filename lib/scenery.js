// Rich, lightweight SVG parallax scenery for Köln
// Zero external images, completely vector, responsive and super lightweight (~few KBs)

const uri = (svg) => `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;

// 1. Distant Köln Skyline: Rhine River, Kranhaeuser (Crane Houses), distant bridges, and Kölner Dom spires
export const FAR_SKYLINE = uri(`
<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="320" viewBox="0 0 1400 320">
  <defs>
    <linearGradient id="farGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#b88372" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#e8a892" stop-opacity="0.3"/>
    </linearGradient>
    <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#3b7d9c" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#5599b8" stop-opacity="0.8"/>
    </linearGradient>
  </defs>

  <!-- Distant Hills & Horizon -->
  <path d="M0,230 Q350,180 700,225 T1400,210 L1400,320 L0,320 Z" fill="url(#farGrad)" opacity="0.4"/>

  <!-- Distant Kranhaeuser (Modern Crane Houses of Rheinauhafen) -->
  <g fill="url(#farGrad)" opacity="0.65">
    <rect x="120" y="160" width="18" height="70"/>
    <polygon points="120,160 170,160 185,185 138,185"/>
    <rect x="220" y="155" width="18" height="75"/>
    <polygon points="220,155 270,155 285,180 238,180"/>
  </g>

  <!-- Distant Gross St. Martin Church Tower -->
  <g fill="url(#farGrad)" opacity="0.75">
    <rect x="620" y="110" width="36" height="110"/>
    <polygon points="614,110 638,40 662,110"/>
    <polygon points="610,110 616,80 622,110"/>
    <polygon points="654,110 660,80 666,110"/>
  </g>

  <!-- Kölner Dom (Cathedral) - Majestic twin spires rising in the background -->
  <g fill="url(#farGrad)" opacity="0.88">
    <polygon points="900,230 900,90 914,90 926,12 938,90 952,90 952,230"/>
    <polygon points="970,230 970,90 984,90 996,12 1008,90 1022,90 1022,230"/>
    <rect x="952" y="125" width="18" height="105"/>
    <polygon points="936,125 961,85 986,125"/>
    <rect x="830" y="160" width="70" height="70"/>
    <polygon points="830,160 865,130 900,160"/>
    <rect x="1022" y="160" width="75" height="70"/>
    <polygon points="1022,160 1060,130 1097,160"/>
  </g>

  <!-- Rhine River Shimmer Strip -->
  <rect x="0" y="240" width="1400" height="80" fill="url(#waterGrad)"/>
  <path d="M0,250 Q200,246 400,250 T800,250 T1200,250 T1400,250" stroke="#ffffff" stroke-width="1.5" opacity="0.4" fill="none"/>
  <path d="M50,265 Q250,261 450,265 T850,265 T1250,265 T1400,265" stroke="#ffffff" stroke-width="1.5" opacity="0.3" fill="none"/>
</svg>`);

// 2. Midground: Traditional Cologne Altstadt (Old Town) Houses, Hohenzollern Bridge & Cafes
export const MID_STREET = uri(`
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="260" viewBox="0 0 1200 260">
  <defs>
    <linearGradient id="hRed" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#d95d43"/><stop offset="100%" stop-color="#b6432b"/></linearGradient>
    <linearGradient id="hYellow" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#e9b959"/><stop offset="100%" stop-color="#c69539"/></linearGradient>
    <linearGradient id="hGreen" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#5a9e7d"/><stop offset="100%" stop-color="#3d7e5f"/></linearGradient>
    <linearGradient id="hBlue" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#4e88b8"/><stop offset="100%" stop-color="#376891"/></linearGradient>
    <linearGradient id="hPeach" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#e28c70"/><stop offset="100%" stop-color="#be6b51"/></linearGradient>
  </defs>

  <!-- Row of Traditional Gabled Altstadt Houses -->
  <!-- House 1: Ochre -->
  <rect x="20" y="110" width="85" height="150" fill="url(#hYellow)"/>
  <polygon points="12,110 62,55 113,110" fill="#693026"/>
  <rect x="36" y="130" width="16" height="22" rx="2" fill="#fff9eb"/>
  <rect x="68" y="130" width="16" height="22" rx="2" fill="#fff9eb"/>
  <rect x="36" y="170" width="16" height="22" rx="2" fill="#fff9eb"/>
  <rect x="68" y="170" width="16" height="22" rx="2" fill="#fff9eb"/>
  <rect x="48" y="215" width="28" height="45" rx="3" fill="#46241c"/>

  <!-- House 2: Cologne Red with Cafe Awning -->
  <rect x="120" y="90" width="95" height="170" fill="url(#hRed)"/>
  <polygon points="112,90 167,35 223,90" fill="#3a1b15"/>
  <rect x="135" y="110" width="18" height="26" rx="2" fill="#fff9eb"/>
  <rect x="180" y="110" width="18" height="26" rx="2" fill="#fff9eb"/>
  <rect x="135" y="150" width="18" height="26" rx="2" fill="#fff9eb"/>
  <rect x="180" y="150" width="18" height="26" rx="2" fill="#fff9eb"/>
  <polygon points="115,205 220,205 210,225 125,225" fill="#f4f0eb"/>
  <path d="M115,205 L130,225 L145,205 L160,225 L175,205 L190,225 L205,205 L220,225" stroke="#a32e1d" stroke-width="5" fill="none"/>

  <!-- Tree 1 -->
  <circle cx="250" cy="190" r="34" fill="#4a8039"/>
  <circle cx="265" cy="175" r="28" fill="#589643"/>
  <rect x="252" y="215" width="12" height="45" fill="#503322"/>

  <!-- Hohenzollern Bridge Steel Arches Section -->
  <g stroke="#3f5854" stroke-width="7" fill="none">
    <path d="M300,260 Q400,100 500,260"/>
    <path d="M500,260 Q600,100 700,260"/>
    <line x1="330" y1="260" x2="330" y2="185" stroke-width="3"/>
    <line x1="370" y1="260" x2="370" y2="135" stroke-width="3"/>
    <line x1="400" y1="260" x2="400" y2="120" stroke-width="3"/>
    <line x1="430" y1="260" x2="430" y2="135" stroke-width="3"/>
    <line x1="470" y1="260" x2="470" y2="185" stroke-width="3"/>
    <line x1="530" y1="260" x2="530" y2="185" stroke-width="3"/>
    <line x1="570" y1="260" x2="570" y2="135" stroke-width="3"/>
    <line x1="600" y1="260" x2="600" y2="120" stroke-width="3"/>
    <line x1="630" y1="260" x2="630" y2="135" stroke-width="3"/>
    <line x1="670" y1="260" x2="670" y2="185" stroke-width="3"/>
  </g>
  <!-- Bridge Railing with colorful Love-Locks (Liebesschloesser) -->
  <line x1="290" y1="240" x2="710" y2="240" stroke="#2b3b38" stroke-width="4"/>
  <g fill="#e04040">
    <circle cx="340" cy="242" r="3"/><circle cx="360" cy="242" r="3.5" fill="#f4a261"/>
    <circle cx="390" cy="242" r="3" fill="#2a9d8f"/><circle cx="420" cy="242" r="3.5" fill="#e76f51"/>
    <circle cx="450" cy="242" r="3" fill="#e9c46a"/><circle cx="540" cy="242" r="3.5" fill="#e04040"/>
    <circle cx="580" cy="242" r="3" fill="#9b5de5"/><circle cx="620" cy="242" r="3" fill="#00bbf9"/>
  </g>

  <!-- House 3: Pastel Green -->
  <rect x="730" y="100" width="85" height="160" fill="url(#hGreen)"/>
  <polygon points="722,100 772,50 823,100" fill="#5c3826"/>
  <rect x="746" y="125" width="16" height="24" rx="2" fill="#fff9eb"/>
  <rect x="780" y="125" width="16" height="24" rx="2" fill="#fff9eb"/>
  <rect x="746" y="165" width="16" height="24" rx="2" fill="#fff9eb"/>
  <rect x="780" y="165" width="16" height="24" rx="2" fill="#fff9eb"/>

  <!-- House 4: Slate Blue with Clock Tower -->
  <rect x="830" y="80" width="90" height="180" fill="url(#hBlue)"/>
  <polygon points="820,80 875,20 930,80" fill="#2b2d42"/>
  <circle cx="875" cy="65" r="14" fill="#fff9eb" stroke="#333" stroke-width="2"/>
  <line x1="875" y1="65" x2="875" y2="57" stroke="#222" stroke-width="2"/>
  <line x1="875" y1="65" x2="881" y2="65" stroke="#222" stroke-width="2"/>
  <rect x="850" y="115" width="18" height="24" rx="2" fill="#fff9eb"/>
  <rect x="888" y="115" width="18" height="24" rx="2" fill="#fff9eb"/>

  <!-- Tree 2 & Street Bench -->
  <circle cx="970" cy="180" r="38" fill="#4a8039"/>
  <circle cx="985" cy="165" r="32" fill="#5da045"/>
  <rect x="972" y="210" width="14" height="50" fill="#503322"/>

  <!-- House 5: Warm Peach -->
  <rect x="1030" y="105" width="90" height="155" fill="url(#hPeach)"/>
  <polygon points="1022,105 1075,45 1128,105" fill="#693026"/>
  <rect x="1048" y="130" width="18" height="22" rx="2" fill="#fff9eb"/>
  <rect x="1086" y="130" width="18" height="22" rx="2" fill="#fff9eb"/>
</svg>`);

// 3. Foreground Cobblestone Street with Sidewalk Curb, Streetlamps and Milestone Posts
export const NEAR_STREET = uri(`
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="160" viewBox="0 0 600 160">
  <defs>
    <pattern id="cobble" width="40" height="20" patternUnits="userSpaceOnUse">
      <rect width="40" height="20" fill="#38302c"/>
      <rect x="1" y="1" width="18" height="8" rx="2" fill="#4a403a"/>
      <rect x="21" y="1" width="18" height="8" rx="2" fill="#453b36"/>
      <rect x="11" y="11" width="18" height="8" rx="2" fill="#4e443e"/>
      <rect x="31" y="11" width="8" height="8" rx="2" fill="#463d37"/>
      <rect x="1" y="11" width="8" height="8" rx="2" fill="#463d37"/>
    </pattern>
  </defs>

  <rect x="0" y="0" width="600" height="24" fill="#655b54"/>
  <rect x="0" y="20" width="600" height="6" fill="#25211e"/>
  <rect x="0" y="26" width="600" height="134" fill="url(#cobble)"/>

  <g transform="translate(180, -90)">
    <rect x="12" y="90" width="8" height="16" fill="#1e1e24"/>
    <rect x="14" y="10" width="4" height="80" fill="#2b2d35"/>
    <circle cx="16" cy="10" r="4" fill="#2b2d35"/>
    <polygon points="6,-10 26,-10 22,10 10,10" fill="#fff4cf" stroke="#1e1e24" stroke-width="2"/>
    <circle cx="16" cy="0" r="14" fill="#ffe066" opacity="0.35"/>
    <circle cx="16" cy="0" r="6" fill="#fff2a3"/>
    <polygon points="4,-10 28,-10 16,-22" fill="#1e1e24"/>
  </g>

  <g transform="translate(480, -90)">
    <rect x="12" y="90" width="8" height="16" fill="#1e1e24"/>
    <rect x="14" y="10" width="4" height="80" fill="#2b2d35"/>
    <circle cx="16" cy="10" r="4" fill="#2b2d35"/>
    <polygon points="6,-10 26,-10 22,10 10,10" fill="#fff4cf" stroke="#1e1e24" stroke-width="2"/>
    <circle cx="16" cy="0" r="14" fill="#ffe066" opacity="0.35"/>
    <circle cx="16" cy="0" r="6" fill="#fff2a3"/>
    <polygon points="4,-10 28,-10 16,-22" fill="#1e1e24"/>
  </g>
</svg>`);

// Aliases for compatibility
export const FAR = FAR_SKYLINE;
export const MID = MID_STREET;
