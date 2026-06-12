// primitives.jsx — shared building blocks for the diary prototype.
// Screen frame, status bar, home indicator, tab bar, seal stamp, icons.

const W = 390, H = 844;

function Screen({ theme, children, statusDark = false, bg, contentStyle, noTab = false, tab, onTab }) {
  return (
    <div className={`app-screen${noTab ? ' app-screen-no-tab' : ''}`} style={{
      width: W, height: H, position: 'relative', overflow: 'hidden',
      background: bg || theme.bg, color: theme.text,
    }}>
      <StatusBar theme={theme} dark={statusDark} />
      <div className="no-scroll app-scroll" style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        overflowY: 'auto',
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
    <div style={{
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
    <div className="app-tabbar" style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, height: 82,
      paddingBottom: 24, zIndex: 25,
      background: `linear-gradient(to top, ${theme.bg} 60%, transparent)`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-around',
      padding: '0 12px 24px',
    }}>
      {items.map((it) => {
        const Icon = it.icon;
        const isActive = it.id === active;
        if (it.primary) {
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
              }}>
              <Icon color={theme.bg} size={22} />
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
            }}>
            <Icon color={isActive ? theme.text : theme.textMute} size={20} />
            <span style={{ fontSize: 10.5, letterSpacing: 1, fontWeight: 500 }}>{it.label}</span>
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
  IconHome, IconTimeline, IconPlus, IconImport, IconHex, IconUser, IconSearch,
  IconChevron, IconClose, IconCamera, IconPin, IconShake, sealChars,
  paperBg, PAPER_LIBRARY, PoemBody, splitPoemLines,
});
