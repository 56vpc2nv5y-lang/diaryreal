// app-real.jsx — Real diary app: Firebase auth + Firestore + DeepSeek

const APP_BUILD = '2026.06.19-r64';

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

function normalizePoemRecord(poem) {
  if (!poem || typeof poem.title !== 'string' || !Array.isArray(poem.lines)) return null;
  const isSonnet = poem.style === 'en-sonnet' || poem.form === 'sonnet' || poem.lines.length > 4;
  const limit = isSonnet ? 14 : 4;
  const lines = poem.lines.map(String).filter(Boolean).slice(0, limit);
  if (lines.length !== limit) return null;
  return {
    title: String(poem.title || (isSonnet ? 'Untitled' : '未题')).slice(0, isSonnet ? 48 : 12),
    form: String(poem.form || (isSonnet ? 'sonnet' : '五绝')).slice(0, 16),
    style: isSonnet ? 'en-sonnet' : 'zh-classical',
    lines,
  };
}

function normalizeSignRecord(sign, style = '', poem = null) {
  if (!sign || typeof sign !== 'object') return null;
  const isSonnet = style === 'en-sonnet' || sign.style === 'en-sonnet';
  const poemTexts = [poem?.title, ...(Array.isArray(poem?.lines) ? poem.lines : [])].filter(Boolean);
  const judgmentLines = Array.isArray(sign.judgmentLines)
    ? (isSonnet ? [] : sign.judgmentLines
      .map(String)
      .filter(Boolean)
      .filter(line => !poemTexts.some(poemText => isNearDuplicateText(line, poemText)))
      .slice(0, 1))
    : [];
  const rawTitle = typeof sign.title === 'string' ? sign.title.slice(0, isSonnet ? 40 : 8) : '';
  const title = poemTexts.some(poemText => isNearDuplicateText(rawTitle, poemText)) ? '' : rawTitle;
  if (!title && !judgmentLines.length && !sign.interpretation && !sign.timelineLine) return null;
  return {
    title,
    style: isSonnet ? 'en-sonnet' : 'zh-classical',
    motif: typeof sign.motif === 'string' ? sign.motif.slice(0, isSonnet ? 60 : 30) : '',
    judgmentLines,
    interpretation: typeof sign.interpretation === 'string' ? sign.interpretation.slice(0, 600) : '',
    timelineLine: typeof sign.timelineLine === 'string' ? sign.timelineLine.slice(0, isSonnet ? 80 : 32) : '',
  };
}

function normalizeQuoteSuggestions(items) {
  return Array.isArray(items)
    ? items.filter(item => item && typeof item.quote === 'string').slice(0, 3)
    : [];
}

function normalizePoemVariants(data) {
  const variants = {};
  const source = data?.poemVariants && typeof data.poemVariants === 'object' ? data.poemVariants : {};
  for (const key of ['zh-classical', 'en-sonnet']) {
    const raw = source[key];
    const poem = normalizePoemRecord(raw?.poem);
    if (!poem) continue;
    variants[key] = {
      poem,
      sign: normalizeSignRecord(raw?.sign, key, poem),
      quoteSuggestions: normalizeQuoteSuggestions(raw?.quoteSuggestions),
      poemCollected: raw?.poemCollected !== false,
      generatedAt: typeof raw?.generatedAt === 'string' ? raw.generatedAt : '',
    };
  }
  const legacyPoem = normalizePoemRecord(data?.poem);
  if (legacyPoem && !variants[legacyPoem.style]) {
    variants[legacyPoem.style] = {
      poem: legacyPoem,
      sign: normalizeSignRecord(data?.sign, legacyPoem.style, legacyPoem),
      quoteSuggestions: normalizeQuoteSuggestions(data?.quoteSuggestions),
      poemCollected: data?.poemCollected !== false,
      generatedAt: typeof data?.updatedAt === 'string' ? data.updatedAt : '',
    };
  }
  return variants;
}

function normalizeEntry(data, id) {
  const now = new Date(), p = n => String(n).padStart(2, '0');
  const fallbackDate = `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`;
  const poemVariants = normalizePoemVariants(data);
  const requestedStyle = data?.activePoemStyle === 'en-sonnet' ? 'en-sonnet' : data?.activePoemStyle === 'zh-classical' ? 'zh-classical' : '';
  const activePoemStyle = poemVariants[requestedStyle]
    ? requestedStyle
    : poemVariants['zh-classical'] ? 'zh-classical'
      : poemVariants['en-sonnet'] ? 'en-sonnet'
        : '';
  const activeVariant = activePoemStyle ? poemVariants[activePoemStyle] : null;
  const poem = activeVariant?.poem || null;
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
    featured: !!data?.featured,
    tags: Array.isArray(data?.tags) ? data.tags.map(String) : [],
    paper: typeof data?.paper === 'string' ? data.paper : 'plain',
    activePoemStyle,
    poemVariants,
    poem,
    sign: activeVariant?.sign || null,
    quoteSuggestions: activeVariant?.quoteSuggestions || normalizeQuoteSuggestions(data?.quoteSuggestions),
    collectedQuotes: Array.isArray(data?.collectedQuotes) ? data.collectedQuotes.map(String) : [],
    rejectedQuotes: Array.isArray(data?.rejectedQuotes) ? data.rejectedQuotes.map(String) : [],
    poemCollected: activeVariant?.poemCollected !== false && !!poem,
    notes: Array.isArray(data?.notes) ? data.notes.filter(n => n && typeof n.text === 'string') : [],
    inlineNotes: Array.isArray(data?.inlineNotes) ? data.inlineNotes.filter(n => n && typeof n.text === 'string') : [],
    photos: Array.isArray(data?.photos) ? data.photos.filter(p => typeof p === 'string') : [],
  };
}

