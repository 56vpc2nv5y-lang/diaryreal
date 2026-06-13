// app.jsx — DesignCanvas + Tweaks wiring.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "celadon",
  "poemLayout": "horizontal",
  "density": "sparse",
  "paper": "plain",
  "showNotes": true
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const theme = window.THEMES[t.theme] || window.THEMES.celadon;
  const entries = window.ENTRIES;

  // a noop for the in-frame interactive callbacks — these are mockups
  const noop = () => {};

  const detailEntry = entries[0];
  const detailEntry2 = entries[5]; // sea — has flag + photos + notes

  return (
    <React.Fragment>
      <DesignCanvas>
        {/* ── header / intro ──────────────────────────────────────── */}
        <DCSection
          id="intro"
          title="日记 · 诗签"
          subtitle="写一篇日记 · Grok 读后生成一首专属于这一天的原创诗 · 写完摇一摇 · 今日之诗就此定格"
        >
          <DCArtboard id="brief" label="设计说明" width={420} height={H}>
            <Brief theme={theme} />
          </DCArtboard>
          <DCArtboard id="system" label="视觉系统" width={420} height={H}>
            <SystemNote />
          </DCArtboard>
        </DCSection>

        {/* ── 主页 + 搜索 ─────────────────────────────────────────── */}
        <DCSection
          id="home"
          title="主页 · 今日诗签"
          subtitle="今日诗签置顶 · 往日列表 · 搜索入口"
        >
          <DCArtboard id="home-default" label="主页" width={W} height={H}>
            <Home theme={theme} entries={entries} drafts={window.DRAFTS} poemLayout={t.poemLayout} density={t.density} onOpen={noop} onCompose={noop} onSearch={noop} onTab={noop} />
          </DCArtboard>
          <DCArtboard id="search" label="搜索" width={W} height={H}>
            <Search theme={theme} entries={entries} onClose={noop} onOpen={noop} />
          </DCArtboard>
        </DCSection>

        {/* ── 写日记 + 摇签流程 ──────────────────────────────────── */}
        <DCSection
          id="compose"
          title="写日记 · 摇签求诗"
          subtitle="写下心事是主事 · 摇签是仪式 · 想摇才摇，不摇也开心"
        >
          <DCArtboard id="empty" label="① 空白态" width={W} height={H}>
            <Compose theme={theme} state="empty" paper={t.paper} />
          </DCArtboard>
          <DCArtboard id="filled" label="② 已写好 · 保存/求诗" width={W} height={H}>
            <Compose theme={theme} state="filled" paper={t.paper} />
          </DCArtboard>
          <DCArtboard id="shaking" label="③ 选了求诗 · 正在摇签" width={W} height={H}>
            <Shake theme={theme} state="shaking" entry={detailEntry} />
          </DCArtboard>
          <DCArtboard id="result" label="④ 诗已生成" width={W} height={H}>
            <Shake theme={theme} state="done" entry={detailEntry} />
          </DCArtboard>
        </DCSection>

        {/* ── 信纸背景 ─────────────────── */}
        {/* ── 快记 · 草稿 ────────────────────────────── */}
        <DCSection
          id="quick"
          title="快记 · 来不及写的时候"
          subtitle="长按 + 弹出三个选项 · 先拍 / 先写题 / 完整日记 · 草稿在主页顶部续写"
        >
          <DCArtboard id="quick-menu" label="长按 + 弹出" width={W} height={H}>
            <QuickMenu theme={theme} entries={entries} drafts={window.DRAFTS} />
          </DCArtboard>
          <DCArtboard id="quick-photo" label="拍一张·草稿" width={W} height={H}>
            <QuickCapture theme={theme} kind="photo" />
          </DCArtboard>
          <DCArtboard id="quick-title" label="先写个题·草稿" width={W} height={H}>
            <QuickCapture theme={theme} kind="title" />
          </DCArtboard>
        </DCSection>

        <DCSection
          id="paper"
          title="信纸 · 9 种"
          subtitle="5 种纹路 + 4 种图案 · 信纸都是主题色刷出来的"
        >
          <DCArtboard id="paper-plain" label="空白" width={W} height={H}>
            <Compose theme={theme} state="filled" paper="plain" />
          </DCArtboard>
          <DCArtboard id="paper-ruled" label="横格" width={W} height={H}>
            <Compose theme={theme} state="filled" paper="ruled" />
          </DCArtboard>
          <DCArtboard id="paper-grid" label="方格" width={W} height={H}>
            <Compose theme={theme} state="filled" paper="grid" />
          </DCArtboard>
          <DCArtboard id="paper-columns" label="朋丝栏" width={W} height={H}>
            <Compose theme={theme} state="filled" paper="columns" />
          </DCArtboard>
          <DCArtboard id="paper-dots" label="点阵" width={W} height={H}>
            <Compose theme={theme} state="filled" paper="dots" />
          </DCArtboard>
          <DCArtboard id="paper-sakura" label="樱 · 花瓣" width={W} height={H}>
            <Compose theme={theme} state="filled" paper="sakura" />
          </DCArtboard>
          <DCArtboard id="paper-cloud" label="云 · 祥云" width={W} height={H}>
            <Compose theme={theme} state="filled" paper="cloud" />
          </DCArtboard>
          <DCArtboard id="paper-wave" label="水 · 波纹" width={W} height={H}>
            <Compose theme={theme} state="filled" paper="wave" />
          </DCArtboard>
          <DCArtboard id="paper-moon" label="月 · 月相" width={W} height={H}>
            <Compose theme={theme} state="filled" paper="moon" />
          </DCArtboard>
        </DCSection>

        {/* ── 详情页 ──────────────────────────────────────────────── */}
        <DCSection
          id="detail"
          title="日记详情 · 回看点评"
          subtitle="顶部诗签 · 元信息 · 日记正文 · 配图 · 不同时期的自我对话"
        >
          <DCArtboard id="detail-notes" label="有回看的篇" width={W} height={H}>
            <Detail theme={theme} entry={detailEntry2} />
          </DCArtboard>
          <DCArtboard id="detail-fresh" label="新签 · 还没回看" width={W} height={H}>
            <Detail theme={theme} entry={entries[1]} />
          </DCArtboard>
          <DCArtboard id="detail-no-poem" label="未求诗的篇" width={W} height={H}>
            <Detail theme={theme} entry={entries[3]} showPoem={false} />
          </DCArtboard>
        </DCSection>

        {/* ── 时间线 ──────────────────────────────────────────────── */}
        <DCSection
          id="timeline"
          title="时间线 · 里程碑"
          subtitle="只有被标记 flag 的篇章，按时间排列"
        >
          <DCArtboard id="timeline" label="时间线" width={W} height={H}>
            <Timeline theme={theme} entries={entries} onOpen={noop} onTab={noop} />
          </DCArtboard>
        </DCSection>

        {/* ── 导入 ──────────────────────────────────────────────── */}
        <DCSection
          id="import"
          title="导入过去日记"
          subtitle=".docx · .txt · .pdf · .md 均可 · 每篇旧日记也补一首诗"
        >
          <DCArtboard id="import" label="导入" width={W} height={H}>
            <Import theme={theme} onTab={noop} />
          </DCArtboard>
        </DCSection>

        {/* ── 设置 ──────────────────────────────────────────────── */}
        <DCSection
          id="sign"
          title="卜签 · 六爷"
          subtitle="诗签 与 卜签 共享「签」的视觉语言 · 存每一次求问"
        >
          <DCArtboard id="hex" label="卜签页" width={W} height={H}>
            <Hexagrams theme={theme} onTab={noop} />
          </DCArtboard>
        </DCSection>

        <DCSection
          id="collections"
          title="合集 · 标签"
          subtitle="电影 / 大学 / 研究生 / 跨步 / …… · 后来翻一翻很方便"
        >
          <DCArtboard id="collections" label="合集" width={W} height={H}>
            <Collections theme={theme} />
          </DCArtboard>
        </DCSection>

        <DCSection
          id="export"
          title="导出 · 分享"
          subtitle="单篇方图分朋友圈 · 月度集 · 年度线装古风诗集"
        >
          <DCArtboard id="export-hub" label="导出中心" width={W} height={H}>
            <ExportHub theme={theme} entry={detailEntry} />
          </DCArtboard>
          <DCArtboard id="share-card" label="单篇 · 方图分享" width={W} height={H}>
            <ShareCard theme={theme} entry={detailEntry} paper="sakura" />
          </DCArtboard>
          <DCArtboard id="book" label="年度 · 线装诗集" width={W} height={H}>
            <BookPreview theme={theme} entries={entries} />
          </DCArtboard>
        </DCSection>

        <DCSection
          id="settings"
          title="设置 · 我"
          subtitle="主题皮肤 · 提醒 · 导入 · 导出 · 同步"
        >
          <DCArtboard id="settings" label="设置" width={W} height={H}>
            <Settings theme={theme} currentThemeKey={t.theme} onChangeTheme={(k) => setTweak('theme', k)} onTab={noop} />
          </DCArtboard>
        </DCSection>

        {/* notes scattered on the canvas */}
        {t.showNotes && (
          <React.Fragment>
            <DCPostIt top={-30} left={20} rotate={-3} width={210}>
              点击右下角 ⓘ Tweaks 切换四套主题 · 信纸背景 · 横/竖排诗签
            </DCPostIt>
          </React.Fragment>
        )}
      </DesignCanvas>

      <TweaksPanel title="Tweaks">
        <TweakSection label="主题皮肤" />
        <TweakColor
          label="皮肤"
          value={[window.THEMES[t.theme].bg, window.THEMES[t.theme].accent, window.THEMES[t.theme].seal]}
          options={[
            [window.THEMES.celadon.bg, window.THEMES.celadon.accent, window.THEMES.celadon.seal],
            [window.THEMES.night.bg, window.THEMES.night.accent, window.THEMES.night.seal],
            [window.THEMES.study.bg, window.THEMES.study.accent, window.THEMES.study.seal],
            [window.THEMES.dusk.bg, window.THEMES.dusk.accent, window.THEMES.dusk.seal],
          ]}
          onChange={(palette) => {
            const keys = ['celadon', 'night', 'study', 'dusk'];
            for (const k of keys) {
              const th = window.THEMES[k];
              if ([th.bg, th.accent, th.seal].join(',') === palette.join(',')) {
                setTweak('theme', k); return;
              }
            }
          }}
        />
        <TweakRadio
          label=" "
          value={t.theme}
          options={[
            { value: 'celadon', label: '青瓷' },
            { value: 'night', label: '夜航' },
            { value: 'study', label: '旧书房' },
            { value: 'dusk', label: '暮云' },
          ]}
          onChange={(v) => setTweak('theme', v)}
        />
        <TweakSection label="信纸背景" />
        <TweakSelect
          label="纸质"
          value={t.paper}
          options={[
            { value: 'plain', label: '空白' },
            { value: 'ruled', label: '横格' },
            { value: 'grid', label: '方格' },
            { value: 'columns', label: '朋丝栏' },
            { value: 'dots', label: '点阵' },
            { value: 'sakura', label: '樱·花瓣' },
            { value: 'cloud', label: '云·祥云' },
            { value: 'wave', label: '水·波纹' },
            { value: 'moon', label: '月·月相' },
          ]}
          onChange={(v) => setTweak('paper', v)}
        />
        <TweakSection label="诗签排版" />
        <TweakRadio
          label="今日卡"
          value={t.poemLayout}
          options={[
            { value: 'horizontal', label: '横排' },
            { value: 'vertical', label: '竖排' },
          ]}
          onChange={(v) => setTweak('poemLayout', v)}
        />
        <TweakSection label="主页列表" />
        <TweakRadio
          label="密度"
          value={t.density}
          options={[
            { value: 'sparse', label: '稀疏' },
            { value: 'dense', label: '中等' },
          ]}
          onChange={(v) => setTweak('density', v)}
        />
        <TweakSection label="画布" />
        <TweakToggle
          label="便签提示"
          value={t.showNotes}
          onChange={(v) => setTweak('showNotes', v)}
        />
      </TweaksPanel>
    </React.Fragment>
  );
}

