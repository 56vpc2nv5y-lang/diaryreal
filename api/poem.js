// Vercel Serverless Function — /api/poem
// Accepts POST { diaryText } → returns { title, form, lines[] }
// DeepSeek API key lives in Vercel env vars (never exposed to browser).

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { diaryText } = req.body || {};
  if (!diaryText || !diaryText.trim())
    return res.status(400).json({ error: '日记内容不能为空' });

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
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content:
              '你是精通唐诗宋词的诗人。根据日记内容创作古诗。' +
              '只输出 JSON，格式：{"title":"两字诗题","form":"五绝","lines":["第一句","第二句","第三句","第四句"]}',
          },
          {
            role: 'user',
            content:
              `请根据以下日记，创作一首五言绝句（每句5字）或七言绝句（每句7字）。\n` +
              `风格要求：意境深远，不要白话，押韵，与日记情感呼应但不直白翻译。\n` +
              `严格返回 JSON，除 JSON 外不输出任何字符。\n\n` +
              `日记：\n${diaryText.slice(0, 800)}`,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.92,
        max_tokens: 220,
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error('DeepSeek error:', response.status, t);
      return res.status(502).json({ error: `DeepSeek API 错误 ${response.status}` });
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || '';
    // Strip possible markdown fences
    content = content.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '').trim();
    const poem = JSON.parse(content);

    if (!poem.title || !Array.isArray(poem.lines) || poem.lines.length !== 4)
      throw new Error('诗的格式不对');

    return res.status(200).json(poem);
  } catch (e) {
    console.error('生诗失败:', e);
    return res.status(500).json({ error: e.message || '生诗失败，请稍后再试' });
  }
}
