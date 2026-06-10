// app-real.jsx — Real diary app: Firebase auth + Firestore + DeepSeek

// ─── Firebase helpers ─────────────────────────────────────────────
function col(name) {
  const uid = firebase.auth().currentUser?.uid;
  if (!uid) throw new Error('未登录');
  return firebase.firestore().collection('users').doc(uid).collection(name);
}

async function dbGetEntries() {
  try {
    const snap = await col('entries').orderBy('date', 'desc').get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) { console.error('读取日记失败:', e); return []; }
}

async function dbSaveEntry(data) {
  const { id, ...rest } = data;
  const now = new Date().toISOString();
  if (id) {
    await col('entries').doc(id).set({ ...rest, updatedAt: now }, { merge: true });
    return id;
  }
  const ref = await col('entries').add({ ...rest, createdAt: now, updatedAt: now });
  return ref.id;
}

async function dbDeleteEntry(id) {
  await col('entries').doc(id).delete();
}

async function dbClearCollection(name) {
  const snap = await col(name).get();
  const docs = snap.docs;
  for (let i = 0; i < docs.length; i += 400) {
    const batch = firebase.firestore().batch();
    docs.slice(i, i + 400).forEach(d => batch.delete(d.ref));
    await batch.commit();
  }
}

async function dbClearAllData() {
  await dbClearCollection('entries');
  await dbClearCollection('hexagrams');
}

async function dbImportEntries(entries) {
  for (const entry of entries) {
    const { id, ...data } = entry || {};
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
    await col('hexagrams').doc(id).set({ ...rest, updatedAt: now }, { merge: true });
    return id;
  }
  const ref = await col('hexagrams').add({ ...rest, createdAt: now });
  return ref.id;
}

async function dbGetHexagrams() {
  try {
    const snap = await col('hexagrams').orderBy('createdAt', 'desc').get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) { return []; }
}