// ── intro artboards ──────────────────────────────────────────────
function Brief({ theme }) {
  return (
    <div style={{ padding: '36px 32px', height: H, background: theme.paper, color: theme.text, fontFamily: 'inherit' }}>
      <div style={{ fontSize: 10, letterSpacing: 4, color: theme.textMute, fontWeight: 600 }}>BRIEF</div>
      <div className="serif" style={{ fontSize: 28, fontWeight: 600, letterSpacing: -0.3, marginTop: 6 }}>日记 · 诗签</div>
      <div style={{ width: 28, height: 1, background: theme.accent, margin: '14px 0 18px' }}/>

      <div className="serif" style={{ fontSize: 15, lineHeight: 1.95, color: theme.text, letterSpacing: 0.3 }}>
        每天写日记，Grok 读你的文字，以五绝 / 七绝为形，为这一天生成一首中文古诗。
      </div>
      <div className="serif" style={{ fontSize: 15, lineHeight: 1.95, color: theme.text, letterSpacing: 0.3, marginTop: 12 }}>
        日记 + 诗 = 一签。想摇才摇，不是必须；某些天只想静静写，也是足够的。
      </div>

      <div style={{ marginTop: 26, fontSize: 10, letterSpacing: 4, color: theme.textMute, fontWeight: 600 }}>气 质</div>
      <div className="serif" style={{ fontSize: 14, lineHeight: 1.9, marginTop: 10, color: theme.textSoft }}>
        温暖、舒服、包容。<br/>不冷漠，不功能主义。<br/>留白多过装饰。
      </div>

      <div style={{ marginTop: 26, fontSize: 10, letterSpacing: 4, color: theme.textMute, fontWeight: 600 }}>仪 式 感</div>
      <div className="serif" style={{ fontSize: 14, lineHeight: 1.9, marginTop: 10, color: theme.textSoft }}>
        想求一首诗的时候，把手机端在手里晃一晃，
        像把竹签从签筒里摇出来——一首诗落定。<br/>
        不是每篇都需要，但需要的那一天，会在。
      </div>

      <div style={{ marginTop: 26, fontSize: 10, letterSpacing: 4, color: theme.textMute, fontWeight: 600 }}>核 心 屏</div>
      <div style={{ fontSize: 13, lineHeight: 1.9, marginTop: 10, color: theme.textSoft }}>
        ① 主页 · 今日 + 往日<br/>
        ② 写日记 · 摇签 · 生诗<br/>
        ③ 详情 · 诗签 + 回看点评<br/>
        ④ 时间线 · 里程碑<br/>
        ⑤ 导入 · 旧日记补诗<br/>
        ⑥ 设置 · 三套皮肤
      </div>
    </div>
  );
}

