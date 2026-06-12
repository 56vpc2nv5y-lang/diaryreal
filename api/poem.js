// Vercel Serverless Function — /api/poem
// Accepts POST { diaryText } → returns a structured literary diary reading.
// DeepSeek API key lives in Vercel env vars (never exposed to browser).

import { authorizePersonalApp } from '../lib/api-auth.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!(await authorizePersonalApp(req, res))) return;

  let body = req.body || {};
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { return res.status(400).json({ error: '请求内容不是有效 JSON' }); }
  }
  const { diaryText } = body;
  if (!diaryText || !diaryText.trim())
    return res.status(400).json({ error: '日记内容不能为空' });
  if (diaryText.trim().length > 10000)
    return res.status(400).json({ error: '日记内容不能超过 10000 字' });

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey)
    return res.status(500).json({ error: 'DEEPSEEK_API_KEY 未配置' });

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      signal: AbortSignal.timeout(25000),
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content:
              '你是一位克制、敏锐的日记文学编辑，也精通古典诗歌。' +
              '必须从日记真实存在的事件、情绪、意象与矛盾出发，不得杜撰事实，不得预测命运。' +
              '判语应凝练、象征、留白、有转折，但不得引用或仿写《红楼梦》原句。' +
              '拾句必须逐字引用日记原文，不得改写、拼接或创造；若没有足够独特的句子，返回空数组。' +
              '只输出 JSON。',
          },
          {
            role: 'user',
            content:
              `请根据以下日记生成一枚“今日诗签”。它是文学化回望，不是命运预测。\n` +
              `严格返回以下 JSON：\n` +
              `{"signTitle":"2至4个汉字","motif":"一个具体意象","judgmentLines":["四行判语，每行5至9字"],` +
              `"interpretation":"60至100字，说明判语如何对应日记","timelineLine":"不超过16字的里程碑摘句",` +
              `"title":"两至四字诗题","form":"五绝或七绝","lines":["四句古诗，每句可用中文逗号连接上下半句"],` +
              `"quoteSuggestions":[{"quote":"逐字引用原文","reason":"为何值得保留","theme":"简短主题","score":0到100}]}\n` +
              `诗要原创、含蓄、押韵，与日记呼应但不直译。最多选3条拾句，没有合适句子时返回空数组。\n` +
              `除 JSON 外不输出任何字符。\n\n日记：\n${diaryText.slice(0, 1600)}`,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.92,
        max_tokens: 900,
      }),
    });

    const raw = await response.text();
    let data;
    try { data = raw ? JSON.parse(raw) : {}; }
    catch { return res.status(502).json({ error: `DeepSeek 返回了非 JSON 内容（HTTP ${response.status}）` }); }
    if (!response.ok) {
      console.error('DeepSeek error:', response.status, raw);
      return res.status(502).json({ error: data.error?.message || `DeepSeek API 错误 ${response.status}` });
    }
    let content = data.choices?.[0]?.message?.content || '';
    // Strip possible markdown fences
    content = content.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '').trim();
    const poem = JSON.parse(content);

    if (!poem.title || typeof poem.title !== 'string' || !Array.isArray(poem.lines) ||
        poem.lines.length !== 4 || poem.lines.some(line => typeof line !== 'string' || !line.trim()))
      throw new Error('诗的格式不对');

    return res.status(200).json({
      ...poem,
      signTitle: typeof poem.signTitle === 'string' ? poem.signTitle.slice(0, 8) : poem.title,
      motif: typeof poem.motif === 'string' ? poem.motif.slice(0, 30) : '',
      judgmentLines: Array.isArray(poem.judgmentLines) ? poem.judgmentLines.map(String).slice(0, 4) : [],
      interpretation: typeof poem.interpretation === 'string' ? poem.interpretation.slice(0, 500) : '',
      timelineLine: typeof poem.timelineLine === 'string' ? poem.timelineLine.slice(0, 32) : '',
      quoteSuggestions: Array.isArray(poem.quoteSuggestions)
        ? poem.quoteSuggestions.filter(item => item && typeof item.quote === 'string').slice(0, 3)
        : [],
    });
  } catch (e) {
    console.error('生诗失败:', e);
    return res.status(500).json({ error: e.message || '生诗失败，请稍后再试' });
  }
}
