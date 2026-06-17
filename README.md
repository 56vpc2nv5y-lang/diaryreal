# 诗签 · Poem Lot

> 写下今天，摇出一签 —— AI 为每篇日记生成专属判词与古体诗。

<!-- TODO: 替换为实际部署域名 -->
<!-- [**Live Demo →**](https://your-domain.vercel.app) -->

---

## 功能

- **日记** — 写日记，支持标题、位置、心情、标签、内联点评
- **摇签** — 摇晃手机触发；AI 生成判词 + 解语 + 原创五绝 / 七绝
- **诗册** — 收录历史诗签，书本翻页展示
- **时间线** — 按日期浏览所有日记，里程碑日记显示判词首行
- **六爻** — 投掷铜钱起卦，AI 解签；支持多步追问
- **AI 拾句** — 从日记正文中提取值得收藏的句子
- **七套主题皮肤** — 青瓷、苔庭、墨梅、旧书房、晨报、黄昏、海盐
- **云同步** — Firebase Firestore，绑定邮箱后跨设备同步
- **桌面适配** — ≥ 900 px 侧边导航 + 双栏写作界面
- **PWA** — 可安装到主屏幕，支持离线浏览历史日记

---

## 设计理念

**为什么是「签」？**
古人庙宇抽签，以草木卦象映照心境。「诗签」将这一传统数字化：AI 读取日记，返回一枚属于这一天的签 —— 判词是象征，诗是回响，而非预测或算命。核心体验是「被读懂」的感受。

**为什么选 DeepSeek？**
中文古典诗词生成质量高、成本低（约 $0.02/千 token），适合个人项目长期运营。模型调用集中在 `api/` 目录，替换成本极低。

**为什么不需要构建步骤？**
React 18 + Babel standalone 在浏览器端完成 JSX 编译，部署即一个静态目录。任何人 Fork 后直接部署，无需 npm install。

> 🚧 **规划中：双诗体本地化** —— 英文模式不做中文古诗的硬翻译，而是生成对应母语的古典诗体：莎士比亚式十四行诗（Shakespearean sonnet）。让「签」的文化内核在不同语言里都成立。详见 [PRODUCT-REVIEW.md](PRODUCT-REVIEW.md)。

---

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | React 18（Babel standalone，无构建步骤）|
| 样式 | 内联样式 + 少量 CSS class，CSS 自定义属性主题系统 |
| 后端 API | Vercel Serverless Functions（`api/*.js`）|
| AI | DeepSeek Chat API（`deepseek-chat`）|
| 数据库 | Firebase Firestore（支持离线持久化）|
| 认证 | Firebase Authentication（邮箱密码 + 匿名登录）|
| 部署 | Vercel |
| PWA | Service Worker 缓存 + Web App Manifest |

---

## 目录结构

```
.
├── index.html              # 入口，内联全部 CSS，加载所有 .jsx 脚本
├── app-real.jsx            # 主应用逻辑：路由、状态、Firebase 读写
├── screens-main.jsx        # 首页、写作、摇签、详情、搜索等核心屏
├── screens-other.jsx       # 时间线、诗册、六爻、设置页
├── primitives.jsx          # 共享组件（PoemBody、Seal、Icon 等）
├── themes-extra.js         # 主题皮肤扩展（SVG 背景、panel 样式）
├── enhancements.jsx        # 渐进增强（体验优化）
├── firebase-config.js      # Firebase 项目配置（需替换为自己的）
├── api/
│   ├── poem.js             # AI 生诗 + 判词接口
│   ├── hexagram.js         # 六爻起卦解签接口
│   ├── question.js         # 六爻追问接口
│   └── health.js           # 健康检查
├── assets/
│   ├── icons/              # App 图标（PWA）
│   └── themes/generated/   # 主题背景图（WebP）
├── vercel.json             # Vercel 部署配置（函数超时、缓存头）
└── firebase.json           # Firebase 配置（Firestore 规则路径）
```

---

## 快速部署

### 1. Fork / Clone

```bash
git clone <your-repo-url>
cd diary-app
```

### 2. 配置 Firebase

1. 在 [Firebase Console](https://console.firebase.google.com/) 新建项目
2. 开启 **Authentication** → 启用「电子邮件/密码」和「匿名」两种登录方式
3. 开启 **Firestore Database**，选择生产模式
4. 将项目 Web App 配置复制到 `firebase-config.js`：

```js
// firebase-config.js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};
firebase.initializeApp(firebaseConfig);
```

5. 部署 Firestore 规则（可选）：

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules
```

### 3. 配置环境变量

在 Vercel 项目设置 → **Environment Variables** 中添加：

| 变量名 | 必填 | 说明 |
|---|---|---|
| `DEEPSEEK_API_KEY` | ✅ | DeepSeek 平台的 API Key |
| `ALLOWED_FIREBASE_UID` | ❌ | 限制只有指定 UID 可调用 API，防止滥用 |
| `FIREBASE_WEB_API_KEY` | ❌ | 配合 `ALLOWED_FIREBASE_UID` 做服务端 UID 验证 |

本地调试时创建 `.env.local`（Vercel CLI 会自动读取）：

```
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxx
```

### 4. 部署到 Vercel

```bash
# 安装 Vercel CLI（全局）
npm install -g vercel

# 登录并部署
vercel

# 或直接推送到 GitHub，Vercel 会自动部署
```

---

## 本地开发

项目无构建步骤，直接用静态文件服务器即可：

```bash
# 方式一：npx serve（推荐）
npx serve . -p 3456

# 方式二：Python
python -m http.server 3456
```

> **注意**：`/api/*` 接口需要 Vercel 环境才能运行。本地调试 AI 功能需安装 Vercel CLI 并执行 `vercel dev`。

```bash
npm install -g vercel
vercel dev
```

---

## 认证说明

| 场景 | 操作 |
|---|---|
| 第一次使用 | 可先「匿名使用」，日记保存在匿名 Firebase 账户下 |
| 绑定已有邮箱 | 设置 → 账户卡片 → 绑定邮箱（保留全部日记） |
| 登录已有账户 | 设置 → 账户卡片 → 展开 → **退出，用已有账户登录** → 在登录页输入邮箱密码 |
| 跨设备同步 | 绑定邮箱后，在新设备用同一邮箱登录即可同步 |
| 忘记密码 | 登录页「忘记密码」→ 输入邮箱 → 发送重置邮件 |

---

## Firestore 数据结构

```
/users/{uid}/
  entries/{entryId}          # 日记
    body: string
    title: string
    date: string             # YYYY-MM-DD
    weekday: string
    time: string             # HH:MM
    place: string
    mood: string
    flag: boolean            # 里程碑
    featured: boolean        # 首页置顶诗签
    poem: { title, form, lines[] }
    sign: { title, motif, judgmentLines[], interpretation, timelineLine }
    quoteSuggestions: [...]
    notes: [...]
    inlineNotes: [...]
    tags: string[]
    paper: string
    photos: []

  hexagrams/{hexId}          # 六爻卦象
    question: string
    name: string
    interp: string
    ...
```

---

## 主题皮肤

共 7 套，在设置页切换：

| Key | 名称 | 风格 |
|---|---|---|
| `celadon` | 青瓷 | 冰裂纹青瓷，温润清雅 |
| `inkPlum` | 墨梅 | 宣纸水墨，暗香梅枝 |
| `mossGarden` | 苔庭 | 手绘纸张，苔藓蕨草 |
| `study` | 旧书房 | 琥珀书卷，老纸暖香 |
| `morningPaper` | 晨报 | 新青年杂志风，民国深蓝 |
| `dusk` | 黄昏 | 极简浅紫，无背景 |
| `seaSalt` | 海盐 | 海雾渐变，云水淡蓝 |

---

## API 接口

### `POST /api/poem`

根据日记正文生成判词、解语和古体诗。

**请求体：**
```json
{ "diary": "今天..." }
```

**响应：**
```json
{
  "signTitle": "浮云志",
  "motif": "窗边残茶",
  "judgmentLines": ["...", "...", "...", "..."],
  "interpretation": "...",
  "timelineLine": "...",
  "title": "晴窗",
  "form": "七绝",
  "lines": ["...", "...", "...", "..."],
  "quoteSuggestions": [{ "quote": "...", "reason": "...", "theme": "...", "score": 88 }]
}
```

### `POST /api/hexagram`

起卦并解签。请求体包含卦名、爻辞、问题文本及日记上下文。

### `POST /api/question`

六爻追问（基于已有卦象上下文继续追问）。

### `GET /api/health`

返回服务状态及构建版本号。

---

## 成本估算

以 **100 名月活用户**（每人每月写 10 篇日记 + 摇签 5 次）为基准：

| 服务 | 免费额度 | 预估月用量 | 超出费用 |
|---|---|---|---|
| Vercel（Hobby） | 100 GB 带宽、无限部署 | ~2 GB | $0 |
| Firebase Auth | 10,000 次认证/月 | ~500 次 | $0 |
| Firestore | 50K 读 / 20K 写 / 天 | 远低于限额 | $0 |
| DeepSeek API | 按 token 计费 | ~5M token/月 | ~$3–8 |

**实际运营主要成本为 DeepSeek API**，100 用户规模月支出约 **$3–10**，超出免费额度前完全可以零成本运行。

---

## 常见问题

**Q: 摇签没有反应？**
A: 检查 Vercel 环境变量中 `DEEPSEEK_API_KEY` 是否配置正确；手机端首次摇签需要浏览器弹窗授权运动传感器权限，需点击「允许」。

**Q: 在桌面端怎么触发摇签？**
A: 桌面端（≥ 900 px）顶部有「摇签」按钮，点击即可，无需摇晃设备。

**Q: 匿名模式的数据丢了？**
A: 匿名账户数据绑定当前浏览器，清除浏览器数据或更换设备后无法恢复。建议写完第一篇日记后立即在设置页绑定邮箱。

**Q: 可以换用其他 AI 模型吗？**
A: 可以。替换 `api/poem.js` 和 `api/hexagram.js` 中的模型调用即可。接口格式遵循 OpenAI 兼容标准，Claude / GPT-4 / Qwen 均可接入。

**Q: 数据能导出吗？**
A: 目前暂不支持一键导出。可通过 Firebase Console → Firestore → 导出 JSON 备份数据。App 内导出功能在 Roadmap 中。

**Q: 云同步延迟很高？**
A: Firestore 默认离线优先写入，网络恢复后自动同步。如长时间不同步，检查 Firebase 项目配额是否超限（免费层每天 50K 读 / 20K 写）。

---

## 注意事项

- `firebase-config.js` 包含项目配置，**不要**将真实配置提交到公开仓库；Fork 前替换为自己的配置
- DeepSeek API Key 只存在 Vercel 环境变量中，不在前端代码里
- 匿名账户数据绑定浏览器，清除浏览器数据或更换设备后无法恢复，建议绑定邮箱
- 目前不支持图片上传（存储成本考量），照片功能为预留字段

---

## Roadmap

当前策略：**先免费做增长**，专注留存与口碑，计费能力预留不启用。完整的市场调研、竞品对标与商业化路径见 [PRODUCT-REVIEW.md](PRODUCT-REVIEW.md)。

### 第一阶段 · 免费增长（重心）
- [ ] 匿名首篇后引导绑定邮箱（堵数据丢失痛点）
- [ ] 一键数据导出（JSON / Markdown）
- [ ] 写作引导：每日一问 / 心情提示词（解决空白页焦虑）
- [ ] 温柔连续记录 + 写日记提醒（非惩罚式 streak）
- [ ] 摇签失败重试 + 离线友好提示
- [ ] 隐私说明页（声明 AI 不存储、不训练）
- [ ] 可分享诗签卡片（社交裂变）

### 第二阶段 · 国际化 + 增长深化
- [ ] ⭐ **双诗体本地化** —— 英文模式生成莎士比亚式十四行诗（而非中文古诗硬翻译）+ UI 中英 i18n
- [ ] 周回顾 / 情绪曲线
- [ ] 图片上传（Firebase Storage）
- [ ] 暗色主题 / 更多皮肤

### 第三阶段 · 商业化与扩展
- [ ] Freemium 订阅 + 支付接入（国内微信/支付宝；海外 Stripe / Apple IAP）
- [ ] 升级 / 可选高级 AI 模型（诗歌质量为付费核心卖点）
- [ ] 年度诗集 PDF 导出 / 印刷成实体诗册
- [ ] Capacitor 打包为 iOS / Android 原生应用

---

## License

Private — 保留所有权利