function SystemNote() {
  // Light, theme-independent reference card
  return (
    <div style={{ padding: '36px 32px', height: H, background: '#faf9f7', color: '#29261b', fontFamily: 'inherit' }}>
      <div style={{ fontSize: 10, letterSpacing: 4, color: '#a09a8d', fontWeight: 600 }}>SYSTEM</div>
      <div className="serif" style={{ fontSize: 28, fontWeight: 600, letterSpacing: -0.3, marginTop: 6, color: '#29261b' }}>视觉系统</div>
      <div style={{ width: 28, height: 1, background: '#7B9485', margin: '14px 0 22px' }}/>

      <Row label="字体" v="衬线 · Noto Serif SC（诗签 / 标题）" />
      <Row label=""    v="无衬线 · 系统默认（正文 / UI）" />
      <Hr/>
      <Row label="主色调" v="温暖白底 · 0.02 以下饱和" />
      <Row label="点缀" v="单一 accent · 印章用朱砂红" />
      <Hr/>
      <div style={{ fontSize: 12, letterSpacing: 2, color: '#69655c', marginBottom: 10, fontWeight: 600 }}>四 套 皮 肤</div>
      <Swatches theme={window.THEMES.celadon} name="青瓷" desc="薄荷、深青 · 虔诚、清醒" />
      <Swatches theme={window.THEMES.night} name="夜航" desc="深靛、月白 · 安静、专注" />
      <Swatches theme={window.THEMES.study} name="旧书房" desc="旧纸、胡桃木 · 温暖、沉静" />
      <Swatches theme={window.THEMES.dusk} name="暮云" desc="雾紫、文楷 · 柔和、轻盈" />
      <Hr/>
      <div style={{ fontSize: 12, color: '#69655c', lineHeight: 1.7, letterSpacing: 0.3 }}>
        印章是诗签身份的标识 — 朱砂、圆角方、内置两字（取诗题首两字）、轻微旋转，出现在每张签上。
      </div>
    </div>
  );
}
function Row({ label, v }) {
  return (
    <div style={{ display: 'flex', gap: 14, padding: '5px 0', fontSize: 12.5, color: '#29261b', alignItems: 'baseline' }}>
      <div style={{ width: 56, color: '#a09a8d', fontSize: 11, letterSpacing: 1, flexShrink: 0 }}>{label}</div>
      <div style={{ flex: 1, lineHeight: 1.5 }}>{v}</div>
    </div>
  );
}
function Hr() { return <div style={{ height: 0.5, background: 'rgba(0,0,0,0.08)', margin: '14px 0' }}/>; }
function Swatches({ theme, name, desc }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
      <div style={{ display: 'flex' }}>
        {[theme.bg, theme.accent, theme.seal].map((c, i) => (
          <div key={i} style={{
            width: 22, height: 22, borderRadius: 11, background: c,
            marginLeft: i === 0 ? 0 : -6,
            border: '1.5px solid #fff',
          }}/>
        ))}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, color: '#29261b', fontWeight: 500 }}>{name}</div>
        <div style={{ fontSize: 11, color: '#a09a8d', letterSpacing: 0.3, marginTop: 1 }}>{desc}</div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
