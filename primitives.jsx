// primitives.jsx — shared building blocks for the diary prototype.
// Screen frame, status bar, home indicator, tab bar, seal stamp, icons.

const W = 390, H = 844;
const skin = (theme, part) => theme?.skin?.[part] || {};
const DECOR_THEME_KEYS = new Set([
  'celadon', 'inkPlum', 'mossGarden', 'study', 'dusk',
  'morningPaper', 'seaSalt', 'obsidianDawn', 'snowNight',
]);

function ThemeDecor({ theme }) {
  const key = theme?.key;
  if (!DECOR_THEME_KEYS.has(key)) return null;
  return (
    <div className={`theme-decor theme-decor-${key}`} aria-hidden="true">
      <svg className="theme-decor-svg decor-celadon" viewBox="0 0 390 844">
        <path d="M286 30c44 16 72 50 85 99M303 29c-22 37-24 78-5 119M326 43c-8 28-5 57 11 85"/>
        <path d="M13 680c35-24 67-21 96 7s61 31 95 3 69-28 109 1 57 23 79 8"/>
        <circle cx="334" cy="96" r="34"/><circle cx="334" cy="96" r="24"/>
      </svg>
      <svg className="theme-decor-svg decor-inkPlum" viewBox="0 0 390 844">
        <path d="M405 72c-86 7-119 47-165 90-41 38-90 45-151 75M312 113c-6 42-31 73-67 98M245 160c-35-11-71-7-108 13M362 88c-7 22-2 43 14 63"/>
        <g>
          <circle cx="238" cy="164" r="4"/><circle cx="245" cy="161" r="4"/><circle cx="244" cy="169" r="4"/><circle cx="236" cy="171" r="4"/>
          <circle cx="134" cy="173" r="3.5"/><circle cx="141" cy="170" r="3.5"/><circle cx="140" cy="177" r="3.5"/><circle cx="133" cy="180" r="3.5"/>
          <circle cx="312" cy="113" r="3.5"/><circle cx="319" cy="110" r="3.5"/><circle cx="318" cy="117" r="3.5"/><circle cx="311" cy="120" r="3.5"/>
        </g>
      </svg>
      <svg className="theme-decor-svg decor-mossGarden" viewBox="0 0 390 844">
        <path d="M350 17c-10 70-5 144 21 226M311 31c10 76 23 132 52 191M358 74l-49-26m55 58 33-34m-28 70-52-20m59 56 30-25"/>
        <path d="M-24 723c49-45 103-48 153-17s91 31 138 1 92-29 149 4"/>
        <ellipse cx="308" cy="48" rx="25" ry="6" transform="rotate(26 308 48)"/>
        <ellipse cx="397" cy="70" rx="25" ry="6" transform="rotate(-44 397 70)"/>
        <ellipse cx="315" cy="122" rx="25" ry="6" transform="rotate(20 315 122)"/>
      </svg>
      <svg className="theme-decor-svg decor-study" viewBox="0 0 390 844">
        <path d="M42 72h85M42 80h65M42 88h76M267 734h79M280 742h66"/>
        <path d="M310 39v81M290 61h40M299 61c0-17 22-17 22 0v31c0 12-22 12-22 0z"/>
        <path d="M15 663c64 12 115 12 175 0s119-12 185 0"/>
      </svg>
      <svg className="theme-decor-svg decor-dusk" viewBox="0 0 390 844">
        <path d="M-21 159c58-32 112-27 162 5s102 38 168 7 100-29 126-9M-40 183c60-28 115-20 164 10s103 34 169 4 103-25 139-5"/>
        <path d="M302 54a46 46 0 1 0 38 74 39 39 0 1 1-38-74z"/>
        <circle cx="72" cy="116" r="2"/><circle cx="111" cy="87" r="1.4"/><circle cx="245" cy="126" r="1.7"/>
      </svg>
      <svg className="theme-decor-svg decor-morningPaper" viewBox="0 0 390 844">
        <path d="M20 52h350M20 57h350M20 182h350M20 187h350M20 681h350M20 686h350"/>
        <path d="M48 82h128M48 91h92M48 100h108M218 82h126M218 91h102M218 100h116"/>
        <path d="M56 713h278M56 721h278M56 729h278"/>
      </svg>
      <svg className="theme-decor-svg decor-seaSalt" viewBox="0 0 390 844">
        <path d="M-28 670c77-43 139 28 216-4s135 20 230-8M-30 695c78-38 139 24 216-3s137 17 232-7M-31 718c78-32 143 21 220-2s137 15 231-5"/>
        <path d="M291 94c12-12 24-12 36 0 12-12 24-12 36 0M29 207c9-9 18-9 27 0 9-9 18-9 27 0"/>
        <circle cx="335" cy="152" r="2"/><circle cx="353" cy="179" r="1.5"/>
      </svg>
      <svg className="theme-decor-svg decor-obsidianDawn" viewBox="0 0 390 844">
        <circle cx="322" cy="104" r="34"/><circle cx="322" cy="104" r="21"/>
        <path d="M322 54V34M322 174v-20M272 104h-20M392 104h-20M286 68l-14-14M372 154l-14-14M358 68l14-14M272 154l14-14"/>
        <path d="M26 715h338M26 724h338"/>
      </svg>
      <svg className="theme-decor-svg decor-snowNight" viewBox="0 0 390 844">
        <circle cx="318" cy="105" r="48"/><circle cx="337" cy="88" r="48"/>
        <path d="M72 161v54m-24-41 48 28m-48 0 48-28M310 271v38m-17-29 34 20m-34 0 34-20"/>
        <path d="M-15 690c75-38 132 20 207-5s135 16 214-8M-18 718c78-31 138 17 212-4s135 13 215-7"/>
      </svg>
      <span className="theme-decor-mark mark-a"/><span className="theme-decor-mark mark-b"/><span className="theme-decor-mark mark-c"/>
    </div>
  );
}

