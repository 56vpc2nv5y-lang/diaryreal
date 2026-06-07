// screens-main.jsx — Home, Search, Compose, Shake, Detail.

// ──────────────────────────────────────────────────────────────────
// Home — today's poem at top, history list below
// ──────────────────────────────────────────────────────────────────
function Home({ theme, entries, drafts = [], density = 'sparse', poemLayout = 'horizontal', onOpen, onCompose, onSearch, onTab }) {
  const today = entries[0];
  const rest = entries.slice(1);
  return (
    <Screen theme={theme} tab="home" onTab={onTab}>
      {/* header strip */}
      <div style={{ padding: '64px 24px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: 3, color: theme.textMute, fontWeight: 500 }}>2026 · MAY · 15</div>
          <div className="serif" style={{ fontSize: 30, fontWeight: 600, letterSpacing: -0.5, marginTop: 4, color: theme.text }}>今日</div>
        </div>
        <button onClick={onSearch} style={{
          width: 40, height: 40, borderRadius: 20, border: 'none',
          background: theme.surface, display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 1px 0 ${theme.line}`, cursor: 'pointer'
        }}>
          <IconSearch color={theme.textSoft} size={17} />
        </button>
      </div>

      {/* drafts strip — quick captures not yet written up */}
      {drafts && drafts.length > 0 && (
        <div style={{ padding: '8px 0 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', padding: '0 24px 6px', gap: 8 }}>
            <div style={{ fontSize: 10, letterSpacing: 4, color: theme.seal, fontWeight: 600 }}>草 稿</div>
            <div style={{ fontSize: 11, color: theme.textMute }}>{drafts.length} 个未完成</div>
          </div>
          <div className="no-scroll" style={{ display: 'flex', gap: 10, padding: '4px 24px 4px', overflowX: 'auto' }}>
            {drafts.map((d) => <DraftCard key={d.id} draft={d} theme={theme} />)}
            <div style={{
              flexShrink: 0, width: 110, height: 90, borderRadius: 14,
              border: `1px dashed ${theme.line}`, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              color: theme.textMute, fontSize: 12,
            }}>+ 新草稿</div>
          </div>
        </div>
      )}

      {/* today's poem card */}
      <div style={{ padding: '8px 20px 0' }}>
        <TodayCard theme={theme} entry={today} layout={poemLayout} onClick={() => onOpen(today.id)} />
      </div>

      {/* past divider */}
      <div style={{ padding: '32px 24px 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ fontSize: 10, letterSpacing: 4, color: theme.textMute, fontWeight: 600 }}>往 日</div>
        <div style={{ flex: 1, height: 0.5, background: theme.line }} />
        <div style={{ fontSize: 11, color: theme.textMute }}>{rest.length} 篇</div>
      </div>

      {/* list */}
      <div style={{ padding: '0 24px 120px' }}>
        {rest.map((e, i) =>
        <PastRow key={e.id} entry={e} theme={theme} onClick={() => onOpen(e.id)} isLast={i === rest.length - 1} dense={density === 'dense'} />
        )}
      </div>
    </Screen>);

}

function TodayCard({ theme, entry, layout = 'horizontal', onClick }) {
  if (!entry) return null;
  const poem = entry.poem;
  const [c1, c2] = sealChars(poem?.title || '日');

  // No poem yet — soft CTA
  if (!poem) {
    return (
      <div onClick={onClick} style={{
        position: 'relative', background: theme.paper, borderRadius: 22,
        padding: '28px 26px 22px', cursor: 'pointer',
        border: `0.5px solid ${theme.line}`,
      }}>
        <div style={{ fontSize: 10, letterSpacing: 3, color: theme.textMute, fontWeight: 600, marginBottom: 16 }}>今 日 之 诗</div>
        <div className="serif" style={{ fontSize: 17, color: theme.textSoft, letterSpacing: 2, lineHeight: 2 }}>还没有诗 · 摇一签</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 16, fontSize: 11.5, color: theme.textSoft }}>
          <IconPin color={theme.textSoft} size={11}/><span>{entry.place}</span>
          <span style={{ color: theme.textMute }}>·</span><span>{entry.time}</span>
        </div>
      </div>
    );
  }

  return (
    <div onClick={onClick} style={{
      position: 'relative', background: theme.paper, borderRadius: 22,
      padding: '28px 26px 22px', cursor: 'pointer',
      boxShadow: `0 1px 0 ${theme.line}, 0 12px 32px -16px ${theme.text}22`,
      border: `0.5px solid ${theme.line}`
    }}>
      {/* tag */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div style={{ fontSize: 10, letterSpacing: 3, color: theme.textMute, fontWeight: 600 }}>
          今 日 之 诗
          <span style={{ marginLeft: 10, opacity: 0.7, letterSpacing: 1 }}>{poem.form || '五绝'}</span>
        </div>
        <Seal char1={c1} char2={c2} theme={theme} size={32} />
      </div>

      {/* title */}
      <div className="serif" style={{
        fontSize: 30, fontWeight: 500, letterSpacing: 6,
        color: theme.text, lineHeight: 1.15, textAlign: 'center', paddingLeft: '0.3em',
      }}>{poem.title}</div>

      <div style={{ width: 28, height: 0.8, background: theme.accent, margin: '14px auto 22px' }} />

      {layout === 'vertical' ? (
        <div style={{ display: 'flex', flexDirection: 'row-reverse', gap: 18, justifyContent: 'center', padding: '4px 0' }}>
          {poem.lines.map((ln, i) => (
            <div key={i} className="serif" style={{ writingMode: 'vertical-rl', textOrientation: 'upright', fontSize: 19, color: theme.text, letterSpacing: 8, lineHeight: 1.4, fontWeight: 500 }}>{ln}</div>
          ))}
        </div>
      ) : (
        <PoemBody lines={poem.lines} size={20} theme={theme} />
      )}

      {/* meta */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 22, fontSize: 11.5, color: theme.textSoft }}>
        {entry.mood && <span style={{ fontSize: 14, marginRight: 2 }}>{entry.mood}</span>}
        <IconPin color={theme.textSoft} size={11} />
        <span>{entry.place}</span>
        <span style={{ color: theme.textMute, margin: '0 4px' }}>·</span>
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>{entry.time}</span>
      </div>
    </div>);

}

function PastRow({ entry, theme, onClick, isLast, dense }) {
  const md = entry.date.slice(5).replace('-', '.');
  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'flex-start', gap: 16,
      padding: dense ? '16px 0' : '22px 0',
      borderBottom: isLast ? 'none' : `0.5px solid ${theme.line}`,
      cursor: 'pointer'
    }}>
      <div style={{ width: 44, textAlign: 'center', flexShrink: 0, paddingTop: 2 }}>
        <div className="serif" style={{ fontSize: 22, fontWeight: 500, color: theme.text, lineHeight: 1 }}>{md.split('.')[1]}</div>
        <div style={{ fontSize: 10, color: theme.textMute, letterSpacing: 1, marginTop: 4 }}>{['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][parseInt(md.split('.')[0], 10) - 1]}</div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          {entry.mood && <span style={{ fontSize: 13, lineHeight: 1 }}>{entry.mood}</span>}
          {entry.flag && <FlagDot theme={theme} size={10} />}
          <div className="serif" style={{ fontSize: 18, fontWeight: 500, color: theme.text, letterSpacing: 1 }}>{entry.poem?.title || entry.body?.slice(0, 10) || '无题'}</div>
        </div>
        <div style={{
          fontSize: 13, color: theme.textSoft, lineHeight: 1.55,
          display: '-webkit-box', WebkitLineClamp: dense ? 1 : 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
        }}>{entry.body}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 6, fontSize: 11, color: theme.textMute }}>
          <IconPin color={theme.textMute} size={10} />
          <span>{entry.place.split(' · ')[1] || entry.place}</span>
          {entry.photos && <span style={{ marginLeft: 4 }}>· 图 {entry.photos.length}</span>}
        </div>
      </div>
    </div>);

}

// ──────────────────────────────────────────────────────────────────
// Search
// ──────────────────────────────────────────────────────────────────
// ── Draft card ───────────────────────────────────────────────────────────────
function DraftCard({ draft, theme }) {
  const t = (draft.kind === 'photo' && draft.photos && draft.photos.length) ?
    (
      <div style={{
        width: 110, height: 90, borderRadius: 14,
        background: `linear-gradient(135deg, ${theme.accent}66, ${theme.seal}66)`,
        display: 'flex', alignItems: 'flex-end', padding: 8,
        boxShadow: `inset 0 -32px 32px -16px rgba(0,0,0,0.25)`,
        position: 'relative', overflow: 'hidden',
      }}>
        <IconCamera color="#fff" size={14}/>
        <div style={{ position: 'absolute', left: 8, bottom: 8, right: 8, color: '#fff',
          fontSize: 11, fontWeight: 500, lineHeight: 1.3, letterSpacing: 0.5,
          textShadow: '0 1px 2px rgba(0,0,0,0.3)',
          overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {draft.title}
        </div>
      </div>
    ) :
    (
      <div style={{
        width: 110, height: 90, borderRadius: 14, background: theme.surface,
        border: `0.5px solid ${theme.line}`, padding: 10,
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      }}>
        <div style={{ fontSize: 11, color: theme.text, lineHeight: 1.3, fontWeight: 500,
          overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box',
          WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
          {draft.title}
        </div>
        <div style={{ fontSize: 10, color: theme.textMute, letterSpacing: 0.5 }}>{draft.time}</div>
      </div>
    );
  return (
    <div style={{ flexShrink: 0, position: 'relative' }}>
      {t}
      <div style={{
        position: 'absolute', top: 6, right: 6,
        background: theme.seal, color: '#fff', borderRadius: 8,
        fontSize: 9, padding: '2px 5px', letterSpacing: 1, fontWeight: 600,
      }}>{draft.kind === 'photo' ? '照片' : '标题'}</div>
    </div>
  );
}

function Search({ theme, entries, onClose, onOpen }) {
  return (
    <Screen theme={theme} noTab>
      <div style={{ padding: '60px 20px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          flex: 1, height: 40, borderRadius: 20, background: theme.surface,
          display: 'flex', alignItems: 'center', padding: '0 14px', gap: 8
        }}>
          <IconSearch color={theme.textSoft} size={16} />
          <input autoFocus defaultValue="海" style={{
            border: 'none', outline: 'none', background: 'transparent',
            flex: 1, color: theme.text, fontSize: 15,
            fontFamily: 'inherit'
          }} />
        </div>
        <button onClick={onClose} style={{ border: 'none', background: 'transparent', color: theme.textSoft, fontSize: 15, fontFamily: 'inherit', cursor: 'pointer' }}>取消</button>
      </div>

      {/* filter chips */}
      <div style={{ display: 'flex', gap: 8, padding: '16px 20px 0' }}>
        {['全部', '关键词', '地点', '日期'].map((c, i) =>
        <div key={c} style={{
          padding: '6px 14px', borderRadius: 14,
          background: i === 0 ? theme.text : 'transparent',
          color: i === 0 ? theme.bg : theme.textSoft,
          fontSize: 12, letterSpacing: 0.5,
          border: i === 0 ? 'none' : `0.5px solid ${theme.line}`
        }}>{c}</div>
        )}
      </div>

      <div style={{ padding: '24px 24px 8px', fontSize: 10, letterSpacing: 4, color: theme.textMute, fontWeight: 600 }}>2 篇 · 关于「海」</div>

      <div style={{ padding: '0 24px 120px' }}>
        {entries.filter((e) => e.body.includes('海') || e.place.includes('象山') || e.poem.title.includes('潮')).map((e, i, arr) =>
        <PastRow key={e.id} entry={e} theme={theme} onClick={() => onOpen(e.id)} isLast={i === arr.length - 1} />
        )}
      </div>
    </Screen>);

}

// ──────────────────────────────────────────────────────────────────
// Compose — empty / filled state via `state` prop
// ──────────────────────────────────────────────────────────────────
function Compose({ theme, state = 'filled', paper = 'plain', onClose, onShake }) {
  const filled = state !== 'empty';
  const body = '下午三点的咖啡馆。雨终于停了，光从窗外斜斜地落下来。她迟到了二十分钟，但笑起来还是像高中那年的样子。我们没怎么说话，只是把杯子里的冰块捞出来，一颗一颗，像在偷偷数着什么。';
  const paperStyle = paperBg(paper, theme);

  return (
    <Screen theme={theme} bg={theme.paper} noTab>
      {/* paper pattern layer — fills the whole writing surface */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        ...paperStyle,
      }} />

      {/* content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '60px 20px 0' }}>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 8 }}>
            <IconClose color={theme.textSoft} size={20} />
          </button>
          <div style={{ fontSize: 12, color: theme.textSoft, fontWeight: 500 }}>新日记</div>
          <PaperBadge kind={paper} theme={theme} />
        </div>

        {/* auto meta */}
        <div style={{ padding: '16px 28px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: theme.textMute }}>
            <span>5月15日 · 周五 · 15:42</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: theme.textMute, marginTop: 6 }}>
            <IconPin color={theme.textMute} size={11} />
            <span>上海 · 永康路</span>
            <span style={{ marginLeft: 4, color: theme.accent, fontSize: 10, fontWeight: 600, letterSpacing: 1 }}>自动</span>
          </div>

          {/* mood emoji picker */}
          {filled && (
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 10.5, color: theme.textMute, letterSpacing: 1.5, marginRight: 2 }}>心 情</span>
              {['☕', '🌙', '🌸', '🌊', '✨'].map((m, i) => (
                <span key={i} style={{
                  width: 30, height: 30, borderRadius: 15,
                  background: i === 0 ? theme.seal + '22' : theme.surface,
                  border: i === 0 ? `1px solid ${theme.seal}88` : `0.5px solid ${theme.line}`,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16,
                }}>{m}</span>
              ))}
              <span style={{
                width: 30, height: 30, borderRadius: 15,
                background: 'transparent', border: `0.5px dashed ${theme.line}`,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, color: theme.textMute,
              }}>+</span>
            </div>
          )}
        </div>

        {/* big text area */}
        <div style={{ padding: '24px 28px 0', minHeight: 380 }}>
          {filled ?
            <div className="serif" style={{
              fontSize: 17, lineHeight: paper === 'ruled' ? '34px' : 1.95, color: theme.text, letterSpacing: 0.5,
              whiteSpace: 'pre-wrap',
            }}>{body}<span style={{
              display: 'inline-block', width: 1.5, height: 19, background: theme.accent,
              verticalAlign: 'middle', marginLeft: 1, animation: 'pulse 1s ease infinite',
            }} /></div> :
            <div className="serif" style={{ fontSize: 19, color: theme.textMute, letterSpacing: 0.5, lineHeight: paper === 'ruled' ? '34px' : 1.8 }}>
              今天，
              <span style={{ display: 'inline-block', width: 2, height: 22, background: theme.accent, verticalAlign: 'middle', marginLeft: 2 }} />
            </div>
          }
        </div>

        {/* photos chip row */}
        {filled &&
          <div style={{ padding: '20px 28px 0', display: 'flex', gap: 10 }}>
            <ImgPlaceholder theme={theme} label="cafe.jpg" w={86} h={86} />
            <div style={{
              width: 86, height: 86, borderRadius: 14, border: `0.5px dashed ${theme.line}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.textMute,
              background: theme.surface + 'aa',
            }}>
              <IconCamera color={theme.textMute} size={22} />
            </div>
          </div>
        }

        <div style={{ height: 140 }} />
      </div>

      {/* bottom toolbar — sticky over paper */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 2,
        padding: '12px 16px 32px',
        background: `linear-gradient(to top, ${theme.paper} 78%, ${theme.paper}00)`,
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        {/* tools row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ToolBtn theme={theme} icon={IconCamera} />
          <ToolBtn theme={theme} icon={IconPin} />
          <FlagToggle theme={theme} on={false} />
          <PaperBtn theme={theme} />
          <div style={{ flex: 1 }} />
          <div style={{ fontSize: 11, color: theme.textMute, letterSpacing: 1.5 }}>
            {filled ? '128 字' : ''}
          </div>
        </div>
        {/* action row — save primary, shake optional */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onShake} disabled={!filled} style={{
            flex: 1, height: 46, borderRadius: 23,
            border: `1px solid ${filled ? theme.seal + 'aa' : theme.line}`,
            background: 'transparent',
            color: filled ? theme.seal : theme.textMute,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            fontSize: 14, fontWeight: 500, letterSpacing: 1.5,
            cursor: filled ? 'pointer' : 'not-allowed',
            fontFamily: "'Noto Serif SC', serif",
          }}>
            <IconShake color={filled ? theme.seal : theme.textMute} size={17} />
            摇签求诗
            <span style={{ fontSize: 10, opacity: 0.55, letterSpacing: 0.5 }}>可选</span>
          </button>
          <button disabled={!filled} style={{
            flex: 1, height: 46, borderRadius: 23, border: 'none',
            background: filled ? theme.text : theme.surfaceSoft,
            color: filled ? theme.bg : theme.textMute,
            fontSize: 15, fontWeight: 600, letterSpacing: 3,
            cursor: filled ? 'pointer' : 'not-allowed',
            fontFamily: 'inherit',
          }}>保 存</button>
        </div>
      </div>
    </Screen>);
}

// little paper-name badge in top-right of compose
const PAPER_LABEL = { plain: '空 白', ruled: '横 格', grid: '方 格', columns: '朱 丝 栏', dots: '点 阵' };
function PaperBadge({ kind, theme }) {
  return (
    <div style={{
      height: 26, padding: '0 10px', borderRadius: 13,
      background: theme.surface, border: `0.5px solid ${theme.line}`,
      display: 'flex', alignItems: 'center', gap: 5,
      fontSize: 10.5, color: theme.textSoft, letterSpacing: 1.5,
    }}>
      <span style={{ width: 4, height: 4, borderRadius: 2, background: theme.accent }} />
      {PAPER_LABEL[kind] || '空 白'}
    </div>
  );
}
function PaperBtn({ theme }) {
  return (
    <button style={{
      width: 38, height: 38, borderRadius: 19, border: 'none',
      background: theme.surface, display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer',
    }}>
      {/* stationery icon — folded letter */}
      <svg width="17" height="17" viewBox="0 0 17 17" fill="none" stroke={theme.textSoft} strokeWidth="1.4" strokeLinejoin="round">
        <rect x="2" y="3" width="13" height="11" rx="1.2"/>
        <path d="M5 6.5h7M5 9h7M5 11.5h4"/>
      </svg>
    </button>);
}

function ToolBtn({ theme, icon: Icon }) {
  return (
    <button style={{
      width: 38, height: 38, borderRadius: 19, border: 'none',
      background: theme.surface, display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer'
    }}>
      <Icon color={theme.textSoft} size={17} />
    </button>);

}
function FlagToggle({ theme, on }) {
  return (
    <button style={{
      height: 40, padding: '0 12px', borderRadius: 20, border: 'none',
      background: on ? theme.seal + '22' : theme.surface,
      color: on ? theme.seal : theme.textSoft,
      display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
      fontSize: 13, fontFamily: 'inherit'
    }}>
      <FlagDot theme={theme} size={11} />
      <span>里程碑</span>
    </button>);

}

// ──────────────────────────────────────────────────────────────────
// Shake — mid-shake / generating state
// ──────────────────────────────────────────────────────────────────
// ── QuickMenu ───────────────────────────────────────────────────────────────────────────
function QuickMenu({ theme, entries, drafts }) {
  const opts = [
    { id: 'photo',  label: '打一张',   desc: '拍个现场 · 之后再补字',     icon: IconCamera, color: theme.accent },
    { id: 'title',  label: '先写个题', desc: '扣一句话作引子',           icon: IconPenLine, color: theme.seal },
    { id: 'full',   label: '完整日记',   desc: '出门带上信纸 · 慢慢写',     icon: IconBook, color: theme.text },
  ];
  return (
    <Screen theme={theme} noTab>
      {/* dimmed Home behind */}
      <div style={{ opacity: 0.4, filter: 'blur(2px)', pointerEvents: 'none' }}>
        <Home theme={theme} entries={entries} drafts={drafts} onOpen={() => {}} onSearch={() => {}} onTab={() => {}} />
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(20,15,10,0.25)' }}/>

      <div style={{
        position: 'absolute', left: 16, right: 16, bottom: 110, zIndex: 50,
        background: theme.paper, borderRadius: 22,
        boxShadow: `0 20px 60px -12px rgba(0,0,0,0.35), 0 0 0 0.5px ${theme.line}`,
        padding: 14, display: 'flex', flexDirection: 'column', gap: 4,
      }}>
        <div style={{ fontSize: 10, letterSpacing: 4, color: theme.textMute, fontWeight: 600, padding: '4px 12px 10px' }}>快 记</div>
        {opts.map((o) => {
          const Icon = o.icon;
          return (
            <div key={o.id} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '12px 12px',
              borderRadius: 14,
              background: o.id === 'photo' ? theme.surface : 'transparent',
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 20,
                background: o.color + '22', color: o.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Icon color={o.color} size={20}/>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="serif" style={{ fontSize: 16, color: theme.text, fontWeight: 500, letterSpacing: 1 }}>{o.label}</div>
                <div style={{ fontSize: 11.5, color: theme.textSoft, marginTop: 2, lineHeight: 1.4 }}>{o.desc}</div>
              </div>
              <IconChevron color={theme.textMute} dir="right" size={13}/>
            </div>
          );
        })}
      </div>

      <div style={{
        position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)',
        width: 52, height: 52, borderRadius: 26, background: theme.text,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 6px 16px ${theme.text}55`, zIndex: 40,
      }}>
        <IconPlus color={theme.bg} size={22}/>
      </div>
    </Screen>
  );
}

function IconPenLine({ color = '#000', size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round">
      <path d="M14 3l3 3-9 9-4 1 1-4z"/>
      <path d="M3 17h14"/>
    </svg>
  );
}
function IconBook({ color = '#000', size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round">
      <path d="M4 3h10a2 2 0 012 2v11H6a2 2 0 00-2 2V3z"/>
      <path d="M7 7h6M7 10h5"/>
    </svg>
  );
}

// ── QuickCapture ───────────────────────────────────────────────────────────────────
function QuickCapture({ theme, kind = 'photo' }) {
  return (
    <Screen theme={theme} bg={theme.paper} noTab>
      <div style={{ padding: '60px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 8 }}>
          <IconClose color={theme.textSoft} size={20}/>
        </button>
        <div className="serif" style={{ fontSize: 14, color: theme.text, letterSpacing: 2, fontWeight: 500 }}>
          {kind === 'photo' ? '快记 · 拍一张' : '快记 · 记个题'}
        </div>
        <div style={{ width: 36 }}/>
      </div>

      <div style={{ padding: '14px 28px 0', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: theme.textMute }}>
        <IconPin color={theme.textMute} size={11}/>
        <span>{kind === 'photo' ? '上海 · 安福路' : '上海 · 地铁2号线'}</span>
        <span>·</span>
        <span>5月15日 · {kind === 'photo' ? '12:30' : '09:18'}</span>
      </div>

      {kind === 'photo' ? (
        <div style={{ padding: '28px 24px 0' }}>
          <div style={{
            aspectRatio: '4/5', borderRadius: 18,
            background: `linear-gradient(135deg, ${theme.accent}88, ${theme.seal}66, ${theme.text}55)`,
            position: 'relative', overflow: 'hidden',
            boxShadow: `0 12px 28px -10px ${theme.text}55`,
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 12, fontFamily: 'ui-monospace, monospace',
              letterSpacing: 1, textShadow: '0 1px 4px rgba(0,0,0,0.4)',
            }}>cat.jpg</div>
          </div>
          <input placeholder="中午的猫" defaultValue="中午的猫" style={{
            marginTop: 18, width: '100%', border: 'none', outline: 'none',
            background: 'transparent', color: theme.text, fontFamily: "'Noto Serif SC', serif",
            fontSize: 22, fontWeight: 500, letterSpacing: 2,
            borderBottom: `0.5px solid ${theme.line}`, padding: '8px 0',
          }}/>
        </div>
      ) : (
        <div style={{ padding: '40px 28px 0' }}>
          <input placeholder="随手一句……" defaultValue="今早地铁里的老人" style={{
            width: '100%', border: 'none', outline: 'none',
            background: 'transparent', color: theme.text, fontFamily: "'Noto Serif SC', serif",
            fontSize: 26, fontWeight: 500, letterSpacing: 2, lineHeight: 1.4,
            borderBottom: `1px solid ${theme.line}`, padding: '8px 0',
          }}/>
          <div style={{ marginTop: 24, display: 'flex', gap: 10 }}>
            <button style={{
              flex: 1, height: 44, borderRadius: 22, border: `1px solid ${theme.line}`,
              background: theme.surface, color: theme.textSoft,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              fontSize: 13, fontFamily: 'inherit', letterSpacing: 1,
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={theme.textSoft} strokeWidth="1.5" strokeLinecap="round">
                <rect x="6" y="2" width="4" height="8" rx="2"/><path d="M3 7v1a5 5 0 0010 0V7M8 13v2"/>
              </svg>
              语音记下
            </button>
            <button style={{
              flex: 1, height: 44, borderRadius: 22, border: `1px solid ${theme.line}`,
              background: theme.surface, color: theme.textSoft,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              fontSize: 13, fontFamily: 'inherit', letterSpacing: 1,
            }}>
              <IconCamera color={theme.textSoft} size={16}/>
              加张图
            </button>
          </div>
        </div>
      )}

      <div style={{ padding: '40px 32px 0', fontSize: 12, color: theme.textMute, lineHeight: 1.6, letterSpacing: 0.3 }}>
        今晚或明天，点开草稿续写下去。<br/>补完后，就是一则完整日记。
      </div>

      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        padding: '14px 20px 36px', background: theme.paper,
      }}>
        <button style={{
          width: '100%', height: 50, borderRadius: 25, border: 'none',
          background: theme.text, color: theme.bg,
          fontSize: 15, fontWeight: 600, letterSpacing: 3, fontFamily: 'inherit',
        }}>存为 草 稿</button>
      </div>
    </Screen>
  );
}

function Shake({ theme, state = 'shaking', onCancel, onAccept, onRegen, entry }) {
  // state: 'shaking' | 'done'
  const e = entry;
  const [c1, c2] = sealChars(e.poem.title);
  return (
    <Screen theme={theme} noTab>
      {/* collapsed diary header */}
      <div style={{ padding: '60px 28px 0' }}>
        <div style={{ fontSize: 11, letterSpacing: 3, color: theme.textMute, fontWeight: 600 }}>本 篇 日 记</div>
        <div style={{ fontSize: 13, color: theme.textSoft, marginTop: 8, lineHeight: 1.55,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {e.body}
        </div>
      </div>

      <div style={{ height: 30 }} />

      {state === 'shaking' ?
      <div style={{ padding: '20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 480 }}>
          {/* stylized 签筒 */}
          <div className="anim-shake" style={{ marginBottom: 36 }}>
            <div style={{
            width: 110, height: 160, borderRadius: '8px 8px 14px 14px',
            background: theme.surface,
            border: `1.5px solid ${theme.text}33`,
            position: 'relative', boxShadow: `0 8px 24px ${theme.text}22`
          }}>
              {/* sticks */}
              {[-30, -16, -2, 12, 26].map((rot, i) =>
            <div key={i} style={{
              position: 'absolute', left: '50%', top: -20,
              width: 6, height: 80, background: theme.accent,
              borderRadius: 3, transform: `translateX(-50%) rotate(${rot * 0.2}deg)`,
              transformOrigin: '50% 100%',
              boxShadow: i === 2 ? `0 -4px 8px ${theme.seal}55` : 'none',
              borderTop: i === 2 ? `8px solid ${theme.seal}` : `8px solid ${theme.accent}`
            }} />
            )}
              {/* mouth */}
              <div style={{
              position: 'absolute', left: 6, right: 6, top: 0, height: 8,
              background: theme.bg, borderRadius: '50% 50% 0 0 / 100% 100% 0 0'
            }} />
            </div>
          </div>
          <div className="serif" style={{ fontSize: 18, color: theme.text, letterSpacing: 4, marginBottom: 12 }}>
            Grok 正在写诗
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {[0, 1, 2].map((i) =>
          <div key={i} style={{
            width: 4, height: 4, borderRadius: 2, background: theme.textMute,
            animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`
          }} />
          )}
          </div>
          <style>{`@keyframes pulse{0%,100%{opacity:0.2}50%{opacity:1}}`}</style>
          <div style={{ fontSize: 11, color: theme.textMute, marginTop: 40, letterSpacing: 2 }}>读取本篇日记 · 生成原创中文诗</div>
        </div> :

      // 'done' — reveal
      <div className="anim-rise" style={{ padding: '8px 32px 0', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 10, letterSpacing: 4, color: theme.textMute, fontWeight: 600 }}>
              今 日 之 诗 <span style={{ marginLeft: 8, opacity: 0.7 }}>{e.poem.form || '五绝'}</span>
            </div>
            <Seal char1={c1} char2={c2} theme={theme} size={40} rotate={-4} />
          </div>
          <div className="serif" style={{ fontSize: 32, fontWeight: 500, color: theme.text, letterSpacing: 8, marginTop: 18, lineHeight: 1.1, paddingLeft: '0.5em' }}>
            {e.poem.title}
          </div>
          <div style={{ width: 32, height: 1, background: theme.accent, margin: '20px auto 28px' }} />
          <PoemBody lines={e.poem.lines} size={24} theme={theme} />
          <div style={{ fontSize: 11, color: theme.textMute, marginTop: 36, letterSpacing: 1.5 }}>根据本篇日记生成 · GROK</div>
        </div>
      }

      {/* bottom actions */}
      {state === 'done' &&
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        padding: '14px 20px 36px', background: theme.bg,
        display: 'flex', gap: 10
      }}>
          <button onClick={onRegen} style={{
          flex: 1, height: 50, borderRadius: 25, border: `0.5px solid ${theme.line}`,
          background: theme.surface, color: theme.text,
          fontSize: 15, letterSpacing: 1, fontFamily: 'inherit', cursor: 'pointer'
        }}>重新摇签</button>
          <button onClick={onAccept} style={{
          flex: 1.6, height: 50, borderRadius: 25, border: 'none',
          background: theme.text, color: theme.bg,
          fontSize: 15, letterSpacing: 1, fontFamily: 'inherit', cursor: 'pointer',
          fontWeight: 600
        }}>就是这一首</button>
        </div>
      }
      {state === 'shaking' &&
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        padding: '14px 20px 36px', textAlign: 'center'
      }}>
          <button onClick={onCancel} style={{
          border: 'none', background: 'transparent', color: theme.textMute,
          fontSize: 13, letterSpacing: 2, fontFamily: 'inherit', cursor: 'pointer'
        }}>取消</button>
        </div>
      }
    </Screen>);

}