async function dbGetEntries() {
  try {
    const snap = await col('entries').orderBy('date', 'desc').get();
    return snap.docs
      .map(d => normalizeEntry(d.data(), d.id))
      .sort((a, b) => `${b.date || ''} ${b.time || ''}`.localeCompare(`${a.date || ''} ${a.time || ''}`));
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

async function aiFetch(url, options, timeoutMs = 45000) {
  if (!navigator.onLine) throw new Error('当前离线，无法连接 AI 服务');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function poemStyle() {
  const saved = localStorage.getItem('d-poemStyle');
  return saved === 'en-sonnet' ? 'en-sonnet' : 'zh-classical';
}

function poemPreference() {
  const saved = localStorage.getItem('d-poemStyle');
  return saved === 'en-sonnet' || saved === 'both' ? saved : 'zh-classical';
}

async function apiPoem(diaryText, style = poemStyle()) {
  const token = await firebase.auth().currentUser?.getIdToken();
  const r = await aiFetch('/api/poem', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ diaryText, style }),
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

async function apiPoemSuggest(payload) {
  const token = await firebase.auth().currentUser?.getIdToken();
  const r = await aiFetch('/api/poem-suggest', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload || {}),
  }, 30000);
  const text = await r.text();
  let json;
  try { json = text ? JSON.parse(text) : {}; }
  catch {
    throw new Error(`改诗建议服务返回了非 JSON 内容（HTTP ${r.status}）。`);
  }
  if (!r.ok) throw new Error(json.error || '改诗建议失败');
  return json;
}

function poemFromAiResult(result) {
  if (!result || !Array.isArray(result.lines)) return null;
  const isSonnet = result.style === 'en-sonnet' || result.form === 'sonnet' || result.lines.length > 4;
  return {
    title: String(result.title || result.signTitle || (isSonnet ? 'Untitled' : '未题')).slice(0, isSonnet ? 48 : 12),
    form: String(result.form || (isSonnet ? 'sonnet' : '五绝')).slice(0, 12),
    style: isSonnet ? 'en-sonnet' : 'zh-classical',
    lines: result.lines.map(String).slice(0, isSonnet ? 14 : 4),
  };
}

function compactTextForCompare(value) {
  return String(value || '').toLowerCase().replace(/[\s，。！？、；：,.!?;:'"“”‘’《》()\[\]{}-]/g, '');
}

function isNearDuplicateText(a, b) {
  const x = compactTextForCompare(a);
  const y = compactTextForCompare(b);
  if (!x || !y) return false;
  if (x === y || x.includes(y) || y.includes(x)) return true;
  const grams = value => new Set(Array.from({ length: Math.max(0, value.length - 2) }, (_, i) => value.slice(i, i + 3)));
  const gx = grams(x), gy = grams(y);
  if (!gx.size || !gy.size) return false;
  let hit = 0;
  gx.forEach(item => { if (gy.has(item)) hit++; });
  return hit / Math.min(gx.size, gy.size) > 0.62;
}

function signFromAiResult(result) {
  if (!result) return null;
  const isSonnet = result.style === 'en-sonnet' || result.form === 'sonnet';
  const poemTexts = [result.title, ...(Array.isArray(result.lines) ? result.lines : [])].filter(Boolean);
  const judgmentLines = Array.isArray(result.judgmentLines)
    ? (isSonnet ? [] : result.judgmentLines
      .map(String)
      .filter(Boolean)
      .filter(line => !poemTexts.some(poemText => isNearDuplicateText(line, poemText)))
      .slice(0, 1))
    : [];
  const hasSignPayload = !!(result.signTitle || judgmentLines.length || result.interpretation || result.timelineLine || result.motif);
  if (!hasSignPayload) return null;
  const title = String(result.signTitle || result.title || '').slice(0, isSonnet ? 40 : 8);
  return {
    title,
    style: isSonnet ? 'en-sonnet' : 'zh-classical',
    motif: String(result.motif || '').slice(0, isSonnet ? 60 : 30),
    judgmentLines,
    interpretation: String(result.interpretation || '').slice(0, 600),
    timelineLine: String(result.timelineLine || judgmentLines[3] || judgmentLines[0] || '').slice(0, isSonnet ? 80 : 32),
  };
}

function poemVariantFromAiResult(result) {
  const poem = poemFromAiResult(result);
  if (!poem) return null;
  return {
    poem,
    sign: signFromAiResult(result),
    quoteSuggestions: normalizeQuoteSuggestions(result?.quoteSuggestions),
    poemCollected: true,
    generatedAt: new Date().toISOString(),
  };
}

function patchFromAiPoemResult(result, entry = null) {
  const variant = poemVariantFromAiResult(result);
  const poem = variant?.poem || null;
  const style = poem?.style || poemStyle();
  const poemVariants = {
    ...(entry?.poemVariants || {}),
    ...(variant ? { [style]: variant } : {}),
  };
  return {
    ...(poem ? { poem } : {}),
    activePoemStyle: style,
    poemVariants,
    sign: variant?.sign || null,
    quoteSuggestions: variant?.quoteSuggestions || [],
    poemCollected: !!poem,
  };
}

function patchForPoemStyle(entry, style) {
  const variant = entry?.poemVariants?.[style];
  if (!variant?.poem) return {};
  return {
    activePoemStyle: style,
    poem: variant.poem,
    sign: variant.sign || null,
    quoteSuggestions: normalizeQuoteSuggestions(variant.quoteSuggestions),
    poemCollected: variant.poemCollected !== false,
  };
}

function isAiPoemResult(result) {
  return !!(result && (result.signTitle || result.judgmentLines || result.timelineLine || result.quoteSuggestions));
}

async function apiQuestion(question) {
  const token = await firebase.auth().currentUser?.getIdToken();
  const response = await aiFetch('/api/question', {
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

function readLocalDrafts(entries = []) {
  const entryIds = new Set((entries || []).map(entry => entry.id).filter(Boolean));
  const drafts = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith('diary-draft:')) continue;
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const draft = JSON.parse(raw);
      const hasText = String(draft?.title || '').trim() || String(draft?.body || '').trim();
      if (!hasText) continue;
      const targetId = key.slice('diary-draft:'.length);
      const isEditDraft = targetId && targetId !== 'new' && entryIds.has(targetId);
      const savedAt = draft.savedAt ? new Date(draft.savedAt) : null;
      const time = savedAt && !Number.isNaN(savedAt.getTime())
        ? savedAt.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })
        : '刚刚';
      drafts.push({
        id: key,
        key,
        targetId: isEditDraft ? targetId : '',
        kind: 'text',
        title: String(draft.title || draft.body || '未命名草稿').slice(0, 42),
        time,
        savedAt: savedAt?.getTime() || 0,
      });
    }
  } catch (error) {
    console.warn('读取本地草稿失败:', error);
  }
  return drafts.sort((a, b) => b.savedAt - a.savedAt).slice(0, 8);
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
          ...skin(theme, 'primary'),
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
  const steps = [
    ['1', '写日记', '先把今天留下来，标题可写可不写。'],
    ['2', '摇签选诗', '保存后进入摇签，生成诗、判词和拾句。'],
    ['3', '收入藏册', '喜欢的诗和句子会进入诗册、拾句册。'],
  ];
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

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '34px 28px 118px', textAlign: 'center' }}>
        <Seal char1="诗" char2="签" theme={theme} size={60} rotate={-3}/>
        <div className="serif" style={{ fontSize: 22, color: theme.text, letterSpacing: 4, marginTop: 28, marginBottom: 12 }}>今天还没有日记</div>
        <div className="serif" style={{ fontSize: 15, color: theme.textSoft, lineHeight: 2, letterSpacing: 2 }}>
          写下今天的片段<br/>摇一摇，得一首古诗
        </div>
        <div style={{ width: '100%', marginTop: 26, display: 'grid', gap: 10 }}>
          {steps.map(([num, title, desc]) => (
            <div key={num} style={{
              display: 'flex', gap: 12, alignItems: 'center', textAlign: 'left',
              padding: '13px 14px', borderRadius: 16,
              background: theme.surface, border: `0.5px solid ${theme.line}`,
              ...skin(theme, 'panel'),
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: 14, flexShrink: 0,
                display: 'grid', placeItems: 'center', background: theme.text,
                color: theme.bg, fontSize: 12, fontWeight: 700,
              }}>{num}</div>
              <div style={{ flex: 1 }}>
                <div className="serif" style={{ fontSize: 15.5, color: theme.text, letterSpacing: 1.5 }}>{title}</div>
                <div style={{ fontSize: 11.5, color: theme.textMute, marginTop: 3, lineHeight: 1.55 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
        <button onClick={onCompose} style={{
          marginTop: 24, height: 52, padding: '0 40px', borderRadius: 26,
          border: 'none', background: theme.text, color: theme.bg,
          fontSize: 16, fontWeight: 600, letterSpacing: 3, fontFamily: 'inherit', cursor: 'pointer',
          boxShadow: `0 8px 24px ${theme.text}33`,
          ...skin(theme, 'primary'),
        }}>开 始 写</button>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button type="button" onClick={() => onTab?.('settings')} style={{
            height: 34, padding: '0 14px', borderRadius: 17,
            border: `0.5px solid ${theme.line}`, background: theme.surface,
            color: theme.textSoft, fontFamily: 'inherit', fontSize: 12, cursor: 'pointer',
          }}>账户与备份</button>
          <button type="button" onClick={() => onTab?.('timeline')} style={{
            height: 34, padding: '0 14px', borderRadius: 17,
            border: `0.5px solid ${theme.line}`, background: 'transparent',
            color: theme.textMute, fontFamily: 'inherit', fontSize: 12, cursor: 'pointer',
          }}>看看藏册</button>
        </div>
        <div style={{ marginTop: 12, fontSize: 10.5, color: theme.textMute, lineHeight: 1.6 }}>
          日记会保存到当前 Firebase 账户；换设备前建议绑定邮箱或导出备份。
        </div>
      </div>
    </Screen>
  );
}

function SignLanding({ theme, entries = [], onCompose, onShake, onOpen, onTab }) {
  const latest = entries[0] || null;
  const featuredEntry = entries.find(en => en.featured && en.poem?.title && Array.isArray(en.poem.lines));
  const poemEntry = entries.find(entry => entry?.poem?.title && Array.isArray(entry.poem.lines));
  const displayEntry = featuredEntry || (latest?.poem ? latest : poemEntry);
  const canShakeLatest = !!latest?.id && !!latest?.body?.trim();
  const meta = entry => [entry?.date, entry?.place, entry?.time].filter(Boolean).join(' · ');

  return (
    <Screen theme={theme} tab="sign" onTab={onTab}>
      <div style={{ padding: '64px 24px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: 3, color: theme.textMute, fontWeight: 600 }}>POEM LOT</div>
          <div className="serif" style={{ fontSize: 32, fontWeight: 600, marginTop: 4, color: theme.text }}>签</div>
          <div style={{ fontSize: 12, color: theme.textSoft, marginTop: 8, lineHeight: 1.7 }}>这里收住诗签，不会自动跳进写日记。</div>
        </div>
        <Seal char1="诗" char2="签" theme={theme} size={42} rotate={-4}/>
      </div>

      <div style={{ padding: '22px 22px 126px' }}>
        {displayEntry?.poem ? (
          <div className="theme-poem-card" style={{
            borderRadius: 26,
            padding: '34px 24px 28px',
            background: theme.paper,
            border: `0.5px solid ${theme.line}`,
            boxShadow: `0 10px 30px ${theme.text}12`,
            textAlign: 'center',
            position: 'relative',
            ...skin(theme, 'poemCard'),
          }}>
            <ThemeMotif theme={theme} variant="hero" />
            <div style={{ fontSize: 10, color: theme.textMute, letterSpacing: 3, fontWeight: 600 }}>最近诗签</div>
            <div className="serif" style={{ fontSize: 30, color: theme.text, letterSpacing: 8, marginTop: 18, paddingLeft: '0.5em' }}>
              {displayEntry.poem.title}
            </div>
            <div style={{ width: 32, height: 1, background: theme.accent, margin: '16px auto 22px' }} />
            <PoemBody lines={displayEntry.poem.lines} size={19} theme={theme} />
            <div style={{ fontSize: 11, color: theme.textMute, marginTop: 22 }}>{meta(displayEntry)}</div>
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button type="button" onClick={() => onOpen(displayEntry.id)} style={{
                flex: 1, height: 44, borderRadius: 22, border: `0.5px solid ${theme.line}`,
                background: theme.surface, color: theme.text, fontFamily: 'inherit', cursor: 'pointer',
              }}>查看日记</button>
              {canShakeLatest && <button type="button" onClick={() => onShake(latest.id)} style={{
                flex: 1.2, height: 44, borderRadius: 22, border: 'none',
                background: theme.text, color: theme.bg, fontFamily: 'inherit', cursor: 'pointer',
                ...skin(theme, 'primary'),
              }}>{latest?.poem ? '再摇一签' : '为今日摇签'}</button>}
            </div>
          </div>
        ) : (
          <div className="theme-quote-card" style={{
            borderRadius: 24,
            padding: '42px 28px',
            background: theme.paper,
            border: `0.5px solid ${theme.line}`,
            textAlign: 'center',
            ...skin(theme, 'panel'),
          }}>
            <div className="serif" style={{ fontSize: 24, color: theme.text, letterSpacing: 4 }}>还没有可摇的签</div>
            <div style={{ color: theme.textSoft, fontSize: 13, lineHeight: 1.8, marginTop: 14 }}>
              先保存一篇日记，再回来摇签选诗。底部按钮会一直保留，不需要先退出这个页面。
            </div>
            <button type="button" onClick={onCompose} style={{
              height: 46, padding: '0 28px', borderRadius: 23, marginTop: 28,
              border: 'none', background: theme.text, color: theme.bg,
              fontFamily: 'inherit', cursor: 'pointer', letterSpacing: 2,
              ...skin(theme, 'primary'),
            }}>写新日记</button>
          </div>
        )}

        {latest && !latest.poem && canShakeLatest && (
          <button type="button" onClick={() => onShake(latest.id)} style={{
            width: '100%', marginTop: 14, height: 52, borderRadius: 26,
            border: `0.5px solid ${theme.line}`, background: theme.surface,
            color: theme.text, fontFamily: 'inherit', cursor: 'pointer', letterSpacing: 2,
          }}>为最近一篇日记摇签</button>
        )}

        {(displayEntry || latest) && <button type="button" onClick={onCompose} style={{
          width: '100%', marginTop: 12, height: 48, borderRadius: 24,
          border: 'none', background: 'transparent', color: theme.textSoft,
          fontFamily: 'inherit', cursor: 'pointer', letterSpacing: 2,
        }}>写新日记</button>}
      </div>
    </Screen>
  );
}

// ─── 写字时的元素粒子 ──────────────────────────────────────────────
// 写日记时，提到的自然/情绪意象（花/雨/雪/风/火/月…）会从那个词轻轻升起对应的
// 水墨粒子。覆盖在 textarea 之上的 canvas（pointer-events:none，不影响打字），
// 用镜像 div 定位关键词。配色取自当前主题，气质克制，可在设置里关闭。
const WRITING_FX = [
  { fx: 'petal', re: /花|樱|瓣|梅|桃|杏|蕊|落英|flower|petal|blossom|bloom/gi },
  { fx: 'rain',  re: /雨|淋|潮|霖|drizzle|rain/gi },
  { fx: 'wave',  re: /海|河|湖|浪|潮|水|shore|sea|river|wave|water/gi },
  { fx: 'snow',  re: /雪|霜|寒|冰|snow|frost/gi },
  { fx: 'wind',  re: /风|吹|飘|拂|wind|breeze|gust/gi },
  { fx: 'leaf',  re: /叶|草|树|林|森|枝|竹|苔|园|leaf|tree|grass|garden|branch/gi },
  { fx: 'ink',   re: /墨|字|诗|句|写|纸|书|信|ink|word|letter|poem|write|paper/gi },
  { fx: 'ember', re: /火|焰|烛|灯|炉|暖|fire|flame|ember|lamp|candle/gi },
  { fx: 'memory', re: /梦|忆|旧|远|念|影|quiet|dream|memory|remember|shadow/gi },
  { fx: 'glow',  re: /月|星|光|萤|烁|莹|moon|star|light|glow|shine/gi },
];

function hexToRgba(hex, a) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(String(hex || '').trim());
  if (!m) return `rgba(150,150,150,${a})`;
  return `rgba(${parseInt(m[1], 16)},${parseInt(m[2], 16)},${parseInt(m[3], 16)},${a})`;
}

function markWritingRanges(text) {
  const marks = new Array(text.length).fill(null);
  for (const { fx, re } of WRITING_FX) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(text)) !== null) {
      if (m.index === re.lastIndex) re.lastIndex++;
      let blocked = false;
      for (let i = m.index; i < m.index + m[0].length; i++) if (marks[i]) { blocked = true; break; }
      if (!blocked) for (let i = m.index; i < m.index + m[0].length; i++) marks[i] = { fx, start: i === m.index, end: i === m.index + m[0].length - 1 };
    }
  }
  return marks;
}

class WritingParticle {
  constructor(x, y, fx, theme) {
    const r = Math.random;
    this.x = x; this.y = y; this.fx = fx; this.life = 1; this.dead = false; this.rot = r() * Math.PI * 2;
    this.font = theme.fontSerif || '"Noto Serif SC", serif';
    if (fx === 'petal') { this.vx = (r() - .5) * .5; this.vy = r() * .5 + .25; this.rad = r() * 3 + 2.5; this.decay = .006 + r() * .004; this.spin = (r() - .5) * .08; this.color = theme.seal; }
    else if (fx === 'rain') { this.vx = -.3 + r() * .2; this.vy = r() * 2.4 + 2.2; this.rad = r() * 1 + .6; this.len = r() * 8 + 6; this.decay = .02 + r() * .015; this.color = theme.accent; }
    else if (fx === 'wave') { this.vx = r() * .8 + .25; this.vy = (r() - .5) * .22; this.rad = r() * 5 + 6; this.decay = .012 + r() * .01; this.color = theme.accent; this.phase = r() * Math.PI * 2; }
    else if (fx === 'snow') { this.vx = (r() - .5) * .35; this.vy = r() * .45 + .2; this.rad = r() * 1.8 + 1; this.decay = .005 + r() * .004; this.sway = r() * Math.PI * 2; this.color = '#ffffff'; }
    else if (fx === 'wind') { this.vx = r() * 2.2 + 1.1; this.vy = (r() - .5) * .5; this.rad = r() * 1 + .5; this.len = r() * 14 + 8; this.decay = .015 + r() * .012; this.color = theme.textSoft || theme.textMute; }
    else if (fx === 'leaf') { this.vx = (r() - .5) * .6; this.vy = r() * .42 + .18; this.rad = r() * 3 + 3; this.decay = .006 + r() * .005; this.spin = (r() - .5) * .06; this.sway = r() * Math.PI * 2; this.color = theme.accent; }
    else if (fx === 'ink') { this.vx = (r() - .5) * .32; this.vy = -(r() * .42 + .12); this.rad = r() * 2.2 + 1.2; this.decay = .011 + r() * .007; this.color = theme.text; this.glyph = ['诗', '句', '字', '墨', '·'][Math.floor(r() * 5)]; }
    else if (fx === 'ember') { this.vx = (r() - .5) * .5; this.vy = -(r() * .8 + .4); this.rad = r() * 2 + 1; this.decay = .012 + r() * .01; this.color = theme.accent; this.warm = true; }
    else if (fx === 'memory') { this.vx = (r() - .5) * .24; this.vy = -(r() * .18 + .05); this.rad = r() * 5 + 4; this.decay = .005 + r() * .004; this.color = theme.textSoft || theme.textMute; this.tw = r() * Math.PI * 2; }
    else { this.vx = (r() - .5) * .35; this.vy = -(r() * .35 + .12); this.rad = r() * 2 + 1.4; this.decay = .009 + r() * .006; this.color = theme.seal; this.tw = r() * Math.PI * 2; }
  }
  update() {
    this.x += this.vx; this.y += this.vy; this.life -= this.decay;
    if (this.life <= 0) { this.dead = true; return; }
    if (this.fx === 'petal') { this.rot += this.spin; this.vx += Math.sin(this.y * .05) * .02; }
    else if (this.fx === 'wave') { this.phase += .12; this.x += Math.sin(this.phase) * .08; }
    else if (this.fx === 'snow') { this.sway += .05; this.x += Math.sin(this.sway) * .3; }
    else if (this.fx === 'leaf') { this.rot += this.spin; this.sway += .055; this.x += Math.sin(this.sway) * .22; }
    else if (this.fx === 'ember') { this.vx += (Math.random() - .5) * .06; this.rad *= .992; }
    else if (this.fx === 'glow' || this.fx === 'memory') { this.tw += .12; }
  }
  draw(ctx) {
    if (this.dead) return;
    const a = Math.max(0, this.life);
    if (this.fx === 'petal') {
      ctx.save(); ctx.globalAlpha = a * .5; ctx.translate(this.x, this.y); ctx.rotate(this.rot);
      ctx.fillStyle = hexToRgba(this.color, 1); ctx.beginPath();
      ctx.ellipse(0, 0, this.rad, this.rad * .55, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    } else if (this.fx === 'rain') {
      ctx.globalAlpha = a * .32; ctx.strokeStyle = hexToRgba(this.color, 1); ctx.lineWidth = this.rad; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(this.x, this.y); ctx.lineTo(this.x - this.vx * 2, this.y - this.len); ctx.stroke();
    } else if (this.fx === 'wave') {
      ctx.globalAlpha = a * .30; ctx.strokeStyle = hexToRgba(this.color, 1); ctx.lineWidth = 1.1; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(this.x, this.y, this.rad, Math.PI * .08, Math.PI * .78); ctx.stroke();
    } else if (this.fx === 'snow') {
      ctx.globalAlpha = a * .6; ctx.fillStyle = hexToRgba(this.color, 1);
      ctx.beginPath(); ctx.arc(this.x, this.y, this.rad, 0, Math.PI * 2); ctx.fill();
    } else if (this.fx === 'wind') {
      ctx.globalAlpha = a * .26; ctx.strokeStyle = hexToRgba(this.color, 1); ctx.lineWidth = this.rad; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(this.x - this.len, this.y - this.vy * 2); ctx.lineTo(this.x, this.y); ctx.stroke();
    } else if (this.fx === 'leaf') {
      ctx.save(); ctx.globalAlpha = a * .40; ctx.translate(this.x, this.y); ctx.rotate(this.rot);
      ctx.fillStyle = hexToRgba(this.color, 1); ctx.beginPath();
      ctx.ellipse(0, 0, this.rad * .55, this.rad, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = hexToRgba(this.color, .75); ctx.lineWidth = .7; ctx.beginPath(); ctx.moveTo(0, -this.rad * .7); ctx.lineTo(0, this.rad * .75); ctx.stroke();
      ctx.restore();
    } else if (this.fx === 'ink') {
      ctx.globalAlpha = a * .34; ctx.fillStyle = hexToRgba(this.color, 1);
      ctx.font = `${Math.max(10, this.rad * 6)}px ${this.font}`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(this.glyph, this.x, this.y);
    } else if (this.fx === 'ember') {
      const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.rad * 2);
      g.addColorStop(0, hexToRgba(this.color, a * .7)); g.addColorStop(1, hexToRgba(this.color, 0));
      ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(this.x, this.y, this.rad * 2, 0, Math.PI * 2); ctx.fill();
    } else if (this.fx === 'memory') {
      ctx.globalAlpha = a * (.18 + Math.sin(this.tw) * .06);
      ctx.strokeStyle = hexToRgba(this.color, 1); ctx.lineWidth = .9;
      ctx.beginPath(); ctx.arc(this.x, this.y, this.rad * (1.15 - a * .35), 0, Math.PI * 2); ctx.stroke();
    } else {
      const tw = .55 + Math.sin(this.tw) * .35;
      const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.rad * 2.4);
      g.addColorStop(0, hexToRgba(this.color, a * tw)); g.addColorStop(1, hexToRgba(this.color, 0));
      ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(this.x, this.y, this.rad * 2.4, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}

function WritingParticles({ textareaRef, text, theme, enabled }) {
  const canvasRef = React.useRef(null);
  const mirrorRef = React.useRef(null);
  const dataRef = React.useRef({ particles: [], emitters: [], raf: 0 });

  // Recompute keyword emitter positions (debounced) whenever the text changes.
  const recompute = React.useCallback(() => {
    const ta = textareaRef.current, mirror = mirrorRef.current;
    if (!ta || !mirror) return;
    const cs = getComputedStyle(ta);
    ['fontFamily', 'fontSize', 'fontWeight', 'letterSpacing', 'lineHeight', 'textIndent'].forEach(p => { mirror.style[p] = cs[p]; });
    mirror.style.width = ta.clientWidth + 'px';
    const marks = markWritingRanges(text);
    let html = '', open = false;
    const esc = c => c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : c === '\n' ? '<br>' : c;
    for (let i = 0; i < text.length; i++) {
      const m = marks[i];
      if (m) {
        if (m.start) { if (open) html += '</span>'; html += `<span data-fx="${m.fx}">`; open = true; }
        html += esc(text[i]);
        if (m.end) { html += '</span>'; open = false; }
      } else { if (open) { html += '</span>'; open = false; } html += esc(text[i]); }
    }
    if (open) html += '</span>';
    mirror.innerHTML = html + '<br>';
    const mr = mirror.getBoundingClientRect();
    const scroll = ta.scrollTop;
    const h = ta.clientHeight;
    const emitters = [];
    mirror.querySelectorAll('[data-fx]').forEach(span => {
      const sr = span.getBoundingClientRect();
      const y = sr.top - mr.top - scroll;
      if (y > -20 && y < h + 20) emitters.push({ x: sr.left - mr.left, y, w: sr.width, h: sr.height, fx: span.dataset.fx });
    });
    dataRef.current.emitters = emitters;
  }, [text, textareaRef]);

  React.useEffect(() => {
    if (!enabled) return;
    const t = setTimeout(recompute, 180);
    return () => clearTimeout(t);
  }, [recompute, enabled]);

  React.useEffect(() => {
    if (!enabled) return;
    const ta = textareaRef.current, canvas = canvasRef.current;
    if (!ta || !canvas) return;
    const ctx = canvas.getContext('2d');
    let w = 0, hgt = 0;
    const fit = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = ta.clientWidth; hgt = ta.clientHeight;
      // Overlay the textarea's box exactly (it sits inside .compose-body padding).
      canvas.style.left = ta.offsetLeft + 'px';
      canvas.style.top = ta.offsetTop + 'px';
      canvas.style.width = w + 'px'; canvas.style.height = hgt + 'px';
      canvas.width = w * dpr; canvas.height = hgt * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (mirrorRef.current) { mirrorRef.current.style.left = ta.offsetLeft + 'px'; mirrorRef.current.style.top = ta.offsetTop + 'px'; }
    };
    fit();
    const onScroll = () => recompute();
    ta.addEventListener('scroll', onScroll);
    window.addEventListener('resize', fit);
    const d = dataRef.current;
    const loop = () => {
      d.raf = requestAnimationFrame(loop);
      ctx.clearRect(0, 0, w, hgt);
      for (const em of d.emitters) {
        let n = 0; const R = Math.random();
        if (em.fx === 'petal') n = R < .045 ? 1 : 0;
        else if (em.fx === 'rain') n = R < .16 ? 1 : 0;
        else if (em.fx === 'wave') n = R < .09 ? 1 : 0;
        else if (em.fx === 'snow') n = R < .07 ? 1 : 0;
        else if (em.fx === 'wind') n = R < .1 ? 1 : 0;
        else if (em.fx === 'leaf') n = R < .075 ? 1 : 0;
        else if (em.fx === 'ink') n = R < .11 ? 1 : 0;
        else if (em.fx === 'ember') n = R < .08 ? 1 : 0;
        else if (em.fx === 'memory') n = R < .055 ? 1 : 0;
        else n = R < .055 ? 1 : 0;
        for (let i = 0; i < n; i++) {
          const px = em.x + Math.random() * em.w;
          const py = em.y + (em.fx === 'rain' || em.fx === 'snow' || em.fx === 'petal' ? Math.random() * em.h * .4 : em.h * (.4 + Math.random() * .5));
          d.particles.push(new WritingParticle(px, py, em.fx, theme));
        }
      }
      if (d.particles.length > 230) d.particles.splice(0, d.particles.length - 230);
      for (let i = d.particles.length - 1; i >= 0; i--) {
        const p = d.particles[i]; p.update(); p.draw(ctx);
        if (p.dead || p.y > hgt + 30 || p.x > w + 30 || p.x < -30) d.particles.splice(i, 1);
      }
    };
    loop();
    return () => {
      cancelAnimationFrame(d.raf);
      ta.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', fit);
      d.particles = [];
    };
  }, [enabled, theme, recompute, textareaRef]);

  if (!enabled) return null;
  return (
    <>
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 4 }} aria-hidden="true" />
      <div ref={mirrorRef} aria-hidden="true" style={{
        position: 'absolute', top: 0, left: 0, visibility: 'hidden', pointerEvents: 'none',
        whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', wordBreak: 'break-word',
        margin: 0, padding: 0, border: 0, boxSizing: 'border-box',
      }} />
    </>
  );
}

// ─── Compose Screen (real) ────────────────────────────────────────
const MOODS_REAL = ['☕','🌙','🌸','🌊','✨','🌿','💐','😴','🥲','🎯','📖','🏃','🌳','💌','🍂'];

function ComposeReal({ theme, paper, entry, draftKey: openedDraftKey = '', forceDraft = false, syncState, onChangePaper, onBack, onSaved }) {
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
  const draftKey = openedDraftKey || `diary-draft:${entry?.id || 'new'}`;
  const bodyRef = React.useRef(null);
  const particlesOn = React.useMemo(() => {
    const pref = JSON.parse(localStorage.getItem('d-writingParticles') ?? 'true');
    const reduce = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return pref && !reduce;
  }, []);

  React.useEffect(() => {
    if (editing || forceDraft) return;
    const autoLoc = JSON.parse(localStorage.getItem('d-autoLoc') ?? 'true');
    if (!autoLoc) { setPlace('未记录地点'); return; }
    if (!navigator.geolocation) { setPlace('当前位置'); return; }
    navigator.geolocation.getCurrentPosition(
      async p => setPlace(await geocode(p.coords.latitude, p.coords.longitude)),
      () => setPlace('当前位置'),
      { timeout: 6000 }
    );
  }, [editing, forceDraft]);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (raw) {
        const draft = JSON.parse(raw);
        const differs = draft.title !== (entry?.title || '') || draft.body !== (entry?.body || '');
        if ((forceDraft || differs) && (draft.title?.trim() || draft.body?.trim()) && (forceDraft || window.confirm('发现一份未完成的本地草稿，要继续写吗？'))) {
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
  }, [draftKey, forceDraft]);

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
    try {
      const p = await apiPoem(body);
      window.PLAN?.recordShake?.(); // metering hook (free today; see MONETIZATION.md)
      setPoem(p); setShake('done');
    }
    catch (e) { setErr(friendlyAiError(e, '摇签生诗')); setShake('idle'); }
  };

  const doSave = async (poemArg) => {
    setSaving(true);
    setErr('');
    try {
      const generated = poemArg || (isAiPoemResult(poem) ? poem : null);
      const generatedPatch = generated ? patchFromAiPoemResult(generated, entry) : {};
      const id = await dbSaveEntry({
        ...(entry || {}),
        ...(editing ? { id: entry.id } : {}),
        date: entryInfo.date, weekday: entryInfo.weekday, time: entryInfo.time,
        place, title: title.trim(), body: body.trim(), mood, flag, paper: activePaper,
        tags: entry?.tags || [],
        poem: generatedPatch.poem || poem || entry?.poem || null,
        activePoemStyle: generated ? generatedPatch.activePoemStyle : (entry?.activePoemStyle || poem?.style || entry?.poem?.style || null),
        poemVariants: generated ? generatedPatch.poemVariants : (entry?.poemVariants || {}),
        sign: generated ? generatedPatch.sign : (entry?.sign || null),
        quoteSuggestions: generated ? generatedPatch.quoteSuggestions : (entry?.quoteSuggestions || []),
        poemCollected: generated ? generatedPatch.poemCollected : (entry?.poemCollected !== false && !!(poem || entry?.poem)),
        notes: entry?.notes || [], inlineNotes: entry?.inlineNotes || [],
        photos: entry?.photos || [],
      });
      localStorage.removeItem(draftKey);
      await onSaved({ id, body: body.trim(), editing, hasGeneratedPoem: !!generated });
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

  const displayPoem = poemFromAiResult(poem) || poem || { title: '…', form: '五绝', lines: ['', '', '', ''] };
  const fakeEntry = { body, poem: displayPoem, sign: signFromAiResult(poem) };

  if (shake === 'gen')
    return <Shake theme={theme} state="shaking" entry={fakeEntry} onCancel={() => setShake('idle')}/>;
  if (shake === 'done' && poem)
    return <Shake theme={theme} state="done" entry={fakeEntry}
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
    <div className={`compose-screen theme-screen-${theme?.key || 'default'}${focusMode ? ' compose-focus' : ''}`} style={{ width: W, height: H, background: theme.paper, position: 'relative', overflow: 'hidden', fontFamily: 'inherit', ...(!customPaper ? skin(theme, 'screen') : {}) }}>
      <div className="compose-paper-bg" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: customPaper ? 0.82 : 1, ...ps }}/>
      {customPaper && <div className="compose-paper-veil" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'rgba(255,253,247,.34)' }}/>}
      {!customPaper && <ThemeDecor theme={theme} />}
      <div className="compose-shell" style={{ position: 'relative', zIndex: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>

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
        <div className="compose-body" style={{ position: 'relative', flex: 1, padding: `14px ${customPaper ? 52 : 28}px 0`, minHeight: 0 }}>
          <textarea ref={bodyRef} value={body} onChange={e => setBody(e.target.value)} placeholder="今天，"
            style={{
              position: 'relative', zIndex: 1,
              width: '100%', height: '100%', border: 'none', outline: 'none', resize: 'none',
              background: 'transparent', color: paperInk,
              fontFamily: theme.fontWriting || theme.fontSerif || "'Noto Serif SC', serif",
              fontSize: 17, lineHeight: activePaper === 'ruled' ? '34px' : (theme.writingLineHeight || 1.95), letterSpacing: theme.writingSpacing ?? 0.5,
            }}
          />
          <WritingParticles textareaRef={bodyRef} text={body} theme={theme} enabled={particlesOn && !focusMode} />
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
              ...(filled && !saving && !customPaper ? skin(theme, 'primary') : {}),
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
  const [quoteError, setQuoteError] = React.useState('');
  const generateQuotes = async () => {
    if (!onGenerateQuotes || quoteBusy) return;
    setQuoteBusy(true);
    setQuoteError('');
    try { await onGenerateQuotes(); }
    catch (err) { setQuoteError(friendlyAiError(err, 'AI 拾句')); }
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

        <div className="theme-saved-card" style={{ marginTop: 34, padding: '20px 18px', borderRadius: 20, background: theme.paper, border: `0.5px solid ${theme.line}`, position: 'relative', overflow: 'hidden', ...skin(theme, 'panel') }}>
          <ThemeCardArt theme={theme} kind="quote" />
          <ThemeMotif theme={theme} variant="panel" />
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
            ...skin(theme, 'primary'),
          }}>摇 签 选 诗</button>
          <button type="button" disabled={quoteBusy || !onGenerateQuotes} onClick={generateQuotes} style={{
            height: 48, borderRadius: 24, border: `1px solid ${theme.accent}`, background: 'transparent', color: theme.accent,
            fontFamily: 'inherit', fontSize: 13.5, letterSpacing: 1.5, cursor: quoteBusy ? 'default' : 'pointer',
          }}>{quoteBusy ? '正在认真拾句…' : '让 AI 拾句'}</button>
          {quoteError && <div style={{
            padding: '12px 14px', borderRadius: 14, background: theme.surface,
            border: `0.5px solid ${theme.line}`, color: theme.seal,
            fontSize: 12, lineHeight: 1.7,
          }}>{quoteError}</div>}
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
  const r = await aiFetch('/api/hexagram', {
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
    } catch(e) { setErr(friendlyAiError(e, 'AI 解签')); setStep('setup'); }
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

function AutoPoemShake({ theme, entry, style = poemStyle(), onBack, onAccepted }) {
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
      const generated = await apiPoem(entry.body, style);
      setResult(generated);
      setState('done');
    } catch (err) {
      setError(friendlyAiError(err, '摇签生诗'));
      setState('ready');
    } finally {
      running.current = false;
    }
  }, [entry.body, style]);

  const requestAndGenerate = React.useCallback(async () => {
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      try {
        const permission = await DeviceMotionEvent.requestPermission();
        if (permission !== 'granted') {
          setError('没有获得摇晃感应权限，也可以点这里直接落签。');
        }
      } catch (_) {
        // Some browsers expose the API but do not allow permission prompts.
      }
    }
    generate();
  }, [generate]);

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
    poem: poemFromAiResult(result) || { title: '待落', form: '', lines: ['', '', '', ''] },
    sign: signFromAiResult(result),
  };

  const accept = async () => {
    if (!result) return;
    setSaving(true);
    try {
      await onAccepted(patchFromAiPoemResult(result, entry));
    } catch (err) {
      setError(err?.message || '收入失败，请稍后重试。');
      setSaving(false);
    }
  };

  return <Shake theme={theme} state={state} entry={displayEntry} onCancel={onBack}
    onShake={requestAndGenerate} onRegen={() => { setResult(null); setState('ready'); }}
    onAccept={accept} saving={saving} error={error}/>;
}

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

