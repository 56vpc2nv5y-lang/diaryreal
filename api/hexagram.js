// Vercel Serverless Function — /api/hexagram
// 接收 { question, hexName, lines[] } → 返回 { interpretation }

import { authorizePersonalApp } from '../lib/api-auth.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!(await authorizePersonalApp(req, res))) return;

  let body = req.body || {};
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { return res.status(400).json({ error: '请求内容不是有效 JSON' }); }
  }
  const { question, hexName, lines } = body;
  if (!question?.trim()) return res.status(400).json({ error: '问题不能为空' });
  if (question.trim().length > 500) return res.status(400).json({ error: '问题不能超过 500 字' });
  if (!Array.isArray(lines) || lines.length !== 6 || lines.some(l => !['yin', 'yang'].includes(l?.type)))
    return res.status(400).json({ error: '卦象格式不正确' });

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'DEEPSEEK_API_KEY 未配置' });

  const names = ['初爻','二爻','三爻','四爻','五爻','上爻'];
  const lineDesc = (lines || []).map((l, i) =>
    `${names[i]}${l.type === 'yang' ? '阳' : '阴'}${l.changing ? '（动）' : ''}`
  ).join('、');
  const nChanging = (lines || []).filter(l => l.changing).length;

  try {
    const r = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(25000),
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: '你是精通《周易》六爻的占卜师。解卦时：语言简练，古典风格但现代人能读懂；直指问题核心，不废话；全文150字以内。',
          },
          {
            role: 'user',
            content: `问：${question.trim().slice(0, 500)}\n\n卦：${String(hexName || '未定').slice(0, 20)}\n各爻（初→上）：${lineDesc}` +
              (nChanging > 0 ? `\n（共${nChanging}个动爻，变卦需关注）` : '') +
              `\n\n请解此卦，格式严格如下，不要多余内容：\n【卦意】一句话点明此卦核心\n【解】针对问题的启示（2-3句）\n【宜】一条具体建议\n【忌】一条具体提醒`,
          },
        ],
        temperature: 0.85,
        max_tokens: 400,
      }),
    });
    const raw = await r.text();
    let d;
    try { d = raw ? JSON.parse(raw) : {}; }
    catch { throw new Error(`DeepSeek 返回了非 JSON 内容（HTTP ${r.status}）`); }
    if (!r.ok) throw new Error(d.error?.message || `DeepSeek ${r.status}`);
    return res.status(200).json({ interpretation: d.choices?.[0]?.message?.content?.trim() || '无法解卦' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
}