// ──────────────────────────────────────────────────────────────────
// Detail — full diary + poem + revisit notes
// ──────────────────────────────────────────────────────────────────
// ── Inline-annotated body ─────────────────────────────────────────────────────────
// Renders the diary body with inline-annotation spans highlighted.
// Notes whose `anchor` substring appears in the body get a soft
// cinnabar background + underline. `selectedId` boosts the highlight.
function renderBodyWithAnchors(body, inlineNotes, theme, selectedId, onSelect) {
  if (!inlineNotes || inlineNotes.length === 0) return body;
  const ranges = inlineNotes
    .map((n) => ({ note: n, start: body.indexOf(n.anchor) }))
    .filter((r) => r.start >= 0)
    .sort((a, b) => a.start - b.start);
  if (ranges.length === 0) return body;
  const out = [];
  let cursor = 0;
  ranges.forEach((r, i) => {
    if (r.start > cursor) out.push(<span key={`t${i}`}>{body.slice(cursor, r.start)}</span>);
    const isSel = selectedId === r.note.id;
    out.push(
      <span key={r.note.id}
        onClick={(e) => { e.stopPropagation(); onSelect && onSelect(r.note.id); }}
        style={{
          background: theme.seal + (isSel ? '38' : '18'),
          boxShadow: `inset 0 -1.5px 0 ${theme.seal}aa`,
          borderRadius: 2, padding: '0 1px',
          cursor: 'pointer', transition: 'background .15s',
        }}>{r.note.anchor}</span>
    );
    cursor = r.start + r.note.anchor.length;
  });
  if (cursor < body.length) out.push(<span key="tail">{body.slice(cursor)}</span>);
  return out;
}

