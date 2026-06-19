# 诗签 · Poem Lot

写下今天，摇出一签。AI 会根据每篇日记生成判词、解释、原创中文古体诗，或英文十四行诗。

## 当前状态（2026.06.19-r64）

这版继续修复视觉和产品结构问题：青瓷换成新的釉面背景图，晨报按“新青年 / LA JEUNESSE”报纸骨架重绘，双诗体改成每篇日记独立保存中文与英文版本，并补上草稿、置顶、分享卡、判词去重、摇签动画和翻页动画。

| 问题 | 状态 | 说明 |
|---|---|---|
| 青瓷裂纹与旧背景 | 已修复 | 使用 `assets/themes/generated/celadon-bg.webp`，卡片去掉几何裂纹 |
| 晨报遮挡诗句 | 已修复 | 整屏保留报纸背景，诗卡内部改为纯纸纹和栏线，不再重复刊头字 |
| 一篇日记同时要中文和英文诗 | 已实现 | `poemVariants` 保存双版本，详情页可切换；缺失版本显示生成入口 |
| 草稿功能 | 已实现 | 本地自动保存草稿，首页草稿条可继续编辑 |
| 古诗和判词重复 | 已修复 | API 提示词、服务端校验和旧数据读取都会过滤近似重复判词 |
| 置顶处理 | 已修复 | 列表保持时间顺序，首页顶部优先展示置顶诗签 |
| 摇签动画粗糙 | 已增强 | 签筒、签束、落签、墨点和文字粒子分层动画 |
| 古诗册翻页生硬 | 已增强 | 参考 page-flip 类库的时间、阴影、卷页和落定节奏 |
| 分享设计单薄 | 已增强 | 中文分享卡为竹简竖排，英文分享卡为羊皮卷 |
| PWA 继续读取旧文件 | 已修复 | `CACHE_NAME` 升到 `poem-diary-r64`，入口脚本版本升到 `2026.06.19-r64` |

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

晨报现在按“新青年”刊物感重新设计：

- 背景像一整张旧报纸，有纸纹、栏线、红色刊线和淡化刊头。
- 诗卡像报纸文章栏，内部只保留纸纹、分栏线和克制红线。
- 刊头只出现在卡片上方，不进入诗题和诗句正文区域。

### 旧书房

旧书房改为“桌面上的一本册子”：

- 背景包含木纹、灯光、书架和摊开的册页。
- 诗卡保留温暖旧纸色，但减少杂乱装饰。
- 后续可以继续加书签、批注、墨迹显影，让它更像私人书斋。

### 英文诗与中文诗

英文诗使用羊皮纸/魔法信件方向：展开纸卷，墨迹逐行浮现。

中文诗不照搬羊皮纸，使用竹简和册页方向：

- 今日诗签：像翻开一页右开册页，标题和印章在右上，诗句可做竖排分列。
- 生成动效：不是打字机，而是墨迹显影，最后落一枚朱印。
- 诗册浏览：保留纸张翻页，加强书脊、页角、月份页签。
- 年度导出：可做成“年册”，包含目录、月份分卷、日记摘句和诗签页。

## 多诗体数据方案

旧数据结构是单槽位：

```js
entry.poem
entry.sign
```

现在已兼容并写入多版本结构：

```js
entry.poemVariants = {
  "zh-classical": { poem, sign, generatedAt },
  "en-sonnet": { poem, sign, generatedAt },
  "zh-ci": { poem, sign, generatedAt }
};
entry.activePoemStyle = "zh-classical";
```

交互上，详情页提供“中文 / English”切换。已有版本直接切换；缺失版本显示灰态生成入口。生成新诗体时只写入对应 key，不覆盖已有诗。旧数据可兼容：没有 `poemVariants` 时，把现有 `poem` / `sign` 当作一个版本显示。

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

r64 已检查：

```bash
node --check themes-extra.js
node --check service-worker.js
node --check api/poem.js
node tests/sonnet-grader.test.mjs
PW_PATH=... THEME_KEYS=celadon,morningPaper node tests/render-theme-skins.mjs
PW_PATH=... node tests/render-settings-desktop.mjs
```

真实页面 Playwright 检查在当前沙盒中被外网限制挡住：React/Firebase CDN 请求返回 `ERR_NETWORK_ACCESS_DENIED`，因此页面停在启动屏并出现 `firebase is not defined`。本地或线上网络正常时，r64 已提升缓存名，刷新后应自动更新。