const PASSWORD_RESET_SENT_MESSAGE = '重置密码邮件已发送。只会发送到已注册邮箱；如果 2 分钟内没收到，请检查垃圾箱，并确认邮箱地址无误。';

function friendlyAuthError(error) {
  const messages = {
    'auth/email-already-in-use': '这个邮箱已经注册，请直接登录。',
    'auth/invalid-email': '邮箱格式不正确。',
    'auth/missing-email': '请先填写邮箱地址。',
    'auth/invalid-credential': '邮箱或密码不正确。',
    'auth/wrong-password': '邮箱或密码不正确。',
    'auth/user-not-found': '没有找到这个邮箱账户。',
    'auth/weak-password': '密码至少需要 6 位。',
    'auth/credential-already-in-use': '这个邮箱已经绑定到其他账户。',
    'auth/provider-already-linked': '当前账户已经绑定邮箱。',
    'auth/too-many-requests': '尝试次数过多，请稍后再试。',
    'auth/unauthorized-domain': '当前域名未加入 Firebase Authentication 的授权域名，邮件无法发送。',
    'auth/network-request-failed': '网络连接失败，请稍后再试。',
    'auth/operation-not-allowed': '请先在 Firebase Console 开启“电子邮件/密码”登录。',
  };
  return messages[error?.code] || error?.message || '操作失败，请稍后重试。';
}

