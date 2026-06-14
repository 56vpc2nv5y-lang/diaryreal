// app-real.jsx — Real diary app: Firebase auth + Firestore + DeepSeek

const APP_BUILD = '2026.06.14-r35';

const SYNC_EVENT = 'poem-diary-sync';
const syncTracker = {
  pending: 0,
  error: '',
  online: navigator.onLine,
};

function syncSnapshot() {
  return { ...syncTracker };
}

function emitSyncState() {
  window.dispatchEvent(new CustomEvent(SYNC_EVENT, { detail: syncSnapshot() }));
}

window.addEventListener('online', () => {
  syncTracker.online = true;
  emitSyncState();
});
window.addEventListener('offline', () => {
  syncTracker.online = false;
  emitSyncState();
});

function trackWrite(writePromise) {
  syncTracker.pending += 1;
  syncTracker.error = '';
  emitSyncState();
  writePromise.then(() => {
    syncTracker.pending = Math.max(0, syncTracker.pending - 1);
    emitSyncState();
  }, error => {
    syncTracker.pending = Math.max(0, syncTracker.pending - 1);
    syncTracker.error = error?.message || '同步失败';
    emitSyncState();
  });
  return syncTracker.online ? writePromise : Promise.resolve();
}

firebase.firestore().enablePersistence({ synchronizeTabs: true }).catch(error => {
  if (error?.code !== 'failed-precondition' && error?.code !== 'unimplemented') {
    console.warn('Firestore 离线持久化未启用:', error);
  }
});

// ─── Firebase helpers ─────────────────────────────────────────────
function col(name) {
  const uid = firebase.auth().currentUser?.uid;
  if (!uid) throw new Error('未登录');
  return firebase.firestore().collection('users').doc(uid).collection(name);
}

function normalizeEntry(data, id) {
  const now = new Date(), p = n => String(n).padStart(2, '0');
  const fallbackDate = `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`;
  const poem = data?.poem && typeof data.poem.title === 'string' &&
    Array.isArray(data.poem.lines) && data.poem.lines.length === 4
    ? { ...data.poem, lines: data.poem.lines.map(String) }
    : null;
  return {
    ...data,
    ...(id ? { id } : {}),
    date: typeof data?.date === 'string' ? data.date : fallbackDate,
    weekday: typeof data?.weekday === 'string' ? data.weekday : '',
    time: typeof data?.time === 'string' ? data.time : '',
    place: typeof data?.place === 'string' ? data.place : '未记录地点',
    title: typeof data?.title === 'string' ? data.title : '',
    body: typeof data?.body === 'string' ? data.body : '',
    mood: typeof data?.mood === 'string' ? data.mood : '',
    flag: !!data?.flag,
    tags: Array.isArray(data?.tags) ? data.tags.map(String) : [],
    paper: typeof data?.paper === 'string' ? data.paper : 'plain',
    poem,
    sign: data?.sign && typeof data.sign === 'object' ? {
      title: typeof data.sign.title === 'string' ? data.sign.title : '',
      motif: typeof data.sign.motif === 'string' ? data.sign.motif : '',
      judgmentLines: Array.isArray(data.sign.judgmentLines) ? data.sign.judgmentLines.map(String) : [],
      interpretation: typeof data.sign.interpretation === 'string' ? data.sign.interpretation : '',
      timelineLine: typeof data.sign.timelineLine === 'string' ? data.sign.timelineLine : '',
    } : null,
    quoteSuggestions: Array.isArray(data?.quoteSuggestions)
      ? data.quoteSuggestions.filter(item => item && typeof item.quote === 'string')
      : [],
    collectedQuotes: Array.isArray(data?.collectedQuotes) ? data.collectedQuotes.map(String) : [],
    rejectedQuotes: Array.isArray(data?.rejectedQuotes) ? data.rejectedQuotes.map(String) : [],
    poemCollected: data?.poemCollected !== false && !!poem,
    notes: Array.isArray(data?.notes) ? data.notes.filter(n => n && typeof n.text === 'string') : [],
    inlineNotes: Array.isArray(data?.inlineNotes) ? data.inlineNotes.filter(n => n && typeof n.text === 'string') : [],
    photos: Array.isArray(data?.photos) ? data.photos.filter(p => typeof p === 'string') : [],
  };
}

async function dbGetEntries() {
  try {
    const snap = await col('entries').orderBy('date', 'desc').get();
    return snap.docs.map(d => normalizeEntry(d.data(), d.id));
  } catch (e) { console.error('读取日记失败:', e); return []; }
}

async function dbSaveEntry(data) {
  const { id, ...rest } = data;
  const now = new Date().toISOString();
  const ref = id ? col('entries').doc(id) : col('entries').doc();
  await trackWrite(ref.set(
    { ...rest, ...(id ? {} : { createdAt: now }), updatedAt: now },
    { merge: true },
  ));
  return ref.id;
}

async function dbDeleteEntry(id) {
  await trackWrite(col('entries').doc(id).delete());
}

async function dbClearCollection(name) {
  const snap = await col(name).get();
  const docs = snap.docs;
  for (let i = 0; i < docs.length; i += 400) {
    const batch = firebase.firestore().batch();
    docs.slice(i, i + 400).forEach(d => batch.delete(d.ref));
    await trackWrite(batch.commit());
  }
}

async function dbClearAllData() {
  await dbClearCollection('entries');
  await dbClearCollection('hexagrams');
}

async function dbImportEntries(entries) {
  const normalized = entries.map(entry => normalizeEntry(entry || {}, entry?.id)).filter(entry => entry.body.trim());
  for (const entry of normalized) {
    const bytes = new Blob([JSON.stringify(entry)]).size;
    if (bytes > 900 * 1024) throw new Error(`日记“${entry.poem?.title || entry.date}”过大，无法写入 Firestore`);
  }
  for (const entry of normalized) {
    const { id, ...data } = entry;
    if (!data.body?.trim()) continue;
    if (id) await dbSaveEntry({ id, ...data });
    else await dbSaveEntry(data);
  }
}

async function dbImportHexagrams(hexagrams) {
  for (const hex of hexagrams) {
    if (!hex?.question?.trim() || !Array.isArray(hex.lines)) continue;
    await dbSaveHexagram(hex);
  }
}

async function dbSaveHexagram(data) {
  const { id, ...rest } = data;
  const now = new Date().toISOString();
  if (id) {
    await trackWrite(col('hexagrams').doc(id).set({ ...rest, updatedAt: now }, { merge: true }));
    return id;
  }
  const ref = col('hexagrams').doc();
  await trackWrite(ref.set({ ...rest, createdAt: now }));
  return ref.id;
}

async function dbGetHexagrams() {
  try {
    const snap = await col('hexagrams').orderBy('createdAt', 'desc').get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) { return []; }
}

async function apiPoem(diaryText) {
  const token = await firebase.auth().currentUser?.getIdToken();
  const r = await fetch('/api/poem', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ diaryText }),
  });
  const text = await r.text();
  let json;
  try { json = text ? JSON.parse(text) : {}; }
  catch {
    throw new Error(`生诗服务返回了非 JSON 内容（HTTP ${r.status}）。请检查 Vercel Functions 部署和日志。`);
  }
  if (!r.ok) throw new Error(json.error || '生诗失败');
  return json;
}

async function apiQuestion(question) {
  const token = await firebase.auth().currentUser?.getIdToken();
  const response = await fetch('/api/question', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ question }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || '理问失败');
  return data.analysis;
}

