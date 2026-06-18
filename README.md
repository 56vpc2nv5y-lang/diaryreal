# 诗签 · Poem Lot

写下今天，摇出一签。AI 会根据每篇日记生成判词、解释、原创中文古体诗，或英文十四行诗。

## 当前状态（2026.06.19-r63）

这版主要是一次紧急修复：上一轮版本号替换时，`index.html` 和 `README.md` 被错误编码写入，导致中文乱码、HTML 启动屏标签损坏、CSS `content` 字符串缺少闭合引号，进而让设置页桌面布局塌缩。r63 已修复这些结构性问题，并强制刷新 PWA 缓存。

| 问题 | 状态 | 说明 |
|---|---|---|
| 页面标题和启动屏乱码 | 已修复 | 恢复 `诗签`、`加载中`、启动提示文案和 HTML 标签闭合 |
| 设置页主题卡片挤成一列 | 已修复 | 修复损坏的 CSS `content` 字符串，避免后续桌面布局规则失效 |
| README 大段乱码 | 已修复 | README 已重新写成 UTF-8 中文文档 |
| PWA 继续读取旧文件 | 已修复 | `CACHE_NAME` 升到 `poem-diary-r63`，入口脚本版本升到 `2026.06.19-r63` |
| 晨报主题遮挡正文 | 已修复 | 改为报纸背景和报纸诗卡，去掉会盖住文字的刊头贴片 |
| 旧书房主题不满意 | 初版重绘 | 改为木桌、灯光、书架、摊开册页的视觉方向 |
| 古诗册翻页生硬 | 初版增强 | 增加纸页掠影、书脊阴影、页角卷影和落定动画 |

## 功能

- 日记：标题、正文、日期、位置、心情、标签、照片、里程碑。
- 摇签：读取日记后生成判词、解释、原创诗。
- 双诗体：中文古体诗和英文 Shakespearean sonnet。
- 诗册：收藏历史诗签，支持纸张翻页展示。
- 时间线：按日期浏览日记和里程碑。
- 六爻：投掷铜钱起卦，并支持追问。
- AI 拾句：从日记正文中提取值得收藏的句子。
- 主题皮肤：青瓷、苔庭、墨梅、旧书房、晨报、黄昏、海盐等。
- 云同步：Firebase Authentication + Firestore。
- PWA：可安装到主屏幕，并支持离线浏览缓存内容。

## 主题设计方向

### 晨报

晨报不再使用会覆盖正文的刊头贴片。现在的方向是：

- 背景像一整张旧报纸，有纸纹、栏线、红色刊线。
- 诗卡像报纸版面，而不是普通卡片上贴一个“新青年”框。
- 正文区域优先保证阅读，不允许装饰层压住标题或诗句。

### 旧书房

旧书房改为“桌面上的一本册子”：

- 背景包含木纹、灯光、书架和摊开的册页。
- 诗卡保留温暖旧纸色，但减少杂乱装饰。
- 后续可以继续加书签、批注、墨迹显影，让它更像私人书斋。

### 英文诗与中文诗

英文诗适合羊皮纸/魔法信件：展开纸卷，墨迹逐行浮现。

中文诗不建议照搬羊皮纸。更适合做成线装册或笺谱：

- 今日诗签：像翻开一页右开册页，标题和印章在右上，诗句可做竖排分列。
- 生成动效：不是打字机，而是墨迹显影，最后落一枚朱印。
- 诗册浏览：保留纸张翻页，加强书脊、页角、月份页签。
- 年度导出：可做成“年册”，包含目录、月份分卷、日记摘句和诗签页。

## 多诗体数据方案

目前旧数据结构是单槽位：

```js
entry.poem
entry.sign
```

如果一篇日记同时需要中文诗、英文诗，甚至不同中文古诗体，建议迁移为多版本结构：

```js
entry.poemVariants = {
  "zh-classical": { poem, sign, generatedAt },
  "en-sonnet": { poem, sign, generatedAt },
  "zh-ci": { poem, sign, generatedAt }
};
entry.activePoemStyle = "zh-classical";
```

交互上，详情页和诗册页提供“中文 / English / 更多诗体”的切换。生成新诗体时只写入对应 key，不覆盖已有诗。旧数据可兼容：没有 `poemVariants` 时，把现有 `poem` / `sign` 当作 `zh-classical` 显示。

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | React 18 + Babel standalone |
| 样式 | 内联样式 + CSS 自定义属性主题系统 |
| API | Vercel Serverless Functions |
| AI | DeepSeek Chat API |
| 数据库 | Firebase Firestore |
| 认证 | Firebase Authentication |
| PWA | Service Worker + Web App Manifest |

## 目录结构

```text
.
├── index.html              # 入口、全局 CSS、脚本加载
├── app-real.jsx            # 主应用、路由、状态、Firebase 读写
├── primitives.jsx          # 共享组件、主题装饰、PoemBody
├── screens-main.jsx        # 首页、写作、摇签、详情、搜索
├── screens-other.jsx       # 时间线、诗册、六爻、设置
├── themes-extra.js         # 主题皮肤与 SVG 背景
├── service-worker.js       # PWA 缓存
├── api/                    # poem、hexagram、question、health
└── assets/                 # 图标和主题资源
```

## 本地运行

项目没有构建步骤，可以直接启动静态服务：

```bash
python -m http.server 4173
```

然后打开：

```text
http://127.0.0.1:4173/
```

AI 接口需要 Vercel 环境变量：

```text
DEEPSEEK_API_KEY=sk-...
```

## 验证记录

r63 修复后建议检查：

```bash
node --check themes-extra.js
node --check service-worker.js
node --check api/health.js
node tests/sonnet-grader.test.mjs
```

如浏览器仍显示旧版，请清理站点数据或等待新的 service worker 激活。r63 已提升缓存名，正常刷新后应自动更新。
