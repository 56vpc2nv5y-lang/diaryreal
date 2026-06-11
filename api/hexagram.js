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
  const {
    question, hexName, changedHexName, lines, diaryContext, trigrams,
    mode = 'reading', originalQuestion, previousInterpretation,
  } = body;
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
  const movingLines = (lines || []).map((l, i) => l.changing ? names[i] : '').filter(Boolean).join('、') || '无动爻';
  const isFollowUp = mode === 'followup';

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
            content:
              '你是一名严谨、克制的《周易》卦象分析者。当前数据只有本卦、阴阳爻、动爻、变卦与用户问题，' +
              '没有纳甲、月建、日辰、旬空、六亲、世应，因此不得假装完成完整六爻旺衰或断具体吉凶日期。\n' +
              '分析顺序：先识别问题真正关注的选择或风险；再解释本卦的核心处境；有动爻时重点分析动爻位置所代表的变化阶段；' +
              '再把变卦作为趋势和下一阶段，而不是注定结果；最后给出可执行建议与风险提醒。\n' +
              '爻位可以理解为事情的发展层级：初爻是起始，二爻是落实，三爻是转折与风险，四爻是进入外部环境，五爻是主导与决策，上爻是发展至极与收束；应结合问题解释，不可机械套用。\n' +
              '无动爻时侧重守持本卦；一爻动时集中解释该爻；多爻动时提炼共同方向和矛盾，不逐条堆砌。\n' +
              '语言现代、清晰、有依据，不故作玄虚，不迎合用户，不制造恐惧，不替用户做医疗、法律、投资等高风险决定。',
          },
          {
            role: 'user',
            content: isFollowUp
              ? `这是对同一卦象的追问，不得重新起卦，也不得把追问当成独立新卦。\n` +
                `原问题：${String(originalQuestion || '').slice(0, 500)}\n` +
                `原解签：${String(previousInterpretation || '').slice(0, 1600)}\n` +
                `本卦：${String(hexName || '未定').slice(0, 20)}\n` +
                `变卦：${String(changedHexName || hexName || '未定').slice(0, 20)}\n` +
                `上下卦：上${String(trigrams?.upper || '未定')}、下${String(trigrams?.lower || '未定')}\n` +
                `动爻：${movingLines}\n各爻（初→上）：${lineDesc}\n` +
                `关联日记背景：${String(diaryContext || '无').slice(0, 800)}\n` +
                `追问：${question.trim().slice(0, 500)}\n\n` +
                `请延续原解签回答追问。格式：\n【承接】说明追问与原卦哪一点相关\n【判断】直接回答，不模棱两可\n【依据】用本卦、动爻或变卦说明\n【行动】给出一条可执行建议`
              : `问题：${question.trim().slice(0, 500)}\n` +
                `关联日记背景：${String(diaryContext || '无').slice(0, 800)}\n\n` +
                `本卦：${String(hexName || '未定').slice(0, 20)}\n` +
                `变卦：${String(changedHexName || hexName || '未定').slice(0, 20)}\n` +
                `上下卦：上${String(trigrams?.upper || '未定')}、下${String(trigrams?.lower || '未定')}\n` +
                `动爻：${movingLines}\n各爻（初→上）：${lineDesc}\n\n` +
                `请严格按以下格式回答：\n` +
                `【核心判断】一句话直接回答问题\n` +
                `【卦理】解释本卦为何对应当前处境\n` +
                `【变化】结合动爻与变卦说明趋势；无动爻则说明应守持什么\n` +
                `【行动】两条具体、现实、可执行的建议\n` +
                `【提醒】一个最需要避免的误区\n` +
                `全文控制在260字以内。`,
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
