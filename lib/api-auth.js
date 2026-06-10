export async function authorizePersonalApp(req, res) {
  const allowedUid = process.env.ALLOWED_FIREBASE_UID;
  if (!allowedUid) return true;

  const firebaseApiKey = process.env.FIREBASE_WEB_API_KEY;
  if (!firebaseApiKey) {
    res.status(500).json({ error: '已配置 ALLOWED_FIREBASE_UID，但缺少 FIREBASE_WEB_API_KEY' });
    return false;
  }

  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) {
    res.status(401).json({ error: '缺少 Firebase 身份令牌' });
    return false;
  }

  try {
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: token }),
      signal: AbortSignal.timeout(8000),
    });
    const data = await response.json();
    const uid = data.users?.[0]?.localId;
    if (!response.ok || !uid) {
      res.status(401).json({ error: 'Firebase 身份令牌无效' });
      return false;
    }
    if (uid !== allowedUid) {
      res.status(403).json({ error: '此 AI 接口仅允许应用所有者使用' });
      return false;
    }
    return true;
  } catch {
    res.status(502).json({ error: '暂时无法验证 Firebase 身份' });
    return false;
  }
}
