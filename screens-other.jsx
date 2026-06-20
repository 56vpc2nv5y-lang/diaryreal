// screens-other.jsx — Timeline, Import, Settings.

// ──────────────────────────────────────────────────────────────────
// Timeline — milestones only
// ──────────────────────────────────────────────────────────────────
function Timeline({ theme, entries, onOpen, onTab }) {
  const flagged = entries.filter(e => e.flag);
  const poemItems = entries.flatMap(entry => {
    const variants = entry.poemVariants || {};
    const fromVariants = ['zh-classical', 'en-sonnet'].flatMap(style => {
      const variant = variants[style];
      if (!variant?.poem || variant.poemCollected === false) return [];
      return [{
        ...entry,
        id: `${entry.id}:${style}`,
        sourceEntryId: entry.id,
        activePoemStyle: style,
        poem: variant.poem,
        sign: variant.sign || null,
        poemCollected: true,
      }];
    });
    if (fromVariants.length) return fromVariants;
    return entry.poem && entry.poemCollected !== false ? [{ ...entry, sourceEntryId: entry.id }] : [];
  });
  const zhPoems = poemItems.filter(e => e.poem?.style !== 'en-sonnet' && (e.poem?.lines || []).length <= 4);
  const enPoems = poemItems.filter(e => e.poem?.style === 'en-sonnet' || (e.poem?.lines || []).length > 4);
  const quotes = entries.flatMap(entry => (entry.collectedQuotes || []).map(quote => ({ quote, entry })));
  const [view, setView] = React.useState('zh-poems');
  return (
    <Screen theme={theme} tab="timeline" onTab={onTab}>
      <div style={{ padding: '64px 24px 8px' }}>
        <div style={{ fontSize: 11, letterSpacing: 3, color: theme.textMute, fontWeight: 500 }}>COLLECTIONS</div>
        <div className="serif" style={{ fontSize: 30, fontWeight: 600, letterSpacing: -0.5, marginTop: 4, color: theme.text }}>藏 册</div>
        <div style={{ fontSize: 12, color: theme.textSoft, marginTop: 6 }}>诗、句子与被记住的时刻</div>
      </div>

      <div style={{ display: 'flex', gap: 8, padding: '14px 20px 2px' }}>
        {[['zh-poems','中文诗册',zhPoems.length],['en-poems','英文诗册',enPoems.length],['quotes','拾句册',quotes.length],['milestones','里程碑',flagged.length]].map(([id,label,count]) => (
          <button key={id} type="button" onClick={() => setView(id)} style={{
            flex: 1, height: 38, borderRadius: 19, border: `0.5px solid ${view === id ? theme.text : theme.line}`,
            background: view === id ? theme.text : theme.surface, color: view === id ? theme.bg : theme.textSoft,
            fontFamily: 'inherit', cursor: 'pointer', fontSize: 11.5,
          }}>{label} · {count}</button>
        ))}
      </div>

      {view === 'zh-poems' && <PoemBook theme={theme} entries={zhPoems} onOpen={onOpen} bookLabel="中文诗册" />}
      {view === 'en-poems' && <PoemBook theme={theme} entries={enPoems} onOpen={onOpen} bookLabel="英文诗册" />}

      {view === 'quotes' && <div className="quote-box-grid" style={{ padding: '24px 20px 120px' }}>
        {quotes.map(({ quote, entry }, index) => <QuoteMysteryBox key={`${entry.id}-${index}`} quote={quote} entry={entry} theme={theme} onOpen={() => onOpen(entry.id)} />)}
        {!quotes.length && <div className="serif" style={{ color: theme.textMute, padding: 40, textAlign: 'center' }}>在日记详情中确认 AI 拾句建议</div>}
      </div>}

      {view === 'milestones' &&
      <div style={{ padding: '32px 0 120px', position: 'relative' }}>
        {/* year header */}
        <YearMarker theme={theme} year="2026" />

        <div style={{ position: 'relative', padding: '0 24px' }}>
          {/* vertical line */}
          <div style={{
            position: 'absolute', left: 38, top: 0, bottom: 0,
            width: 0.8, background: theme.line,
          }} />

          {flagged.map((e, i) => (
            <TimelineRow key={e.id} entry={e} theme={theme} onClick={() => onOpen(e.id)} isFirst={i === 0} />
          ))}

          {/* terminator */}
          <div style={{ position: 'relative', paddingLeft: 56, paddingTop: 10 }}>
            <div style={{
              position: 'absolute', left: 35, top: 14, width: 7, height: 7, borderRadius: 4,
              background: theme.bg, border: `1px solid ${theme.textMute}`,
            }} />
            <div style={{ fontSize: 11, color: theme.textMute, letterSpacing: 2 }}>开 始 ·  2026.03</div>
          </div>
        </div>
      </div>}
    </Screen>
  );
}

function QuoteMysteryBox({ quote, entry, theme, onOpen }) {
  const [open, setOpen] = React.useState(false);
  const entryLabel = entry.title || entry.poem?.title || '日记';
  const handleClick = () => {
    if (open) onOpen?.();
    else setOpen(true);
  };
  return (
    <button
      type="button"
      className={`quote-mystery-box${open ? ' quote-mystery-box-open' : ''}`}
      aria-expanded={open}
      aria-label={open ? `查看 ${entryLabel}` : '拆开拾句盲盒'}
      onClick={handleClick}
      style={{
        '--quote-line': theme.line,
        '--quote-surface': theme.surface,
        '--quote-paper': theme.paper,
        '--quote-text': theme.text,
        '--quote-soft': theme.textSoft,
        '--quote-mute': theme.textMute,
        '--quote-seal': theme.seal,
        '--quote-accent': theme.accent,
      }}
    >
      <div className="quote-mystery-glow" />
      <div className="quote-mystery-sparks" aria-hidden="true">
        {Array.from({ length: 7 }).map((_, i) => <i key={i} style={{ '--i': i }} />)}
      </div>
      <div className="quote-mystery-pack" aria-hidden="true">
        <div className="quote-mystery-lid"><span /></div>
        <div className="quote-mystery-body">
          <div className="quote-mystery-stamp">拾</div>
          <div className="quote-mystery-label">拾句盲盒</div>
          <div className="quote-mystery-meta">{entry.date}</div>
        </div>
        <div className="quote-mystery-tear"><span>OPEN</span></div>
        <div className="quote-mystery-flap" />
      </div>
      <div className="quote-prize-card text-particle-host">
        <TextParticleAura theme={theme} variant="quote" density="soft" />
        <div className="quote-prize-kicker">已 拾 之 句</div>
        <div className="serif quote-prize-text">“{quote}”</div>
        <div className="quote-prize-meta">{entry.date} · {entryLabel} · 再点看原文</div>
      </div>
      <div className="quote-mystery-hint">{open ? '再点进入原文' : '轻触拆封'}</div>
    </button>
  );
}

function QuoteBlindBox({ quote, entry, theme, onOpen }) {
  const [open, setOpen] = React.useState(false);
  const handleClick = () => {
    if (open) onOpen?.();
    else setOpen(true);
  };
  return (
    <button type="button" className={`quote-blindbox${open ? ' quote-blindbox-open' : ''}`} onClick={handleClick} style={{
      width: '100%', textAlign: 'left', marginBottom: 12, minHeight: open ? 118 : 96,
      borderRadius: 22, border: `0.5px solid ${theme.line}`, background: theme.surface,
      fontFamily: 'inherit', cursor: 'pointer', position: 'relative', overflow: 'hidden',
      color: theme.text, padding: 0, ...skin(theme, 'panel'),
    }}>
      <div className="quote-box-lid" style={{ '--quote-seal': theme.seal, '--quote-accent': theme.accent }} />
      <div className="quote-box-ribbon" style={{ background: theme.seal }} />
      <div style={{ position: 'relative', zIndex: 2, padding: open ? '20px 22px 16px' : '22px 22px' }}>
        {!open ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <div style={{ fontSize: 10.5, color: theme.textMute, letterSpacing: 3, fontWeight: 600 }}>句 匣 未 拆</div>
                <div className="serif" style={{ marginTop: 8, fontSize: 19, color: theme.text, letterSpacing: 2 }}>拆开一枚金句</div>
              </div>
              <div className="serif" style={{ width: 48, height: 48, borderRadius: 16, border: `1px solid ${theme.seal}55`, color: theme.seal, display: 'grid', placeItems: 'center', fontSize: 18 }}>封</div>
            </div>
            <div style={{ marginTop: 10, fontSize: 11, color: theme.textMute }}>{entry.date} · {entry.title || entry.poem?.title || '日记'}</div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 10.5, color: theme.seal, letterSpacing: 3, fontWeight: 600 }}>已 拾 之 句</div>
            <div className="serif" style={{ marginTop: 10, fontSize: 17, color: theme.text, lineHeight: 1.8 }}>“{quote}”</div>
            <div style={{ marginTop: 8, fontSize: 11, color: theme.textMute }}>{entry.date} · {entry.title || entry.poem?.title || '日记'} · 再点查看原文</div>
          </>
        )}
      </div>
    </button>
  );
}

function YearMarker({ theme, year }) {
  return (
    <div style={{ padding: '0 24px 12px', display: 'flex', alignItems: 'center', gap: 14 }}>
      <div className="serif" style={{ fontSize: 38, fontWeight: 500, color: theme.text, letterSpacing: 2, lineHeight: 1 }}>{year}</div>
      <div style={{ flex: 1, height: 0.5, background: theme.line }} />
    </div>
  );
}

