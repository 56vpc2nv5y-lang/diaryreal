import { authorizePersonalApp } from '../lib/api-auth.js';
import { rateLimit } from '../lib/rate-limit.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!rateLimit(req, res, { limit: 20, windowMs: 60_000, name: 'poem-suggest' })) return;
  if (!(await authorizePersonalApp(req, res))) return;

  let body = req.body || {};
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { return res.status(400).json({ error: '请求内容不是有效 JSON' }); }
  }

  const style = body.style === 'en-sonnet' ? 'en-sonnet' : 'zh-classical';
  const title = String(body.title || '').slice(0, 80);
  const line = String(body.line || '').trim().slice(0, 240);
  const note = String(body.note || '').trim().slice(0, 500);
  const diaryText = String(body.diaryText || '').trim().slice(0, 1200);
  const poemLines = Array.isArray(body.lines) ? body.lines.map(item => String(item || '').slice(0, 240)).slice(0, 14) : [];
  if (!line && !note) return res.status(400).json({ error: '请先提供要修改的诗句或你的想法' });

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'DEEPSEEK_API_KEY 未配置' });

  const languageRule = style === 'en-sonnet'
    ? 'Reply in English. Keep iambic-pentameter instincts, natural diction, and a Shakespearean-sonnet register without sounding fake-archaic.'
    : '用中文回答。保持古体诗的含蓄、凝练和画面感，避免白话解释腔。';

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(25000),
      body: JSON.stringify({
        model: 'deepseek-chat',
        response_format: { type: 'json_object' },
        temperature: style === 'en-sonnet' ? 0.74 : 0.82,
        max_tokens: 650,
        messages: [
          {
            role: 'system',
            content:
              'You are a careful poetry editor. Give options, not final authority. ' +
              'Do not invent new diary facts. Do not rewrite the whole poem unless asked. ' +
              languageRule + ' Output JSON only.',
          },
          {
            role: 'user',
            content:
              `Diary context:\n${diaryText || '(not provided)'}\n\n` +
              `Poem title: ${title || '(untitled)'}\n` +
              `Current poem:\n${poemLines.join('\n') || '(not provided)'}\n\n` +
              `Line to improve:\n${line || '(not provided)'}\n\n` +
              `Writer's question or target:\n${note || '(general improvement)'}\n\n` +
              `Return strictly this JSON:\n` +
              `{"revisedLine":"one suggested replacement line","wordChoices":["3 to 6 useful words or phrases"],"alternatives":["2 or 3 alternate lines"],"note":"short explanation of what changed"}`
          },
        ],
      }),
    });
    const raw = await response.text();
    let data;
    try { data = raw ? JSON.parse(raw) : {}; } catch { throw new Error(`DeepSeek 返回了非 JSON 内容（HTTP ${response.status}）`); }
    if (!response.ok) throw new Error(data.error?.message || `DeepSeek API 错误 ${response.status}`);
    const content = data.choices?.[0]?.message?.content || '{}';
    const parsed = JSON.parse(content.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '').trim());
    return res.status(200).json({
      revisedLine: String(parsed.revisedLine || '').slice(0, 240),
      wordChoices: Array.isArray(parsed.wordChoices) ? parsed.wordChoices.map(String).filter(Boolean).slice(0, 6) : [],
      alternatives: Array.isArray(parsed.alternatives) ? parsed.alternatives.map(String).filter(Boolean).slice(0, 3) : [],
      note: String(parsed.note || '').slice(0, 280),
    });
  } catch (error) {
    console.error('改诗建议失败:', error);
    return res.status(500).json({ error: error.message || '改诗建议失败，请稍后再试' });
  }
}