async function geocode(lat, lng) {
  try {
    const r = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=zh`,
      { headers: { 'User-Agent': 'DiaryApp/1.0' } }
    );
    const d = await r.json();
    const a = d.address || {};
    return [a.city || a.county || a.state, a.suburb || a.neighbourhood || a.road]
      .filter(Boolean).join(' · ') || '当前位置';
  } catch { return '当前位置'; }
}

function nowInfo() {
  const d = new Date(), p = n => String(n).padStart(2, '0');
  return {
    date: `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`,
    weekday: `周${'日一二三四五六'[d.getDay()]}`,
    time: `${p(d.getHours())}:${p(d.getMinutes())}`,
    label: `${d.getMonth()+1}月${d.getDate()}日 · 周${'日一二三四五六'[d.getDay()]} · ${p(d.getHours())}:${p(d.getMinutes())}`,
  };
}

// ─── Splash (brief init screen) ─────────────────────────────────
function SplashScreen({ theme }) {
  return (
    <div style={{ width: W, height: H, background: theme.paper, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <img src="assets/icons/app-icon-192.png" alt="诗签" style={{
        width: 86, height: 86, borderRadius: 22,
        boxShadow: `0 12px 32px ${theme.text}22`,
      }}/>
    </div>
  );
}

// ─── Welcome — 开场页（亮色，三套主题均适用）────────────────────
function WelcomeScreen({ theme, onStart, loading }) {
  const [show, setShow] = React.useState(false);
  React.useEffect(() => { const t = setTimeout(() => setShow(true), 80); return () => clearTimeout(t); }, []);

  const now = new Date();
  const MM = ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'];
  const dateStr = `${now.getFullYear()} · ${MM[now.getMonth()]} · ${now.getDate()}日`;

  const poem = {
    title: '旧 约', form: '七绝',
    lines: ['雨歇斜阳过午迟', '帘前犹是少年时', '冰沉杯底无人语', '笑里偷藏一寸丝'],
  };

  const up = (d = 0) => ({
    opacity: show ? 1 : 0,
    transform: show ? 'translateY(0)' : 'translateY(20px)',
    transition: `opacity 0.9s ${d}s cubic-bezier(.16,1,.3,1), transform 0.9s ${d}s cubic-bezier(.16,1,.3,1)`,
  });

  const bg = paperBg('sakura', theme);

  return (
    <div style={{
      width: W, height: H,
      background: `linear-gradient(160deg, ${theme.bg} 0%, ${theme.paper} 55%, ${theme.surface} 100%)`,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* paper pattern */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.55, ...bg }}/>

      {/* accent top bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: theme.seal }}/>

      {/* top row: label + date + seal */}
      <div style={{
        ...up(0),
        width: '100%', padding: '62px 32px 0',
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        position: 'relative',
      }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: 4, color: theme.textMute, fontWeight: 600 }}>今 日 赠 签</div>
          <div style={{ fontSize: 11, color: theme.textMute, letterSpacing: 1.5, marginTop: 4 }}>{dateStr}</div>
        </div>
        <Seal char1="诗" char2="签" theme={theme} size={42} rotate={-5}/>
      </div>

      {/* poem block */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '0 40px', position: 'relative',
      }}>

        {/* poem title */}
        <div style={{ ...up(0.12) }}>
          <div className="serif" style={{
            fontSize: 40, fontWeight: 500, color: theme.text,
            letterSpacing: 12, paddingLeft: '0.8em', lineHeight: 1, textAlign: 'center',
          }}>{poem.title}</div>
        </div>

        {/* form label */}
        <div style={{ ...up(0.2), display: 'flex', alignItems: 'center', gap: 10, margin: '18px 0 24px' }}>
          <div style={{ width: 36, height: 0.5, background: theme.accent }}/>
          <div style={{ fontSize: 10, color: theme.textMute, letterSpacing: 3 }}>{poem.form}</div>
          <div style={{ width: 36, height: 0.5, background: theme.accent }}/>
        </div>

        {/* poem lines */}
        <div className="serif" style={{ textAlign: 'center' }}>
          {poem.lines.map((ln, i) => (
            <div key={i} style={{
              ...up(0.26 + i * 0.1),
              fontSize: 21, color: i % 2 === 0 ? theme.text : theme.textSoft,
              letterSpacing: '0.38em', lineHeight: 2.15, paddingLeft: '0.38em',
              fontWeight: i % 2 === 0 ? 500 : 400,
            }}>{ln}</div>
          ))}
        </div>
      </div>

      {/* bottom CTA */}
      <div style={{
        ...up(0.64),
        width: '100%', padding: '0 32px 50px',
        display: 'flex', flexDirection: 'column', gap: 11, alignItems: 'center',
        position: 'relative',
      }}>
        <div className="serif" style={{ fontSize: 13, color: theme.textSoft, letterSpacing: 3, marginBottom: 2 }}>
          写今天，得属于你的一首
        </div>
        <button onClick={onStart} disabled={loading} style={{
          width: '100%', height: 56, borderRadius: 28,
          border: 'none',
          background: theme.text, color: theme.bg,
          fontSize: 18, fontWeight: 600, letterSpacing: 5,
          fontFamily: "'Noto Serif SC', serif",
          cursor: loading ? 'default' : 'pointer',
          opacity: loading ? 0.7 : 1,
          boxShadow: `0 10px 32px ${theme.text}22`,
          transition: 'opacity .2s',
        }}>
          {loading ? '…' : '开 始 写 今 天'}
        </button>
        <div style={{ fontSize: 10.5, color: theme.textMute, letterSpacing: 2 }}>数据保存在你的 Firebase 匿名账户</div>
      </div>
    </div>
  );
}
// ─── Empty Home ───────────────────────────────────────────────────
function EmptyHomeScreen({ theme, onCompose, onTab }) {
  const d = new Date();
  const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  return (
    <Screen theme={theme} tab="home" onTab={onTab}>
      <div style={{ padding: '64px 24px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: 3, color: theme.textMute, fontWeight: 500 }}>
            {d.getFullYear()} · {months[d.getMonth()]} · {d.getDate()}
          </div>
          <div className="serif" style={{ fontSize: 30, fontWeight: 600, letterSpacing: -0.5, marginTop: 4, color: theme.text }}>今日</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 48px 0', textAlign: 'center' }}>
        <Seal char1="诗" char2="签" theme={theme} size={60} rotate={-3}/>
        <div className="serif" style={{ fontSize: 22, color: theme.text, letterSpacing: 4, marginTop: 28, marginBottom: 12 }}>今天还没有日记</div>
        <div className="serif" style={{ fontSize: 15, color: theme.textSoft, lineHeight: 2, letterSpacing: 2 }}>
          写下今天的片段<br/>摇一摇，得一首古诗
        </div>
        <button onClick={onCompose} style={{
          marginTop: 36, height: 52, padding: '0 40px', borderRadius: 26,
          border: 'none', background: theme.text, color: theme.bg,
          fontSize: 16, fontWeight: 600, letterSpacing: 3, fontFamily: 'inherit', cursor: 'pointer',
          boxShadow: `0 8px 24px ${theme.text}33`,
        }}>开 始 写</button>
      </div>
    </Screen>
  );
}

// ─── Compose Screen (real) ────────────────────────────────────────
const MOODS_REAL = ['☕','🌙','🌸','🌊','✨','🌿','💐','😴','🥲','🎯','📖','🏃','🌳','💌','🍂'];

function ComposeReal({ theme, paper, entry, syncState, onChangePaper, onBack, onSaved }) {
  const editing = !!entry?.id;
  const [focusMode, setFocusMode] = React.useState(false);
  const [title, setTitle] = React.useState(entry?.title || '');
  const [body, setBody] = React.useState(entry?.body || '');
  const [mood, setMood] = React.useState(entry?.mood || '');
  const [flag, setFlag] = React.useState(!!entry?.flag);
  const [place, setPlace] = React.useState(entry?.place || '获取位置中…');
  const [activePaper, setActivePaper] = React.useState(entry?.paper || paper);
  const [shake, setShake] = React.useState('idle'); // idle|gen|done
  const [poem, setPoem] = React.useState(entry?.poem || null);
  const [saving, setSaving] = React.useState(false);
  const [paperOpen, setPaperOpen] = React.useState(false);
  const [err, setErr] = React.useState('');
  const [draftSavedAt, setDraftSavedAt] = React.useState('');
  const draftReady = React.useRef(false);
  const draftKey = `diary-draft:${entry?.id || 'new'}`;

  React.useEffect(() => {
    if (editing) return;
    const autoLoc = JSON.parse(localStorage.getItem('d-autoLoc') ?? 'true');
    if (!autoLoc) { setPlace('未记录地点'); return; }
    if (!navigator.geolocation) { setPlace('当前位置'); return; }
    navigator.geolocation.getCurrentPosition(
      async p => setPlace(await geocode(p.coords.latitude, p.coords.longitude)),
      () => setPlace('当前位置'),
      { timeout: 6000 }
    );
  }, [editing]);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (raw) {
        const draft = JSON.parse(raw);
        const differs = draft.title !== (entry?.title || '') || draft.body !== (entry?.body || '');
        if (differs && (draft.title?.trim() || draft.body?.trim()) && window.confirm('发现一份未完成的本地草稿，要继续写吗？')) {
          setTitle(draft.title || '');
          setBody(draft.body || '');
          setMood(draft.mood || '');
          setFlag(!!draft.flag);
          setPlace(draft.place || entry?.place || '未记录地点');
          if (window.PAPER_LIBRARY.some(item => item.id === draft.paper)) setActivePaper(draft.paper);
        }
      }
    } catch (error) {
      console.warn('读取草稿失败:', error);
    } finally {
      draftReady.current = true;
    }
  }, [draftKey]);

  React.useEffect(() => {
    if (!draftReady.current) return;
    const timer = setTimeout(() => {
      const hasContent = title.trim() || body.trim();
      if (!hasContent && !editing) {
        localStorage.removeItem(draftKey);
        setDraftSavedAt('');
        return;
      }
      localStorage.setItem(draftKey, JSON.stringify({
        title, body, mood, flag, place, paper: activePaper, savedAt: new Date().toISOString(),
      }));
      setDraftSavedAt(new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }));
    }, 650);
    return () => clearTimeout(timer);
  }, [title, body, mood, flag, place, activePaper, draftKey, editing]);

  const info = nowInfo();
  const entryInfo = editing ? {
    date: entry.date, weekday: entry.weekday, time: entry.time,
    label: `${(entry.date || '').replace(/-/g, '.')} · ${entry.weekday || ''} · ${entry.time || ''}`,
  } : info;

  const choosePaper = nextPaper => {
    setActivePaper(nextPaper);
    onChangePaper?.(nextPaper);
    setPaperOpen(false);
  };

  const doShake = async () => {
    if (!body.trim()) return;
    setShake('gen'); setErr('');
    try { const p = await apiPoem(body); setPoem(p); setShake('done'); }
    catch (e) { setErr(e.message); setShake('idle'); }
  };

  const doSave = async (poemArg) => {
    setSaving(true);
    setErr('');
    try {
      const id = await dbSaveEntry({
        ...(entry || {}),
        ...(editing ? { id: entry.id } : {}),
        date: entryInfo.date, weekday: entryInfo.weekday, time: entryInfo.time,
        place, title: title.trim(), body: body.trim(), mood, flag, paper: activePaper,
        tags: entry?.tags || [], poem: poemArg || poem || null,
        notes: entry?.notes || [], inlineNotes: entry?.inlineNotes || [],
        photos: entry?.photos || [],
      });
      localStorage.removeItem(draftKey);
      await onSaved({ id, body: body.trim(), editing });
    } catch (e) { setErr('保存失败: ' + e.message); setSaving(false); }
  };

  React.useEffect(() => {
    const handleKeyDown = event => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        if (body.trim() && !saving) doSave(null);
      }
      if (event.key === 'Escape' && focusMode) setFocusMode(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [body, saving, focusMode, title, mood, flag, place, activePaper]);

  const fakeEntry = { body, poem: poem || { title: '…', form: '五绝', lines: ['', '', '', ''] } };

  if (shake === 'gen')
    return <Shake theme={theme} state="shaking" entry={fakeEntry} onCancel={() => setShake('idle')}/>;
  if (shake === 'done' && poem)
    return <Shake theme={theme} state="done" entry={{ ...fakeEntry, poem }}
      onRegen={doShake} onAccept={() => doSave(poem)} saving={saving} error={err}/>;

  const filled = body.trim().length > 0;
  const ps = paperBg(activePaper, theme);
  const selectedPaper = window.PAPER_LIBRARY.find(item => item.id === activePaper) || window.PAPER_LIBRARY[0];
  const customPaper = activePaper.startsWith('art-');
  const paperInk = customPaper ? '#514A43' : theme.text;
  const paperSoft = customPaper ? '#625A52' : theme.textSoft;
  const paperMuted = customPaper ? '#756B61' : theme.textMute;
  const paperControl = customPaper ? 'rgba(255,253,247,.72)' : theme.surface;
  const paperControlStrong = customPaper ? 'rgba(255,253,247,.82)' : theme.surfaceSoft;
  const floatingControlShadow = customPaper ? '0 5px 16px rgba(67,55,43,.10)' : 'none';

  return (
    <div className={`compose-screen${focusMode ? ' compose-focus' : ''}`} style={{ width: W, height: H, background: theme.paper, position: 'relative', overflow: 'hidden', fontFamily: 'inherit' }}>
      <div className="compose-paper-bg" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: customPaper ? 0.82 : 1, ...ps }}/>
      {customPaper && <div className="compose-paper-veil" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'rgba(255,253,247,.34)' }}/>}
      <div className="compose-shell" style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>

        {/* top bar */}
        <div className="compose-topbar" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '60px 20px 0',
          background: customPaper ? 'linear-gradient(to bottom, rgba(255,253,247,.38), rgba(255,253,247,0))' : 'transparent',
          position: 'relative', zIndex: 2,
        }}>
          <button onClick={onBack} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 8 }}>
            <IconClose color={customPaper ? paperSoft : theme.textSoft} size={20}/>
          </button>
          <div style={{ fontSize: 12, color: customPaper ? paperSoft : theme.textSoft, fontWeight: 500 }}>{editing ? '编辑日记' : '新日记'}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button className="compose-focus-toggle" type="button" onClick={() => setFocusMode(!focusMode)} style={{ height: 28, padding: '0 11px', borderRadius: 14, background: customPaper ? 'rgba(255,253,247,.76)' : theme.surface + 'dd', border: `0.5px solid ${customPaper ? 'rgba(81,74,67,.16)' : theme.line}`, color: paperSoft, fontSize: 10.5, letterSpacing: 1.5, fontFamily: 'inherit', cursor: 'pointer' }}>
              {focusMode ? '退出专注' : '专注写作'}
            </button>
            <button type="button" onClick={() => setPaperOpen(true)} style={{ height: 28, padding: '0 10px', borderRadius: 14, background: customPaper ? 'rgba(255,253,247,.76)' : theme.surface + 'dd', border: `0.5px solid ${customPaper ? 'rgba(81,74,67,.16)' : theme.line}`, backdropFilter: customPaper ? 'blur(12px)' : 'none', display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10.5, color: paperSoft, letterSpacing: 1.5, fontFamily: 'inherit', cursor: 'pointer' }}>
              <span style={{ width: 4, height: 4, borderRadius: 2, background: theme.accent, display: 'inline-block' }}/>
              {selectedPaper.name}
            </button>
          </div>
        </div>

        {/* meta */}
        <div className="compose-meta" style={{
          padding: `${customPaper ? 26 : 14}px ${customPaper ? 52 : 28}px 18px`,
          background: 'transparent',
          margin: customPaper ? '-12px 2px 0' : 0,
          position: 'relative',
        }}>
          {customPaper && <div style={{
            position: 'absolute', inset: '-44px -24px -34px', pointerEvents: 'none',
            background: 'radial-gradient(ellipse 78% 68% at 38% 45%, rgba(255,253,247,.82) 0%, rgba(255,253,247,.54) 52%, rgba(255,253,247,.14) 76%, rgba(255,253,247,0) 100%)',
          }}/>}
          <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 12, color: paperMuted, letterSpacing: 0.3 }}>{entryInfo.label}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: paperMuted, marginTop: 5 }}>
            <IconPin color={paperMuted} size={11}/><span>{place}</span>
          </div>
          {/* mood picker */}
          <div className="no-scroll compose-moods" style={{
            marginTop: 10, display: 'flex', alignItems: 'center', gap: 6, overflowX: 'auto',
            padding: '2px 28px 4px 0',
            WebkitMaskImage: customPaper ? 'linear-gradient(to right, #000 0%, #000 88%, transparent 100%)' : 'none',
            maskImage: customPaper ? 'linear-gradient(to right, #000 0%, #000 88%, transparent 100%)' : 'none',
          }}>
            <span style={{ fontSize: 10.5, color: paperMuted, letterSpacing: 1.5, flexShrink: 0, marginRight: 2 }}>心 情</span>
            {MOODS_REAL.map(m => (
              <span key={m} onClick={() => setMood(mood === m ? '' : m)} style={{
                width: 30, height: 30, borderRadius: 15, cursor: 'pointer', flexShrink: 0,
                background: mood === m ? theme.seal + '22' : (customPaper ? 'rgba(255,253,247,.48)' : 'transparent'),
                border: mood === m ? `1.5px solid ${theme.seal}` : `0.5px solid ${customPaper ? 'rgba(81,74,67,.18)' : theme.line}`,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                boxShadow: customPaper ? '0 2px 8px rgba(70,60,50,.05)' : 'none',
                transition: 'border .12s, background .12s',
              }}>{m}</span>
            ))}
          </div>
          </div>
        </div>

        {/* title + text area */}
        <div className="compose-title" style={{ padding: `16px ${customPaper ? 52 : 28}px 0` }}>
          <input value={title} onChange={e => setTitle(e.target.value)} maxLength={80}
            placeholder="给今天起个标题（可选）"
            style={{
              width: '100%', border: 'none', borderBottom: `0.5px solid ${customPaper ? 'rgba(81,74,67,.18)' : theme.line}`,
              outline: 'none', background: 'transparent', color: paperInk,
              fontFamily: theme.fontSerif || "'Noto Serif SC', serif", fontSize: 23, fontWeight: 500,
              letterSpacing: 1.5, padding: '4px 0 10px',
            }}
          />
        </div>
        <div className="compose-body" style={{ flex: 1, padding: `14px ${customPaper ? 52 : 28}px 0`, minHeight: 0 }}>
          <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="今天，"
            style={{
              width: '100%', height: '100%', border: 'none', outline: 'none', resize: 'none',
              background: 'transparent', color: paperInk,
              fontFamily: theme.fontWriting || theme.fontSerif || "'Noto Serif SC', serif",
              fontSize: 17, lineHeight: activePaper === 'ruled' ? '34px' : (theme.writingLineHeight || 1.95), letterSpacing: theme.writingSpacing ?? 0.5,
            }}
          />
        </div>

        {err && <div className="compose-error" style={{ padding: '4px 28px', color: theme.seal, fontSize: 12 }}>{err}</div>}

        {/* bottom bar */}
        <div className="compose-actions" style={{
          padding: customPaper ? '10px 10px 20px' : '8px 16px 32px',
          margin: customPaper ? '0 10px 8px' : 0,
          borderRadius: 0,
          background: customPaper ? 'transparent' : `linear-gradient(to top, ${theme.paper} 72%, ${theme.paper}00)`,
          border: 'none',
          boxShadow: 'none',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <button onClick={() => setFlag(!flag)} style={{
              height: 34, padding: '0 12px', borderRadius: 17, border: 'none',
              background: flag ? theme.seal + '22' : paperControl,
              color: flag ? theme.seal : paperSoft,
              display: 'flex', alignItems: 'center', gap: 5, fontSize: 12,
              fontFamily: 'inherit', cursor: 'pointer',
              border: customPaper ? '0.5px solid rgba(81,74,67,.10)' : 'none',
              boxShadow: floatingControlShadow,
              backdropFilter: customPaper ? 'blur(14px)' : 'none',
            }}>
              <FlagDot theme={theme} size={10}/>里程碑
            </button>
            <div style={{ flex: 1 }}/>
            <span style={{ fontSize: 10.5, color: syncState?.error ? theme.seal : paperMuted }}>
              {!syncState?.online ? '离线待同步' : syncState?.pending ? '同步中…' : draftSavedAt ? `草稿 ${draftSavedAt}` : ''}
            </span>
            <span style={{ fontSize: 11, color: paperMuted }}>{body.length > 0 ? body.length + ' 字' : ''}</span>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => doSave(null)} disabled={!filled || saving} style={{
              width: '100%', height: 48, borderRadius: 24, border: 'none',
              background: filled && !saving ? paperInk : paperControlStrong,
              color: filled && !saving ? (customPaper ? '#FFFDF7' : theme.bg) : paperMuted,
              fontSize: 15, fontWeight: 600, letterSpacing: 3,
              fontFamily: 'inherit', cursor: filled && !saving ? 'pointer' : 'default',
              boxShadow: filled && !saving && customPaper ? '0 8px 22px rgba(67,55,43,.22)' : floatingControlShadow,
              backdropFilter: customPaper ? 'blur(14px)' : 'none',
            }}>{saving ? '保存中…' : editing ? '保 存 修 改' : '保 存 日 记'}</button>
          </div>
        </div>
      </div>
      {paperOpen && (
        <div onClick={() => setPaperOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(20,25,22,.36)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div className="paper-picker-sheet" onClick={event => event.stopPropagation()} style={{ width: '100%', maxWidth: W, maxHeight: '72vh', background: theme.bg, borderRadius: '24px 24px 0 0', padding: '20px 16px 34px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 6px 14px' }}>
              <div>
                <div className="serif" style={{ fontSize: 19, color: theme.text, letterSpacing: 3 }}>选 择 信 纸</div>
                <div style={{ fontSize: 11, color: theme.textMute, marginTop: 4 }}>基础纹样、插画与新信纸</div>
              </div>
              <button type="button" aria-label="关闭信纸选择器" onClick={() => setPaperOpen(false)} style={{ border: 'none', background: 'transparent', padding: 6, cursor: 'pointer' }}>
                <IconClose color={theme.textSoft} size={18}/>
              </button>
            </div>
            <div className="no-scroll" style={{ overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, padding: '2px 4px 12px' }}>
              {window.PAPER_LIBRARY.map(item => {
                const active = item.id === activePaper;
                const previewStyle = item.thumb
                  ? { backgroundImage: `url("${item.thumb}")`, backgroundSize: '100% 100%', backgroundPosition: 'center' }
                  : paperBg(item.id, theme);
                return (
                  <button type="button" key={item.id} onClick={() => choosePaper(item.id)} style={{
                    border: active ? `2px solid ${theme.accent}` : `0.5px solid ${theme.line}`,
                    background: active ? theme.surface : 'transparent', borderRadius: 13,
                    padding: 5, cursor: 'pointer', fontFamily: 'inherit',
                  }}>
                    <div style={{ height: 116, borderRadius: 9, backgroundColor: theme.paper, overflow: 'hidden', ...previewStyle }}/>
                    <div style={{ marginTop: 6, fontSize: 11, color: active ? theme.text : theme.textSoft, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SavedEntryNext({ theme, entry, onGenerateQuotes, onShake, onOpen, onDone }) {
  const [quoteBusy, setQuoteBusy] = React.useState(false);
  const generateQuotes = async () => {
    if (!onGenerateQuotes || quoteBusy) return;
    setQuoteBusy(true);
    try { await onGenerateQuotes(); }
    finally { setQuoteBusy(false); }
  };
  return (
    <Screen theme={theme} noTab>
      <div style={{ minHeight: '100%', padding: '96px 26px 44px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ fontSize: 10.5, letterSpacing: 4, color: theme.textMute, fontWeight: 600 }}>今 日 已 记 下</div>
        <div className="serif" style={{ marginTop: 12, fontSize: 32, lineHeight: 1.35, color: theme.text, letterSpacing: 2 }}>
          日记保存好了
        </div>
        <div style={{ marginTop: 12, color: theme.textSoft, fontSize: 13.5, lineHeight: 1.8 }}>
          先让文字安静地留下，再决定要不要继续。
        </div>

        <div className="theme-saved-card" style={{ marginTop: 34, padding: '20px 18px', borderRadius: 20, background: theme.paper, border: `0.5px solid ${theme.line}` }}>
          <div className="serif" style={{ color: theme.text, fontSize: 18, lineHeight: 1.6 }}>
            {entry?.title || entry?.body?.slice(0, 32) || '今日的日记'}
          </div>
          <div style={{ marginTop: 8, color: theme.textMute, fontSize: 11.5 }}>
            {entry?.date?.replace(/-/g, '.')} · {entry?.body?.length || 0} 字
          </div>
        </div>

        <div style={{ marginTop: 24, display: 'grid', gap: 10 }}>
          <button type="button" onClick={onShake} style={{
            height: 50, borderRadius: 25, border: 'none', background: theme.text, color: theme.bg,
            fontFamily: 'inherit', fontSize: 14, fontWeight: 600, letterSpacing: 2, cursor: 'pointer',
          }}>摇 签 选 诗</button>
          <button type="button" disabled={quoteBusy || !onGenerateQuotes} onClick={generateQuotes} style={{
            height: 48, borderRadius: 24, border: `1px solid ${theme.accent}`, background: 'transparent', color: theme.accent,
            fontFamily: 'inherit', fontSize: 13.5, letterSpacing: 1.5, cursor: quoteBusy ? 'default' : 'pointer',
          }}>{quoteBusy ? '正在认真拾句…' : '让 AI 拾句'}</button>
          <button type="button" onClick={onOpen} style={{
            height: 46, borderRadius: 23, border: `0.5px solid ${theme.line}`, background: theme.surface, color: theme.textSoft,
            fontFamily: 'inherit', fontSize: 13, cursor: 'pointer',
          }}>查看这篇日记</button>
          <button type="button" onClick={onDone} style={{
            height: 42, border: 'none', background: 'transparent', color: theme.textMute, fontFamily: 'inherit', fontSize: 12.5, cursor: 'pointer',
          }}>就到这里</button>
        </div>
      </div>
    </Screen>
  );
}

// ─── NewHexagram ────────────────────────────────────────────────
const HEXAGRAM_BY_TRIGRAMS = {
  '7:7':'乾', '7:3':'履', '7:5':'同人', '7:1':'无妄', '7:6':'姤', '7:2':'讼', '7:4':'遯', '7:0':'否',
  '3:7':'夬', '3:3':'兑', '3:5':'革', '3:1':'随', '3:6':'大过', '3:2':'困', '3:4':'咸', '3:0':'萃',
  '5:7':'大有', '5:3':'睽', '5:5':'离', '5:1':'噬嗑', '5:6':'鼎', '5:2':'未济', '5:4':'旅', '5:0':'晋',
  '1:7':'大壮', '1:3':'归妹', '1:5':'丰', '1:1':'震', '1:6':'恒', '1:2':'解', '1:4':'小过', '1:0':'豫',
  '6:7':'小畜', '6:3':'中孚', '6:5':'家人', '6:1':'益', '6:6':'巽', '6:2':'涣', '6:4':'渐', '6:0':'观',
  '2:7':'需', '2:3':'节', '2:5':'既济', '2:1':'屯', '2:6':'井', '2:2':'坎', '2:4':'蹇', '2:0':'比',
  '4:7':'大畜', '4:3':'损', '4:5':'贲', '4:1':'颐', '4:6':'蛊', '4:2':'蒙', '4:4':'艮', '4:0':'剥',
  '0:7':'泰', '0:3':'临', '0:5':'明夷', '0:1':'复', '0:6':'升', '0:2':'师', '0:4':'谦', '0:0':'坤',
};
function trigramValue(lines) {
  return lines.reduce((sum, line, i) => sum + (line?.type === 'yang' ? 1 : 0) * Math.pow(2, i), 0);
}
function hexNameFor(lines) {
  const lower = trigramValue(lines.slice(0, 3));
  const upper = trigramValue(lines.slice(3, 6));
  return HEXAGRAM_BY_TRIGRAMS[`${upper}:${lower}`] || '未定';
}
const TRIGRAM_NAME_BY_VALUE = { 7:'乾', 3:'兑', 5:'离', 1:'震', 6:'巽', 2:'坎', 4:'艮', 0:'坤' };
function trigramNamesFor(lines) {
  return {
    lower: TRIGRAM_NAME_BY_VALUE[trigramValue(lines.slice(0, 3))] || '未定',
    upper: TRIGRAM_NAME_BY_VALUE[trigramValue(lines.slice(3, 6))] || '未定',
  };
}

async function apiHexagram(question, hexName, lines, context = {}) {
  const token = await firebase.auth().currentUser?.getIdToken();
  const r = await fetch('/api/hexagram', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ question, hexName, lines, ...context }),
  });
  const text = await r.text();
  let d;
  try { d = text ? JSON.parse(text) : {}; }
  catch {
    throw new Error(`解签服务返回了非 JSON 内容（HTTP ${r.status}）。请检查 Vercel Functions 部署和日志。`);
  }
  if (!r.ok) throw new Error(d.error || 'AI解签失败');
  if (!d.interpretation) throw new Error('AI 解签返回内容为空');
  return d.interpretation;
}

// Render one yao line — tap to toggle yin/yang, [动] button for changing
function YaoRow({ line, idx, theme, onChange }) {
  const names = ['初','二','三','四','五','上'];
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 0', borderBottom:`0.5px solid ${theme.line}`, cursor:'pointer' }}>
      <span className="serif" style={{ width:28, fontSize:12, color:theme.textMute, flexShrink:0, textAlign:'right' }}>
        {names[idx]}爻
      </span>
      <div onClick={() => onChange('type')} style={{ flex:1, display:'flex', alignItems:'center', gap:8, padding:'4px 0' }}>
        {line.type==='yang' ? (
          <div style={{ flex:1, height:6, borderRadius:3,
            background: line.changing ? theme.seal : theme.text }}/>
        ) : (
          <>
            <div style={{ flex:1, height:6, borderRadius:3,
              background: line.changing ? theme.seal : theme.text }}/>
            <div style={{ flex:1, height:6, borderRadius:3,
              background: line.changing ? theme.seal : theme.text }}/>
          </>
        )}
      </div>
      <span style={{ fontSize:11, color:theme.textMute, width:24, flexShrink:0, textAlign:'center' }}>
        {line.type==='yang' ? '阳' : '阴'}
      </span>
      <button onClick={() => onChange('changing')} style={{
        height:26, padding:'0 8px', borderRadius:13, border:'none', flexShrink:0,
        background: line.changing ? theme.seal+'22' : theme.surface,
        color: line.changing ? theme.seal : theme.textMute,
        fontSize:11, cursor:'pointer', letterSpacing:1,
        outline: line.changing ? `1px solid ${theme.seal}88` : 'none',
      }}>动</button>
    </div>
  );
}

function NewHexagram({ theme, initialQuestion = '', entryId = '', diaryContext = '', parentHexId = '', rootHexId = '', parentContext = '', onBack, onSaved }) {
  const [question, setQuestion] = React.useState(initialQuestion);
  const [mood, setMood] = React.useState('');
  const [lines, setLines] = React.useState(Array(6).fill(null).map(() => ({ type:'yang', changing:false })));
  const [step, setStep] = React.useState('setup'); // setup | loading | done
  const [interp, setInterp] = React.useState('');
  const [err, setErr] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  const hexName = React.useMemo(() => hexNameFor(lines), [JSON.stringify(lines)]);
  const changedHexName = React.useMemo(() => hexNameFor(lines.map(line => ({
    ...line,
    type: line.changing ? (line.type === 'yang' ? 'yin' : 'yang') : line.type,
  }))), [JSON.stringify(lines)]);
  const trigrams = React.useMemo(() => trigramNamesFor(lines), [JSON.stringify(lines)]);

  const changeLine = (i, field) => setLines(prev =>
    prev.map((l,idx) => idx===i ? {...l, [field]: field==='type'?(l.type==='yang'?'yin':'yang'):!l.changing} : l)
  );

  const doInterpret = async () => {
    if (!question.trim()) { setErr('请先写下问题'); return; }
    setStep('loading'); setErr('');
    try {
      const result = await apiHexagram(question.trim(), hexName, lines, {
        changedHexName, diaryContext, trigrams,
        mode: parentHexId ? 'linked-reading' : 'reading',
        parentContext,
      });
      setInterp(result); setStep('done');
    } catch(e) { setErr(e.message); setStep('setup'); }
  };

  const doSave = async () => {
    setSaving(true);
    try {
      const info = nowInfo();
      await onSaved({
        date:info.date, time:info.time, question:question.trim(), name:hexName,
        changedHexName, trigrams, lines, interp, mood, entryId, diaryContext,
        parentHexId, rootHexId: rootHexId || parentHexId || '', followUps: [],
      });
    } catch(e) { setErr('保存失败：' + e.message); setSaving(false); }
  };

  return (
    <div style={{ width:W, height:H, background:theme.paper, display:'flex', flexDirection:'column', overflow:'hidden' }}>
      {/* top bar */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'58px 20px 0', flexShrink:0 }}>
        <button onClick={onBack} style={{ border:'none', background:'transparent', cursor:'pointer', padding:8 }}>
          <IconClose color={theme.textSoft} size={20}/>
        </button>
        <div className="serif" style={{ fontSize:15, color:theme.text, letterSpacing:3 }}>起 一 卦</div>
        <div style={{ width:36 }}/>
      </div>

      <div className="no-scroll" style={{ flex:1, overflowY:'auto', padding:'18px 26px 140px' }}>

        {/* question */}
        <div style={{ fontSize:10, letterSpacing:4, color:theme.textMute, fontWeight:600, marginBottom:8 }}>今 日 疑 问</div>
        <textarea value={question} onChange={e=>setQuestion(e.target.value)} disabled={step!=='setup'}
          placeholder="心里有什么想问的……"
          style={{ width:'100%', height:76, border:`0.5px solid ${theme.line}`, borderRadius:14,
            background:theme.surface, padding:'11px 14px', fontSize:15, color:theme.text,
            fontFamily:"'Noto Serif SC',serif", resize:'none', outline:'none', letterSpacing:0.5, lineHeight:1.7 }}
        />

        {/* mood */}
        <div style={{ display:'flex', alignItems:'center', gap:6, margin:'12px 0 20px', flexWrap:'wrap' }}>
          <span style={{ fontSize:10.5, color:theme.textMute, letterSpacing:1.5 }}>心情</span>
          {['焦虑','犹豫','平静','期待','低落','迷茫'].map(m=>(
            <span key={m} onClick={()=>setMood(mood===m?'':m)} style={{
              padding:'4px 10px', borderRadius:12, fontSize:12, cursor:'pointer',
              background:mood===m?theme.seal+'22':theme.surface,
              color:mood===m?theme.seal:theme.textSoft,
              border:`0.5px solid ${mood===m?theme.seal+'88':theme.line}`,
            }}>{m}</span>
          ))}
        </div>

        {/* hexagram setup */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
          <div style={{ fontSize:10, letterSpacing:4, color:theme.textMute, fontWeight:600 }}>设 爻</div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <HexagramGlyph lines={lines} color={theme.text} size="sm"/>
            <div className="serif" style={{ fontSize:16, color:theme.text, letterSpacing:3, fontWeight:500 }}>{hexName}</div>
          </div>
        </div>
        <div style={{ fontSize:11, color:theme.textMute, marginBottom:10 }}>点击横线切换阴阳 · 点「动」标记动爻（上爻在上）</div>

        {/* lines: show top-to-bottom = index 5 down to 0 */}
        <div style={{ background:theme.surface, borderRadius:16, padding:'4px 16px', border:`0.5px solid ${theme.line}` }}>
          {[5,4,3,2,1,0].map(i => (
            <YaoRow key={i} line={lines[i]} idx={i} theme={theme}
              onChange={(field) => step==='setup' && changeLine(i, field)}/>
          ))}
        </div>

        {/* AI result */}
        {step==='done' && interp && (
          <div style={{ marginTop:20, padding:'18px 18px', background:theme.paper, borderRadius:16, border:`0.5px solid ${theme.line}` }}>
            <div style={{ fontSize:10, letterSpacing:4, color:theme.textMute, fontWeight:600, marginBottom:12 }}>AI 解 签</div>
            {interp.split(/\n/).filter(Boolean).map((ln, i) => (
              <div key={i} className="serif" style={{
                fontSize:14.5, color: ln.startsWith('【') ? theme.seal : theme.text,
                lineHeight:1.9, letterSpacing:0.5,
                fontWeight: ln.startsWith('【') ? 600 : 400,
                marginBottom: ln.startsWith('【') ? 2 : 8,
              }}>{ln}</div>
            ))}
          </div>
        )}

        {err && <div style={{ marginTop:10, color:theme.seal, fontSize:12 }}>{err}</div>}
      </div>

      {/* bottom actions */}
      <div style={{ position:'absolute', left:0, right:0, bottom:0, padding:'12px 24px 38px',
        background:`linear-gradient(to top, ${theme.paper} 72%, transparent)` }}>
        {step==='setup' && (
          <button onClick={doInterpret} disabled={!question.trim()} style={{
            width:'100%', height:50, borderRadius:25, border:'none',
            background: question.trim() ? theme.seal : theme.surfaceSoft,
            color: question.trim() ? '#fff' : theme.textMute,
            fontSize:16, fontWeight:600, letterSpacing:3, fontFamily:"'Noto Serif SC',serif",
            cursor: question.trim() ? 'pointer' : 'default',
            boxShadow: question.trim() ? `0 8px 24px ${theme.seal}44` : 'none',
          }}>求 AI 解 签</button>
        )}
        {step==='loading' && (
          <div style={{ textAlign:'center', padding:'12px 0' }}>
            <div className="serif" style={{ fontSize:14, color:theme.textSoft, letterSpacing:3 }}>正在解卦…</div>
          </div>
        )}
        {step==='done' && (
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={() => { setStep('setup'); setInterp(''); setLines(Array(6).fill(null).map(()=>({type:'yang',changing:false}))); }} style={{
              flex:1, height:50, borderRadius:25, border:`0.5px solid ${theme.line}`,
              background:'transparent', color:theme.textSoft,
              fontSize:14, fontFamily:'inherit', cursor:'pointer', letterSpacing:1,
            }}>换一卦</button>
            <button onClick={doSave} disabled={saving} style={{
              flex:1.4, height:50, borderRadius:25, border:'none',
              background: saving ? theme.surfaceSoft : theme.text,
              color: saving ? theme.textMute : theme.bg,
              fontSize:15, fontWeight:600, letterSpacing:3, fontFamily:'inherit',
              cursor: saving ? 'default' : 'pointer',
            }}>{saving?'保存中…':'存 此 一 卦'}</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main App ──────────────────────────────────────────────────────
function GuardedNewHexagram({ theme, params, parentHex, onBack, onSaved }) {
  const [unlocked, setUnlocked] = React.useState(false);
  const now = new Date();
  const hour = now.getHours();
  const isZiHour = hour === 23 || hour === 0;
  const isWuHour = hour === 11 || hour === 12;
  const parentTime = parentHex
    ? Date.parse(parentHex.createdAt || `${parentHex.date || ''}T${parentHex.time || '00:00'}`)
    : NaN;
  const unlockAt = Number.isFinite(parentTime) ? new Date(parentTime + 3 * 24 * 60 * 60 * 1000) : null;
  const cooling = !!parentHex && !!unlockAt && now < unlockAt;
  const needsGate = !unlocked && (cooling || isZiHour || isWuHour);

  if (needsGate) {
    const timeReason = isZiHour ? '现在是子时（23:00–01:00）' : isWuHour ? '现在是午时（11:00–13:00）' : '';
    return (
      <div style={{ width: W, height: H, background: theme.paper, padding: '76px 28px 36px', display: 'flex', flexDirection: 'column' }}>
        <button type="button" onClick={onBack} style={{ alignSelf: 'flex-start', border: 'none', background: 'transparent', color: theme.textSoft, fontFamily: 'inherit', cursor: 'pointer', padding: 0 }}>返回</button>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="serif" style={{ color: theme.text, fontSize: 30, letterSpacing: 5 }}>静候，再问</div>
          <div style={{ width: 34, height: 1, background: theme.accent, margin: '22px 0' }}/>
          {cooling && <div style={{ color: theme.text, fontSize: 15, lineHeight: 1.9, marginBottom: 14 }}>
            这是对「{parentHex.question || '上一卦'}」的再次起卦。应用建议同一问卦链先静候 3 天，再观察事情是否已有变化。
          </div>}
          {timeReason && <div style={{ color: theme.text, fontSize: 15, lineHeight: 1.9, marginBottom: 14 }}>
            {timeReason}。部分流派会避开子时、午时起卦；这不是统一规则，应用仅作提醒。
          </div>}
          {cooling && unlockAt && <div style={{ color: theme.textMute, fontSize: 12, lineHeight: 1.8 }}>
            建议解锁时间：{unlockAt.toLocaleString('zh-CN', { hour12: false })}
          </div>}
          <div style={{ color: theme.textMute, fontSize: 11.5, lineHeight: 1.8, marginTop: 18 }}>
            “初筮告，再三渎，渎则不告”强调避免因焦虑而反复求同一答案；3 天是本应用的反思期设置，并非所有传统的固定天数。
          </div>
        </div>
        <button type="button" onClick={() => setUnlocked(true)} style={{ height: 50, borderRadius: 25, border: 'none', background: theme.text, color: theme.bg, fontFamily: 'inherit', fontSize: 15, letterSpacing: 2, cursor: 'pointer' }}>我已想清楚，仍然起卦</button>
      </div>
    );
  }

  return <NewHexagram theme={theme} initialQuestion={params.question || ''} entryId={params.entryId || ''}
    diaryContext={params.diaryContext || ''} parentHexId={params.parentHexId || ''} rootHexId={params.rootHexId || ''}
    parentContext={params.parentContext || ''} onBack={onBack} onSaved={onSaved}/>;
}

function AutoPoemShake({ theme, entry, onBack, onAccepted }) {
  const [state, setState] = React.useState('ready');
  const [result, setResult] = React.useState(null);
  const [error, setError] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const running = React.useRef(false);

  const generate = React.useCallback(async () => {
    if (running.current) return;
    running.current = true;
    setState('shaking'); setError('');
    try {
      const generated = await apiPoem(entry.body);
      setResult(generated);
      setState('done');
    } catch (err) {
      setError(err.message || '摇签失败');
      setState('ready');
    } finally {
      running.current = false;
    }
  }, [entry.body]);

  React.useEffect(() => {
    let last = 0;
    const onMotion = event => {
      if (state !== 'ready') return;
      const a = event.accelerationIncludingGravity;
      if (!a) return;
      const force = Math.abs(a.x || 0) + Math.abs(a.y || 0) + Math.abs(a.z || 0);
      const now = Date.now();
      if (force > 28 && now - last > 1200) { last = now; generate(); }
    };
    window.addEventListener('devicemotion', onMotion);
    return () => window.removeEventListener('devicemotion', onMotion);
  }, [state, generate]);

  const displayEntry = {
    ...entry,
    poem: result ? { title: result.title, form: result.form, lines: result.lines } : { title: '待落', form: '', lines: ['', '', '', ''] },
    sign: result ? {
      title: result.signTitle,
      motif: result.motif,
      judgmentLines: result.judgmentLines,
      interpretation: result.interpretation,
      timelineLine: result.timelineLine,
    } : null,
  };

  const accept = async () => {
    if (!result) return;
    setSaving(true);
    try {
      await onAccepted({
        poem: displayEntry.poem,
        sign: displayEntry.sign,
        quoteSuggestions: result.quoteSuggestions || [],
        poemCollected: true,
      });
    } catch (err) {
      setError(err.message || '收入失败');
      setSaving(false);
    }
  };

  return <Shake theme={theme} state={state} entry={displayEntry} onCancel={onBack}
    onShake={generate} onRegen={() => { setResult(null); setState('ready'); }}
    onAccept={accept} saving={saving} error={error}/>;
}

function AppReal() {
  const [authState, setAuthState] = React.useState('loading');
  const [entries, setEntries] = React.useState([]);
  const [hexagrams, setHexagrams] = React.useState([]);
  const [stack, setStack] = React.useState([{ screen: 'home', params: {} }]);
  const [themeKey, setThemeKey_] = React.useState(() => {
    const saved = localStorage.getItem('diary-theme') || 'celadon';
    return window.THEMES[saved] ? saved : 'celadon';
  });
  const [paper, setPaper_] = React.useState(
    () => {
      const saved = localStorage.getItem('diary-paper') || 'plain';
      return window.PAPER_LIBRARY.some(item => item.id === saved) ? saved : 'plain';
    }
  );
  const [startLoading, setStartLoading] = React.useState(false);
  const [syncState, setSyncState] = React.useState(() => syncSnapshot());

  const theme = window.THEMES[themeKey] || window.THEMES.celadon;
  const setThemeKey = k => { localStorage.setItem('diary-theme', k); setThemeKey_(k); };
  const setPaper = k => { localStorage.setItem('diary-paper', k); setPaper_(k); };

  React.useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = themeKey;
    root.dataset.diaryTheme = themeKey;
    root.style.setProperty('--theme-body-font', theme.fontBody || "'Noto Sans SC', sans-serif");
    root.style.setProperty('--theme-serif-font', theme.fontSerif || "'Noto Serif SC', serif");
    root.style.setProperty('--theme-writing-font', theme.fontWriting || theme.fontSerif || "'Noto Serif SC', serif");
  }, [themeKey, theme.fontBody, theme.fontSerif, theme.fontWriting]);

  const push = (s, p = {}) => setStack(st => [...st, { screen: s, params: p }]);
  const pop  = () => setStack(st => st.length > 1 ? st.slice(0, -1) : st);
  const reset = s => setStack([{ screen: s, params: {} }]);
  const replace = (s, p = {}) => setStack(st => [...st.slice(0, -1), { screen: s, params: p }]);

  const tabHandler = t => t === 'compose' ? push('compose') : reset(t);

  const refresh = async () => { const e = await dbGetEntries(); setEntries(e); return e; };

  const updateEntry = async (id, patch) => {
    const current = entries.find(e => e.id === id);
    if (!current) throw new Error('找不到这篇日记');
    await dbSaveEntry({ ...current, ...patch, id });
    await refresh();
  };

  const deleteEntry = async (id) => {
    await dbDeleteEntry(id);
    await refresh();
  };

  const importData = async data => {
    await dbImportEntries(data.entries || []);
    await dbImportHexagrams(data.hexagrams || []);
    await refresh();
    setHexagrams(await dbGetHexagrams());
  };

  const clearAllData = async () => {
    await dbClearAllData();
    await refresh();
    setHexagrams([]);
  };

  React.useEffect(() => firebase.auth().onAuthStateChanged(u => {
    if (u) {
      setAuthState('auth');
      dbGetEntries().then(setEntries);
      dbGetHexagrams().then(setHexagrams);
    } else {
      setAuthState('welcome');
    }
  }), []);

  React.useEffect(() => {
    const update = event => setSyncState(event.detail || syncSnapshot());
    window.addEventListener(SYNC_EVENT, update);
    return () => window.removeEventListener(SYNC_EVENT, update);
  }, []);


  const handleSignOut = async () => {
    if (!window.confirm('当前是匿名账号。退出后将生成新的匿名身份，可能无法再访问旧数据。确定仍要退出吗？')) return;
    await firebase.auth().signOut();
    setEntries([]); setHexagrams([]); setStack([{ screen: 'home', params: {} }]);
  };

  if (authState === 'loading') return <SplashScreen theme={theme}/>;
  const handleStart = async () => {
    setStartLoading(true);
    try { await firebase.auth().signInAnonymously(); }
    catch (e) { alert('请先在 Firebase Console → Authentication 开启 Anonymous 匿名登录'); setStartLoading(false); }
  };

  if (authState === 'welcome') return <WelcomeScreen theme={theme} onStart={handleStart} loading={startLoading}/>;

  const { screen, params } = stack[stack.length - 1];

  // Guard: no entries yet
  if (screen === 'home' && entries.length === 0)
    return <EmptyHomeScreen theme={theme} onCompose={() => push('compose')} onTab={tabHandler}/>;

  const entryById = id => entries.find(e => e.id === id);

  switch (screen) {
    case 'home':
      return (
        <Home theme={theme} entries={entries} drafts={[]}
          poemLayout="horizontal" density="sparse"
          onOpen={id => push('detail', { id })}
          onCompose={() => push('compose')}
          onSearch={() => push('search')}
          onTab={tabHandler}
        />
      );

    case 'compose':
      return (
        <ComposeReal theme={theme} paper={paper} syncState={syncState} onChangePaper={setPaper} onBack={pop}
          onSaved={async ({ id } = {}) => {
            await refresh();
            if (id) replace('saved', { id });
          }}
        />
      );

    case 'edit': {
      const entry = entryById(params.id);
      if (!entry) { pop(); return null; }
      return (
        <ComposeReal theme={theme} paper={paper} entry={entry} syncState={syncState} onChangePaper={setPaper} onBack={pop}
          onSaved={async () => {
            await refresh();
            pop();
          }}
        />
      );
    }

    case 'saved': {
      const entry = entryById(params.id);
      if (!entry) { reset('home'); return null; }
      return <SavedEntryNext theme={theme} entry={entry}
        onShake={() => replace('shake', { id: entry.id })}
        onOpen={() => replace('detail', { id: entry.id })}
        onDone={() => reset('home')}
        onGenerateQuotes={entry.body?.trim() ? async () => {
          const result = await apiPoem(entry.body);
          await updateEntry(entry.id, { quoteSuggestions: result.quoteSuggestions || [] });
          replace('detail', { id: entry.id });
        } : null}
      />;
    }

    case 'detail': {
      const entry = entryById(params.id);
      if (!entry) { pop(); return null; }
      return <Detail theme={theme} entry={entry} onBack={pop}
        onEdit={() => push('edit', { id: entry.id })}
        onToggleFlag={() => updateEntry(entry.id, { flag: !entry.flag })}
        onAddNote={text => updateEntry(entry.id, {
          notes: [...(entry.notes || []), { date: new Date().toLocaleString('zh-CN', { hour12: false }), text }],
        })}
        onGeneratePoem={entry.body?.trim() ? async () => {
          push('shake', { id: entry.id });
        } : null}
        onCollectQuote={quote => updateEntry(entry.id, {
          collectedQuotes: Array.from(new Set([...(entry.collectedQuotes || []), quote])),
        })}
        onRejectQuote={quote => updateEntry(entry.id, {
          quoteSuggestions: (entry.quoteSuggestions || []).filter(item => item.quote !== quote),
          rejectedQuotes: Array.from(new Set([...(entry.rejectedQuotes || []), quote])),
        })}
        onGenerateQuotes={entry.body?.trim() ? async () => {
          const result = await apiPoem(entry.body);
          const rejected = new Set(entry.rejectedQuotes || []);
          await updateEntry(entry.id, {
            quoteSuggestions: (result.quoteSuggestions || []).filter(item => !rejected.has(item.quote)),
          });
        } : null}
        linkedHexagrams={hexagrams.filter(hex => hex.entryId === entry.id)}
        onStartHexagram={() => push('newhex', { entryId: entry.id, diaryContext: entry.body })}
        onDelete={async () => { await deleteEntry(entry.id); pop(); }}
      />;
    }

    case 'shake': {
      const entry = entryById(params.id);
      if (!entry) { pop(); return null; }
      return <AutoPoemShake theme={theme} entry={entry} onBack={pop} onAccepted={async patch => {
        await updateEntry(entry.id, patch);
        pop();
      }}/>;
    }

    case 'search':
      return (
        <EnhancedSearch theme={theme} entries={entries} onClose={pop}
          onOpen={id => { pop(); push('detail', { id }); }}
        />
      );

    case 'timeline':
      return (
        <Timeline theme={theme} entries={entries}
          onOpen={id => push('detail', { id })}
          onTab={tabHandler}
        />
      );

    case 'hex':
      return <EnhancedHexagrams theme={theme} hexes={hexagrams} onAnalyze={apiQuestion} onNew={() => push('newhex', {})} onFollowUp={hex => push('newhex', {
        parentHexId: hex.id,
        rootHexId: hex.rootHexId || hex.id,
        entryId: hex.entryId || '',
        diaryContext: hex.diaryContext || '',
        question: `关于「${hex.question || '上一卦'}」，我想进一步问：`,
        parentContext: `原问题：${hex.question || ''}\n原卦：${hex.name || '未定'}${hex.changedHexName ? ` → ${hex.changedHexName}` : ''}\n原解签：${hex.interp || ''}`,
      })} onTab={tabHandler}/>;

    case 'settings':
      return (
        <Settings theme={theme} currentThemeKey={themeKey}
          onChangeTheme={setThemeKey}
          entriesCount={entries.length}
          entries={entries}
          hexagrams={hexagrams}
          buildLabel={APP_BUILD}
          syncState={syncState}
          onImportData={importData}
          onClearData={clearAllData}
          onSignOut={handleSignOut}
          onTab={tabHandler}
        />
      );

    case 'newhex':
      return <GuardedNewHexagram theme={theme} params={params} parentHex={hexagrams.find(hex => hex.id === params.parentHexId)} onBack={pop} onSaved={async (hex) => {
        await dbSaveHexagram(hex); const h = await dbGetHexagrams(); setHexagrams(h); pop();
      }}/>;

    default:
      return (
        <EmptyHomeScreen theme={theme} onCompose={() => push('compose')} onTab={tabHandler}/>
      );
  }
}

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error('应用运行错误:', error, info);
  }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{ width: W, minHeight: H, padding: '80px 28px', background: '#fff7f3', color: '#5b3028', fontFamily: 'sans-serif' }}>
        <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 14 }}>页面运行出错</div>
        <div style={{ fontSize: 13, lineHeight: 1.7, wordBreak: 'break-word' }}>{this.state.error.message}</div>
        <div style={{ fontSize: 11, marginTop: 12, opacity: .65 }}>版本 {APP_BUILD}</div>
        <button onClick={() => location.reload()} style={{ marginTop: 24, height: 44, padding: '0 22px', border: 0, borderRadius: 22, background: '#5b3028', color: '#fff' }}>重新加载</button>
      </div>
    );
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(<AppErrorBoundary><AppReal/></AppErrorBoundary>);