function ThemeMotif({ theme, variant = 'card' }) {
  const key = theme?.key;
  if (!DECOR_THEME_KEYS.has(key)) return null;
  const common = {
    position: 'absolute', pointerEvents: 'none', zIndex: 0,
    right: variant === 'hero' ? 18 : 12, bottom: variant === 'panel' ? 10 : 12,
    width: variant === 'hero' ? 86 : 62, height: variant === 'hero' ? 62 : 46,
    color: theme.accent, opacity: variant === 'panel' ? 0.32 : 0.42,
  };
  const motif = {
    celadon: <><circle cx="39" cy="24" r="18"/><circle cx="39" cy="24" r="12"/><path d="M5 37c18-14 34 10 52-2"/></>,
    inkPlum: <><path d="M3 39c21-2 25-18 39-25 8-4 14-4 22-8"/><path d="M36 17c-6-7-7-12-6-16M47 12c3-7 8-10 14-12"/><circle cx="36" cy="17" r="3"/><circle cx="49" cy="11" r="3"/></>,
    mossGarden: <><path d="M58 44C43 34 29 22 13 2M48 36l2-18M39 29l-18-1M31 20l1-15M23 14 8 13"/><ellipse cx="50" cy="18" rx="9" ry="3"/><ellipse cx="21" cy="28" rx="9" ry="3"/></>,
    study: <><path d="M7 7h48v32H7zM13 13h34M13 20h27M13 27h31"/><path d="M52 7l6-5v32l-6 5"/></>,
    dusk: <><path d="M17 6a18 18 0 1 0 17 29A15 15 0 1 1 17 6z"/><path d="M34 38c10-7 20-7 30 0"/><circle cx="53" cy="10" r="1.5"/></>,
    morningPaper: <><path d="M4 5h56v36H4zM9 12h46M9 18h21M35 18h20M9 25h46M9 32h35"/><path d="M32 7v32"/></>,
    seaSalt: <><path d="M2 36c12-8 22 7 34-1s21 5 32-1M4 43c12-7 22 6 34-1s21 4 30-1M28 12c6-6 12-6 18 0 6-6 12-6 18 0"/></>,
    obsidianDawn: <><circle cx="48" cy="17" r="9"/><path d="M48 2v6m0 18v6M33 17h6m18 0h6M9 7h5v35H9zM18 7h2v35h-2z"/></>,
    snowNight: <><path d="M37 4v30M24 11l26 16M24 27l26-16M8 38c11-7 19 6 30-1s19 4 27-1"/><circle cx="58" cy="8" r="1.5"/></>,
  }[key];
  return (
    <svg className={`theme-card-motif theme-card-motif-${key}`} viewBox="0 0 70 48" style={common}
      fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {motif}
    </svg>
  );
}

