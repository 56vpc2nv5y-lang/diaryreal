# 部署前清单

## Vercel 环境变量

必须配置：

- `DEEPSEEK_API_KEY`

强烈建议配置，防止公开的 AI API 被他人调用：

- `ALLOWED_FIREBASE_UID`：Firebase Console -> Authentication -> Users 中当前使用账户的 UID
- `FIREBASE_WEB_API_KEY`：与 `firebase-config.js` 中 `apiKey` 相同

修改环境变量后需要重新部署。

## Firestore Rules

Vercel 部署不会发布 Firestore Rules。请在 Firebase Console 中发布
`firestore.rules` 的内容，或使用 Firebase CLI：

```bash
firebase deploy --only firestore:rules
```

## 部署后验证

1. 打开 `/api/poem` 和 `/api/hexagram`，GET 请求应返回 JSON 格式的
   `Method not allowed`，不能返回 HTML。
2. 新建日记并分别测试直接保存、AI 生诗。
3. 新建卦象并测试 AI 解签。
4. 在详情页测试右上角菜单、编辑日记、修改里程碑和添加追评。
5. 下载 JSON 备份，再导入一次确认可恢复。
6. 确认 Firebase Console 中只有自己的 UID 能读取对应数据。

## Firebase 登录

- Firebase Console -> Authentication -> Sign-in method 中启用 `Email/Password`，并保留 `Anonymous`。
- 已有日记的匿名用户应在应用“我”页面绑定邮箱，以保留原 UID 和全部数据。
- 直接注册全新邮箱账号会得到新 UID；若配置了 `ALLOWED_FIREBASE_UID`，需要同步更新 Vercel 环境变量并重新部署。

## 当前限制

- 匿名模式仍可使用，但未绑定邮箱前清除浏览器数据、退出或换设备，可能无法访问旧 UID 的数据。
- 免费版不提供日记照片上传，也不启用 Firebase Storage。诗签 PNG 在浏览器本地生成。
- 日记正文会发送给 DeepSeek 生成诗，问题和卦象会发送给 DeepSeek 解签。