function TimelineRow({ entry, theme, onClick, isFirst }) {
  const [c1, c2] = sealChars(entry.poem?.title || '日记');
  const judgmentLine = entry.sign?.timelineLine || entry.sign?.judgmentLines?.[3] || entry.sign?.judgmentLines?.[0];
  return (
    <div onClick={onClick} style={{ position: 'relative', paddingLeft: 56, paddingBottom: 28, cursor: 'pointer' }}>
      {/* node */}
      <div style={{
        position: 'absolute', left: 28, top: 6,
      }}>
        <Seal char1={c1} char2={c2} theme={theme} size={22} rotate={-4}/>
      </div>

      {/* date */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
        <div className="serif" style={{ fontSize: 22, fontWeight: 500, color: theme.text, letterSpacing: 1, lineHeight: 1 }}>
          {entry.date.slice(5).replace('-', '.')}
        </div>
        <div style={{ fontSize: 11, color: theme.textMute }}>{entry.weekday}</div>
        {entry.mood && <span style={{ fontSize: 14, marginLeft: 4 }}>{entry.mood}</span>}
      </div>

      {/* poem title */}
      <div className="serif" style={{ fontSize: 19, fontWeight: 500, color: theme.text, letterSpacing: 2, marginBottom: 6 }}>
        《{entry.poem?.title || '无题'}》
      </div>

      {/* place */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: theme.textSoft, marginBottom: 8 }}>
        <IconPin color={theme.textSoft} size={11}/>
        <span>{entry.place}</span>
      </div>

      {/* a single judgment line for the milestone */}
      <div className="serif" style={{
        fontSize: 14, lineHeight: 1.7, color: theme.textSoft, letterSpacing: 1,
        paddingLeft: 12, borderLeft: `1.5px solid ${theme.accent}`,
        fontStyle: 'normal',
      }}>{judgmentLine || entry.body?.slice(0, 28) || '这一日被记下。'}</div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// 诗册插画库 — 免费静态国风插画（零成本、零存储、可主题化）
// 每首诗按关键词+季节确定性分配一幅水墨小景；未来可在付费期换成 AI 逐篇配图。
// ──────────────────────────────────────────────────────────────────
const BOOK_SCENES = {
  // 远山
  mountains: (t) => (<>
    <circle cx="113" cy="50" r="17" fill={t.seal} opacity=".12" />
    <circle cx="113" cy="50" r="17" fill="none" stroke={t.seal} strokeWidth="1" opacity=".34" />
    <path d="M0 150 Q42 112 74 138 T150 122" fill="none" stroke={t.textSoft} strokeWidth="1.4" strokeLinecap="round" opacity=".5" />
    <path d="M0 176 Q40 142 78 166 T150 150" fill="none" stroke={t.accent} strokeWidth="1.6" strokeLinecap="round" opacity=".55" />
    <path d="M0 214 Q48 168 96 198 Q124 215 150 188 L150 220 L0 220 Z" fill={t.accent} opacity=".14" />
    <path d="M0 214 Q48 168 96 198 Q124 215 150 188" fill="none" stroke={t.accent} strokeWidth="1.8" strokeLinecap="round" opacity=".5" />
  </>),
  // 孤月 · 水波
  moon: (t) => (<>
    <circle cx="104" cy="56" r="22" fill={t.seal} opacity=".13" />
    <circle cx="104" cy="56" r="22" fill="none" stroke={t.seal} strokeWidth="1.1" opacity=".4" />
    <path d="M90 49c6 5 6 13 0 18" fill="none" stroke={t.seal} strokeWidth="1" opacity=".3" />
    {[150, 168, 186].map((y, i) => (
      <path key={i} d={`M8 ${y} q34 -9 67 0 t67 0`} fill="none" stroke={t.accent} strokeWidth="1.2" strokeLinecap="round" opacity={0.46 - i * 0.1} />
    ))}
  </>),
  // 梅枝
  plum: (t) => (<>
    <path d="M16 214 C40 170 58 140 70 92 C76 66 84 50 96 36" fill="none" stroke={t.accent} strokeWidth="2.4" strokeLinecap="round" opacity=".62" />
    <path d="M58 132 C72 126 84 118 92 104M70 92 C84 92 96 84 104 72M64 112 C54 108 46 100 42 88" fill="none" stroke={t.accent} strokeWidth="1.5" strokeLinecap="round" opacity=".5" />
    {[[98, 34], [108, 70], [90, 104], [44, 86], [70, 56]].map(([x, y], i) => (
      <g key={i}>
        <circle cx={x} cy={y} r="5.5" fill={t.seal} opacity=".18" />
        <circle cx={x} cy={y} r="5.5" fill="none" stroke={t.seal} strokeWidth="1" opacity=".5" />
        <circle cx={x} cy={y} r="1.2" fill={t.seal} opacity=".6" />
      </g>
    ))}
  </>),
  // 江帆 · 流水
  river: (t) => (<>
    {[120, 138, 156, 174, 192].map((y, i) => (
      <path key={i} d={`M6 ${y} q36 -7 72 0 t66 0`} fill="none" stroke={t.accent} strokeWidth="1.2" strokeLinecap="round" opacity={0.5 - i * 0.07} />
    ))}
    <path d="M92 116 l0 -44 28 44 z" fill={t.seal} opacity=".14" />
    <path d="M92 116 l0 -44 28 44" fill="none" stroke={t.accent} strokeWidth="1.5" strokeLinejoin="round" opacity=".55" />
    <path d="M80 116 q12 8 40 0" fill="none" stroke={t.accent} strokeWidth="1.8" strokeLinecap="round" opacity=".55" />
  </>),
  // 飞鸟 · 远云
  birds: (t) => (<>
    <path d="M16 60 q22 -16 46 -4 q20 10 44 2" fill="none" stroke={t.textSoft} strokeWidth="1.3" strokeLinecap="round" opacity=".42" />
    {[[40, 96], [74, 82], [104, 100], [60, 120]].map(([x, y], i) => (
      <path key={i} d={`M${x - 11} ${y} q11 -9 11 0 q0 -9 11 0`} fill="none" stroke={t.accent} strokeWidth="1.6" strokeLinecap="round" opacity=".55" />
    ))}
    <path d="M0 206 q40 -10 80 0 t70 0" fill="none" stroke={t.accent} strokeWidth="1.5" strokeLinecap="round" opacity=".4" />
  </>),
  // 幽兰 · 草
  orchid: (t) => (<>
    {[[30, 30], [46, -10], [62, 22], [80, -14], [96, 14]].map(([x, sway], i) => (
      <path key={i} d={`M${x} 216 C${x + sway} 168 ${x - sway} 120 ${x + sway / 2} ${72 + i * 4}`} fill="none" stroke={t.accent} strokeWidth="1.6" strokeLinecap="round" opacity={0.55 - i * 0.05} />
    ))}
    <circle cx="58" cy="78" r="3.2" fill={t.seal} opacity=".5" />
    <circle cx="84" cy="92" r="2.6" fill={t.seal} opacity=".4" />
  </>),
  // 孤舟 · 月下
  boat: (t) => (<>
    <circle cx="110" cy="48" r="15" fill={t.seal} opacity=".12" />
    <circle cx="110" cy="48" r="15" fill="none" stroke={t.seal} strokeWidth="1" opacity=".34" />
    {[150, 170, 190].map((y, i) => (
      <path key={i} d={`M8 ${y} q34 -8 68 0 t66 0`} fill="none" stroke={t.accent} strokeWidth="1.1" strokeLinecap="round" opacity={0.4 - i * 0.08} />
    ))}
    <path d="M44 150 q22 16 50 0" fill="none" stroke={t.accent} strokeWidth="2" strokeLinecap="round" opacity=".6" />
    <path d="M68 150 l0 -22M68 128 l14 8" fill="none" stroke={t.accent} strokeWidth="1.4" strokeLinecap="round" opacity=".5" />
  </>),
  // 秋叶 · 枯枝
  autumn: (t) => (<>
    <path d="M150 30 C112 44 92 60 78 86 C70 100 60 112 44 120" fill="none" stroke={t.accent} strokeWidth="2.2" strokeLinecap="round" opacity=".55" />
    <path d="M104 56 C100 44 100 34 106 24M86 78 C80 70 78 58 82 48" fill="none" stroke={t.accent} strokeWidth="1.3" strokeLinecap="round" opacity=".45" />
    {[[54, 150, 18], [40, 180, -22], [78, 168, 8]].map(([x, y, r], i) => (
      <g key={i} transform={`translate(${x} ${y}) rotate(${r})`}>
        <path d="M0 0 q7 -8 0 -16 q-7 8 0 16" fill={t.seal} opacity=".22" />
        <path d="M0 0 q7 -8 0 -16 q-7 8 0 16M0 0 l0 -16" fill="none" stroke={t.seal} strokeWidth=".9" opacity=".5" />
      </g>
    ))}
  </>),
};
const BOOK_SCENE_IDS = Object.keys(BOOK_SCENES);

function pickBookScene(entry) {
  const text = [entry?.poem?.title, entry?.sign?.motif, entry?.sign?.title,
    (entry?.poem?.lines || []).join(''), entry?.title, (entry?.body || '').slice(0, 80)].join(' ');
  const rules = [
    [/月|夜|宵|银河|星|moon|night|star/i, 'moon'],
    [/舟|船|帆|渡|航|boat|sail|ship/i, 'boat'],
    [/山|岭|峰|岚|崖|mountain|hill|peak/i, 'mountains'],
    [/梅|花|蕊|香|绽|开|blossom|flower|bloom|petal/i, 'plum'],
    [/雨|水|江|河|川|流|溪|潮|海|波|rain|river|water|sea|tide|wave/i, 'river'],
    [/鸟|雁|飞|燕|鹤|翼|bird|wing|fly|swallow|crane/i, 'birds'],
    [/兰|草|风|蕨|苔|grass|wind|orchid|moss/i, 'orchid'],
    [/秋|叶|落|枯|寒|霜|autumn|leaf|fall|wither|frost/i, 'autumn'],
  ];
  for (const [re, id] of rules) if (re.test(text)) return id;
  const month = Number((entry?.date || '').slice(5, 7)) || 0;
  if (month >= 3 && month <= 5) return 'plum';
  if (month >= 6 && month <= 8) return 'river';
  if (month >= 9 && month <= 11) return 'autumn';
  if (month === 12 || (month >= 1 && month <= 2)) return 'moon';
  let hash = 0; const s = String(entry?.id || '');
  for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
  return BOOK_SCENE_IDS[hash % BOOK_SCENE_IDS.length];
}

function BookIllustration({ theme, scene }) {
  const render = BOOK_SCENES[scene] || BOOK_SCENES.mountains;
  return (
    <svg viewBox="0 0 150 220" style={{ position: 'relative', zIndex: 1, width: '100%', height: 224, marginTop: 16 }}>
      {render(theme)}
    </svg>
  );
}

function PoemBook({ theme, entries, onOpen, bookLabel = '诗册' }) {
  const [page, setPage] = React.useState(0);
  const [dir, setDir] = React.useState('next');
  const [turnLeaf, setTurnLeaf] = React.useState(null);
  const touchX = React.useRef(null);
  const turnTimer = React.useRef(0);

  React.useEffect(() => {
    if (page > Math.max(0, entries.length - 1)) setPage(Math.max(0, entries.length - 1));
  }, [entries.length, page]);

  React.useEffect(() => () => window.clearTimeout(turnTimer.current), []);

  const turn = React.useCallback((delta) => {
    setPage(current => {
      const next = Math.max(0, Math.min(entries.length - 1, current + delta));
      if (next !== current) {
        const nextDir = delta > 0 ? 'next' : 'prev';
        const oldEntry = entries[current];
        setDir(nextDir);
        setTurnLeaf({
          dir: nextDir,
          title: oldEntry?.poem?.title || (nextDir === 'next' ? '上一页' : '下一页'),
          date: oldEntry?.date || '',
          en: oldEntry?.poem?.style === 'en-sonnet' || (oldEntry?.poem?.lines || []).length > 4,
        });
        window.clearTimeout(turnTimer.current);
        turnTimer.current = window.setTimeout(() => setTurnLeaf(null), 1080);
      }
      return next;
    });
  }, [entries]);

  React.useEffect(() => {
    const onKey = e => {
      const tag = (e.target?.tagName || '').toUpperCase();
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'ArrowLeft') turn(-1);
      if (e.key === 'ArrowRight') turn(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [turn]);

  if (!entries.length) {
    return (
      <div className="serif" style={{ color: theme.textMute, padding: 40, textAlign: 'center' }}>
        摇出的诗会自动收入这本{bookLabel}
      </div>
    );
  }

  const entry = entries[page];
  const [c1, c2] = sealChars(entry.poem?.title || '诗签');
  const enPoem = entry.poem?.style === 'en-sonnet' || entry.sign?.style === 'en-sonnet' || (entry.poem?.lines || []).length > 4;
  const motif = entry.sign?.motif || entry.poem?.title || (enPoem ? 'today' : '今日');
  const scene = pickBookScene(entry);
  const canPrev = page > 0;
  const canNext = page < entries.length - 1;

  const onTouchStart = e => { touchX.current = e.changedTouches?.[0]?.clientX ?? null; };
  const onTouchEnd = e => {
    if (touchX.current == null) return;
    const dx = (e.changedTouches?.[0]?.clientX ?? touchX.current) - touchX.current;
    if (Math.abs(dx) > 46) turn(dx < 0 ? 1 : -1);
    touchX.current = null;
  };

  const navButton = (delta, enabled, dirIcon, label) => (
    <button type="button" aria-label={label} disabled={!enabled} onClick={() => turn(delta)} style={{
      width: 34, height: 34, borderRadius: 17, border: `0.5px solid ${theme.line}`,
      background: enabled ? theme.paper : theme.surface, opacity: enabled ? 1 : .45,
      display: 'grid', placeItems: 'center', cursor: enabled ? 'pointer' : 'default',
    }}><IconChevron color={theme.textSoft} dir={dirIcon} size={12}/></button>
  );

  const titleButton = (
    <button type="button" onClick={() => onOpen?.(entry.sourceEntryId || entry.id)} className="serif" title="查看那天的日记" style={{
      border: 'none', background: 'transparent', color: theme.text, fontFamily: 'inherit',
      fontSize: enPoem ? 19 : 25, letterSpacing: enPoem ? 1 : 7, lineHeight: 1.2,
      fontStyle: enPoem ? 'italic' : 'normal', padding: enPoem ? 0 : '0 0 0 .45em',
      cursor: 'pointer', textAlign: 'center',
    }}>{entry.poem.title}</button>
  );

  const illustration = (
    <div style={{
      position: 'relative',
      padding: enPoem ? '18px 16px 14px' : '26px 16px 20px',
      background: `linear-gradient(150deg, ${theme.surface}, ${theme.paper})`,
      borderRight: enPoem ? 'none' : `0.5px solid ${theme.line}`,
      borderBottom: enPoem ? `0.5px solid ${theme.line}` : 'none',
      overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', inset: enPoem ? 12 : 22, border: `1px solid ${theme.line}`, opacity: .4 }} />
      <BookIllustration theme={theme} scene={scene} />
      {enPoem
        ? <div className="serif" style={{ position: 'relative', zIndex: 1, textAlign: 'center', marginTop: 8, color: theme.textSoft, fontSize: 12.5, fontStyle: 'italic', letterSpacing: .4, lineHeight: 1.5 }}>{motif}</div>
        : <div className="serif" style={{ position: 'relative', zIndex: 1, writingMode: 'vertical-rl', textOrientation: 'upright', margin: '8px auto 0', height: 112, color: theme.textSoft, fontSize: 17, letterSpacing: 8 }}>{motif}</div>}
      <div style={{ position: 'absolute', left: 14, bottom: 12, fontSize: 9.5, color: theme.textMute, letterSpacing: 1.5 }}>
        {enPoem ? 'illustration · by motif' : '插画 · 据意象绘'}
      </div>
    </div>
  );

  const poemPane = (
    <div style={{ position: 'relative', zIndex: 1, padding: enPoem ? '20px 22px 18px' : '26px 20px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ fontSize: 10, color: theme.textMute, letterSpacing: 3, fontWeight: 600 }}>{enPoem ? 'ENGLISH BOOK' : bookLabel}</div>
        <Seal char1={c1} char2={c2} theme={theme} size={30} rotate={-4}/>
      </div>
      <div style={{ marginTop: enPoem ? 12 : 24 }}>{titleButton}</div>
      <div style={{ fontSize: 9, color: theme.textMute, marginTop: 5, letterSpacing: 1 }}>
        {enPoem ? 'tap title · open that day' : '点标题 · 看那天日记'}
      </div>
      <div style={{ width: 26, height: 1, background: theme.accent, margin: enPoem ? '12px auto 14px' : '16px auto 20px' }} />
      <PoemBody lines={entry.poem.lines || []} size={enPoem ? 14 : 17} theme={theme}/>
      <div style={{ marginTop: 'auto', width: '100%', color: theme.textMute, fontSize: 10.5, lineHeight: 1.7, letterSpacing: 1, paddingTop: 14 }}>
        {entry.date?.replace(/-/g, '.')} · {entry.place || (enPoem ? '—' : '未记录地点')}
      </div>
    </div>
  );

  return (
    <div style={{ padding: '20px 16px 120px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 8px 12px' }}>
        <div style={{ fontSize: 11, color: theme.textMute, letterSpacing: 2 }}>第 {page + 1} 页 · 共 {entries.length} 首</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {navButton(-1, canPrev, 'left', '上一页')}
          {navButton(1, canNext, 'right', '下一页')}
        </div>
      </div>

      <div style={{ perspective: 1500 }} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div key={`${entry.id}-${page}-${dir}`} className={`book-page-shell book-page-shell-${dir}${enPoem ? ' book-page-shell-en' : ''}`} style={{
          '--book-paper': theme.paper,
          '--theme-text': theme.text,
          position: 'relative',
          minHeight: enPoem ? 0 : 430,
          display: 'grid',
          gridTemplateColumns: enPoem ? '1fr' : 'minmax(0, .92fr) minmax(0, 1.08fr)',
          borderRadius: '8px 18px 18px 8px',
          overflow: 'hidden',
          background: theme.paper,
          border: `0.5px solid ${theme.line}`,
          boxShadow: `0 20px 48px ${theme.text}26`,
          transformOrigin: dir === 'next' ? 'left center' : 'right center',
          backfaceVisibility: 'hidden',
        }}>
          {/* spine shadow (Chinese two-page look) */}
          {!enPoem && <div style={{ position: 'absolute', left: '46%', top: 0, bottom: 0, width: '8%', background: `linear-gradient(90deg, transparent, ${theme.text}14, transparent)`, pointerEvents: 'none', zIndex: 2 }} />}
          <div className="book-curl-shadow" />
          <div className={`book-turn-leaf book-turn-leaf-${dir}`}>
            {turnLeaf && (
              <div className={`book-turn-leaf-content book-turn-leaf-content-${turnLeaf.dir}`}>
                <div className="book-turn-leaf-kicker">{turnLeaf.en ? 'SONNET PAGE' : bookLabel}</div>
                <div className="serif book-turn-leaf-title">{turnLeaf.title}</div>
                <div className="book-turn-leaf-date">{turnLeaf.date?.replace(/-/g, '.')}</div>
              </div>
            )}
          </div>
          {!enPoem && illustration}
          {poemPane}
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 12, fontSize: 11, color: theme.textMute, letterSpacing: 1.5 }}>
        左右滑动 · 箭头键 · 点标题看那天日记
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Import — past diary import
// ──────────────────────────────────────────────────────────────────
function Import({ theme, onBack, onTab }) {
  const files = [
    { name: '2024-2025 日记.docx', count: 187, status: 'done' },
    { name: '高中三年.md', count: 432, status: 'done' },
    { name: '欧洲旅行.txt', count: 28, status: 'working', progress: 0.62 },
  ];
  return (
    <Screen theme={theme} tab="import" onTab={onTab}>
      <div style={{ padding: '64px 24px 0' }}>
        <div style={{ fontSize: 11, letterSpacing: 3, color: theme.textMute, fontWeight: 500 }}>IMPORT</div>
        <div className="serif" style={{ fontSize: 30, fontWeight: 600, letterSpacing: -0.5, marginTop: 4, color: theme.text }}>导入过去</div>
        <div style={{ fontSize: 13, color: theme.textSoft, marginTop: 8, lineHeight: 1.55 }}>
          AI 自动识别日期与内容，逐篇解析。每一篇旧日记，也会得到属于它的那首诗。
        </div>
      </div>

      {/* drop zone */}
      <div style={{ padding: '24px 24px 0' }}>
        <div style={{
          borderRadius: 18, padding: '32px 20px',
          background: theme.surface,
          textAlign: 'center',
          ...skin(theme, 'panel'),
          border: `1.5px dashed ${theme.accent}`,
        }}>
          <div style={{
            width: 46, height: 46, borderRadius: 23, background: theme.bg,
            margin: '0 auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `0.5px solid ${theme.line}`,
          }}>
            <IconImport color={theme.accent} size={20}/>
          </div>
          <div className="serif" style={{ fontSize: 17, color: theme.text, letterSpacing: 1.5, marginBottom: 4 }}>选择文件 / 拖拽上传</div>
          <div style={{ fontSize: 11, color: theme.textMute, letterSpacing: 1 }}>支持 .docx · .txt · .pdf · .md</div>
          <div style={{ marginTop: 16, display: 'inline-flex', gap: 8 }}>
            <button style={{
              padding: '8px 18px', borderRadius: 18, border: 'none',
              background: theme.text, color: theme.bg, fontSize: 13, fontWeight: 500,
              fontFamily: 'inherit', cursor: 'pointer', letterSpacing: 1,
            }}>从文件选取</button>
            <button style={{
              padding: '8px 18px', borderRadius: 18, border: `0.5px solid ${theme.line}`,
              background: 'transparent', color: theme.textSoft, fontSize: 13,
              fontFamily: 'inherit', cursor: 'pointer', letterSpacing: 1,
            }}>从云端</button>
          </div>
        </div>
      </div>

      {/* imported list */}
      <div style={{ padding: '32px 24px 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ fontSize: 10, letterSpacing: 4, color: theme.textMute, fontWeight: 600 }}>已 导 入</div>
        <div style={{ flex: 1, height: 0.5, background: theme.line }} />
        <div style={{ fontSize: 11, color: theme.textMute }}>共 647 篇</div>
      </div>

      <div style={{ padding: '0 24px 120px' }}>
        {files.map((f, i) => (
          <div key={f.name} style={{
            padding: '16px 0', display: 'flex', alignItems: 'center', gap: 14,
            borderBottom: i === files.length - 1 ? 'none' : `0.5px solid ${theme.line}`,
          }}>
            <div style={{
              width: 36, height: 44, borderRadius: 4,
              background: theme.surface, border: `0.5px solid ${theme.line}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'ui-monospace, monospace', fontSize: 9, color: theme.textSoft,
              letterSpacing: 0.5, flexShrink: 0,
            }}>{f.name.split('.').pop().toUpperCase()}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, color: theme.text, marginBottom: 4, fontWeight: 500,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</div>
              {f.status === 'done' ? (
                <div style={{ fontSize: 11.5, color: theme.textMute, letterSpacing: 0.5 }}>{f.count} 篇 · 已解析 · 已生诗</div>
              ) : (
                <div>
                  <div style={{ fontSize: 11.5, color: theme.accent, letterSpacing: 0.5, marginBottom: 5 }}>
                    解析中 · {Math.round(f.progress * f.count)} / {f.count}
                  </div>
                  <div style={{ height: 3, background: theme.surface, borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ width: `${f.progress * 100}%`, height: '100%', background: theme.accent }}/>
                  </div>
                </div>
              )}
            </div>
            {f.status === 'done' ? (
              <div style={{ fontSize: 18, color: theme.accent }}>✓</div>
            ) : (
              <div style={{ fontSize: 11, color: theme.accent, letterSpacing: 1 }}>62%</div>
            )}
          </div>
        ))}
      </div>
    </Screen>
  );
}

// ──────────────────────────────────────────────────────────────────
function EmailAccountCard({ theme, user, entriesCount, onBindEmail, onPasswordReset, onSignOut }) {
  const [expanded, setExpanded] = React.useState(false);
  const [email, setEmail] = React.useState(user?.email || '');
  const [password, setPassword] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const isAnonymous = !user || user.isAnonymous;

  const bind = async () => {
    setMessage('');
    const normalizedEmail = typeof normalizeEmail === 'function'
      ? normalizeEmail(email)
      : String(email || '').trim().toLowerCase();
    if (!normalizedEmail || password.length < 6) {
      setMessage('请输入邮箱，并使用至少 6 位密码。');
      return;
    }
    setBusy(true);
    try {
      await onBindEmail(normalizedEmail, password);
      setPassword('');
      setExpanded(false);
      setMessage('邮箱绑定成功，现有日记仍属于同一账户。');
    } catch (error) {
      setMessage(typeof friendlyAuthError === 'function' ? friendlyAuthError(error) : (error?.message || '绑定失败，请稍后重试。'));
    } finally {
      setBusy(false);
    }
  };

  const reset = async () => {
    setBusy(true);
    setMessage('');
    try {
      const resetEmail = typeof normalizeEmail === 'function'
        ? normalizeEmail(user?.email || email)
        : String(user?.email || email || '').trim().toLowerCase();
      if (!resetEmail) {
        setMessage('请先填写邮箱地址。');
        return;
      }
      await onPasswordReset(resetEmail);
      setMessage(typeof PASSWORD_RESET_SENT_MESSAGE === 'string'
        ? PASSWORD_RESET_SENT_MESSAGE
        : '重置密码邮件已发送。只会发送到已注册邮箱；如果 2 分钟内没收到，请检查垃圾箱。');
    } catch (error) {
      setMessage(typeof friendlyAuthError === 'function' ? friendlyAuthError(error) : (error?.message || '发送失败，请稍后重试。'));
    } finally {
      setBusy(false);
    }
  };

  const inputStyle = {
    width: '100%', height: 42, borderRadius: 10, border: `1px solid ${theme.line}`,
    background: theme.paper, color: theme.text, padding: '0 12px', fontFamily: 'inherit',
    outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div className="theme-settings-account" style={{
      background: theme.paper, borderRadius: 16, border: `1px solid ${theme.line}`,
      padding: 18, ...skin(theme, 'panel'),
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 22, background: theme.accent,
          color: '#fff', display: 'grid', placeItems: 'center', fontSize: 18,
        }}>{isAnonymous ? '匿' : '邮'}</div>
        <div style={{ flex: 1 }}>
          <div style={{ color: theme.text, fontSize: 15.5, fontWeight: 600 }}>
            {isAnonymous ? '匿名日记账户' : user.email}
          </div>
          <div style={{ color: theme.textMute, fontSize: 11.5, marginTop: 3 }}>
            已写 {entriesCount} 篇 · {isAnonymous ? '绑定邮箱后可跨设备登录' : '邮箱账户已绑定'}
          </div>
        </div>
        <button type="button" onClick={() => setExpanded(value => !value)} style={{
          border: `1px solid ${theme.line}`, borderRadius: 9, background: theme.surface,
          color: theme.text, padding: '7px 10px', fontFamily: 'inherit', cursor: 'pointer',
        }}>{expanded ? '收起' : isAnonymous ? '绑定邮箱' : '账户设置'}</button>
      </div>
      {expanded && (
        <div style={{ marginTop: 16, paddingTop: 15, borderTop: `1px solid ${theme.line}` }}>
          {isAnonymous ? (
            <>
              <div style={{ fontSize: 12, color: theme.textSoft, lineHeight: 1.7, marginBottom: 10 }}>
                绑定会保留当前账户 UID 和全部日记，不会创建一份空白数据。
              </div>
              <input type="email" value={email} onChange={event => setEmail(event.target.value)}
                placeholder="邮箱地址" autoComplete="email" style={inputStyle}/>
              <input type="password" value={password} onChange={event => setPassword(event.target.value)}
                placeholder="设置密码（至少 6 位）" autoComplete="new-password"
                style={{ ...inputStyle, marginTop: 9 }}/>
              <button type="button" disabled={busy} onClick={bind} style={{
                width: '100%', height: 42, marginTop: 11, border: 0, borderRadius: 10,
                background: theme.text, color: theme.paper, fontFamily: 'inherit', cursor: 'pointer',
              }}>{busy ? '绑定中…' : '绑定邮箱并保留日记'}</button>
              {onSignOut && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '14px 0 0' }}>
                    <div style={{ flex: 1, height: 1, background: theme.line }}/>
                    <span style={{ fontSize: 10.5, color: theme.textMute }}>或者</span>
                    <div style={{ flex: 1, height: 1, background: theme.line }}/>
                  </div>
                  <button type="button" onClick={onSignOut} style={{
                    width: '100%', height: 42, marginTop: 10, border: `1px solid ${theme.line}`,
                    borderRadius: 10, background: 'transparent', color: theme.textSoft,
                    fontFamily: 'inherit', cursor: 'pointer', fontSize: 13,
                  }}>退出，用已有账户登录</button>
                  <div style={{ fontSize: 10.5, color: theme.textMute, marginTop: 6, lineHeight: 1.6 }}>
                    退出后，匿名日记建议先备份。可在"导入与导出"中导出 JSON。
                  </div>
                </>
              )}
            </>
          ) : (
            <button type="button" disabled={busy} onClick={reset} style={{
              width: '100%', height: 42, border: `1px solid ${theme.line}`, borderRadius: 10,
              background: theme.surface, color: theme.text, fontFamily: 'inherit', cursor: 'pointer',
            }}>{busy ? '发送中…' : '发送重置密码邮件'}</button>
          )}
          {message && <div style={{ color: theme.textSoft, fontSize: 11.5, lineHeight: 1.6, marginTop: 10 }}>{message}</div>}
        </div>
      )}
    </div>
  );
}

// Settings
// ──────────────────────────────────────────────────────────────────
function Settings({ theme, currentThemeKey, onChangeTheme, entriesCount = 0, entries = [], hexagrams = [], buildLabel = '', syncState = {}, currentUser, onBindEmail, onPasswordReset, onImportData, onClearData, onSignOut, onTab }) {
  const [autoLoc, setAutoLoc_] = React.useState(() => JSON.parse(localStorage.getItem('d-autoLoc') ?? 'true'));
  const [autoPoem, setAutoPoem_] = React.useState(() => JSON.parse(localStorage.getItem('d-autoPoem') ?? 'true'));
  const [saveRej, setSaveRej_] = React.useState(() => JSON.parse(localStorage.getItem('d-saveRej') ?? 'false'));
  const [writeFx, setWriteFx_] = React.useState(() => JSON.parse(localStorage.getItem('d-writingParticles') ?? 'true'));
  const [poemStyle, setPoemStyle_] = React.useState(() => {
    const saved = localStorage.getItem('d-poemStyle');
    return saved === 'en-sonnet' || saved === 'both' ? saved : 'zh-classical';
  });
  const [guideOpen, setGuideOpen] = React.useState(false);
  const fileRef = React.useRef(null);
  const tog = (key, val, setter) => { localStorage.setItem(key, JSON.stringify(val)); setter(val); };
  const togglePoemStyle = () => {
    const next = poemStyle === 'zh-classical' ? 'en-sonnet' : poemStyle === 'en-sonnet' ? 'both' : 'zh-classical';
    localStorage.setItem('d-poemStyle', next);
    setPoemStyle_(next);
  };
  const poemStyleDetail = poemStyle === 'both'
    ? '中文 + 英文，每篇可分别生成'
    : poemStyle === 'en-sonnet'
      ? '英文 · 莎士比亚十四行诗'
      : '中文 · 古体诗';

  const backupText = () => JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), entries, hexagrams }, null, 2);

  const backupMarkdown = () => {
    const esc = s => String(s || '').trim();
    const blocks = (entries || []).map(e => {
      const head = `## ${esc(e.title) || '无题'}\n\n*${esc(e.date)} ${esc(e.weekday)} ${esc(e.time)}${e.place ? ' · ' + esc(e.place) : ''}${e.mood ? ' · ' + esc(e.mood) : ''}*`;
      const body = esc(e.body);
      const sign = e.sign ? `\n\n> **${esc(e.sign.title)}**\n>\n${(e.sign.judgmentLines || []).map(l => '> ' + esc(l)).join('\n')}${e.sign.interpretation ? '\n>\n> ' + esc(e.sign.interpretation) : ''}` : '';
      const variantBlocks = ['zh-classical', 'en-sonnet']
        .map(key => e.poemVariants?.[key]?.poem)
        .filter(poem => poem && Array.isArray(poem.lines))
        .map(poem => `\n\n**〈${esc(poem.title)}〉** ${esc(poem.form)}\n\n${poem.lines.map(esc).join('\n')}`);
      const poem = variantBlocks.length
        ? variantBlocks.join('')
        : e.poem && Array.isArray(e.poem.lines) ? `\n\n**〈${esc(e.poem.title)}〉** ${esc(e.poem.form)}\n\n${e.poem.lines.map(esc).join('\n')}` : '';
      const tags = (e.tags || []).length ? `\n\n${e.tags.map(t => '#' + esc(t)).join(' ')}` : '';
      return `${head}\n\n${body}${sign}${poem}${tags}`;
    });
    return `# 诗签 · 日记导出\n\n导出时间：${new Date().toLocaleString('zh-CN')} · 共 ${blocks.length} 篇\n\n---\n\n${blocks.join('\n\n---\n\n')}\n`;
  };

  const downloadMarkdown = () => {
    const blob = new Blob([backupMarkdown()], { type: 'text/markdown' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `诗签日记-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  const downloadBackup = () => {
    const blob = new Blob([backupText()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `诗签备份-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  const shareBackup = async () => {
    const name = `诗签备份-${new Date().toISOString().slice(0, 10)}.json`;
    const file = new File([backupText()], name, { type: 'application/json' });
    try {
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: '诗签数据备份', files: [file] });
      } else {
        downloadBackup();
      }
    } catch (e) {
      if (e?.name !== 'AbortError') alert('分享失败：' + e.message);
    }
  };

  const importFile = async ev => {
    const file = ev.target.files?.[0];
    ev.target.value = '';
    if (!file || !onImportData) return;
    try {
      const isJson = file.name.toLowerCase().endsWith('.json');
      if (isJson && file.size > 10 * 1024 * 1024) throw new Error('JSON 备份文件过大，请控制在 10MB 以内');
      if (!isJson && file.size > 700 * 1024) throw new Error('文本文件过大，请控制在 700KB 以内，避免超过 Firestore 单文档限制');
      const text = await file.text();
      let data;
      if (isJson) {
        const parsed = JSON.parse(text);
        data = Array.isArray(parsed)
          ? { entries: parsed, hexagrams: [] }
          : { entries: parsed.entries || [], hexagrams: parsed.hexagrams || [] };
        if (!Array.isArray(data.entries) || !Array.isArray(data.hexagrams)) throw new Error('备份文件格式不正确');
      } else {
        const d = new Date(), p = n => String(n).padStart(2, '0');
        data = { entries: [{
          date: `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`,
          weekday: `周${'日一二三四五六'[d.getDay()]}`,
          time: `${p(d.getHours())}:${p(d.getMinutes())}`,
          place: '导入', title: file.name.replace(/\.[^.]+$/, ''), body: text.trim(), mood: '', flag: false,
          tags: ['导入'], poem: null, notes: [], inlineNotes: [], photos: [],
        }], hexagrams: [] };
      }
      await onImportData(data);
      alert(`已导入 ${data.entries.length} 篇日记、${data.hexagrams.length} 个卦象`);
    } catch (e) { alert('导入失败：' + e.message); }
  };

  const clearAll = async () => {
    if (!onClearData || !window.confirm('确定清除 Firestore 中的全部日记和卦象吗？此操作不可撤销。建议先备份。')) return;
    try {
      await onClearData();
      alert('全部日记和卦象已清除');
    } catch (e) {
      alert('清除失败：' + (e?.message || '未知错误'));
    }
  };
  const syncDetail = !syncState.online
    ? '离线 · 待联网同步'
    : syncState.error
      ? '同步失败'
      : syncState.pending
        ? `同步中 · ${syncState.pending} 项`
        : '已同步';
  const themeGroups = [
    { label: '', keys: ['celadon', 'inkPlum', 'mossGarden', 'seaSalt', 'mintNote', 'study', 'morningPaper', 'dusk'] },
  ];
  const themeRecommendations = {
    celadon: '青釉浅色信纸 · 楷体',
    inkPlum: '宣纸留白 · 楷体',
    mossGarden: '苔庭信纸 · 楷体',
    dusk: '低对比浅色信纸 · 楷体',
    seaSalt: '生成图海盐纸 · 楷体',
    mintNote: '浅青纸笺 · 松绿控件 · 楷体',
    study: '旧书房案头微光 · 楷体',
    morningPaper: '新青年式报纸版 · 宋体',
  };
  const accountStateLabel = currentUser?.isAnonymous ? 'Firebase 匿名账户' : '邮箱账户已绑定';
  const openGuide = () => setGuideOpen(true);
  return (
    <Screen theme={theme} tab="settings" onTab={onTab}>
      <div className="settings-page">
      <div className="settings-header" style={{ padding: '64px 24px 24px' }}>
        <div style={{ fontSize: 11, letterSpacing: 3, color: theme.textMute, fontWeight: 500 }}>SETTINGS</div>
        <div className="serif" style={{ fontSize: 30, fontWeight: 600, letterSpacing: -0.5, marginTop: 4, color: theme.text }}>我</div>
      </div>

      {/* account card */}
      <div className="settings-account-wrap" style={{ padding: '0 20px 24px' }}>
        <EmailAccountCard theme={theme} user={currentUser} entriesCount={entriesCount}
          onBindEmail={onBindEmail} onPasswordReset={onPasswordReset} onSignOut={onSignOut}/>
        <button type="button" onClick={openGuide} style={{
          width: '100%', border: 'none', textAlign: 'left', fontFamily: 'inherit', cursor: 'pointer',
          background: theme.paper, borderRadius: 18, padding: 18,
          border: `0.5px solid ${theme.line}`,
          display: 'flex', alignItems: 'center', gap: 14,
          ...skin(theme, 'panel'),
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 24,
            background: theme.accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontFamily: "'Noto Serif SC', serif", fontSize: 22, fontWeight: 500,
          }}>林</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, color: theme.text, fontWeight: 500 }}>我的日记</div>
            <div style={{ fontSize: 11.5, color: theme.textMute, marginTop: 3, letterSpacing: 0.5 }}>已写 {entriesCount} 篇 · {accountStateLabel} · 查看说明</div>
          </div>
          <IconChevron color={theme.textMute} dir="right" size={14}/>
        </button>
      </div>

      {/* theme picker */}
      <SettingsSection theme={theme} title="主 题 皮 肤" className="settings-theme-section">
        <div style={{ padding: '12px 14px 4px', color: theme.textMute, fontSize: 11.5 }}>
          推荐搭配：{themeRecommendations[currentThemeKey] || '跟随皮肤默认字体与信纸'}
        </div>
        {themeGroups.map(group => (
          <div key={group.label}>
            {group.label && <div style={{ padding: '12px 16px 0', color: theme.textMute, fontSize: 10.5, letterSpacing: 3 }}>{group.label}</div>}
            <div className="theme-picker-grid">
              {group.keys.filter(key => window.THEMES[key]).map(key => {
                const tokens = window.THEMES[key];
                const active = key === currentThemeKey;
                const swatch = [tokens.accent, tokens.paper, tokens.seal];
                return (
                  <button key={key} onClick={() => onChangeTheme(key)} style={{
                    background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  }}>
                    <div className={`theme-card-preview theme-preview-${key}`} style={{
                      width: '100%', borderRadius: (key === 'seaSalt' || key === 'mintNote') ? 18 : 12,
                      background: tokens.paper,
                      border: active ? `1.5px solid ${theme.text}` : `0.5px solid ${theme.line}`,
                      padding: 8, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 5,
                      position: 'relative', overflow: 'hidden',
                      boxShadow: 'none',
                      ...skin(tokens, 'preview'),
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 2 }}>
                        <div style={{ display: 'flex', gap: 3 }}>
                          {swatch.map((c, i) => <div key={i} style={{ width: 6, height: 6, borderRadius: 5, background: c, border: i === 1 ? `0.5px solid ${theme.line}` : 'none' }}/>)}
                        </div>
                        <div style={{ fontFamily: tokens.fontSerif, fontSize: 6.5, color: tokens.textMute, letterSpacing: .8 }}>今日</div>
                      </div>
                      <div className="theme-poem-card theme-preview-poem-card" style={{ flex: 1, minHeight: 42, padding: '7px 5px 5px', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', ...skin(tokens, 'poemCard') }}>
                        <ThemeCardArt theme={tokens} />
                        <div style={{ fontFamily: tokens.fontSerif, fontSize: 12, color: tokens.text, letterSpacing: 2, fontWeight: 500, position: 'relative' }}>诗</div>
                        <div style={{ width: 13, height: .7, background: tokens.accent, marginTop: 4, position: 'relative' }}/>
                        <div style={{ width: '70%', borderTop: `1px solid ${tokens.line}`, marginTop: 5, position: 'relative' }}/>
                      </div>
                      <div style={{ height: 9, display: 'flex', alignItems: 'center', justifyContent: 'space-around', ...skin(tokens, 'nav') }}>
                        <i style={{ width: 3, height: 3, borderRadius: 3, background: tokens.accent }}/>
                        <i style={{ width: 3, height: 3, borderRadius: 3, background: tokens.textMute }}/>
                        <i style={{ width: 9, height: 9, borderRadius: skin(tokens, 'primary').borderRadius || 5, background: skin(tokens, 'primary').background || tokens.text }}/>
                        <i style={{ width: 3, height: 3, borderRadius: 3, background: tokens.textMute }}/>
                        <i style={{ width: 3, height: 3, borderRadius: 3, background: tokens.textMute }}/>
                      </div>
                      {active && (
                        <div style={{
                          position: 'absolute', top: 7, right: 7, width: 17, height: 17, borderRadius: 9,
                          background: theme.text, color: theme.bg,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10,
                        }}>✓</div>
                      )}
                    </div>
                    <div style={{ fontSize: 11.5, color: active ? theme.text : theme.textSoft, fontWeight: active ? 600 : 400 }}>{tokens.name}</div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </SettingsSection>

      <div className="settings-columns">
        <div className="settings-column">
          <SettingsSection theme={theme} title="写 作 与 生 诗">
            <SettingsRow theme={theme} label="每日提醒" detail="22:00 · App 版" />
            <SettingsRow theme={theme} label="自动记录位置" toggle on={autoLoc} onToggle={() => tog('d-autoLoc', !autoLoc, setAutoLoc_)} />
            <SettingsRow theme={theme} label="日记生诗" toggle on={autoPoem} onToggle={() => tog('d-autoPoem', !autoPoem, setAutoPoem_)} detail="保存后摇签" />
            <SettingsRow theme={theme} label="每篇日记的诗体"
              detail={poemStyleDetail}
              onClick={togglePoemStyle} />
            <SettingsRow theme={theme} label="写字时的元素粒子" toggle on={writeFx} onToggle={() => tog('d-writingParticles', !writeFx, setWriteFx_)} detail="花·雨·雪·风·火·月" />
            <SettingsRow theme={theme} label="保存被否决的诗" toggle on={saveRej} onToggle={() => tog('d-saveRej', !saveRej, setSaveRej_)} isLast />
          </SettingsSection>

          <SettingsSection theme={theme} title="安 全 与 隐 私">
            <SettingsRow theme={theme} label="使用与数据说明" detail="诗体 · 数据 · 隐私 · 同步" onClick={openGuide} isLast />
          </SettingsSection>

          <SettingsSection theme={theme} title="数 据">
            <SettingsRow theme={theme} label="清除所有数据" detail="不可撤销" onClick={clearAll} />
            <SettingsRow theme={theme} label="退出" onClick={onSignOut} isLast />
          </SettingsSection>
        </div>

        <div className="settings-column">
          <SettingsSection theme={theme} title="导 入 与 导 出">
            <input ref={fileRef} type="file" accept=".json,.txt,.md" onChange={importFile} style={{ display: 'none' }}/>
            <SettingsRow theme={theme} label="导入过去日记" detail=".json · .txt · .md" onClick={() => fileRef.current?.click()} />
            <SettingsRow theme={theme} label="导出与分享" detail="系统分享 · JSON" onClick={shareBackup} />
            <SettingsRow theme={theme} label="数据备份" detail={`JSON · ${entriesCount} 篇`} onClick={downloadBackup} />
            <SettingsRow theme={theme} label="导出 Markdown" detail={`可读文本 · ${entriesCount} 篇`} onClick={downloadMarkdown} isLast />
          </SettingsSection>

          <SettingsSection theme={theme} title="用 户 反 馈">
            <FeedbackBox theme={theme} buildLabel={buildLabel} currentUser={currentUser} />
          </SettingsSection>

          <SettingsSection theme={theme} title="云 同 步">
            <SettingsRow theme={theme} label="Firestore" detail={syncDetail} onClick={openGuide} />
            <SettingsRow theme={theme} label="跨设备同步"
              detail={currentUser?.isAnonymous ? '绑定邮箱后可用' : '邮箱账户已启用'}
              onClick={openGuide} isLast />
          </SettingsSection>
        </div>
      </div>

      <div className="settings-version" style={{ textAlign: 'center', fontSize: 10.5, color: theme.textMute, letterSpacing: 1, padding: '2px 0 18px' }}>
        版本 {buildLabel || 'prototype'}
      </div>
      <div className="settings-bottom-spacer" style={{ height: 100 }} />
      {guideOpen && <SettingsGuideSheet theme={theme} buildLabel={buildLabel} accountStateLabel={accountStateLabel} syncDetail={syncDetail} currentUser={currentUser} onClose={() => setGuideOpen(false)} />}
      </div>
    </Screen>
  );
}

function SettingsGuideSheet({ theme, buildLabel = '', accountStateLabel = '', syncDetail = '', currentUser, onClose }) {
  const closeRef = React.useRef(null);
  React.useEffect(() => {
    const previousFocus = document.activeElement;
    const onKey = event => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    setTimeout(() => closeRef.current?.focus(), 0);
    return () => {
      window.removeEventListener('keydown', onKey);
      previousFocus?.focus?.();
    };
  }, [onClose]);
  const trapFocus = event => {
    if (event.key !== 'Tab') return;
    const focusables = Array.from(event.currentTarget.querySelectorAll('button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])'))
      .filter(node => !node.disabled && node.offsetParent !== null);
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };
  const sections = [
    {
      title: '中英文诗与摇签',
      body: [
        '打开任意一篇日记，诗标题上方会显示「中文 / English」入口。已有版本可直接切换；未生成的版本会进入摇签生成。',
        '设置为「中文 + 英文」后，新日记会保留两个入口；英文内容使用独立的十四行诗结构，不和中文判词混在一起。',
      ],
    },
    {
      title: '数据保存与备份',
      body: [
        `当前账户状态：${accountStateLabel || '未知'}。日记、诗签、拾句和卦象保存在你的 Firebase 用户数据下。`,
        '浏览器本地只保存主题、草稿、开关等偏好；重要日记建议定期用「数据备份」导出 JSON。',
      ],
    },
    {
      title: 'AI 会读取什么',
      body: [
        'AI 生诗、拾句和理问只会在你触发生成时，把对应正文发送到后端接口处理。',
        '特别私密的内容可以先只保存日记，等需要时再生成诗或问题。',
      ],
    },
    {
      title: '删除、恢复与同步',
      body: [
        '「清除所有数据」会删除当前账户下的日记和卦象，无法撤销；执行前请先备份。',
        currentUser?.isAnonymous
          ? '匿名账户更换设备或清除浏览器数据后可能找不回；绑定邮箱后可以跨设备登录。'
          : `邮箱账户已启用跨设备同步。当前同步状态：${syncDetail || '未知'}。`,
      ],
    },
    {
      title: '反馈草稿',
      body: [
        '反馈区的「保存草稿」只保存在本机浏览器，方便你稍后查看、复制或再发邮件。',
        `当前版本：${buildLabel || 'unknown'}。`,
      ],
    },
  ];
  return (
    <div className="settings-guide-backdrop" role="presentation" onClick={onClose}>
      <section className="settings-guide-sheet" role="dialog" aria-modal="true" aria-label="使用与数据说明" onClick={event => event.stopPropagation()} onKeyDown={trapFocus} style={{
        background: theme.paper,
        color: theme.text,
        borderColor: theme.line,
        ...skin(theme, 'panel'),
      }}>
        <div className="settings-guide-head">
          <div>
            <div className="settings-guide-kicker" style={{ color: theme.textMute }}>GUIDE</div>
            <h2 style={{ color: theme.text }}>使用与数据说明</h2>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="关闭说明" style={{ color: theme.textSoft }}>
            <IconClose color="currentColor" size={18}/>
          </button>
        </div>
        <div className="settings-guide-body">
          {sections.map(section => (
            <article key={section.title} className="settings-guide-section">
              <h3 style={{ color: theme.seal || theme.accent }}>{section.title}</h3>
              {section.body.map(text => (
                <p key={text} style={{ color: theme.textSoft }}>{text}</p>
              ))}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function FeedbackBox({ theme, buildLabel = '', currentUser }) {
  const [text, setText] = React.useState('');
  const [copied, setCopied] = React.useState(false);
  const [showDrafts, setShowDrafts] = React.useState(false);
  const [drafts, setDrafts] = React.useState(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem('d-feedback-drafts') || '[]');
      return Array.isArray(parsed) ? parsed.slice(0, 5) : [];
    } catch {
      return [];
    }
  });
  const targetEmail = '18926135948@163.com';
  const canSend = text.trim().length >= 3;
  const buildBody = () => [
    text.trim(),
    '',
    '---',
    `版本：${buildLabel || 'unknown'}`,
    `账户：${currentUser?.email || (currentUser?.isAnonymous ? '匿名账户' : '未登录')}`,
    `页面：${location.href}`,
    `设备：${navigator.userAgent}`,
  ].join('\n');
  const copyFeedback = async () => {
    const body = buildBody();
    try {
      await navigator.clipboard.writeText(`收件人：${targetEmail}\n\n${body}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt('复制以下内容后发给我：', `收件人：${targetEmail}\n\n${body}`);
    }
  };
  const sendMail = () => {
    if (!canSend) return;
    const subject = encodeURIComponent(`诗签用户反馈 · ${buildLabel || 'web'}`);
    const body = encodeURIComponent(buildBody());
    window.location.href = `mailto:${targetEmail}?subject=${subject}&body=${body}`;
  };
  const saveDraft = () => {
    if (!canSend) return;
    const item = {
      id: `${Date.now()}`,
      text: text.trim(),
      createdAt: new Date().toISOString(),
      buildLabel: buildLabel || 'unknown',
    };
    const next = [item, ...drafts.filter(draft => draft.text !== item.text)].slice(0, 5);
    localStorage.setItem('d-feedback-drafts', JSON.stringify(next));
    setDrafts(next);
    setShowDrafts(true);
  };
  const removeDraft = id => {
    const next = drafts.filter(draft => draft.id !== id);
    localStorage.setItem('d-feedback-drafts', JSON.stringify(next));
    setDrafts(next);
  };
  return (
    <div style={{ padding: 16 }}>
      <div style={{ fontSize: 13, color: theme.textSoft, lineHeight: 1.7, marginBottom: 10 }}>
        写下问题或建议，点击发送会打开你的邮箱应用，并自动填好收件人。
      </div>
      <textarea value={text} onChange={event => setText(event.target.value)} maxLength={1200}
        placeholder="例如：我希望诗签页可以…… / 这里有个 bug……"
        style={{
          width: '100%', minHeight: 112, resize: 'vertical', borderRadius: 14,
          border: `0.5px solid ${theme.line}`, background: theme.paper, color: theme.text,
          outline: 'none', padding: 13, fontFamily: 'inherit', fontSize: 14.5, lineHeight: 1.7,
        }}/>
      <div className="settings-feedback-actions">
        <button type="button" onClick={sendMail} disabled={!canSend} style={{
          width: '100%', height: 44, borderRadius: 22, border: 'none',
          background: canSend ? theme.text : theme.surfaceSoft,
          color: canSend ? theme.bg : theme.textMute,
          fontFamily: 'inherit', cursor: canSend ? 'pointer' : 'default', letterSpacing: 1.5,
          ...skin(theme, 'primary'),
          opacity: canSend ? 1 : .55,
        }}>发送邮件</button>
        <button type="button" onClick={saveDraft} disabled={!canSend} style={{
          width: '100%', height: 44, borderRadius: 22, border: `0.5px solid ${theme.line}`,
          background: theme.surface, color: theme.textSoft,
          fontFamily: 'inherit', cursor: canSend ? 'pointer' : 'default',
          opacity: canSend ? 1 : .55,
        }}>保存草稿</button>
        <button type="button" onClick={copyFeedback} disabled={!canSend} style={{
          width: '100%', height: 44, borderRadius: 22, border: `0.5px solid ${theme.line}`,
          background: theme.surface, color: theme.textSoft,
          fontFamily: 'inherit', cursor: canSend ? 'pointer' : 'default',
          opacity: canSend ? 1 : .55,
        }}>{copied ? '已复制' : '复制'}</button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, fontSize: 11, color: theme.textMute, marginTop: 9 }}>
        <span>收件邮箱：{targetEmail}</span>
        {!!drafts.length && (
          <button type="button" onClick={() => setShowDrafts(v => !v)} style={{ border: 'none', background: 'transparent', color: theme.accent, fontFamily: 'inherit', cursor: 'pointer', padding: 0 }}>
            {showDrafts ? '收起已存' : `查看已存 ${drafts.length}`}
          </button>
        )}
      </div>
      {showDrafts && !!drafts.length && (
        <div className="settings-feedback-drafts" style={{ borderColor: theme.line }}>
          {drafts.map(draft => (
            <div key={draft.id} className="settings-feedback-draft" style={{ borderColor: theme.line, background: theme.surface }}>
              <button type="button" onClick={() => setText(draft.text)} style={{ color: theme.text }}>
                <span>{draft.text}</span>
                <small style={{ color: theme.textMute }}>{new Date(draft.createdAt).toLocaleString('zh-CN')}</small>
              </button>
              <button type="button" onClick={() => removeDraft(draft.id)} aria-label="删除这条反馈草稿" style={{ color: theme.textMute }}>删</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SettingsSection({ theme, title, children, className = '' }) {
  return (
    <div className={`settings-section ${className}`} style={{ marginBottom: 20 }}>
      <div style={{ padding: '0 28px 8px', fontSize: 10, letterSpacing: 4, color: theme.textMute, fontWeight: 600 }}>{title}</div>
      <div className="theme-settings-panel" style={{ background: theme.surface, margin: '0 16px', borderRadius: 16, overflow: 'hidden', ...skin(theme, 'panel') }}>{children}</div>
    </div>
  );
}

function SettingsRow({ theme, label, detail, toggle, on, onToggle, isLast, onClick }) {
  const handleClick = toggle ? onToggle : onClick;
  return (
    <button type="button" onClick={handleClick} style={{
      width: '100%', border: 'none', background: 'transparent', fontFamily: 'inherit', textAlign: 'left',
      padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12,
      borderBottom: isLast ? 'none' : `0.5px solid ${theme.line}`,
      minHeight: 50, cursor: (toggle || onClick) ? 'pointer' : 'default',
    }}>
      <div style={{ flex: 1, minWidth: 0, fontSize: 14.5, color: theme.text }}>{label}</div>
      {detail && !toggle && <div style={{
        minWidth: 116, maxWidth: '48%', fontSize: 13, color: theme.textMute,
        textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>{detail}</div>}
      {toggle ? (
        <div style={{
          width: 38, height: 22, borderRadius: 11,
          background: on ? theme.accent : theme.surfaceSoft,
          position: 'relative', transition: 'background .2s', flexShrink: 0,
        }}>
          <div style={{
            position: 'absolute', top: 2, left: on ? 18 : 2, width: 18, height: 18, borderRadius: 9,
            background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.2)', transition: 'left .2s',
          }}/>
        </div>
      ) : onClick ? (
        <IconChevron color={theme.textMute} dir="right" size={13}/>
      ) : null}
    </button>
  );
}

Object.assign(window, { Timeline, Import, Settings, Hexagrams, Collections, ExportHub, ShareCard, BookPreview });

// ──────────────────────────────────────────────────────────────────
// Export Hub — share / save / book
// ──────────────────────────────────────────────────────────────────
function ExportHub({ theme, entry, onTab }) {
  return (
    <Screen theme={theme} noTab>
      <div style={{ padding: '60px 16px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button style={{
          width: 40, height: 40, borderRadius: 20, border: 'none', background: theme.surface,
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}>
          <IconChevron color={theme.text} dir="left" size={14}/>
        </button>
        <div className="serif" style={{ fontSize: 17, color: theme.text, letterSpacing: 3, fontWeight: 500 }}>导 出 与 分 享</div>
        <div style={{ width: 40 }} />
      </div>

      {/* mini share-card preview */}
      <div style={{ padding: '24px 32px 0' }}>
        <div style={{ fontSize: 10, letterSpacing: 4, color: theme.textMute, fontWeight: 600, marginBottom: 12 }}>本 篇 · 一 张 卡</div>
        <div style={{
          aspectRatio: '1', borderRadius: 20, padding: '24px 22px',
          background: theme.paper, border: `0.5px solid ${theme.line}`,
          boxShadow: `0 12px 32px -16px ${theme.text}33`,
          display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden',
          ...skin(theme, 'poemCard'),
        }}>
          <ThemeCardArt theme={theme} />
          <ThemeMotif theme={theme} />
          <MiniShareCardContent theme={theme} entry={entry} />
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <ExportChip theme={theme} icon="□" label="方图" detail="朋友圈" active />
          <ExportChip theme={theme} icon="▭" label="长图" />
          <ExportChip theme={theme} icon="P" label="PDF" />
        </div>
      </div>

      {/* group exports */}
      <SectHeader theme={theme} title="按 时 间 导 出" />
      <ExportRow theme={theme} icon="❒"  label="本月" detail="5 月 · 9 篇 · 3 首诗" right="32 页 PDF" />
      <ExportRow theme={theme} icon="❒❒" label="本年" detail="2026 · 64 篇" right="一册 · 线装" featured/>
      <ExportRow theme={theme} icon="ʕ"   label="按合集" detail="选标签导出 · 电影 / 跑步 / 大学…" />

      <SectHeader theme={theme} title="全 部 备 份" />
      <ExportRow theme={theme} icon="↧"  label="全部日记 · 备份" detail="JSON + 图片 · 658 篇" isLast/>

      <div style={{ height: 80 }} />
    </Screen>
  );
}

function MiniShareCardContent({ theme, entry }) {
  const poem = entry.poem || {};
  const isSonnet = poem.style === 'en-sonnet' || poem.form === 'sonnet' || (poem.lines || []).length > 4;
  const [c1, c2] = sealChars(poem.title || '诗签');
  const title = poem.title || (isSonnet ? 'Untitled' : '未题');
  const lines = Array.isArray(poem.lines) ? poem.lines : [];
  if (isSonnet) {
    return (
      <div style={{
        height: '100%', margin: -18, padding: '24px 24px 22px',
        borderRadius: 18,
        background:
          'radial-gradient(circle at 16% 12%, rgba(145,104,54,.16), transparent 27%), radial-gradient(circle at 82% 88%, rgba(125,84,38,.14), transparent 30%), repeating-linear-gradient(0deg, rgba(99,72,38,.035) 0 1px, transparent 1px 6px), linear-gradient(135deg, #fff7df, #e8c990 54%, #fff0c6)',
        boxShadow: 'inset 0 0 32px rgba(104,72,34,.14)',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ height: 12, borderRadius: 999, background: 'linear-gradient(90deg, #704722, #a4783c, #704722)', margin: '0 -10px 14px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ fontSize: 8, letterSpacing: 3, color: '#7d6039', fontWeight: 600 }}>SONNET · POEM LOT</div>
          <Seal char1={c1} char2={c2} theme={theme} size={26} rotate={-4} />
        </div>
        <div className="serif" style={{ marginTop: 16, textAlign: 'center', color: '#3e2b1b', fontSize: 22, lineHeight: 1.1, fontStyle: 'italic', letterSpacing: .6 }}>{title}</div>
        <div style={{ width: 54, height: 1, background: '#9b4a34', margin: '12px auto 14px' }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4 }}>
          {lines.slice(0, 8).map((line, i) => (
            <div key={i} style={{ color: '#3d5f64', fontSize: 10.5, lineHeight: 1.35, fontStyle: 'italic', letterSpacing: .35 }}>{line}</div>
          ))}
        </div>
        <div style={{ height: 12, borderRadius: 999, background: 'linear-gradient(90deg, #704722, #a4783c, #704722)', margin: '14px -10px 0' }} />
      </div>
    );
  }
  return (
    <div style={{
      height: '100%', margin: -18, padding: '22px 18px 18px',
      borderRadius: 18,
      background:
        'linear-gradient(90deg, rgba(74,46,19,.18), transparent 8%, transparent 92%, rgba(74,46,19,.16)), linear-gradient(180deg, #f1d59b, #ddb56f)',
      boxShadow: 'inset 0 0 30px rgba(75,47,20,.18)',
      position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ position: 'absolute', inset: '14px 16px', display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3, opacity: .75 }}>
        {Array.from({ length: 7 }).map((_, i) => (
          <span key={i} style={{
            borderRadius: 11,
            background: i % 2 ? 'linear-gradient(90deg, #d1a05c, #f3d59a, #c6924f)' : 'linear-gradient(90deg, #dfba78, #f8dda2, #cfa05b)',
            border: '1px solid rgba(89,57,25,.16)',
          }} />
        ))}
      </div>
      {[48, 'calc(100% - 48px)'].map((top, i) => (
        <div key={i} style={{ position: 'absolute', left: 22, right: 22, top, height: 5, borderRadius: 999, background: 'rgba(91,52,24,.58)', boxShadow: '0 1px 0 rgba(255,239,198,.35)' }} />
      ))}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Seal char1={c1} char2={c2} theme={theme} size={28} rotate={-4} />
        <div style={{ fontSize: 8, letterSpacing: 3, color: '#68431f', fontWeight: 700 }}>竹 简 · {poem.form || '古体'}</div>
      </div>
      <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'row-reverse', justifyContent: 'center', alignItems: 'center', gap: 18, padding: '30px 4px 20px' }}>
        <div className="serif" style={{ writingMode: 'vertical-rl', textOrientation: 'upright', color: '#56351d', fontSize: 21, fontWeight: 700, letterSpacing: 5 }}>
          {Array.from(title).slice(0, 8).join('')}
        </div>
        {lines.slice(0, 4).map((line, i) => (
          <div key={i} className="serif" style={{ writingMode: 'vertical-rl', textOrientation: 'upright', color: '#34281d', fontSize: 15.5, letterSpacing: 4, lineHeight: 1.3 }}>
            {String(line).replace(/[，。,.]/g, '')}
          </div>
        ))}
      </div>
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', fontSize: 8.5, color: '#68431f', letterSpacing: 1 }}>
        <span>{(entry.date || '').replace(/-/g, '.')}</span>
        <span>诗 签</span>
      </div>
    </div>
  );
}

function ExportChip({ theme, icon, label, detail, active }) {
  return (
    <div style={{
      flex: 1, padding: '12px 8px', borderRadius: 14,
      background: active ? theme.text : theme.surface,
      color: active ? theme.bg : theme.text,
      border: active ? 'none' : `0.5px solid ${theme.line}`,
      textAlign: 'center',
    }}>
      <div className="serif" style={{ fontSize: 16, fontWeight: 500, marginBottom: 3 }}>{icon}</div>
      <div style={{ fontSize: 12, letterSpacing: 1, fontWeight: 500 }}>{label}</div>
      {detail && <div style={{ fontSize: 9.5, marginTop: 2, opacity: 0.7 }}>{detail}</div>}
    </div>
  );
}

function SectHeader({ theme, title }) {
  return (
    <div style={{ padding: '28px 32px 10px', display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ fontSize: 10, letterSpacing: 4, color: theme.textMute, fontWeight: 600 }}>{title}</div>
      <div style={{ flex: 1, height: 0.5, background: theme.line }} />
    </div>
  );
}
function ExportRow({ theme, icon, label, detail, right, featured, isLast }) {
  return (
    <div style={{ padding: '0 20px' }}>
      <div style={{
        padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14,
        background: featured ? theme.paper : 'transparent',
        borderRadius: featured ? 14 : 0,
        border: featured ? `0.5px solid ${theme.line}` : 'none',
        borderBottom: featured ? `0.5px solid ${theme.line}` : (isLast ? 'none' : `0.5px solid ${theme.line}`),
        marginBottom: featured ? 6 : 0,
      }}>
        <div className="serif" style={{
          width: 32, height: 32, borderRadius: 8,
          background: theme.surface, color: theme.accent,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 600, flexShrink: 0,
        }}>{icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14.5, color: theme.text, fontWeight: 500 }}>{label}</div>
          <div style={{ fontSize: 11.5, color: theme.textMute, marginTop: 3, letterSpacing: 0.3 }}>{detail}</div>
        </div>
        {right && <div style={{ fontSize: 11, color: theme.accent, letterSpacing: 0.5 }}>{right}</div>}
        <IconChevron color={theme.textMute} dir="right" size={13}/>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// ShareCard — full-bleed 1:1 poem card preview (for social share)
// ──────────────────────────────────────────────────────────────────
function ShareCard({ theme, entry, paper = 'sakura' }) {
  const [c1, c2] = sealChars(entry.poem.title);
  const paperStyle = paperBg(paper, theme);
  return (
    <Screen theme={theme} bg={theme.text} noTab>
      {/* top bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '50px 16px 0', display: 'flex', justifyContent: 'space-between', zIndex: 20 }}>
        <button style={{ width: 40, height: 40, borderRadius: 20, border: 'none', background: theme.surface + '22', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <IconClose color="#fff" size={18}/>
        </button>
        <div style={{ color: '#fff', fontSize: 13, letterSpacing: 2, paddingTop: 12 }}>分 享 · 方 图</div>
        <div style={{ width: 40 }}/>
      </div>

      {/* card centered on dark bg */}
      <div style={{
        position: 'absolute', top: 110, left: 28, right: 28,
        aspectRatio: '1', borderRadius: 22, overflow: 'hidden',
        background: theme.paper,
        boxShadow: '0 20px 60px -10px rgba(0,0,0,0.5)',
      }}>
        {/* paper pattern */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', ...paperStyle }}/>
        {/* content */}
        <div style={{ position: 'relative', height: '100%', padding: '32px 28px',
          display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ fontSize: 10, letterSpacing: 4, color: theme.textMute, fontWeight: 600 }}>
              诗 签 <span style={{ marginLeft: 8, opacity: 0.7 }}>{entry.poem.form}</span>
            </div>
            <Seal char1={c1} char2={c2} theme={theme} size={40} rotate={-4} />
          </div>
          <div className="serif" style={{
            fontSize: 32, fontWeight: 500, color: theme.text,
            letterSpacing: 10, textAlign: 'center', paddingLeft: '0.7em',
            marginTop: 22, lineHeight: 1.1,
          }}>{entry.poem.title}</div>
          <div style={{ width: 28, height: 1, background: theme.accent, margin: '18px auto 28px' }}/>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PoemBody lines={entry.poem.lines} size={22} theme={theme} />
          </div>
          <div style={{
            marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
            fontSize: 10.5, color: theme.textMute, letterSpacing: 1.5,
          }}>
            <span>{entry.date.replace(/-/g, '.')} · {entry.place}</span>
            <span className="serif" style={{ fontWeight: 600, letterSpacing: 3, color: theme.accent }}>诗 签</span>
          </div>
        </div>
      </div>

      {/* paper picker */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 130, padding: '0 24px',
      }}>
        <div className="no-scroll" style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: 4 }}>
          {['plain', 'sakura', 'cloud', 'wave', 'moon', 'columns'].map((p) => {
            const style = paperBg(p, theme);
            const active = p === paper;
            return (
              <div key={p} style={{
                width: 56, height: 56, borderRadius: 12, flexShrink: 0,
                background: theme.paper, position: 'relative', overflow: 'hidden',
                outline: active ? `2px solid ${theme.accent}` : `1px solid rgba(255,255,255,0.18)`,
                outlineOffset: active ? 2 : 0,
              }}>
                <div style={{ position: 'absolute', inset: 0, ...style }}/>
              </div>
            );
          })}
        </div>
      </div>

      {/* action bar */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        padding: '16px 20px 36px', display: 'flex', gap: 10,
      }}>
        <button style={{
          flex: 1, height: 48, borderRadius: 24, border: '1px solid rgba(255,255,255,0.25)',
          background: 'transparent', color: '#fff', fontSize: 14, fontFamily: 'inherit', letterSpacing: 1.5,
        }}>存到相册</button>
        <button style={{
          flex: 1.4, height: 48, borderRadius: 24, border: 'none',
          background: theme.accent, color: '#fff', fontSize: 15, fontFamily: 'inherit',
          fontWeight: 600, letterSpacing: 2,
        }}>分 享</button>
      </div>
    </Screen>
  );
}

// ──────────────────────────────────────────────────────────────────
// BookPreview — 线装古风诗集 (年度合集导出)
// ──────────────────────────────────────────────────────────────────
function BookPreview({ theme, entries }) {
  const sample = entries.slice(0, 3);
  return (
    <Screen theme={theme} bg={'#2a221b'} noTab>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '50px 16px 0', display: 'flex', justifyContent: 'space-between', zIndex: 20 }}>
        <button style={{ width: 40, height: 40, borderRadius: 20, border: 'none', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <IconChevron color="#fff" dir="left" size={14}/>
        </button>
        <div style={{ color: '#fff', fontSize: 13, letterSpacing: 2, paddingTop: 12 }}>2026 · 线 装 集</div>
        <div style={{ width: 40 }}/>
      </div>

      {/* book stack */}
      <div style={{
        position: 'absolute', top: 110, left: 32, right: 32,
        bottom: 200,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        {/* book */}
        <div style={{
          width: '100%', maxWidth: 280, aspectRatio: '3/4',
          background: theme.paper, position: 'relative',
          boxShadow: '0 30px 60px -10px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,0,0,0.2)',
          borderRadius: '2px 4px 4px 2px',
        }}>
          {/* spine binding — 4 朱线 */}
          {[0.18, 0.34, 0.52, 0.7, 0.86].map((y, i) => (
            <div key={i} style={{
              position: 'absolute', left: 12, top: `${y * 100}%`, width: 4, height: 18,
              background: theme.seal, borderRadius: 1,
              boxShadow: `0 0 0 2px ${theme.paper}`,
            }}/>
          ))}
          {/* cover content */}
          <div style={{ padding: '28px 28px 28px 38px', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 10, letterSpacing: 4, color: theme.textMute, fontWeight: 600, marginBottom: 10 }}>2026 · 诗 集</div>
            <div className="serif" style={{
              writingMode: 'vertical-rl', textOrientation: 'upright',
              fontSize: 40, color: theme.text, letterSpacing: 14, lineHeight: 1.0,
              marginTop: 'auto', marginBottom: 'auto', marginLeft: 'auto',
              fontWeight: 500,
            }}>
              一 年 之 诗
            </div>
            <div style={{
              marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
            }}>
              <Seal char1="诗" char2="签" theme={theme} size={36} rotate={-4}/>
              <div style={{ fontSize: 10.5, color: theme.textMute, letterSpacing: 1.5, textAlign: 'right' }}>
                64 篇 · 38 首<br/>
                <span style={{ opacity: 0.6 }}>林时雨 著</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 20, color: 'rgba(255,255,255,0.55)', fontSize: 12, letterSpacing: 2, textAlign: 'center' }}>
          竖排 · 衬线 · 朱栏 · 朱印
        </div>
      </div>

      {/* action bar */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        padding: '16px 20px 36px',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          {['封面', '目录', '内文', '版权'].map((s, i) => (
            <div key={s} style={{
              padding: '6px 12px', borderRadius: 14,
              background: i === 0 ? 'rgba(255,255,255,0.18)' : 'transparent',
              border: i === 0 ? 'none' : '0.5px solid rgba(255,255,255,0.18)',
              color: '#fff', fontSize: 11.5, letterSpacing: 1,
            }}>{s}</div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={{
            flex: 1, height: 48, borderRadius: 24,
            border: '1px solid rgba(255,255,255,0.25)', background: 'transparent',
            color: '#fff', fontSize: 14, fontFamily: 'inherit', letterSpacing: 1.5,
          }}>导出 PDF</button>
          <button style={{
            flex: 1.4, height: 48, borderRadius: 24, border: 'none',
            background: theme.seal, color: '#fff',
            fontSize: 15, fontFamily: 'inherit', fontWeight: 600, letterSpacing: 2,
            boxShadow: `0 8px 20px ${theme.seal}55`,
          }}>下 单 印 制</button>
        </div>
      </div>
    </Screen>
  );
}

// ──────────────────────────────────────────────────────────────────
// Hexagrams (六爻) — saved divinations: question + time + hexagram + interp
// ──────────────────────────────────────────────────────────────────
function Hexagrams({ theme, hexes = [], onNew, onFollowUp, onTab }) {
  const list = hexes.length > 0 ? hexes : [];
  return (
    <Screen theme={theme} tab="hex" onTab={onTab}>
      <div style={{ padding: '64px 24px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: 3, color: theme.textMute, fontWeight: 500 }}>HEXAGRAMS · 六 爻</div>
          <div className="serif" style={{ fontSize: 30, fontWeight: 600, letterSpacing: -0.5, marginTop: 4, color: theme.text }}>卜 签</div>
          <div style={{ fontSize: 12, color: theme.textSoft, marginTop: 6 }}>记录每一次求问 · {hexes.length} 次</div>
        </div>
        <button type="button" aria-label="起一卦" onClick={onNew} style={{
          width: 40, height: 40, borderRadius: 20, border: 'none', background: theme.seal,
          color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', boxShadow: `0 4px 12px ${theme.seal}55`,
          marginTop: 28,
        }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round">
            <path d="M9 3v12M3 9h12"/>
          </svg>
        </button>
      </div>

      {/* feature card — start a reading */}
      <div style={{ padding: '20px 20px 0' }}>
        <div onClick={onNew} style={{
          background: theme.paper, borderRadius: 20, padding: '20px 22px',
          border: `0.5px solid ${theme.line}`,
          display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer',
          ...skin(theme, 'poemCard'),
        }}>
          <HexagramGlyph lines={[
            { type: 'yang' }, { type: 'yin' }, { type: 'yang' },
            { type: 'yin' }, { type: 'yang' }, { type: 'yin' },
          ]} color={theme.text} size="lg" />
          <div style={{ flex: 1 }}>
            <div className="serif" style={{ fontSize: 18, color: theme.text, fontWeight: 500, letterSpacing: 2 }}>起 一 卦</div>
            <div style={{ fontSize: 12, color: theme.textSoft, marginTop: 4, lineHeight: 1.5 }}>手动设爻 · AI 解签 · 记下今天的疑问</div>
          </div>
          <IconChevron color={theme.textMute} dir="right" size={13}/>
        </div>
      </div>

      {/* past readings */}
      <div style={{ padding: '32px 24px 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ fontSize: 10, letterSpacing: 4, color: theme.textMute, fontWeight: 600 }}>往 卦</div>
        <div style={{ flex: 1, height: 0.5, background: theme.line }} />
      </div>

      {list.length === 0 ? (
        <div style={{ padding: '48px 32px', textAlign: 'center' }}>
          <div className="serif" style={{ fontSize: 18, color: theme.textMute, letterSpacing: 3, lineHeight: 2 }}>
            还没有卦象<br/>点上方起一卦
          </div>
        </div>
      ) : (
        <div style={{ padding: '0 20px 120px' }}>
          {list.map((h) => (
            <HexCard key={h.id} hex={h} theme={theme} onFollowUp={onFollowUp}/>
          ))}
        </div>
      )}
    </Screen>
  );
}

function HexagramGlyph({ lines, color, size = 'sm' }) {
  // lines: bottom-up array of 6 { type, changing }
  const w = size === 'lg' ? 48 : size === 'md' ? 32 : 22;
  const gap = size === 'lg' ? 5 : size === 'md' ? 3.5 : 2.5;
  const h = size === 'lg' ? 3 : size === 'md' ? 2.2 : 1.6;
  const split = size === 'lg' ? 8 : size === 'md' ? 5 : 4;
  // render top-to-bottom (reverse the lines)
  const display = [...lines].reverse();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap, alignItems: 'center', flexShrink: 0 }}>
      {display.map((ln, i) => {
        if (ln.type === 'yang') {
          return (
            <div key={i} style={{
              width: w, height: h, background: color,
              borderRadius: h * 0.4,
              position: 'relative',
            }}>
              {ln.changing && <div style={{
                position: 'absolute', right: -8, top: '50%', transform: 'translateY(-50%)',
                width: 4, height: 4, borderRadius: 2, background: '#D44A3D',
              }}/>}
            </div>
          );
        }
        return (
          <div key={i} style={{ display: 'flex', gap: split, position: 'relative' }}>
            <div style={{ width: (w - split) / 2, height: h, background: color, borderRadius: h * 0.4 }}/>
            <div style={{ width: (w - split) / 2, height: h, background: color, borderRadius: h * 0.4 }}/>
            {ln.changing && <div style={{
              position: 'absolute', right: -8, top: '50%', transform: 'translateY(-50%)',
              width: 4, height: 4, borderRadius: 2, background: '#D44A3D',
            }}/>}
          </div>
        );
      })}
    </div>
  );
}

function HexCard({ hex, theme, onFollowUp }) {
  const interpLines = (hex.interp || '').split('\n').filter(Boolean);
  return (
    <div style={{
      background: theme.surface, borderRadius: 16, padding: '18px 18px',
      marginBottom: 12, display: 'flex', gap: 18, alignItems: 'flex-start',
      border: `0.5px solid ${theme.line}`,
      ...skin(theme, 'panel'),
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <HexagramGlyph lines={hex.lines} color={theme.text} size="md" />
        <div className="serif" style={{ fontSize: 12, color: theme.text, letterSpacing: 2, fontWeight: 500 }}>{hex.name}</div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14.5, color: theme.text, lineHeight: 1.5, fontWeight: 500, marginBottom: 8 }}>{hex.question}</div>
        <div style={{
          paddingLeft: 10, borderLeft: `1.5px solid ${theme.accent}`, marginBottom: 10,
        }}>
          {interpLines.length ? interpLines.map((ln, i) => (
            <div key={i} className="serif" style={{
              fontSize: 12.5, lineHeight: 1.75,
              color: ln.startsWith('【') ? theme.seal : theme.textSoft,
              fontWeight: ln.startsWith('【') ? 600 : 400,
            }}>{ln}</div>
          )) : (
            <div className="serif" style={{ fontSize: 12.5, color: theme.textMute, lineHeight: 1.7 }}>未解</div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 11, color: theme.textMute, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>{(hex.date || '').replace(/-/g, '.')}</span>
            <span>·</span>
            <span>{hex.time}</span>
            {hex.mood && <><span>·</span><span style={{ color: theme.accent }}>{hex.mood}</span></>}
          </div>
          {onFollowUp && (
            <button onClick={() => onFollowUp(hex.question)} style={{
              border: `0.5px solid ${theme.line}`, background: 'transparent',
              borderRadius: 12, padding: '4px 12px', fontSize: 11,
              color: theme.textSoft, cursor: 'pointer', letterSpacing: 1, flexShrink: 0,
            }}>追 问</button>
          )}
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Collections — tags / groups of entries (电影 / 大学 / 研究生 / ...)
// ──────────────────────────────────────────────────────────────────
function Collections({ theme, onOpen, onTab }) {
  const tags = window.TAGS;
  return (
    <Screen theme={theme} noTab>
      <div style={{ padding: '64px 24px 8px' }}>
        <div style={{ fontSize: 11, letterSpacing: 3, color: theme.textMute, fontWeight: 500 }}>COLLECTIONS</div>
        <div className="serif" style={{ fontSize: 30, fontWeight: 600, letterSpacing: -0.5, marginTop: 4, color: theme.text }}>合 集</div>
        <div style={{ fontSize: 12, color: theme.textSoft, marginTop: 6 }}>用标签把日子归类 · 后来翻一翻很方便</div>
      </div>

      {/* tag grid */}
      <div style={{ padding: '24px 20px 0', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {tags.map((t, i) => {
          const featured = i < 2;
          return (
            <div key={t.name} style={{
              gridColumn: featured ? 'span 1' : 'span 1',
              background: featured ? theme.paper : theme.surface,
              borderRadius: 16, padding: '16px 16px',
              border: `0.5px solid ${theme.line}`,
              display: 'flex', flexDirection: 'column', gap: 10,
              minHeight: featured ? 110 : 92,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="serif" style={{ fontSize: 22, color: theme.accent, lineHeight: 1 }}>{t.icon}</span>
                <span style={{ fontSize: 11, color: theme.textMute, fontVariantNumeric: 'tabular-nums' }}>{t.count}</span>
              </div>
              <div className="serif" style={{ fontSize: 16, color: theme.text, fontWeight: 500, letterSpacing: 1 }}>{t.name}</div>
              {featured && (
                <div style={{ fontSize: 11, color: theme.textSoft, lineHeight: 1.5, marginTop: 'auto' }}>
                  最近：{i === 0 ? '《夜直》5.14' : '《旧约》5.15'}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* new tag */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{
          border: `1px dashed ${theme.line}`, borderRadius: 16,
          padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10,
          color: theme.textMute, fontSize: 13,
        }}>
          <span style={{ fontSize: 16 }}>+</span>
          <span>新建合集</span>
        </div>
      </div>

      <div style={{ height: 80 }} />
    </Screen>
  );
}