function ThemeHeaderMark({ theme }) {
  const key = theme?.key;
  if (!DECOR_THEME_KEYS.has(key)) return null;
  const marks = {
    celadon: ['青瓷', '温润如玉'],
    inkPlum: ['墨梅', '一枝清雅'],
    mossGarden: ['苔庭', '清静自然'],
    study: ['书房', '旧纸暖光'],
    dusk: ['暮云', '微光留白'],
    morningPaper: ['晨报', '第1287期'],
    seaSalt: ['海盐', '海风轻拂'],
    obsidianDawn: ['晨光', '曜石映日'],
    snowNight: ['雪夜', '月色如雪'],
  };
  const [label, detail] = marks[key];
  return (
    <div className={`theme-header-mark theme-header-mark-${key}`} aria-hidden="true">
      <span>{label}</span><small>{detail}</small>
    </div>
  );
}

function ThemeCardArt({ theme, kind = 'poem' }) {
  const key = theme?.key;
  if (!DECOR_THEME_KEYS.has(key)) return null;
  return (
    <div className={`theme-card-art theme-card-art-${key} theme-card-art-${kind}`} aria-hidden="true">
      <svg viewBox="0 0 360 240" preserveAspectRatio="none">
        <path className="art-line art-line-a" d="M-12 205c69-34 121 25 191-3s124 21 196-5"/>
        <path className="art-line art-line-b" d="M-15 220c70-29 126 21 196-3s124 17 194-4"/>
        <path className="art-branch" d="M372 21c-68 5-91 38-129 68-34 27-71 32-118 56M285 61c-4 31-20 52-45 70M239 92c-24-8-47-5-72 7"/>
        <path className="art-leaf-stem" d="M361 238c-22-69-46-116-96-177M321 173l-43-9m58 38 27-34m-70-29-4-38m-4 59-42-17"/>
        <path className="art-book" d="M34 32h95v62H34zM47 46h67M47 58h54M47 70h61M129 32l15-12v62l-15 12"/>
        <path className="art-rays" d="M302 54v-25m0 108v-25m-54-29h25m58 0h25m-92-38 18 18m40 40 18 18m0-76-18 18m-40 40-18 18"/>
        <circle className="art-sun" cx="302" cy="83" r="22"/><circle className="art-sun" cx="302" cy="83" r="13"/>
        <path className="art-moon" d="M303 38a42 42 0 1 0 36 64 35 35 0 1 1-36-64z"/>
        <path className="art-snow" d="M82 33v45M62 44l40 23M62 67l40-23"/>
        <g className="art-blossoms"><circle cx="239" cy="92" r="4"/><circle cx="247" cy="89" r="4"/><circle cx="246" cy="97" r="4"/><circle cx="238" cy="99" r="4"/></g>
      </svg>
      <span className="theme-card-art-label"/>
    </div>
  );
}

function Screen({ theme, children, statusDark = false, bg, contentStyle, noTab = false, tab, onTab }) {
  return (
    <div className={`app-screen theme-screen-${theme?.key || 'default'}${noTab ? ' app-screen-no-tab' : ''}${bg ? ' app-screen-custom-bg' : ''}`} style={{
      width: W, height: H, position: 'relative', overflow: 'hidden',
      background: bg || theme.bg, color: theme.text,
      ...(!bg ? skin(theme, 'screen') : {}),
    }}>
      <StatusBar theme={theme} dark={statusDark} />
      {!bg && <ThemeDecor theme={theme} />}
      <div className="no-scroll app-scroll" style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        overflowY: 'auto', zIndex: 3,
        ...contentStyle,
      }}>
        {children}
      </div>
      {!noTab && <TabBar theme={theme} active={tab} onChange={onTab} />}
      <HomeIndicator theme={theme} />
    </div>
  );
}