function Detail({ theme, entry, onBack, showPoem = true }) {
  const e = entry;
  const [c1, c2] = sealChars(e.poem.title);
  return (
    <Screen theme={theme} noTab>
      {/* top bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '50px 16px 0', display: 'flex', justifyContent: 'space-between', zIndex: 20 }}>
        <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: 20, border: 'none', background: theme.surface + 'dd', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <IconChevron color={theme.text} dir="left" size={14} />
        </button>
        <button style={{ width: 40, height: 40, borderRadius: 20, border: 'none', background: theme.surface + 'dd', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <svg width="16" height="4" viewBox="0 0 16 4" fill={theme.text}>
            <circle cx="2" cy="2" r="1.5" /><circle cx="8" cy="2" r="1.5" /><circle cx="14" cy="2" r="1.5" />
          </svg>
        </button>
      </div>

      {showPoem ? (
      /* poem block */
      <div style={{ padding: '110px 32px 36px', background: theme.paper, borderBottom: `0.5px solid ${theme.line}`, textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 10, letterSpacing: 4, color: theme.textMute, fontWeight: 600 }}>
              诗 签 <span style={{ marginLeft: 8, opacity: 0.7 }}>{e.poem.form || '五绝'}</span>
            </div>
            <Seal char1={c1} char2={c2} theme={theme} size={42} rotate={-4} />
          </div>
          <div className="serif" style={{ fontSize: 28, fontWeight: 500, color: theme.text, letterSpacing: 8, marginTop: 16, lineHeight: 1.1, paddingLeft: '0.5em' }}>{e.poem.title}</div>
          <div style={{ width: 28, height: 1, background: theme.accent, margin: '18px auto 24px' }} />
          <PoemBody lines={e.poem.lines} size={21} theme={theme} />
          <div style={{ fontSize: 11, color: theme.textMute, marginTop: 28, letterSpacing: 1.5 }}>根据本篇日记生成 · GROK</div>
        </div>) : (

      /* unpoemed — soft CTA, paper kept for visual continuity */
      <div style={{ padding: '110px 32px 28px', background: theme.paper, borderBottom: `0.5px solid ${theme.line}`, position: 'relative' }}>
          <div style={{ fontSize: 10, letterSpacing: 4, color: theme.textMute, fontWeight: 600 }}>本 篇 尚 未 求 诗</div>
          <div className="serif" style={{
          fontSize: 17, lineHeight: 1.85, color: theme.textSoft,
          letterSpacing: 1.5, marginTop: 16
        }}>
            没有也没关系 —— 日记<br />本身已是这一日的诗。
          </div>
          <button style={{
          marginTop: 22, height: 42, padding: '0 18px', borderRadius: 21,
          border: `1px solid ${theme.seal}88`, background: 'transparent',
          color: theme.seal, display: 'inline-flex', alignItems: 'center', gap: 7,
          fontSize: 13.5, letterSpacing: 1.5,
          fontFamily: "'Noto Serif SC', serif", cursor: 'pointer'
        }}>
            <IconShake color={theme.seal} size={16} />
            现在摇一签
          </button>
        </div>)
      }

      {/* meta strip */}
      <div style={{ padding: '20px 32px 0', display: 'flex', flexWrap: 'wrap', gap: '6px 16px', fontSize: 12, color: theme.textSoft, alignItems: 'center' }}>
        {e.mood && <span style={{ fontSize: 18, marginRight: 2 }}>{e.mood}</span>}
        <span>{e.date.replace(/-/g, '.')}</span>
        <span style={{ color: theme.textMute }}>·</span>
        <span>{e.weekday}</span>
        <span style={{ color: theme.textMute }}>·</span>
        <span>{e.time}</span>
        <span style={{ color: theme.textMute }}>·</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <IconPin color={theme.textSoft} size={11} />{e.place}
        </span>
        {e.flag &&
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: theme.seal }}>
            <FlagDot theme={theme} size={11} />里程碑
          </span>
        }
      </div>

      {/* body with inline annotations */}
      <div style={{ padding: '24px 32px 0' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ fontSize: 10, letterSpacing: 4, color: theme.textMute, fontWeight: 600 }}>日 记 正 文</div>
          {e.inlineNotes && e.inlineNotes.length > 0 && (
            <div style={{ fontSize: 11, color: theme.seal, letterSpacing: 1 }}>· {e.inlineNotes.length} 点评</div>
          )}
        </div>
        <div className="serif" style={{ fontSize: 16, lineHeight: 2.0, color: theme.text, letterSpacing: 0.4 }}>
          {renderBodyWithAnchors(e.body, e.inlineNotes, theme)}
        </div>
        {/* tags */}
        {e.tags && e.tags.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 14 }}>
            {e.tags.map((tg) => (
              <span key={tg} style={{
                fontSize: 11, color: theme.textSoft, letterSpacing: 0.5,
                padding: '3px 9px', borderRadius: 12,
                background: theme.surface, border: `0.5px solid ${theme.line}`,
              }}>#{tg}</span>
            ))}
          </div>
        )}
      </div>

      {/* inline annotations — each linked to a body anchor */}
      {e.inlineNotes && e.inlineNotes.length > 0 && (
        <div style={{ padding: '24px 32px 0' }}>
          <div style={{ fontSize: 10, letterSpacing: 4, color: theme.textMute, fontWeight: 600, marginBottom: 12 }}>句 中 点 评</div>
          {e.inlineNotes.map((n) => (
            <div key={n.id} style={{
              marginBottom: 12, padding: '14px 16px 14px 18px',
              background: theme.surface, borderRadius: 14,
              borderLeft: `2.5px solid ${theme.seal}`,
            }}>
              <div className="serif" style={{
                fontSize: 12, color: theme.textMute, letterSpacing: 0.3, marginBottom: 6,
              }}>「{n.anchor}」</div>
              <div style={{ fontSize: 14, color: theme.text, lineHeight: 1.6, marginBottom: 6 }}>{n.text}</div>
              <div style={{ fontSize: 11, color: theme.textMute, letterSpacing: 0.5 }}>{n.date}</div>
            </div>
          ))}
        </div>
      )}

      {e.photos &&
      <div style={{ padding: '20px 32px 0', display: 'flex', gap: 10 }}>
          {e.photos.map((p, i) => <ImgPlaceholder key={i} theme={theme} label={p} w={104} h={104} />)}
        </div>
      }

      {/* revisit notes */}
      <div style={{ padding: '32px 32px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ fontSize: 10, letterSpacing: 4, color: theme.textMute, fontWeight: 600 }}>回 看 点 评</div>
          <div style={{ fontSize: 11, color: theme.textMute }}>{e.notes.length} 条</div>
        </div>
        {e.notes.length === 0 &&
        <div style={{ fontSize: 13, color: theme.textMute, letterSpacing: 0.5, padding: '8px 0 0' }}>
            还没有回看 — 下一次再来读这一篇，可以写下当时的感想。
          </div>
        }
        {e.notes.map((n, i) =>
        <div key={i} style={{
          padding: '14px 16px', borderRadius: 14, background: theme.surface,
          marginBottom: 10, position: 'relative'
        }}>
            <div style={{ fontSize: 11, color: theme.textMute, marginBottom: 6, letterSpacing: 0.5 }}>{n.date}</div>
            <div style={{ fontSize: 14, color: theme.text, lineHeight: 1.6 }}>{n.text}</div>
          </div>
        )}

        {/* add note */}
        <div style={{
          marginTop: 10, padding: '14px 16px', borderRadius: 14,
          border: `0.5px dashed ${theme.line}`, color: theme.textSoft,
          fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <span>+ 添加这一刻的感想</span>
          <span style={{ fontSize: 11, color: theme.textMute }}>2026.05.15 现在</span>
        </div>
      </div>

      <div style={{ height: 80 }} />
    </Screen>);

}

Object.assign(window, { Home, Search, Compose, QuickCapture, QuickMenu, Shake, Detail, TodayCard, PastRow, renderBodyWithAnchors });