// screens-other.jsx — Timeline, Import, Settings.

// ──────────────────────────────────────────────────────────────────
// Timeline — milestones only
// ──────────────────────────────────────────────────────────────────
function Timeline({ theme, entries, onOpen, onTab }) {
  const flagged = entries.filter(e => e.flag);
  const poems = entries.filter(e => e.poem && e.poemCollected !== false);
  const quotes = entries.flatMap(entry => (entry.collectedQuotes || []).map(quote => ({ quote, entry })));
  const [view, setView] = React.useState('poems');
  return (
    <Screen theme={theme} tab="timeline" onTab={onTab}>
      <div style={{ padding: '64px 24px 8px' }}>
        <div style={{ fontSize: 11, letterSpacing: 3, color: theme.textMute, fontWeight: 500 }}>COLLECTIONS</div>
        <div className="serif" style={{ fontSize: 30, fontWeight: 600, letterSpacing: -0.5, marginTop: 4, color: theme.text }}>藏 册</div>
        <div style={{ fontSize: 12, color: theme.textSoft, marginTop: 6 }}>诗、句子与被记住的时刻</div>
      </div>

      <div style={{ display: 'flex', gap: 8, padding: '14px 20px 2px' }}>
        {[['poems','诗册',poems.length],['quotes','拾句册',quotes.length],['milestones','里程碑',flagged.length]].map(([id,label,count]) => (
          <button key={id} type="button" onClick={() => setView(id)} style={{
            flex: 1, height: 38, borderRadius: 19, border: `0.5px solid ${view === id ? theme.text : theme.line}`,
            background: view === id ? theme.text : theme.surface, color: view === id ? theme.bg : theme.textSoft,
            fontFamily: 'inherit', cursor: 'pointer', fontSize: 12,
          }}>{label} · {count}</button>
        ))}
      </div>

      {view === 'poems' && <div style={{ padding: '24px 20px 120px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
        {poems.map(entry => <button type="button" key={entry.id} onClick={() => onOpen(entry.id)} style={{
          minHeight: 260, borderRadius: 18, border: `0.5px solid ${theme.line}`, padding: '20px 18px',
          backgroundColor: theme.paper, ...paperBg(entry.paper || 'plain', theme),
          fontFamily: 'inherit', cursor: 'pointer', overflow: 'hidden',
        }}>
          <div style={{ background: 'rgba(255,253,247,.84)', borderRadius: 14, padding: '18px 12px', height: '100%', position: 'relative', overflow: 'hidden', ...skin(theme, 'poemCard') }}>
            <ThemeCardArt theme={theme} />
            <ThemeMotif theme={theme} />
            <div className="serif" style={{ fontSize: 22, color: theme.text, letterSpacing: 5 }}>{entry.poem.title}</div>
            <div style={{ width: 24, height: 1, background: theme.accent, margin: '12px auto' }}/>
            <PoemBody lines={entry.poem.lines || []} size={14} theme={theme}/>
            <div style={{ marginTop: 12, fontSize: 10.5, color: theme.textMute }}>{entry.date}</div>
          </div>
        </button>)}
        {!poems.length && <div className="serif" style={{ color: theme.textMute, padding: 40, textAlign: 'center' }}>摇出的诗会自动收入这里</div>}
      </div>}

      {view === 'quotes' && <div style={{ padding: '24px 20px 120px' }}>
        {quotes.map(({ quote, entry }, index) => <button type="button" key={`${entry.id}-${index}`} onClick={() => onOpen(entry.id)} style={{
          width: '100%', textAlign: 'left', marginBottom: 10, padding: '17px 18px', borderRadius: 15,
          border: `0.5px solid ${theme.line}`, background: theme.surface, fontFamily: 'inherit', cursor: 'pointer',
          position: 'relative', overflow: 'hidden', ...skin(theme, 'panel'),
        }}>
          <ThemeCardArt theme={theme} kind="quote" />
          <ThemeMotif theme={theme} variant="panel" />
          <div className="serif" style={{ fontSize: 16, color: theme.text, lineHeight: 1.75 }}>“{quote}”</div>
          <div style={{ marginTop: 7, fontSize: 11, color: theme.textMute }}>{entry.date} · {entry.title || entry.poem?.title || '日记'}</div>
        </button>)}
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

      {/* a single haunting line from the poem */}
      <div className="serif" style={{
        fontSize: 14, lineHeight: 1.7, color: theme.textSoft, letterSpacing: 1,
        paddingLeft: 12, borderLeft: `1.5px solid ${theme.accent}`,
        fontStyle: 'normal',
      }}>{entry.sign?.timelineLine || entry.poem?.lines?.[entry.poem.lines.length - 1] || entry.body?.slice(0, 28) || '这一日被记下。'}</div>
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
function EmailAccountCard({ theme, user, entriesCount, onBindEmail, onPasswordReset }) {
  const [expanded, setExpanded] = React.useState(false);
  const [email, setEmail] = React.useState(user?.email || '');
  const [password, setPassword] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const isAnonymous = !user || user.isAnonymous;

  const bind = async () => {
    setMessage('');
    if (!email.trim() || password.length < 6) {
      setMessage('请输入邮箱，并使用至少 6 位密码。');
      return;
    }
    setBusy(true);
    try {
      await onBindEmail(email.trim(), password);
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
      await onPasswordReset(user?.email || email.trim());
      setMessage('重置密码邮件已发送。');
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
  const fileRef = React.useRef(null);
  const tog = (key, val, setter) => { localStorage.setItem(key, JSON.stringify(val)); setter(val); };

  const backupText = () => JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), entries, hexagrams }, null, 2);

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
    { label: '清雅', keys: ['celadon', 'inkPlum', 'mossGarden'] },
    { label: '温暖', keys: ['study', 'morningPaper', 'obsidianDawn'] },
    { label: '轻盈', keys: ['dusk', 'seaSalt', 'snowNight'] },
  ];
  const themeRecommendations = {
    celadon: '素雅浅色信纸 · 宋体或霞鹜文楷',
    inkPlum: '宣纸或留白信纸 · 霞鹜文楷',
    mossGarden: '植物边缘信纸 · 宋体',
    study: '米白旧纸 · 宋体或霞鹜文楷',
    morningPaper: '无图案信纸 · 宋体',
    obsidianDawn: '暖白矿物纸 · 小薇体',
    dusk: '低对比浅色信纸 · 小薇体',
    seaSalt: '开阔浅蓝信纸 · 宋体',
    snowNight: '月白或冰蓝信纸 · 小薇体',
  };
  return (
    <Screen theme={theme} tab="settings" onTab={onTab}>
      <div style={{ padding: '64px 24px 24px' }}>
        <div style={{ fontSize: 11, letterSpacing: 3, color: theme.textMute, fontWeight: 500 }}>SETTINGS</div>
        <div className="serif" style={{ fontSize: 30, fontWeight: 600, letterSpacing: -0.5, marginTop: 4, color: theme.text }}>我</div>
      </div>

      {/* account card */}
      <div style={{ padding: '0 20px 24px' }}>
        <EmailAccountCard theme={theme} user={currentUser} entriesCount={entriesCount}
          onBindEmail={onBindEmail} onPasswordReset={onPasswordReset}/>
        <button type="button" onClick={() => alert('当前为 Firebase 匿名账户。请定期使用“数据备份”；清除浏览器数据或更换设备后，匿名账户可能无法找回。')} style={{
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
            <div style={{ fontSize: 11.5, color: theme.textMute, marginTop: 3, letterSpacing: 0.5 }}>已写 {entriesCount} 篇 · Firebase 匿名账户</div>
          </div>
          <IconChevron color={theme.textMute} dir="right" size={14}/>
        </button>
      </div>

      {/* theme picker */}
      <SettingsSection theme={theme} title="主 题 皮 肤">
        <div style={{ padding: '12px 14px 4px', color: theme.textMute, fontSize: 11.5 }}>
          推荐搭配：{themeRecommendations[currentThemeKey] || '跟随皮肤默认字体与信纸'}
        </div>
        {themeGroups.map(group => (
          <div key={group.label}>
            <div style={{ padding: '12px 16px 0', color: theme.textMute, fontSize: 10.5, letterSpacing: 3 }}>{group.label}</div>
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
                      width: '100%', borderRadius: key === 'morningPaper' ? 5 : key === 'seaSalt' ? 18 : 12,
                      background: tokens.paper,
                      border: active ? `1.5px solid ${theme.text}` : `0.5px solid ${theme.line}`,
                      padding: 8, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 5,
                      position: 'relative', overflow: 'hidden',
                      boxShadow: key === 'snowNight' ? `inset 0 0 0 1px ${tokens.line}` : 'none',
                      ...skin(tokens, 'preview'),
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 2 }}>
                        <div style={{ display: 'flex', gap: 3 }}>
                          {swatch.map((c, i) => <div key={i} style={{ width: 6, height: 6, borderRadius: key === 'morningPaper' ? 1 : 5, background: c, border: i === 1 ? `0.5px solid ${theme.line}` : 'none' }}/>)}
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

      <SettingsSection theme={theme} title="写 作 与 生 诗">
        <SettingsRow theme={theme} label="每日提醒" detail="22:00" onClick={() => alert('提醒功能将在 App 版本支持')} />
        <SettingsRow theme={theme} label="自动记录位置" toggle on={autoLoc} onToggle={() => tog('d-autoLoc', !autoLoc, setAutoLoc_)} />
        <SettingsRow theme={theme} label="日记生诗" toggle on={autoPoem} onToggle={() => tog('d-autoPoem', !autoPoem, setAutoPoem_)} detail="摇签可选" />
        <SettingsRow theme={theme} label="保存被否决的诗" toggle on={saveRej} onToggle={() => tog('d-saveRej', !saveRej, setSaveRej_)} isLast />
      </SettingsSection>

      <SettingsSection theme={theme} title="导 入 与 导 出">
        <input ref={fileRef} type="file" accept=".json,.txt,.md" onChange={importFile} style={{ display: 'none' }}/>
        <SettingsRow theme={theme} label="导入过去日记" detail=".json · .txt · .md" onClick={() => fileRef.current?.click()} />
        <SettingsRow theme={theme} label="导出与分享" detail="系统分享 · JSON" onClick={shareBackup} />
        <SettingsRow theme={theme} label="数据备份" detail={`JSON · ${entriesCount} 篇`} onClick={downloadBackup} isLast />
      </SettingsSection>

      <SettingsSection theme={theme} title="云 同 步">
        <SettingsRow theme={theme} label="Firestore" detail={syncDetail} onClick={() => alert(syncState.error ? `最近一次同步失败：${syncState.error}` : syncDetail)} />
        <SettingsRow theme={theme} label="跨设备同步" detail="匿名账号不支持" onClick={() => alert('当前使用 Firebase 匿名登录。要跨设备同步，需要后续增加 Google 或邮箱登录。')} isLast />
      </SettingsSection>

      <SettingsSection theme={theme} title="数 据">
        <SettingsRow theme={theme} label="清除所有数据" detail="不可撤销" onClick={clearAll} />
        <SettingsRow theme={theme} label="退出" onClick={onSignOut} isLast />
      </SettingsSection>

      <div style={{ textAlign: 'center', fontSize: 10.5, color: theme.textMute, letterSpacing: 1, padding: '2px 0 18px' }}>
        版本 {buildLabel || 'prototype'}
      </div>
      <div style={{ height: 100 }} />
    </Screen>
  );
}

function SettingsSection({ theme, title, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
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
      <div style={{ flex: 1, fontSize: 14.5, color: theme.text }}>{label}</div>
      {detail && !toggle && <div style={{ fontSize: 13, color: theme.textMute }}>{detail}</div>}
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
      ) : (
        <IconChevron color={theme.textMute} dir="right" size={13}/>
      )}
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
  const [c1, c2] = sealChars(entry.poem.title);
  return (
    <React.Fragment>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ fontSize: 9, letterSpacing: 4, color: theme.textMute, fontWeight: 600 }}>
          诗 签 <span style={{ opacity: 0.7, marginLeft: 5 }}>{entry.poem.form || '五绝'}</span>
        </div>
        <Seal char1={c1} char2={c2} theme={theme} size={28} rotate={-4} />
      </div>
      <div className="serif" style={{
        fontSize: 22, fontWeight: 500, color: theme.text, letterSpacing: 8,
        textAlign: 'center', marginTop: 18, paddingLeft: '0.5em',
      }}>{entry.poem.title}</div>
      <div style={{ width: 24, height: 1, background: theme.accent, margin: '12px auto 16px' }}/>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <PoemBody lines={entry.poem.lines} size={16} theme={theme} />
      </div>
      <div style={{ marginTop: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: 9.5, color: theme.textMute, letterSpacing: 1 }}>
        <span>{entry.date.replace(/-/g, '.')} · {entry.place.split(' · ')[1] || entry.place}</span>
        <span style={{ fontWeight: 600, letterSpacing: 2 }}>诗 签</span>
      </div>
    </React.Fragment>
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
