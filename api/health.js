export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const commit = process.env.VERCEL_GIT_COMMIT_SHA;
  return res.status(200).json({
    ok: true,
    service: 'poem-diary-api',
    deepseekConfigured: Boolean(process.env.DEEPSEEK_API_KEY),
    accessRestricted: Boolean(process.env.ALLOWED_FIREBASE_UID),
    // Prefer the real deploy commit (set automatically on Vercel) for traceability.
    build: commit ? commit.slice(0, 7) : '2026.06.16-r56',
    env: process.env.VERCEL_ENV || 'local',
    time: new Date().toISOString(),
  });
}