function StatusBar({ theme, dark = false }) {
  return null;
}

function HomeIndicator({ theme }) {
  return (
    <div className="home-indicator" style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, height: 34,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      paddingBottom: 8, zIndex: 40, pointerEvents: 'none',
    }}>
      <div style={{ width: 134, height: 5, borderRadius: 100, background: theme.text, opacity: 0.32 }} />
    </div>
  );
}

// Cinnabar seal — small rounded square with vertical chinese chars
function Seal({ char1, char2, theme, size = 36, rotate = -3 }) {
  const px = size;
  const fs = Math.round(px * 0.36);
  return (
    <div className="theme-seal" style={{
      width: px, height: px, borderRadius: Math.round(px * 0.12),
      background: theme.seal,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      transform: `rotate(${rotate}deg)`,
      boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
      fontFamily: "'Noto Serif SC', serif",
      fontWeight: 700, color: '#fff',
      fontSize: fs, lineHeight: 1.0,
      letterSpacing: 0, gap: Math.round(px * 0.04),
      flexShrink: 0,
    }}>
      <span>{char1}</span>
      {char2 && <span>{char2}</span>}
    </div>
  );
}

// Tiny flag glyph
function FlagDot({ theme, size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" style={{ flexShrink: 0 }}>
      <path d="M3 1v10" stroke={theme.seal} strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M3.5 1.5h6l-1.2 2.2L9.5 6h-6V1.5z" fill={theme.seal}/>
    </svg>
  );
}

