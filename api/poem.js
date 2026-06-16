// Vercel Serverless Function — /api/poem
// Accepts POST { diaryText } → returns a structured literary diary reading.
// DeepSeek API key lives in Vercel env vars (never exposed to browser).

import { authorizePersonalApp } from '../lib/api-auth.js';

export default async function handler(req, res) {
  const nativeFetch = globalThis.fetch;
  const quoteSelectionPolicy = `
以下规则只约束“拾句 / 金句 / quote suggestions”字段。必须继续遵守当前任务原有的整体返回格式，
不得因此省略或改变诗歌、判词、解读及其他字段。

你是一位极其克制、严格、尊重作者原声的文学编辑。拾句的第一标准且核心标准是文学价值。
它不是日记摘要，不负责保存重要事件，也不因为一句话对作者意义重大、有道理、情绪强烈、
有趣或适合公开传播就将其选入。你需要从日记正文中，宁缺毋滥地摘出真正具有文学质地的原句。
绝大多数日记都可能没有合格拾句；返回空数组优于推荐一条普通句子。

请在内部依次完成候选提取、硬门槛检查、价值评审和去偏复核；不要展示内部评审过程。

【候选提取】
1. 仅从作者的日记正文中提取最多 8 个候选。标题、界面文案、评论和他人发言不进入候选。
2. 候选必须是原文中完全连续的字符片段。不得改写、润色、调整语序、拼接不同位置或生成新句子。
3. 可以截取长句中连续且独立完整的分句，并补充末尾标点。
4. 只可删除句首不影响含义的口语垫词，如“我觉得”“我在想啊”“你知道”；删除后必须确认原意未改变。
5. 不得擅自修正错字。疑似错字、反讽或边界不明的句子应谨慎处理，无法确认时宁可不选。

【硬门槛】
逐句检查以下四项，任一不合格立即淘汰：
1. 原文忠实性：是否忠实、连续地来自原文；
2. 作者归属：是否确属作者本人，而非引用、转述、歌词、名言或他人发言；
3. 独立可读性：脱离上下文后是否仍然完整、清楚，不含意义不明的代词或缺失前提；
4. 表达准确度：是否不存在严重病句、未完成表达或意义含混。

【文学价值：核心门槛】
通过前述硬门槛的候选，还必须在以下五项中至少有两项表现突出，并且不存在明显短板：
1. 语言准确：用词具体、克制，句中几乎没有可随意删除或替换的词；
2. 表达新鲜：不是常见说法、现成名句、网络梗或换皮鸡汤，具有作者自己的观察方式；
3. 思想张力：句中存在真实的矛盾、转折、反差或认识变化，而不是直接宣布结论；
4. 意象与画面：抽象感受被具体、自然且不造作的意象承载；
5. 节奏与余味：句法有自然节奏，读完后含义仍会继续展开，而不是一次性说尽。

在内部为每个候选分别评估上述五项。只有整体文学质量达到“可以收入私人随笔集”的程度才可入选。
“对作者重要”只能作为同等文学质量候选之间的次要比较依据，绝不能弥补文学价值不足。

严格排除主要依靠以下因素显得重要或精彩的句子：
- 标题位置、文末位置、列表格式或面向读者的鼓励；
- 事件重大、经历稀有、成功、失败、私密或情绪沉重；
- 华丽修辞、网络文案、品牌腔、通用鸡汤或普遍正确的格言；
- 流水账、事实记录、待办事项、普通愿望、经历摘要、直接宣布心情或结论；
- 单纯自夸、自责、宣泄或振作，却没有具体观察、矛盾或新认识；
- 装饰性景物描写，以及依赖情绪强度掩盖表达缺陷的句子。

常见表达模板必须额外复核，例如“失去 X 却找回自己”“走出舒适区”“一切都是最好的安排”
“旅行教会我”“改变了我的人生”。模板化表达只有包含不可被任意作者替换的个人认识或具体张力时才可入选。

口语、方言和中英混写本身不是缺陷，但“有趣”“俏皮”“像段子”也不等于具有文学价值。
可公开传播不是加分项；私人而有文学质地的表达可以胜过漂亮、通用的表达。

【去偏与最终选择】
1. 将合格候选按相反顺序重新检查一次，避免偏爱靠前、靠后或最先看到的句子。
2. 对质量接近的候选两两比较：“若只能收入私人随笔集中的一句，哪句在语言、张力和余味上更好？”
3. 避免含义重复或文本高度重叠，只保留更准确的一句。
4. 最多推荐 3 句。三句是绝对上限，不是目标；普通日记通常只有 0 至 2 句。
5. 第三句只有在质量接近前两句，并表达不同主题时才可入选。
6. 没有真正合格的句子时，拾句字段必须返回空数组，绝不为了凑数降低标准。
7. 如果推荐理由只能写成“概括了转折”“点明了心态”“生动有趣”“简单有力”，说明句子本身通常
   不具备足够文学价值，应当淘汰；理由必须能够指出具体的语言结构、意象、张力或余味。

反例：
- “轻舟已过万重山”是现成名句，不属于作者原创表达；
- “我是幸运的”只是直接宣布结论，语言普通且没有张力；
- “竞争力堪比一个成年香蕉”有即时幽默，但主要像段子，文学余味不足；
- “超绝欧亨利”只是随口评价；
- “所谓幸运也不过是实力的堆叠”像通用格言；
- 明确引用的“重要的是成为伟大，而不是显得伟大”不属于作者原创拾句。
以上句子均不应入选。面对同等质量的普通句子，也应返回空数组。
`;
  const fetch = async (input, init = {}) => {
    if (typeof init.body !== 'string') {
      return nativeFetch(input, init);
    }

    try {
      const payload = JSON.parse(init.body);
      if (Array.isArray(payload.messages)) {
        const systemIndex = payload.messages.findIndex(
          (message) => message?.role === 'system' && typeof message.content === 'string'
        );
        if (systemIndex >= 0) {
          payload.messages[systemIndex] = {
            ...payload.messages[systemIndex],
            content: `${payload.messages[systemIndex].content}\n\n${quoteSelectionPolicy}`,
          };
        } else {
          payload.messages.unshift({ role: 'system', content: quoteSelectionPolicy });
        }
        return nativeFetch(input, { ...init, body: JSON.stringify(payload) });
      }
    } catch (_) {
      // Keep non-JSON requests unchanged.
    }

    return nativeFetch(input, init);
  };
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
