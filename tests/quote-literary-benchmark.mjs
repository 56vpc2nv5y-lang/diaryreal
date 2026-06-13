import fs from 'node:fs/promises';
import path from 'node:path';

const API_BASE = (process.env.BENCHMARK_API_BASE || 'https://api.openai.com/v1').replace(/\/$/, '');
const API_KEY = process.env.BENCHMARK_API_KEY || process.env.OPENAI_API_KEY;
const MODEL = process.env.BENCHMARK_MODEL || 'gpt-4.1-mini';
const CONCURRENCY = Number(process.env.BENCHMARK_CONCURRENCY || 3);

const prompt = `
你是一位极其克制、严格、尊重作者原声的文学编辑。请从日记正文中摘取真正具有文学价值的原句。

文学价值是第一标准。句子必须忠实、连续地来自作者原文，脱离上下文仍完整清楚，并至少在以下
五项中有两项突出且没有明显短板：语言准确、表达新鲜、思想张力、意象画面、节奏余味。

不要因为内容对作者重要、有道理、情绪强烈、有趣、积极、私密、位于标题或结尾而选入。
严格排除引用、转述、现成名句、网络梗、鸡汤、直接宣布结论、流水账、事实记录、普通愿望、
经历摘要、单纯自夸、自责或宣泄。宁可返回空数组，也不要推荐普通句子。

最多选择 3 句。仅输出 JSON：{"quotes":[{"text":"逐字摘录的原句"}]}。无合格句只输出 {"quotes":[]}。
`;

const literarySeeds = [
  '我一直把忙碌当成认真，因为认真需要面对结果，而忙碌只需要填满时间。',
  '我不是害怕离开这份工作，我只是害怕离开以后，无法继续证明当初留下是正确的。',
  '似乎我总喜欢在电影结束时才知道结局。',
  '门关上的声音很轻，我却在那一刻听见了整个夏天的结束。',
  '我把沉默练得越来越熟，却始终不会用它回答自己。',
  '后来我才明白，我怀念的不是那座城，而是在那里仍敢于期待的自己。',
  '雨停以后，窗上的水痕仍替天空保留着刚才的情绪。',
  '我以为自己在等待一个答案，其实只是舍不得承认问题已经改变。',
  '父亲把旧钟调快了五分钟，仿佛这样就能替我们追回一些来不及说的话。',
  '我终于不再向过去讨要解释，只把它当作一条曾经下过雨的路。',
  '人群散去以后，我才发现自己整晚都在扮演一个不需要安慰的人。',
  '她没有说再见，只把我的名字从未来时改成了过去时。',
  '我曾把忍耐误认为平静，直到身体替我说出了拒绝。',
  '故乡没有变小，是我终于长到能看见它的边界。',
  '那天的晚霞很慢，慢得足够让我承认有些告别不必追赶。',
  '我把每一次迟疑都解释成谨慎，后来才看见其中藏着的恐惧。',
  '成年以后，很多原谅不是握手言和，而是不再等待道歉。',
  '我努力成为所有人都放心的人，最后却不知道该把自己交给谁。',
  '她递来的苹果已经氧化，却比那些及时的安慰更像关心。',
  '我以为远方会回答我，后来发现它只是把问题换了一种回声。',
  '房间重新安静下来，我才听见自己一直没有同意。',
  '冬天把树叶删得很干净，反而让枝桠说出了真实的方向。',
  '我没有失去那段时间，它只是拒绝再替今天作证。',
  '我们谈了很多以后，真正留下来的仍是那句没有说出口的话。',
  '我开始允许答案来得晚一点，也允许自己不再站在原地等它。',
];

const ordinarySeeds = [
  '我是幸运的。',
  '轻舟已过万重山。',
  '竞争力堪比一个成年香蕉。',
  '超绝欧亨利。',
  '所谓幸运也不过是实力的堆叠。',
  '一切都是最好的安排。',
  '今天真的太累了。',
  '我一定要继续努力。',
  '生活总会越来越好的。',
  '重要的是成为伟大，而不是显得伟大。',
  '今天开了三个会。',
  '我觉得这件事很有意思。',
  '总之，我基本选择了我喜欢的。',
  '好在是扛过来了。',
  '我做得很好，我真棒。',
  '明天开始认真工作。',
  '今天的天空特别蓝。',
  '成长就是不断走出舒适区。',
  '失去工作以后，我找回了自己。',
  '旅行教会了我很多。',
  '这件事改变了我的人生。',
  '我真的非常非常难过。',
  '成功属于坚持到底的人。',
  '成年人最大的自由就是想喝奶茶时可以买两杯。',
  '今天吃了面，下午取了快递，晚上看了剧。',
];

