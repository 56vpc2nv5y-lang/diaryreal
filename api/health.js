export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({
    ok: true,
    service: 'poem-diary-api',
    deepseekConfigured: Boolean(process.env.DEEPSEEK_API_KEY),
    build: '2026.06.11-r8',
  });
}