async function apiPoem(diaryText) {
  const r = await fetch('/api/poem', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
      <Seal char1="诗" char2="签" theme={theme} size={52}/>
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

function ComposeReal({ theme, paper, onBack, onSaved }) {
  const [body, setBody] = React.useState('');
  const [mood, setMood] = React.useState('');
  const [flag, setFlag] = React.useState(false);
  const [place, setPlace] = React.useState('获取位置中…');
  const [shake, setShake] = React.useState('idle'); // idle|gen|done
  const [poem, setPoem] = React.useState(null);
  const [saving, setSaving] = React.useState(false);
  const [err, setErr] = React.useState('');

  React.useEffect(() => {
    if (!navigator.geolocation) { setPlace('当前位置'); return; }
    navigator.geolocation.getCurrentPosition(
      async p => setPlace(await geocode(p.coords.latitude, p.coords.longitude)),
      () => setPlace('当前位置'),
      { timeout: 6000 }
    );
  }, []);

  const info = nowInfo();

  const doShake = async () => {
    if (!body.trim()) return;
    setShake('gen'); setErr('');
    try { const p = await apiPoem(body); setPoem(p); setShake('done'); }
    catch (e) { setErr(e.message); setShake('idle'); }
  };

  const doSave = async (poemArg) => {
    setSaving(true);
    try {
      await dbSaveEntry({
        date: info.date, weekday: info.weekday, time: info.time,
        place, body: body.trim(), mood, flag,
        tags: [], poem: poemArg || null, notes: [], inlineNotes: [],
        photos: [],
      });
      await onSaved();
    } catch (e) { setErr('保存失败: ' + e.message); setSaving(false); }
  };

  const fakeEntry = { body, poem: poem || { title: '…', form: '五绝', lines: ['', '', '', ''] } };

  if (shake === 'gen')
    return <Shake theme={theme} state="shaking" entry={fakeEntry} onCancel={() => setShake('idle')}/>;
  if (shake === 'done' && poem)
    return <Shake theme={theme} state="done" entry={{ ...fakeEntry, poem }}
      onRegen={doShake} onAccept={() => doSave(poem)}/>;

  const filled = body.trim().length > 0;
  const ps = paperBg(paper, theme);
  const paperLabel = { plain:'空 白', ruled:'横 格', grid:'方 格', columns:'朱 丝 栏', dots:'点 阵', sakura:'花 瓣', cloud:'祥 云', wave:'波 纹', moon:'月 相' };

  return (
    <div style={{ width: W, height: H, background: theme.paper, position: 'relative', overflow: 'hidden', fontFamily: 'inherit' }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', ...ps }}/>
      <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>

        {/* top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '60px 20px 0' }}>
          <button onClick={onBack} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 8 }}>
            <IconClose color={theme.textSoft} size={20}/>
          </button>
          <div style={{ fontSize: 12, color: theme.textSoft, fontWeight: 500 }}>新日记</div>
          <div style={{ height: 26, padding: '0 10px', borderRadius: 13, background: theme.surface + 'cc', border: `0.5px solid ${theme.line}`, display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10.5, color: theme.textSoft, letterSpacing: 1.5 }}>
            <span style={{ width: 4, height: 4, borderRadius: 2, background: theme.accent, display: 'inline-block' }}/>
            {paperLabel[paper] || '空 白'}
          </div>
        </div>

        {/* meta */}
        <div style={{ padding: '12px 28px 0' }}>
          <div style={{ fontSize: 12, color: theme.textMute, letterSpacing: 0.3 }}>{info.label}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: theme.textMute, marginTop: 5 }}>
            <IconPin color={theme.textMute} size={11}/><span>{place}</span>
          </div>
          {/* mood picker */}
          <div className="no-scroll" style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 5, overflowX: 'auto', paddingBottom: 2 }}>
            <span style={{ fontSize: 10.5, color: theme.textMute, letterSpacing: 1.5, flexShrink: 0, marginRight: 2 }}>心 情</span>
            {MOODS_REAL.map(m => (
              <span key={m} onClick={() => setMood(mood === m ? '' : m)} style={{
                width: 30, height: 30, borderRadius: 15, cursor: 'pointer', flexShrink: 0,
                background: mood === m ? theme.seal + '22' : 'transparent',
                border: mood === m ? `1.5px solid ${theme.seal}` : `0.5px solid ${theme.line}`,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                transition: 'border .12s, background .12s',
              }}>{m}</span>
            ))}
          </div>
        </div>

        {/* text area */}
        <div style={{ flex: 1, padding: '18px 28px 0', minHeight: 0 }}>
          <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="今天，"
            style={{
              width: '100%', height: '100%', border: 'none', outline: 'none', resize: 'none',
              background: 'transparent', color: theme.text,
              fontFamily: "'Noto Serif SC', serif",
              fontSize: 17, lineHeight: paper === 'ruled' ? '34px' : 1.95, letterSpacing: 0.5,
            }}
          />
        </div>

        {err && <div style={{ padding: '4px 28px', color: theme.seal, fontSize: 12 }}>{err}</div>}

        {/* bottom bar */}
        <div style={{ padding: '8px 16px 32px', background: `linear-gradient(to top, ${theme.paper} 72%, ${theme.paper}00)` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <button onClick={() => setFlag(!flag)} style={{
              height: 34, padding: '0 12px', borderRadius: 17, border: 'none',
              background: flag ? theme.seal + '22' : theme.surface,
              color: flag ? theme.seal : theme.textSoft,
              display: 'flex', alignItems: 'center', gap: 5, fontSize: 12,
              fontFamily: 'inherit', cursor: 'pointer',
            }}>
              <FlagDot theme={theme} size={10}/>里程碑
            </button>
            <div style={{ flex: 1 }}/>
            <span style={{ fontSize: 11, color: theme.textMute }}>{body.length > 0 ? body.length + ' 字' : ''}</span>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={doShake} disabled={!filled || saving} style={{
              flex: 1, height: 46, borderRadius: 23,
              border: `1px solid ${filled ? theme.seal + 'aa' : theme.line}`, background: 'transparent',
              color: filled ? theme.seal : theme.textMute,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              fontSize: 13.5, letterSpacing: 1.5, fontFamily: "'Noto Serif SC', serif",
              cursor: filled ? 'pointer' : 'default',
            }}>
              <IconShake color={filled ? theme.seal : theme.textMute} size={16}/>
              摇签求诗
              <span style={{ fontSize: 9.5, opacity: 0.55 }}>可选</span>
            </button>
            <button onClick={() => doSave(null)} disabled={!filled || saving} style={{
              flex: 1, height: 46, borderRadius: 23, border: 'none',
              background: filled && !saving ? theme.text : theme.surfaceSoft,
              color: filled && !saving ? theme.bg : theme.textMute,
              fontSize: 15, fontWeight: 600, letterSpacing: 3,
              fontFamily: 'inherit', cursor: filled && !saving ? 'pointer' : 'default',
            }}>{saving ? '保存中…' : '保 存'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── NewHexagram ────────────────────────────────────────────────
const HEX_NAMES = ['乾','坤','屯','蒙','需','讼','师','比','小畜','履','泰','否','同人','大有','谦','豫','随','蛊','临','观','噬嗑','贲','剥','复','无妄','大畜','颐','大过','坎','离','咸','恒','遯','大壮','晋','明夷','家人','睽','蹇','解','损','益','夬','姤','萃','升','困','井','革','鼎','震','艮','渐','归妹','丰','旅','巽','兑','涣','节','中孚','小过','既济','未济'];
function hexIndex(lines) { return lines.reduce((a,l,i) => a+(l.type==='yang'?1:0)*Math.pow(2,i),0)%64; }

async function apiHexagram(question, hexName, lines) {
  const r = await fetch('/api/hexagram', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, hexName, lines }),
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

function NewHexagram({ theme, initialQuestion = '', onBack, onSaved }) {
  const [question, setQuestion] = React.useState(initialQuestion);
  const [mood, setMood] = React.useState('');
  const [lines, setLines] = React.useState(Array(6).fill(null).map(() => ({ type:'yang', changing:false })));
  const [step, setStep] = React.useState('setup'); // setup | loading | done
  const [interp, setInterp] = React.useState('');
  const [err, setErr] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  const hexName = React.useMemo(() => HEX_NAMES[hexIndex(lines)], [JSON.stringify(lines)]);

  const changeLine = (i, field) => setLines(prev =>
    prev.map((l,idx) => idx===i ? {...l, [field]: field==='type'?(l.type==='yang'?'yin':'yang'):!l.changing} : l)
  );

  const doInterpret = async () => {
    if (!question.trim()) { setErr('请先写下问题'); return; }
    setStep('loading'); setErr('');
    try {
      const result = await apiHexagram(question.trim(), hexName, lines);
      setInterp(result); setStep('done');
    } catch(e) { setErr(e.message); setStep('setup'); }
  };

  const doSave = async () => {
    setSaving(true);
    try {
      const info = nowInfo();
      await onSaved({ date:info.date, time:info.time, question:question.trim(), name:hexName, lines, interp, mood });
    } catch(e) { setSaving(false); }
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
function AppReal() {
  const [authState, setAuthState] = React.useState('loading');
  const [entries, setEntries] = React.useState([]);
  const [hexagrams, setHexagrams] = React.useState([]);
  const [stack, setStack] = React.useState([{ screen: 'home', params: {} }]);
  const [themeKey, setThemeKey_] = React.useState(
    () => localStorage.getItem('diary-theme') || 'celadon'
  );
  const [paper, setPaper_] = React.useState(
    () => localStorage.getItem('diary-paper') || 'plain'
  );
  const [startLoading, setStartLoading] = React.useState(false);

  const theme = window.THEMES[themeKey] || window.THEMES.celadon;
  const setThemeKey = k => { localStorage.setItem('diary-theme', k); setThemeKey_(k); };

  const push = (s, p = {}) => setStack(st => [...st, { screen: s, params: p }]);
  const pop  = () => setStack(st => st.length > 1 ? st.slice(0, -1) : st);
  const reset = s => setStack([{ screen: s, params: {} }]);

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
        <ComposeReal theme={theme} paper={paper} onBack={pop}
          onSaved={async () => { await refresh(); pop(); }}
        />
      );

    case 'detail': {
      const entry = entryById(params.id);
      if (!entry) { pop(); return null; }
      return <Detail theme={theme} entry={entry} onBack={pop}
        onToggleFlag={() => updateEntry(entry.id, { flag: !entry.flag })}
        onAddNote={text => updateEntry(entry.id, {
          notes: [...(entry.notes || []), { date: new Date().toLocaleString('zh-CN', { hour12: false }), text }],
        })}
        onDelete={async () => { await deleteEntry(entry.id); pop(); }}
      />;
    }

    case 'search':
      return (
        <Search theme={theme} entries={entries} onClose={pop}
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
      return <Hexagrams theme={theme} hexes={hexagrams} onNew={() => push('newhex', {})} onFollowUp={(q) => push('newhex', { question: q })} onTab={tabHandler}/>;

    case 'settings':
      return (
        <Settings theme={theme} currentThemeKey={themeKey}
          onChangeTheme={setThemeKey}
          entriesCount={entries.length}
          entries={entries}
          hexagrams={hexagrams}
          onImportData={importData}
          onClearData={clearAllData}
          onSignOut={handleSignOut}
          onTab={tabHandler}
        />
      );

    case 'newhex':
      return <NewHexagram theme={theme} initialQuestion={params.question || ''} onBack={pop} onSaved={async (hex) => {
        await dbSaveHexagram(hex); const h = await dbGetHexagrams(); setHexagrams(h); pop();
      }}/>;

    default:
      return (
        <EmptyHomeScreen theme={theme} onCompose={() => push('compose')} onTab={tabHandler}/>
      );
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(<AppReal/>);