const contexts = [
  (s) => `${s}`,
  (s) => `今天没有发生什么特别的事。${s}`,
  (s) => `${s} 写到这里，我准备睡了。`,
  (s) => `标题：今日随想\n正文：${s}`,
  (s) => `早上取了快递，下午开会。${s} 晚上吃了面。`,
  (s) => `我妈说“一切都会过去”。${s}`,
  (s) => `${s} 但我也不确定明天会怎样。`,
  (s) => `说实话，我想了很久。${s} 总之先这样吧。`,
  (s) => `以下是我今天最想记住的话：${s}`,
  (s) => `${s}\n这是整篇日记的最后一句。`,
  (s) => `我觉得自己很优秀，也很幸运。${s}`,
  (s) => `天气很好，风也很轻。${s}`,
  (s) => `朋友问我为什么。${s}`,
  (s) => `${s} 哈哈哈，真有意思。`,
  (s) => `今天的待办：回邮件、开会、买菜。${s}`,
  (s) => `有人曾说“轻舟已过万重山”。${s}`,
  (s) => `我很难过，但不想只记录难过。${s}`,
  (s) => `${s} 我想这大概就是成长吧。`,
  (s) => `日记正文开始。${s} 日记正文结束。`,
  (s) => `I mean, 今天确实很奇妙。${s}`,
];

const cases = [];
for (const [kind, seeds] of [['literary', literarySeeds], ['ordinary', ordinarySeeds]]) {
  for (let seedIndex = 0; seedIndex < seeds.length; seedIndex += 1) {
    for (let contextIndex = 0; contextIndex < contexts.length; contextIndex += 1) {
      const seed = seeds[seedIndex];
      cases.push({
        id: `${kind}-${String(seedIndex + 1).padStart(2, '0')}-${String(contextIndex + 1).padStart(2, '0')}`,
        kind,
        diary: contexts[contextIndex](seed),
        expected: kind === 'literary' ? [seed] : [],
      });
    }
  }
}

if (cases.length !== 1000) throw new Error(`Expected 1000 cases, got ${cases.length}`);

const normalize = (value) =>
  String(value || '').replace(/[“”"'‘’]/g, '').replace(/\s+/g, '').replace(/[。！？!?]+$/, '');

function extractJson(text) {
  const match = String(text).match(/\{[\s\S]*\}/);
  if (!match) throw new Error('No JSON object in response');
  return JSON.parse(match[0]);
}

async function evaluate(testCase) {
  const response = await fetch(`${API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: `日记正文：\n${testCase.diary}` },
      ],
    }),
  });
  if (!response.ok) throw new Error(`${response.status}: ${await response.text()}`);
  const payload = await response.json();
  const parsed = extractJson(payload.choices?.[0]?.message?.content || '');
  const actual = Array.isArray(parsed.quotes)
    ? parsed.quotes.map((item) => typeof item === 'string' ? item : item?.text).filter(Boolean)
    : [];
  const actualNormalized = actual.map(normalize);
  const expectedNormalized = testCase.expected.map(normalize);
  const passed = actualNormalized.length === expectedNormalized.length
    && expectedNormalized.every((item) => actualNormalized.includes(item));
  return { ...testCase, actual, passed };
}

async function runPool(items, worker, concurrency) {
  const results = new Array(items.length);
  let cursor = 0;
  async function next() {
    while (cursor < items.length) {
      const index = cursor++;
      try {
        results[index] = await worker(items[index]);
      } catch (error) {
        results[index] = { ...items[index], passed: false, error: error.message };
      }
      if ((index + 1) % 25 === 0) console.log(`${index + 1}/${items.length}`);
    }
  }
  await Promise.all(Array.from({ length: concurrency }, next));
  return results;
}

if (!API_KEY) {
  console.error('Set BENCHMARK_API_KEY or OPENAI_API_KEY before running this benchmark.');
  process.exit(2);
}

const results = await runPool(cases, evaluate, CONCURRENCY);
const passed = results.filter((item) => item.passed).length;
const falsePositive = results.filter((item) => item.kind === 'ordinary' && !item.passed).length;
const falseNegative = results.filter((item) => item.kind === 'literary' && !item.passed).length;
const summary = {
  model: MODEL,
  total: results.length,
  passed,
  passRate: passed / results.length,
  falsePositive,
  falseNegative,
};

const outputDir = path.resolve('tmp', 'quote-literary-benchmark');
await fs.mkdir(outputDir, { recursive: true });
await fs.writeFile(path.join(outputDir, 'results.json'), JSON.stringify({ summary, results }, null, 2));
await fs.writeFile(
  path.join(outputDir, 'failures.json'),
  JSON.stringify(results.filter((item) => !item.passed), null, 2)
);
await fs.writeFile(path.join(outputDir, 'summary.json'), JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
