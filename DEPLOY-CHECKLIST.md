# Vercel 同步部署检查

这次修复后的页面版本是 `2026.06.10-r5`。

## 必须一起部署

- 部署根目录必须是包含 `index.html`、`api/`、`lib/`、`vercel.json` 的本目录。
- 必须部署到 Production，而不只是生成 Preview Deployment。
- 不要只上传静态 HTML；`api/poem.js` 和 `api/hexagram.js` 必须作为 Vercel Functions 一起部署。

## Vercel 环境变量

- 必填：`DEEPSEEK_API_KEY`
- 建议：`ALLOWED_FIREBASE_UID`，防止公开网站上的 AI 接口被别人消耗额度。
- 如果设置了 `ALLOWED_FIREBASE_UID`，还必须设置 `FIREBASE_WEB_API_KEY`。

修改环境变量后需要重新部署。

## 部署后验证

1. 打开 `https://你的域名/api/health`
2. 应返回 JSON，且包含：

```json
{
  "ok": true,
  "deepseekConfigured": true,
  "build": "2026.06.10-r5"
}
```

3. 打开应用设置页底部，应显示 `版本 2026.06.10-r5`。
4. 如果仍显示 `iCloud`、`Android 同步` 或 `.docx · .txt · .pdf · .md`，说明当前域名仍指向旧部署或 Vercel 项目的 Root Directory 配错。

## Firestore

Firestore 可以用于这个个人应用。需要单独将 `firestore.rules` 部署到 Firebase。

当前使用匿名登录：同一浏览器里可以持续使用，但清除浏览器数据或更换设备后可能无法访问旧 UID 的数据。请定期使用设置页的“数据备份”；如需可靠跨设备同步，应增加邮箱或 Google 登录。