function TabBar({ theme, active = 'home', onChange }) {
  const items = [
    { id: 'home', label: '今日', icon: IconHome },
    { id: 'timeline', label: '藏册', icon: IconTimeline },
    { id: 'compose', label: '', icon: IconPlus, primary: true },
    { id: 'hex', label: '问', icon: IconHex },
    { id: 'settings', label: '我', icon: IconUser },
  ];
  return (
    <div className={`app-tabbar theme-tabbar-${theme?.key || 'default'}`} style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, height: 82,
      paddingBottom: 24, zIndex: 25,
      background: `linear-gradient(to top, ${theme.bg} 60%, transparent)`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-around',
      padding: '0 12px 24px',
      ...skin(theme, 'nav'),
    }}>
      {items.map((it) => {
        const Icon = it.icon;
        const isActive = it.id === active;
        if (it.primary) {
          const themedPrimary = DECOR_THEME_KEYS.has(theme?.key);
          return (
            <button key={it.id} type="button" aria-label="写日记"
              className="app-tab-item app-tab-primary"
              onClick={() => onChange && onChange(it.id)}
              style={{
                width: 52, height: 52, borderRadius: 26,
                background: theme.text, border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 6px 16px ${theme.text}33`,
                cursor: 'pointer',
                ...skin(theme, 'primary'),
              }}>
              {themedPrimary
                ? <span className="serif app-tab-primary-label" style={{ color: theme.paper, fontSize: 24, lineHeight: 1, letterSpacing: 0 }}>签</span>
                : <Icon color={theme.bg} size={22} />}
            </button>
          );
        }
        return (
          <button key={it.id} type="button" aria-label={it.label}
            className="app-tab-item"
            onClick={() => onChange && onChange(it.id)}
              style={{
                border: 'none', background: 'transparent', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                padding: '6px 10px', minWidth: 52,
                color: isActive ? theme.text : theme.textMute,
                ...skin(theme, 'tabItem'),
                ...(isActive ? skin(theme, 'tabActive') : {}),
              }}>
            <span className="app-tab-icon"><Icon color={isActive ? theme.text : theme.textMute} size={20} /></span>
            <span className="app-tab-label" style={{ fontSize: 10.5, letterSpacing: 1, fontWeight: 500 }}>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── Icons (line-style, 1.5 stroke) ─────────────────────────────────
const IconHome   = ({ color = '#000', size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l7-6 7 6v8a1 1 0 01-1 1h-4v-5H8v5H4a1 1 0 01-1-1V9z"/>
  </svg>
);
const IconTimeline = ({ color = '#000', size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round">
    <path d="M5 3v14M5 6h10M5 11h7M5 16h12"/>
  </svg>
);
const IconPlus = ({ color = '#fff', size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 22 22" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round">
    <path d="M11 4v14M4 11h14"/>
  </svg>
);
const IconHex = ({ color = '#000', size = 20 }) => (
  // hexagram glyph — 6 horizontal lines (top 3 solid 乾, bottom split 坎上, mixed)
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round">
    <path d="M4 4h12"/>
    <path d="M4 7h12"/>
    <path d="M4 10h5M11 10h5"/>
    <path d="M4 13h12"/>
    <path d="M4 16h5M11 16h5"/>
  </svg>
);
const IconImport = ({ color = '#000', size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 3v9m0 0l-3-3m3 3l3-3M4 14v2a1 1 0 001 1h10a1 1 0 001-1v-2"/>
  </svg>
);
const IconUser = ({ color = '#000', size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round">
    <circle cx="10" cy="7" r="3.2"/>
    <path d="M4 17c0-3 2.7-5 6-5s6 2 6 5"/>
  </svg>
);
const IconSearch = ({ color = '#000', size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round">
    <circle cx="8" cy="8" r="5.2"/>
    <path d="M12 12l3.5 3.5"/>
  </svg>
);
const IconChevron = ({ color = '#000', size = 14, dir = 'right' }) => {
  const paths = { right: 'M5 3l5 5-5 5', left: 'M9 3L4 8l5 5', down: 'M3 5l5 5 5-5', up: 'M3 9l5-5 5 5' };
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d={paths[dir] || paths.right}/>
    </svg>
  );
};
const IconClose = ({ color = '#000', size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round">
    <path d="M5 5l10 10M15 5L5 15"/>
  </svg>
);
const IconCamera = ({ color = '#000', size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round">
    <path d="M3 6h3l1.5-2h5L14 6h3v10H3z"/>
    <circle cx="10" cy="11" r="3"/>
  </svg>
);
const IconPin = ({ color = '#000', size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke={color} strokeWidth="1.4" strokeLinejoin="round">
    <path d="M7 1c2.5 0 4 1.8 4 4 0 3-4 8-4 8s-4-5-4-8c0-2.2 1.5-4 4-4z"/>
    <circle cx="7" cy="5" r="1.4"/>
  </svg>
);
const IconShake = ({ color = '#fff', size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 22 22" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 8.5c0-2 1.6-3.5 3.5-3.5h1c2 0 3.5 1.5 3.5 3.5v5c0 2-1.5 3.5-3.5 3.5h-1C6.6 17 5 15.5 5 13.5z"/>
    <path d="M16 6l2 2M17 11l2 .5M16 16l1.5-1.5"/>
  </svg>
);

// ── Image placeholder ────────────────────────────────────────────────
function ImgPlaceholder({ theme, label, h = 120, w = '100%', onClick }) {
  const isImage = typeof label === 'string' && /^(https?:|data:image|blob:)/i.test(label);
  return (
    <div onClick={onClick} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? `查看图片 ${label || ''}` : undefined}
      onKeyDown={e => { if (onClick && (e.key === 'Enter' || e.key === ' ')) onClick(); }}
      style={{
      width: w, height: h, borderRadius: 14,
      background: `repeating-linear-gradient(135deg, ${theme.surfaceSoft}, ${theme.surfaceSoft} 6px, ${theme.surface} 6px, ${theme.surface} 12px)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
      fontSize: 11, color: theme.textSoft, letterSpacing: 0.5,
      border: `0.5px solid ${theme.line}`,
      overflow: 'hidden', cursor: onClick ? 'pointer' : 'default',
    }}>
      {isImage ? <img src={label} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/> : label}
    </div>
  );
}

// ── Paper background patterns ────────────────────────────────────────
// Classical-stationery feel. All patterns over `theme.paper` base color.
// `kind`:
//   plain    — no pattern
//   ruled    — horizontal feint lines, like notebook
//   grid     — square grid, like 田字格
//   columns  — 朱丝栏: vertical cinnabar column lines (classic letter paper)
//   dots     — fine dot grid
const PAPER_LIBRARY = [
  { id: 'plain', name: '空白', group: '基础' },
  { id: 'ruled', name: '横格', group: '基础' },
  { id: 'grid', name: '方格', group: '基础' },
  { id: 'columns', name: '朱丝栏', group: '基础' },
  { id: 'dots', name: '点阵', group: '基础' },
  { id: 'cloud', name: '祥云', group: '纹样' },
  { id: 'art-01', name: '花猫茶歇', group: '插画' },
  { id: 'art-02', name: '山野蘑菇', group: '插画' },
  { id: 'art-03', name: '彩色几何', group: '插画' },
  { id: 'art-04', name: '梦幻独角兽', group: '插画' },
  { id: 'art-06', name: '星月航行', group: '插画' },
  { id: 'art-07', name: '星光餐厅', group: '插画' },
  { id: 'art-08', name: '暖色拼贴', group: '插画' },
  { id: 'art-09', name: '像素冒险', group: '插画' },
  { id: 'art-10', name: '月光留白', group: '插画' },
  { id: 'art-11', name: '流光', group: '插画' },
  { id: 'art-12', name: '复古白玫瑰', group: '插画' },
  { id: 'art-13', name: '植物标本', group: '插画' },
  { id: 'art-14', name: '樱花', group: '插画' },
  { id: 'art-15', name: '邮差小熊', group: '插画' },
  { id: 'art-16', name: '云朵', group: '插画' },
  { id: 'art-17', name: '野餐小狗', group: '插画' },
  { id: 'art-18', name: '巴黎午后', group: '插画' },
  { id: 'art-19', name: '旧纸打字机', group: '插画' },
  { id: 'art-20', name: '圣诞松枝', group: '插画' },
  { id: 'art-21', name: '水墨梅鸟', group: '插画' },
  { id: 'art-22', name: '故宫秋日', group: '插画' },
  { id: 'art-23', name: '秋山', group: '插画' },
  { id: 'art-24', name: '江南园林', group: '插画' },
  { id: 'art-25', name: '雪中宫墙', group: '插画' },
  { id: 'art-26', name: '云海浦江', group: '新信纸' },
  { id: 'art-27', name: '花窗旧巷', group: '新信纸' },
  { id: 'art-28', name: '单车朱门', group: '新信纸' },
  { id: 'art-29', name: '荷亭烟水', group: '新信纸' },
  { id: 'art-30', name: '欧陆花街', group: '新信纸' },
  { id: 'art-31', name: '岭南花窗', group: '新信纸' },
  { id: 'art-32', name: '电车花城', group: '新信纸' },
  { id: 'art-33', name: '京华扇影', group: '新信纸' },
  { id: 'art-34', name: '灯笼家宴', group: '新信纸' },
  { id: 'art-35', name: '港味早茶', group: '新信纸' },
  { id: 'art-36', name: '海棠茶点', group: '新信纸' },
  { id: 'art-37', name: '海棠书案', group: '新信纸' },
  { id: 'art-38', name: '水城贡多拉', group: '新信纸' },
  { id: 'art-39', name: '雨巷花桥', group: '新信纸' },
  { id: 'art-40', name: '塔影湖畔', group: '新信纸' },
  { id: 'art-41', name: '水墨云山', group: '新信纸' },
  { id: 'art-42', name: '荷塘远山', group: '新信纸' },
  { id: 'art-43', name: '枫亭秋色', group: '新信纸' },
  { id: 'art-44', name: '富士秋日', group: '新信纸' },
  { id: 'art-45', name: '爱琴海岛', group: '新信纸' },
  { id: 'art-46', name: '月门水墨', group: '新信纸' },
  { id: 'art-47', name: '竹林飞瀑', group: '新信纸' },
  { id: 'art-48', name: '尼罗河畔', group: '新信纸' },
  { id: 'art-49', name: '峡谷落日', group: '新信纸' },
  { id: 'art-50', name: '沙漠月夜', group: '新信纸' },
  { id: 'art-51', name: '草原金树', group: '新信纸' },
  { id: 'art-52', name: '雪山晨光', group: '新信纸' },
].map(item => item.id.startsWith('art-')
  ? { ...item, src: `assets/papers/paper-${item.id.slice(4)}.webp`, thumb: `assets/papers/paper-${item.id.slice(4)}-thumb.webp` }
  : item);

function paperBg(kind, theme) {
  const custom = PAPER_LIBRARY.find(item => item.id === kind && item.src);
  if (custom) {
    return {
      backgroundImage: `url("${custom.src}")`,
      backgroundSize: '100% 100%',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    };
  }
  const line = theme.line;
  const seal = theme.seal + '33'; // ~20% opacity
  switch (kind) {
    case 'ruled':
      return {
        backgroundImage: `repeating-linear-gradient(to bottom, transparent 0, transparent 34px, ${line} 34px, ${line} 34.6px)`,
      };
    case 'grid':
      return {
        backgroundImage: `linear-gradient(${line} 0.6px, transparent 0.6px), linear-gradient(90deg, ${line} 0.6px, transparent 0.6px)`,
        backgroundSize: '26px 26px',
      };
    case 'columns':
      return {
        backgroundImage: `repeating-linear-gradient(to right, transparent 0, transparent 38px, ${seal} 38px, ${seal} 38.6px)`,
      };
    case 'dots':
      return {
        backgroundImage: `radial-gradient(circle, ${line} 0.9px, transparent 1px)`,
        backgroundSize: '20px 20px',
      };
    case 'sakura': {
      const blossom = (cx, cy, s, rot, c) =>
        `<g transform='translate(${cx} ${cy}) rotate(${rot}) scale(${s})'>` +
        `<g fill='${c}'>` +
        `<ellipse cx='0' cy='-4' rx='2.2' ry='3'/>` +
        `<ellipse cx='3.8' cy='-1.2' rx='2.2' ry='3' transform='rotate(72)'/>` +
        `<ellipse cx='2.3' cy='3.2' rx='2.2' ry='3' transform='rotate(144)'/>` +
        `<ellipse cx='-2.3' cy='3.2' rx='2.2' ry='3' transform='rotate(216)'/>` +
        `<ellipse cx='-3.8' cy='-1.2' rx='2.2' ry='3' transform='rotate(288)'/>` +
        `</g>` +
        `<circle r='1' fill='${theme.seal}66'/>` +
        `</g>`;
      const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'>` +
        blossom(22, 26, 0.9, 12, theme.seal + '32') +
        blossom(68, 18, 0.7, -30, theme.seal + '26') +
        blossom(76, 68, 1.0, 50, theme.seal + '30') +
        blossom(28, 80, 0.65, -10, theme.seal + '22') +
        `</svg>`;
      return {
        backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`,
        backgroundSize: '100px 100px',
      };
    }
    case 'cloud': {
      const cloud = (x, y, s, c) =>
        `<g transform='translate(${x} ${y}) scale(${s})' fill='none' stroke='${c}' stroke-width='1.4' stroke-linecap='round'>` +
        `<path d='M0 8 q4 -6 9 -2 q4 -5 9 0'/>` +
        `<circle cx='2.5' cy='6' r='1.4' fill='${c}' stroke='none'/>` +
        `<circle cx='15' cy='4.5' r='1.4' fill='${c}' stroke='none'/>` +
        `</g>`;
      const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'>` +
        cloud(10, 16, 1.0, theme.accent + '44') +
        cloud(60, 42, 0.85, theme.accent + '3a') +
        cloud(22, 70, 0.9, theme.accent + '3c') +
        cloud(70, 82, 0.7, theme.accent + '36') +
        `</svg>`;
      return {
        backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`,
        backgroundSize: '100px 100px',
      };
    }
    case 'wave': {
      const ripple = (x, y, c) =>
        `<g fill='none' stroke='${c}' stroke-width='1' stroke-linecap='round' transform='translate(${x} ${y})'>` +
        `<path d='M-10 0 q10 -7 20 0'/>` +
        `<path d='M-7 4 q7 -5 14 0'/>` +
        `<path d='M-4 7 q4 -3 8 0'/>` +
        `</g>`;
      const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96'>` +
        ripple(22, 24, theme.accent + '50') +
        ripple(72, 56, theme.accent + '46') +
        ripple(42, 82, theme.accent + '40') +
        `</svg>`;
      return {
        backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`,
        backgroundSize: '96px 96px',
      };
    }
    case 'moon': {
      const moon = (x, y, ph, c) =>
        `<g transform='translate(${x} ${y})'>` +
        `<circle r='5.5' fill='${c}'/>` +
        `<circle cx='${ph}' r='5.5' fill='${theme.paper}'/>` +
        `</g>`;
      const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96'>` +
        moon(22, 26, 2.6, theme.seal + '28') +
        moon(72, 54, -2, theme.seal + '22') +
        moon(34, 80, 1.4, theme.seal + '20') +
        `</svg>`;
      return {
        backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`,
        backgroundSize: '96px 96px',
      };
    }
    case 'plain':
    default:
      return {};
  }
}

// ── Classical poem block — centered, generous letter-spacing ─────────
// Renders 4-line 五绝 / 七绝 in modern horizontal typesetting that still
// reads like a 古诗 — each character clearly spaced, centered, serif.
function splitPoemLines(lines) {
  return (lines || []).flatMap(line => {
    const text = String(line || '').trim();
    const comma = text.indexOf('，');
    if (comma < 0 || comma === text.length - 1) return [text];
    return [text.slice(0, comma + 1), text.slice(comma + 1)];
  }).filter(Boolean);
}

function PoemBody({ lines, size = 22, theme, color, weight = 500 }) {
  const displayLines = splitPoemLines(lines);
  const longest = Math.max(1, ...displayLines.map(line => Array.from(line).length));
  const fittedSize = longest > 8
    ? Math.max(13, Math.min(size, Math.floor(size * 8.2 / longest)))
    : size;
  const spacing = longest >= 12 ? '0.16em' : longest > 8 ? '0.25em' : '0.42em';
  return (
    <div className="serif" style={{
      textAlign: 'center', color: color || theme.text, fontWeight: weight,
      width: '100%', overflow: 'visible',
    }}>
      {displayLines.map((ln, i) => (
        <div key={i} style={{
          fontSize: fittedSize, letterSpacing: spacing,
          lineHeight: longest > 8 ? 2.15 : 2.0,
          paddingLeft: spacing,
          whiteSpace: 'nowrap',
          wordBreak: 'keep-all',
        }}>{ln}</div>
      ))}
    </div>
  );
}

// ── Pull title down to first 2 chars for seal ────────────────────────
function sealChars(title) {
  const t = String(title || '');
  if (t.length === 0) return ['印', '签'];
  if (t.length === 1) return [t, null];
  return [t[0], t[1]];
}

Object.assign(window, {
  W, H, Screen, StatusBar, HomeIndicator, TabBar, Seal, FlagDot, ImgPlaceholder,
  ThemeDecor, ThemeMotif, ThemeHeaderMark, ThemeCardArt,
  IconHome, IconTimeline, IconPlus, IconImport, IconHex, IconUser, IconSearch,
  IconChevron, IconClose, IconCamera, IconPin, IconShake, sealChars,
  paperBg, PAPER_LIBRARY, PoemBody, splitPoemLines, skin,
});
