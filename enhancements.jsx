// Interaction fixes layered after the shared screens.

function EnhancedSearch({ theme, entries, onClose, onOpen }) {
  const [query, setQuery] = React.useState('');
  const [filter, setFilter] = React.useState('全部');
  const q = query.trim().toLowerCase();
  const valuesFor = entry => {
    const keyword = [
      entry?.title,
      entry?.body,
      entry?.poem?.title,
      ...(entry?.tags || []),
      ...(entry?.notes || []).map(note => note?.text),
    ];
    const place = [entry?.place];
    const date = [entry?.date, entry?.weekday, entry?.time];
    if (filter === '关键词') return keyword;
    if (filter === '地点') return place;
    if (filter === '时间') return date;
    return [...keyword, ...place, ...date];
  };
  const results = q
    ? (entries || []).filter(entry => valuesFor(entry)
      .filter(Boolean)
      .some(value => String(value).toLowerCase().includes(q)))
    : [];
  return (
    <Screen theme={theme} noTab>
      <div style={{ padding: '60px 20px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, height: 40, borderRadius: 20, background: theme.surface, display: 'flex', alignItems: 'center', padding: '0 14px', gap: 8 }}>
          <IconSearch color={theme.textSoft} size={16}/>
          <input autoFocus value={query} onChange={event => setQuery(event.target.value)}
            placeholder={filter === '全部' ? '搜索正文、地点、日期、诗题或标签' : `搜索${filter}`}
            style={{ border: 'none', outline: 'none', background: 'transparent', flex: 1, color: theme.text, fontSize: 15, fontFamily: 'inherit' }}/>
        </div>
        <button type="button" onClick={onClose} style={{ border: 'none', background: 'transparent', color: theme.textSoft, fontSize: 15, fontFamily: 'inherit', cursor: 'pointer' }}>取消</button>
      </div>
      <div style={{ display: 'flex', gap: 8, padding: '16px 20px 0' }}>
        {['全部', '关键词', '地点', '时间'].map(label => {
          const active = filter === label;
          return <button type="button" key={label} onClick={() => setFilter(label)} style={{
            padding: '6px 14px', borderRadius: 14, cursor: 'pointer', fontFamily: 'inherit',
            background: active ? theme.text : 'transparent',
            color: active ? theme.bg : theme.textSoft,
            fontSize: 12, letterSpacing: .5,
            border: active ? 'none' : `0.5px solid ${theme.line}`,
          }}>{label}</button>;
        })}
      </div>
      <div style={{ padding: '24px 24px 8px', fontSize: 10, letterSpacing: 4, color: theme.textMute, fontWeight: 600 }}>
        {q ? `${results.length} 篇 · ${filter}中关于「${query.trim()}」` : `输入内容开始搜索 · 当前筛选：${filter}`}
      </div>
      <div style={{ padding: '0 24px 120px' }}>
        {results.map((entry, index, list) =>
          <PastRow key={entry.id} entry={entry} theme={theme} onClick={() => onOpen(entry.id)} isLast={index === list.length - 1}/>
        )}
      </div>
    </Screen>
  );
};

function LinkedHexCard({ theme, hex, onFollowUp, parent, childCount = 0 }) {
  return (
    <div style={{ background: theme.paper, borderRadius: 18, border: `0.5px solid ${theme.line}`, padding: '18px 18px', marginBottom: 14 }}>
      {parent && <div style={{ fontSize: 11, color: theme.accent, marginBottom: 12, paddingBottom: 10, borderBottom: `0.5px solid ${theme.line}` }}>
        追问自「{parent.question || '上一卦'}」 · {parent.name || '未定'} → 本次重新起卦
      </div>}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <HexagramGlyph lines={hex.lines || []} color={theme.text} size="lg"/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="serif" style={{ color: theme.text, fontSize: 18, letterSpacing: 2 }}>{hex.question || '未命名问题'}</div>
          <div style={{ color: theme.textMute, fontSize: 11, marginTop: 5 }}>{hex.name || '未定'}{hex.changedHexName && hex.changedHexName !== hex.name ? ` → ${hex.changedHexName}` : ''} · {hex.date || ''} {hex.time || ''}</div>
          {hex.entryId && <div style={{ color: theme.accent, fontSize: 11, marginTop: 5 }}>已关联日记</div>}
          {childCount > 0 && <div style={{ color: theme.accent, fontSize: 11, marginTop: 5 }}>后续追问 {childCount} 卦</div>}
        </div>
      </div>
      <div className="serif" style={{ marginTop: 14, paddingLeft: 14, borderLeft: `1.5px solid ${theme.accent}`, color: theme.text, fontSize: 14, lineHeight: 1.9, whiteSpace: 'pre-wrap' }}>{hex.interp || ''}</div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
        <button type="button" onClick={() => onFollowUp && onFollowUp(hex)} style={{
          height: 34, padding: '0 16px', borderRadius: 17,
          border: `0.5px solid ${theme.line}`, background: 'transparent',
          color: theme.textSoft, cursor: 'pointer', fontFamily: 'inherit',
        }}>追问并重新起卦</button>
      </div>
    </div>
  );
}

function EnhancedHexagrams({ theme, hexes = [], onNew, onFollowUp, onAnalyze, onTab }) {
  const [mode, setMode] = React.useState('reason');
  const [question, setQuestion] = React.useState('');
  const [analysis, setAnalysis] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');
  const analyze = async () => {
    if (!question.trim() || !onAnalyze) return;
    setBusy(true); setError('');
    try { setAnalysis(await onAnalyze(question.trim())); }
    catch (err) { setError(err.message || '分析失败'); }
    finally { setBusy(false); }
  };
  return (
    <Screen theme={theme} tab="hex" onTab={onTab}>
      <div style={{ padding: '64px 24px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: 3, color: theme.textMute, fontWeight: 500 }}>QUESTIONS</div>
          <div className="serif" style={{ fontSize: 30, fontWeight: 600, marginTop: 4, color: theme.text }}>问</div>
          <div style={{ fontSize: 12, color: theme.textSoft, marginTop: 6 }}>分析生活疑惑，或以卦象照见处境</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, padding: '16px 20px 0' }}>
        {[['reason','理问'],['hex','卜签']].map(([id,label]) => <button key={id} type="button" onClick={() => setMode(id)} style={{
          flex: 1, height: 40, borderRadius: 20, border: `0.5px solid ${mode === id ? theme.text : theme.line}`,
          background: mode === id ? theme.text : theme.surface, color: mode === id ? theme.bg : theme.textSoft,
          fontFamily: 'inherit', cursor: 'pointer', letterSpacing: 2,
        }}>{label}</button>)}
      </div>

      {mode === 'reason' ? <div style={{ padding: '22px 20px 120px' }}>
        <div style={{ background: theme.paper, borderRadius: 18, padding: 18, border: `0.5px solid ${theme.line}` }}>
          <div className="serif" style={{ fontSize: 18, color: theme.text, letterSpacing: 2 }}>写下一个生活疑惑</div>
          <div style={{ fontSize: 11.5, color: theme.textMute, lineHeight: 1.7, marginTop: 7 }}>AI 会分析多种可能解释、反例与验证方法，不提供命运预测，也不会把示例理解成要开发某种系统。</div>
          <textarea value={question} onChange={event => setQuestion(event.target.value)} maxLength={1000}
            placeholder="例如：为什么我在纸上写东西时更容易认真思考？"
            style={{ width: '100%', height: 130, marginTop: 14, resize: 'none', borderRadius: 14, border: `0.5px solid ${theme.line}`, background: theme.surface, padding: 13, color: theme.text, outline: 'none', fontFamily: 'inherit', fontSize: 15, lineHeight: 1.7 }}/>
          <button type="button" onClick={analyze} disabled={busy || !question.trim()} style={{
            width: '100%', height: 46, marginTop: 10, borderRadius: 23, border: 'none',
            background: question.trim() ? theme.text : theme.surfaceSoft, color: question.trim() ? theme.bg : theme.textMute,
            fontFamily: 'inherit', cursor: question.trim() ? 'pointer' : 'default', letterSpacing: 2,
          }}>{busy ? '分析中…' : '开始理问'}</button>
        </div>
        {error && <div style={{ color: theme.seal, fontSize: 12, marginTop: 12 }}>{error}</div>}
        {analysis && <div style={{ marginTop: 14, background: theme.surface, borderRadius: 18, padding: '18px 18px', border: `0.5px solid ${theme.line}` }}>
          {analysis.split(/\n/).filter(Boolean).map((line, index) => <div key={index} className={line.startsWith('【') ? 'serif' : ''} style={{
            color: line.startsWith('【') ? theme.seal : theme.text, fontSize: line.startsWith('【') ? 14 : 13.5,
            fontWeight: line.startsWith('【') ? 600 : 400, lineHeight: 1.8, marginTop: index ? 7 : 0,
          }}>{line}</div>)}
        </div>}
      </div> : <>
      <div style={{ padding: '20px 20px 0' }}>
        <button type="button" onClick={onNew} style={{ width: '100%', background: theme.paper, borderRadius: 20, padding: '20px 22px', border: `0.5px solid ${theme.line}`, display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}>
          <HexagramGlyph lines={[{type:'yang'},{type:'yin'},{type:'yang'},{type:'yin'},{type:'yang'},{type:'yin'}]} color={theme.text} size="lg"/>
          <div style={{ flex: 1 }}>
            <div className="serif" style={{ fontSize: 18, color: theme.text, fontWeight: 500, letterSpacing: 2 }}>起 一 卦</div>
            <div style={{ fontSize: 12, color: theme.textSoft, marginTop: 4 }}>手动设爻 · AI 解签 · 记下今天的疑问</div>
          </div>
          <IconChevron color={theme.textMute} dir="right" size={14}/>
        </button>
      </div>
      <div style={{ padding: '26px 20px 120px' }}>
        {hexes.length
          ? hexes.map(hex => <LinkedHexCard key={hex.id} hex={hex} parent={hexes.find(item => item.id === hex.parentHexId)}
              childCount={hexes.filter(item => item.parentHexId === hex.id).length} theme={theme} onFollowUp={onFollowUp}/>)
          : <div className="serif" style={{ padding: '48px 20px', textAlign: 'center', color: theme.textMute, lineHeight: 2 }}>还没有卦象<br/>点上方起一卦</div>}
      </div>
      </>}
    </Screen>
  );
};
