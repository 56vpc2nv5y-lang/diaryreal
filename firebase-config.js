// ─────────────────────────────────────────────────────────────────────────────
// 🔑 步骤 1：把下面的占位符换成你的 Firebase 项目配置
//    Firebase Console → 项目设置 → 你的应用 → Web App → 复制 firebaseConfig 对象
// ─────────────────────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID",
};

firebase.initializeApp(firebaseConfig);
