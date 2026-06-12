import { authorizePersonalApp } from '../lib/api-auth.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!(await authorizePersonalApp(req, res))) return;

  let body = req.body || {};
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { return res.status(400).json({ error: '请求内容不是有效 JSON' }); }
  }
  const question = String(body.question || '').trim();
  if (!question) return res.status(400).json({ error: '请先写下疑惑' });
  if (question.length > 1000) return res.status(400).json({ error: '疑惑不能超过 1000 字' });

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'DEEPSEEK_API_KEY 未配置' });

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(25000),
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content:
              '你是严谨、克制的生活问题分析者。用户提出的是生活疑惑，不是要求你替他开发某种系统。' +
              '不要假设存在普遍正确答案，不迎合，不做命运预测。区分事实、推测与个人偏好；给出多个可能解释、反例和可验证的小实验。' +
              '医疗、法律、财务等高风险问题要明确提醒寻求专业意见。',
          },
          {
            role: 'user',
            content:
              `生活疑惑：${question}\n\n请按以下格式回答：\n` +
              `【核心判断】一句话说明问题可能没有唯一答案\n` +
              `【可能解释】列出3个不同角度\n` +
              `【反面情况】指出这些解释何时不成立\n` +
              `【验证方法】设计一个低成本、可执行的小实验\n` +
              `【继续追问】给出一个值得用户进一步思考的问题\n全文控制在500字以内。`,
          },
        ],
        temperature: 0.72,
        max_tokens: 750,
      }),
    });
    const raw = await response.text();
    let data;
    try { data = raw ? JSON.parse(raw) : {}; } catch { throw new Error(`DeepSeek 返回了非 JSON 内容（HTTP ${response.status}）`); }
    if (!response.ok) throw new Error(data.error?.message || `DeepSeek API 错误 ${response.status}`);
    return res.status(200).json({ analysis: data.choices?.[0]?.message?.content?.trim() || '暂时无法分析' });
  } catch (error) {
    console.error('理问失败:', error);
    return res.status(500).json({ error: error.message || '理问失败，请稍后再试' });
  }
}