function AuthChoiceScreen({ theme, onGuest, onEmailLogin, onEmailRegister, onPasswordReset, loading }) {
  const [mode, setMode] = React.useState('login');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const submit = async () => {
    setMessage('');
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail || password.length < 6) {
      setMessage('请输入邮箱，并使用至少 6 位密码。');
      return;
    }
    setBusy(true);
    try {
      if (mode === 'register') await onEmailRegister(normalizedEmail, password);
      else await onEmailLogin(normalizedEmail, password);
    } catch (error) {
      setMessage(friendlyAuthError(error));
      setBusy(false);
    }
  };
  const reset = async () => {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) {
      setMessage('请先填写邮箱地址。');
      return;
    }
    setBusy(true);
    try {
      await onPasswordReset(normalizedEmail);
      setMessage(PASSWORD_RESET_SENT_MESSAGE);
    } catch (error) {
      setMessage(friendlyAuthError(error));
    } finally {
      setBusy(false);
    }
  };
  const inputStyle = {
    width: '100%', height: 46, border: `1px solid ${theme.line}`, borderRadius: 12,
    background: theme.paper, color: theme.text, padding: '0 14px', fontFamily: 'inherit',
    outline: 'none', boxSizing: 'border-box',
  };
  return (
    <div style={{
      width: W, minHeight: H, background: theme.bg, color: theme.text, padding: '62px 26px 36px',
      boxSizing: 'border-box', display: 'flex', flexDirection: 'column',
      ...skin(theme, 'screen'),
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <img src="assets/icons/app-icon-192.png" alt="诗签" style={{ width: 58, height: 58, borderRadius: 15 }}/>
        <div>
          <div className="serif" style={{ fontSize: 28, letterSpacing: 5 }}>诗签</div>
          <div style={{ fontSize: 11, color: theme.textSoft, marginTop: 5, letterSpacing: 2 }}>写日记，也收藏诗与句子</div>
        </div>
      </div>
      <div style={{
        marginTop: 42, background: theme.paper, border: `1px solid ${theme.line}`,
        borderRadius: 18, padding: 20, ...skin(theme, 'panel'),
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, background: theme.surfaceSoft, padding: 4, borderRadius: 11 }}>
          {[['login', '邮箱登录'], ['register', '注册邮箱']].map(([key, label]) => (
            <button key={key} type="button" onClick={() => { setMode(key); setMessage(''); }} style={{
              height: 36, border: 0, borderRadius: 8, fontFamily: 'inherit', cursor: 'pointer',
              background: mode === key ? theme.paper : 'transparent',
              color: mode === key ? theme.text : theme.textSoft,
            }}>{label}</button>
          ))}
        </div>
        <input type="email" value={email} onChange={event => setEmail(event.target.value)}
          placeholder="邮箱地址" autoComplete="email" style={{ ...inputStyle, marginTop: 16 }}/>
        <input type="password" value={password} onChange={event => setPassword(event.target.value)}
          placeholder={mode === 'register' ? '设置密码（至少 6 位）' : '密码'}
          autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
          onKeyDown={event => event.key === 'Enter' && submit()}
          style={{ ...inputStyle, marginTop: 10 }}/>
        <button type="button" disabled={busy} onClick={submit} style={{
          width: '100%', height: 48, marginTop: 14, border: 0, borderRadius: 12,
          background: theme.text, color: theme.paper, fontFamily: 'inherit', fontSize: 15,
        }}>{busy ? '请稍候…' : mode === 'register' ? '注册并开始写日记' : '登录'}</button>
        {mode === 'login' && <button type="button" disabled={busy} onClick={reset} style={{
          width: '100%', border: 0, background: 'transparent', color: theme.textSoft,
          fontFamily: 'inherit', fontSize: 12, marginTop: 12,
        }}>忘记密码</button>}
        {message && <div style={{ color: theme.textSoft, fontSize: 11.5, lineHeight: 1.6, marginTop: 10 }}>{message}</div>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0', color: theme.textMute, fontSize: 11 }}>
        <i style={{ flex: 1, borderTop: `1px solid ${theme.line}` }}/><span>或者</span><i style={{ flex: 1, borderTop: `1px solid ${theme.line}` }}/>
      </div>
      <button type="button" disabled={loading} onClick={onGuest} style={{
        width: '100%', height: 46, border: `1px solid ${theme.line}`, borderRadius: 12,
        background: theme.paper, color: theme.text, fontFamily: 'inherit',
      }}>{loading ? '正在进入…' : '先匿名使用'}</button>
      <div style={{ marginTop: 12, color: theme.textMute, fontSize: 10.5, lineHeight: 1.7, textAlign: 'center' }}>
        匿名使用后，也可以在“我”中绑定邮箱并保留全部日记。
      </div>
    </div>
  );
}

// Gentle one-time nudge for anonymous writers: bind an email so the diary
// (which lives only in this browser's anonymous account) cannot be lost.
function BindEmailNudge({ theme, onBindEmail, onClose }) {
  const [show, setShow] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [done, setDone] = React.useState(false);

  const finish = () => { localStorage.setItem('d-bindNudgeDone', '1'); onClose(); };
  const later = () => { localStorage.setItem('d-bindNudgeDone', '1'); onClose(); };

  const bind = async () => {
    setMessage('');
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail || password.length < 6) { setMessage('请输入邮箱，并使用至少 6 位密码。'); return; }
    setBusy(true);
    try {
      await onBindEmail(normalizedEmail, password);
      setDone(true);
      localStorage.setItem('d-bindNudgeDone', '1');
    } catch (error) {
      setMessage(typeof friendlyAuthError === 'function' ? friendlyAuthError(error) : (error?.message || '绑定失败，请稍后重试。'));
    } finally { setBusy(false); }
  };

  const input = {
    width: '100%', height: 44, borderRadius: 10, border: `1px solid ${theme.line}`,
    background: theme.paper, color: theme.text, padding: '0 12px', fontFamily: 'inherit',
    outline: 'none', boxSizing: 'border-box', marginTop: 9,
  };

  return (
    <div onClick={later} style={{
      position: 'fixed', inset: 0, zIndex: 4000, background: 'rgba(20,16,10,.5)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      backdropFilter: 'blur(2px)',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: W, background: theme.surface,
        borderRadius: '22px 22px 0 0', padding: '26px 24px calc(30px + env(safe-area-inset-bottom))',
        boxShadow: '0 -12px 40px rgba(0,0,0,.25)', animation: 'sign-drop .4s cubic-bezier(.16,1,.3,1) both',
      }}>
        {done ? (
          <>
            <div className="serif" style={{ fontSize: 22, color: theme.text, letterSpacing: 1 }}>已绑定，日记安全了</div>
            <div style={{ marginTop: 10, color: theme.textSoft, fontSize: 13, lineHeight: 1.8 }}>
              现在可以在任意设备用这个邮箱登录，找回全部日记。已向邮箱发送了验证邮件。
            </div>
            <button type="button" onClick={finish} style={{
              width: '100%', height: 46, marginTop: 18, border: 0, borderRadius: 12,
              background: theme.text, color: theme.paper, fontFamily: 'inherit', fontSize: 14, cursor: 'pointer',
            }}>好的</button>
          </>
        ) : (
          <>
            <div style={{ fontSize: 10.5, letterSpacing: 3, color: theme.seal, fontWeight: 600 }}>留 住 你 写 下 的</div>
            <div className="serif" style={{ fontSize: 22, color: theme.text, letterSpacing: 1, marginTop: 8 }}>给日记绑定一个邮箱</div>
            <div style={{ marginTop: 10, color: theme.textSoft, fontSize: 13, lineHeight: 1.8 }}>
              现在的日记保存在这台设备的匿名账户里，清除浏览器数据或换设备后会找不回。
              绑定邮箱后日记仍是同一份，还能跨设备同步 —— 只需半分钟。
            </div>
            {!show ? (
              <div style={{ marginTop: 18, display: 'grid', gap: 10 }}>
                <button type="button" onClick={() => setShow(true)} style={{
                  height: 48, border: 0, borderRadius: 12, background: theme.text, color: theme.paper,
                  fontFamily: 'inherit', fontSize: 14, fontWeight: 600, letterSpacing: 1, cursor: 'pointer',
                }}>绑定邮箱并保留日记</button>
                <button type="button" onClick={later} style={{
                  height: 44, border: `1px solid ${theme.line}`, borderRadius: 12, background: 'transparent',
                  color: theme.textSoft, fontFamily: 'inherit', fontSize: 13, cursor: 'pointer',
                }}>以后再说</button>
              </div>
            ) : (
              <>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="邮箱地址" autoComplete="email" style={input}/>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="设置密码（至少 6 位）" autoComplete="new-password" style={input}/>
                <button type="button" disabled={busy} onClick={bind} style={{
                  width: '100%', height: 46, marginTop: 12, border: 0, borderRadius: 12,
                  background: theme.text, color: theme.paper, fontFamily: 'inherit', fontSize: 14, cursor: 'pointer',
                }}>{busy ? '绑定中…' : '完成绑定'}</button>
                <button type="button" onClick={later} style={{
                  width: '100%', height: 40, marginTop: 8, border: 0, background: 'transparent',
                  color: theme.textMute, fontFamily: 'inherit', fontSize: 12, cursor: 'pointer',
                }}>以后再说</button>
              </>
            )}
            {message && <div style={{ color: theme.seal, fontSize: 11.5, lineHeight: 1.6, marginTop: 10 }}>{message}</div>}
          </>
        )}
      </div>
    </div>
  );
}

function AppReal() {
  const [authState, setAuthState] = React.useState('loading');
  const [currentUser, setCurrentUser] = React.useState(null);
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
  const [nudge, setNudge] = React.useState(false);

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
    const screenSkin = theme.skin?.screen || {};
    const poemSkin = theme.skin?.poemCard || {};
    const panelSkin = theme.skin?.panel || {};
    const setSkinVariable = (name, value, fallback) => root.style.setProperty(name, value || fallback);
    setSkinVariable('--theme-screen-image', screenSkin.backgroundImage, 'none');
    setSkinVariable('--theme-screen-position', screenSkin.backgroundPosition, 'center');
    setSkinVariable('--theme-screen-size', screenSkin.backgroundSize, 'auto');
    setSkinVariable('--theme-screen-repeat', screenSkin.backgroundRepeat, 'repeat');
    setSkinVariable('--theme-poem-image', poemSkin.backgroundImage, 'none');
    setSkinVariable('--theme-poem-position', poemSkin.backgroundPosition, 'center');
    setSkinVariable('--theme-poem-size', poemSkin.backgroundSize, 'auto');
    setSkinVariable('--theme-poem-repeat', poemSkin.backgroundRepeat, 'repeat');
    setSkinVariable('--theme-panel-image', panelSkin.backgroundImage, 'none');
    setSkinVariable('--theme-panel-position', panelSkin.backgroundPosition, 'center');
    setSkinVariable('--theme-panel-size', panelSkin.backgroundSize, 'auto');
    setSkinVariable('--theme-panel-repeat', panelSkin.backgroundRepeat, 'repeat');
  }, [themeKey, theme.fontBody, theme.fontSerif, theme.fontWriting, theme.skin]);

  const push = (s, p = {}) => setStack(st => [...st, { screen: s, params: p }]);
  const pop  = () => setStack(st => st.length > 1 ? st.slice(0, -1) : st);
  const reset = (s, p = {}) => setStack([{ screen: s, params: p }]);
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
    setCurrentUser(u || null);
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

  // First-entry nudge: once an anonymous writer has a saved entry, gently invite
  // them (one time) to bind an email so the diary cannot be lost with the browser.
  React.useEffect(() => {
    if (authState !== 'auth' || !currentUser?.isAnonymous) return;
    if (entries.length < 1 || localStorage.getItem('d-bindNudgeDone')) return;
    if (stack[stack.length - 1]?.screen === 'home') setNudge(true);
  }, [authState, currentUser, entries.length, stack]);


  const handleSignOut = async () => {
    const message = currentUser?.isAnonymous
      ? '当前是匿名账号。退出后可能无法再访问旧数据。建议先绑定邮箱或备份数据。确定仍要退出吗？'
      : `确定退出邮箱账户 ${currentUser?.email || ''} 吗？日记会保留在账户中，下次登录后仍可访问。`;
    if (!window.confirm(message)) return;
    await firebase.auth().signOut();
    setEntries([]); setHexagrams([]); setStack([{ screen: 'home', params: {} }]);
  };

  if (authState === 'loading') return <SplashScreen theme={theme}/>;
  const handleStart = async () => {
    setStartLoading(true);
    try { await firebase.auth().signInAnonymously(); }
    catch (e) { alert('请先在 Firebase Console → Authentication 开启 Anonymous 匿名登录'); setStartLoading(false); }
  };

  const handleBindEmail = async (email, password) => {
    const user = firebase.auth().currentUser;
    if (!user) throw new Error('当前没有可绑定的账户。');
    if (!user.isAnonymous) throw new Error('当前账户已经绑定邮箱。');
    const credential = firebase.auth.EmailAuthProvider.credential(normalizeEmail(email), password);
    const result = await user.linkWithCredential(credential);
    await result.user.sendEmailVerification().catch(() => {});
    setCurrentUser(result.user);
    return result.user;
  };
  const handlePasswordReset = email => firebase.auth().sendPasswordResetEmail(normalizeEmail(email), {
    url: window.location.origin,
    handleCodeInApp: false,
  });

  if (authState === 'welcome') return <AuthChoiceScreen theme={theme} onGuest={handleStart}
    onEmailLogin={(email, password) => firebase.auth().signInWithEmailAndPassword(normalizeEmail(email), password)}
    onEmailRegister={async (email, password) => {
      const result = await firebase.auth().createUserWithEmailAndPassword(normalizeEmail(email), password);
      await result.user.sendEmailVerification().catch(() => {});
      return result;
    }}
    onPasswordReset={handlePasswordReset}
    loading={startLoading}/>;

  const { screen, params } = stack[stack.length - 1];
  const localDrafts = readLocalDrafts(entries);

  // Guard: no entries yet
  if (screen === 'home' && entries.length === 0 && localDrafts.length === 0)
    return <EmptyHomeScreen theme={theme} onCompose={() => push('compose')} onTab={tabHandler}/>;

  const entryById = id => entries.find(e => e.id === id);

  const nudgeOverlay = nudge
    ? <BindEmailNudge theme={theme} onBindEmail={handleBindEmail} onClose={() => setNudge(false)} />
    : null;

  const screenEl = (() => {
  switch (screen) {
    case 'home':
      return (
        <Home theme={theme} entries={entries} drafts={localDrafts}
          poemLayout="horizontal" density="sparse"
          onOpen={id => push('detail', { id })}
          onCompose={() => push('compose')}
          onOpenDraft={draft => push(draft.targetId ? 'edit' : 'compose', draft.targetId ? { id: draft.targetId, draftKey: draft.key, forceDraft: true } : { draftKey: draft.key, forceDraft: true })}
          onSearch={() => push('search')}
          onTab={tabHandler}
        />
      );

    case 'sign':
      return (
        <SignLanding theme={theme} entries={entries}
          onCompose={() => push('compose')}
          onShake={id => push('shake', { id })}
          onOpen={id => push('detail', { id })}
          onTab={tabHandler}
        />
      );

    case 'compose':
      return (
        <ComposeReal theme={theme} paper={paper} draftKey={params.draftKey || ''} forceDraft={!!params.forceDraft} syncState={syncState} onChangePaper={setPaper} onBack={pop}
          onSaved={async ({ id, hasGeneratedPoem } = {}) => {
            await refresh();
            const autoPoem = JSON.parse(localStorage.getItem('d-autoPoem') ?? 'true');
            if (id) replace(autoPoem && !hasGeneratedPoem ? 'shake' : 'saved', { id });
          }}
        />
      );

    case 'edit': {
      const entry = entryById(params.id);
      if (!entry) { pop(); return null; }
      return (
        <ComposeReal theme={theme} paper={paper} entry={entry} draftKey={params.draftKey || ''} forceDraft={!!params.forceDraft} syncState={syncState} onChangePaper={setPaper} onBack={pop}
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
        onToggleFeatured={async () => {
          const wasFeatured = !!entry.featured;
          if (!wasFeatured) {
            const cur = entries.find(en => en.featured);
            if (cur && cur.id !== entry.id) await updateEntry(cur.id, { featured: false });
          }
          await updateEntry(entry.id, { featured: !wasFeatured });
        }}
        onSelectPoemStyle={style => updateEntry(entry.id, patchForPoemStyle(entry, style))}
        onGeneratePoemStyle={entry.body?.trim() ? async style => {
          push('shake', { id: entry.id, style });
        } : null}
        onSavePoemVariant={async (style, poemPatch) => {
          const poem = normalizePoemRecord({ ...poemPatch, style });
          if (!poem) throw new Error(style === 'en-sonnet' ? '英文诗需要 14 行。' : '中文诗需要 4 句。');
          const variants = {
            ...(entry.poemVariants || {}),
            [style]: {
              ...(entry.poemVariants?.[style] || {}),
              poem,
              poemCollected: true,
              editedAt: new Date().toISOString(),
            },
          };
          const activeSign = style === entry.activePoemStyle ? entry.sign : (entry.poemVariants?.[style]?.sign || null);
          await updateEntry(entry.id, {
            poem,
            activePoemStyle: style,
            poemVariants: variants,
            sign: activeSign,
            quoteSuggestions: normalizeQuoteSuggestions(entry.poemVariants?.[style]?.quoteSuggestions || entry.quoteSuggestions),
            poemCollected: true,
          });
        }}
        onSuggestPoemLine={payload => apiPoemSuggest(payload)}
        onAddNote={text => updateEntry(entry.id, {
          notes: [...(entry.notes || []), { date: new Date().toLocaleString('zh-CN', { hour12: false }), text }],
        })}
        onGeneratePoem={entry.body?.trim() ? async () => {
          push('shake', { id: entry.id, style: poemStyle() });
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
      return <AutoPoemShake theme={theme} entry={entry} style={params.style || poemStyle()} onBack={pop} onAccepted={async patch => {
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
          currentUser={currentUser}
          onBindEmail={handleBindEmail}
          onPasswordReset={handlePasswordReset}
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
  })();

  return (
    <>
      {screenEl}
      {nudgeOverlay}
    </>
  );
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
