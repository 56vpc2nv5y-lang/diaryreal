// Sonnet-mode benchmark for /api/poem (style: 'en-sonnet').
//
// Validates that the English prompt reliably yields a structurally valid
// Shakespearean sonnet (14 lines, ABAB CDCD EFEF GG, ~iambic pentameter)
// plus a four-line oracle, from both Chinese and English diary input.
//
// Run against DeepSeek directly (default) or any OpenAI-compatible endpoint:
//   DEEPSEEK_API_KEY=sk-xxx node tests/sonnet-benchmark.mjs
//   BENCHMARK_API_BASE=https://api.openai.com/v1 BENCHMARK_API_KEY=sk-xxx BENCHMARK_MODEL=gpt-4.1-mini node tests/sonnet-benchmark.mjs
//
// NOTE: keep the SYSTEM/USER prompts below in sync with api/poem.js (sonnetMessages).

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const API_BASE = (process.env.BENCHMARK_API_BASE || 'https://api.deepseek.com').replace(/\/$/, '');
const API_KEY = process.env.BENCHMARK_API_KEY || process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY;
const MODEL = process.env.BENCHMARK_MODEL || 'deepseek-chat';
const ROUNDS = Number(process.env.BENCHMARK_ROUNDS || 1); // repeat each diary N times to gauge stability

const SYSTEM = 'You are a discerning literary editor and a master of English verse in the tradition of Shakespeare. ' +
  'You read a personal diary entry (it may be written in Chinese) and draw from it a "lot" — a fortune-sign — made of two distinct parts. ' +
  'Work only from what the diary actually contains: its real events, moods, images and tensions. ' +
  'Never invent facts, never foretell the future, never moralize, never make mystical or astrological claims.\n' +
  '1) THE ORACLE — four short, gnomic lines in the manner of an old emblem-book motto or a sundial inscription: terse, image-first, symbolic. ' +
  'A light Early-Modern English flavour is welcome but it must stay readable. The oracle is NOT a summary and must NOT reuse any line of the sonnet. ' +
  'Line 1 sets a concrete image; line 2 glimpses the writer\'s situation through it; line 3 brings a turn, a cost or a reflection; line 4 closes with an aftertaste, not a verdict.\n' +
  '2) THE SONNET — a Shakespearean sonnet of EXACTLY fourteen lines: rhyme scheme strictly ABAB CDCD EFEF GG; ' +
  'iambic pentameter (ten syllables per line, five unstressed-stressed feet, with only rare and natural metrical substitutions and never padding); ' +
  'a volta — a turn of thought — at line 9 or in the final couplet. The sonnet must be original and allusive, faithful to the diary yet never a literal restatement of it. ' +
  'Quote suggestions must be copied VERBATIM from the diary in its original language; if none are truly worth keeping, return an empty array. ' +
  'Output JSON only.';

const userPrompt = (diaryText) =>
  `From the diary below, cast today's "lot": a literary mirror, not a prophecy.\n` +
  `Return strictly this JSON (and nothing else):\n` +
  `{"signTitle":"a 2-4 word English name for the lot","motif":"one concrete image taken from the diary",` +
  `"judgmentLines":["exactly four oracle lines, 4 to 9 words each"],` +
  `"interpretation":"40 to 80 words in English: how the oracle answers to the diary; never frame it as fate",` +
  `"timelineLine":"one English line distilled from the oracle, under 12 words, not copied from the sonnet",` +
  `"title":"a 1-3 word English title for the sonnet","form":"sonnet",` +
  `"lines":["the 14 lines of a Shakespearean sonnet, one line per array item, rhyming ABAB CDCD EFEF GG in iambic pentameter"],` +
  `"quoteSuggestions":[{"quote":"verbatim from the diary, in its original language","reason":"why it is worth keeping","theme":"short theme","score":0-100}]}\n` +
  `Hard rules: "lines" MUST contain exactly 14 items and obey the ABAB CDCD EFEF GG rhyme scheme; the oracle is written separately and must not copy any sonnet line; keep at most 3 quote suggestions. Output nothing but the JSON.\n\n` +
  `Diary:\n${diaryText.slice(0, 1600)}`;

const diaries = [
  { id: 'zh-rain', text: '下了一整天的雨。我在窗边改一份永远改不完的方案，茶凉了三回。傍晚雨停，玻璃上的水痕还在，像替我留着白天没说完的话。' },
  { id: 'zh-farewell', text: '今天送走了室友。火车开动的时候我笑着挥手，回到空荡的宿舍才发现，原来告别不是在站台，而是在你打扫她留下的灰尘的时候。' },
  { id: 'zh-quiet-win', text: '坚持晨跑的第三十天。没有变瘦，也没有变强，只是今早第一次没有看时间就跑完了五公里。原来有些坚持的奖赏，是你终于不再计较奖赏。' },
  { id: 'en-city', text: 'Moved to the new city today. The boxes are still taped shut and the streetlights hum a song I do not know yet. I keep waiting to feel at home, then realize home was never a place that waited for me.' },
  { id: 'en-father', text: 'Dad set the old clock five minutes fast again. He says it keeps us from being late. I think he just wants a little more time to take back the things he never managed to say.' },
];

export function syllables(word) {
  const w = String(word).toLowerCase().replace(/[^a-z]/g, '');
  if (!w) return 0;
  if (w.length <= 3) return 1;
  let s = (w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '').match(/[aeiouy]{1,2}/g) || []).length;
  return Math.max(1, s);
}
export const lineSyllables = (line) => String(line).split(/\s+/).filter(Boolean).reduce((n, w) => n + syllables(w), 0);

function rhymeKey(line) {
  const words = String(line).toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).filter(Boolean);
  let last = words[words.length - 1] || '';
  // Drop a trailing silent 'e' (before, pane, stone) but keep short words like the/be.
  if (last.length > 3 && /[^aeiou]e$/.test(last)) last = last.slice(0, -1);
  const m = last.match(/[aeiouy]+[^aeiouy]*$/); // last vowel cluster + trailing consonants
  return m ? m[0] : last;
}
// Collapse common English spellings of the same vowel sound so that e.g.
// pane/rain, before/for, breath/beneath are treated as rhymes. Heuristic, not a phonetic dictionary.
function canon(key) {
  return key
    .replace(/e$/, '')                 // silent final e: ore->or, ane->an
    .replace(/(ai|ay|ei|ey)/g, 'A')
    .replace(/(igh|ie)/g, 'I')
    .replace(/(oo|ou|ew|ue)/g, 'U')
    .replace(/(oa|ow)/g, 'O')
    .replace(/(ee|ea)/g, 'E')
    .replace(/a/g, 'A').replace(/e/g, 'E').replace(/i/g, 'I')
    .replace(/o/g, 'O').replace(/u/g, 'U').replace(/y/g, 'I');
}
export const rhymes = (a, b) => {
  const ka = canon(rhymeKey(a)), kb = canon(rhymeKey(b));
  return ka && kb && (ka === kb || ka.endsWith(kb) || kb.endsWith(ka));
};

// Shakespearean pattern: pairs that must rhyme (0-indexed)
export const RHYME_PAIRS = [[0, 2], [1, 3], [4, 6], [5, 7], [8, 10], [9, 11], [12, 13]];

function extractJson(text) {
  const cleaned = String(text).replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '').trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('No JSON object in response');
  return JSON.parse(match[0]);
}

export function grade(diary, poem) {
  const issues = [];
  const lines = Array.isArray(poem.lines) ? poem.lines.map(String) : [];
  if (lines.length !== 14) issues.push(`lines=${lines.length} (need 14)`);
  const oracle = Array.isArray(poem.judgmentLines) ? poem.judgmentLines.filter(Boolean) : [];
  if (oracle.length < 4) issues.push(`oracle=${oracle.length} (need 4)`);

  let rhymeHits = 0;
  if (lines.length === 14) {
    for (const [a, b] of RHYME_PAIRS) if (rhymes(lines[a], lines[b])) rhymeHits += 1;
  }
  const rhymeScore = lines.length === 14 ? rhymeHits / RHYME_PAIRS.length : 0;

  const meterOk = lines.filter(l => { const s = lineSyllables(l); return s >= 8 && s <= 12; }).length;
  const meterScore = lines.length ? meterOk / lines.length : 0;

  // oracle must not copy a sonnet line
  const lineSet = new Set(lines.map(l => l.trim().toLowerCase()));
  const oracleLeak = oracle.some(o => lineSet.has(String(o).trim().toLowerCase()));
  if (oracleLeak) issues.push('oracle copies a sonnet line');

  // quotes verbatim subset of diary
  const quotes = Array.isArray(poem.quoteSuggestions) ? poem.quoteSuggestions : [];
  const badQuote = quotes.find(q => q && typeof q.quote === 'string' && q.quote.trim() && !diary.includes(q.quote.trim()));
  if (badQuote) issues.push('quote not verbatim from diary');

  const structurePass = lines.length === 14 && oracle.length >= 4 && !oracleLeak && !badQuote;
  const qualityPass = rhymeScore >= 0.6 && meterScore >= 0.7; // rhyme/meter are heuristic soft-scores
  return { structurePass, qualityPass, rhymeScore, meterScore, issues, lines, oracle };
}

async function callModel(diary) {
  const response = await fetch(`${API_BASE}/chat/completions`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${API_KEY}` },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.85,
      max_tokens: 1400,
      response_format: { type: 'json_object' },
      messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: userPrompt(diary) }],
    }),
  });
  if (!response.ok) throw new Error(`${response.status}: ${await response.text()}`);
  const payload = await response.json();
  return extractJson(payload.choices?.[0]?.message?.content || '');
}

async function main() {
  if (!API_KEY) {
    console.error('Set DEEPSEEK_API_KEY (or BENCHMARK_API_KEY / OPENAI_API_KEY) before running this benchmark.');
    process.exit(2);
  }

  const results = [];
  for (let round = 0; round < ROUNDS; round += 1) {
    for (const d of diaries) {
      try {
        const poem = await callModel(d.text);
        const g = grade(d.text, poem);
        results.push({ id: d.id, round, ...g, poem });
        const flag = g.structurePass ? (g.qualityPass ? '✓' : '~') : '✗';
        console.log(`${flag} ${d.id}  rhyme=${g.rhymeScore.toFixed(2)} meter=${g.meterScore.toFixed(2)}  ${g.issues.join('; ') || 'structure ok'}`);
      } catch (error) {
        results.push({ id: d.id, round, structurePass: false, qualityPass: false, error: error.message });
        console.log(`✗ ${d.id}  ERROR ${error.message}`);
      }
    }
  }

  const n = results.length;
  const summary = {
    model: MODEL,
    total: n,
    structurePassRate: results.filter(r => r.structurePass).length / n,
    qualityPassRate: results.filter(r => r.qualityPass).length / n,
    avgRhyme: results.reduce((s, r) => s + (r.rhymeScore || 0), 0) / n,
    avgMeter: results.reduce((s, r) => s + (r.meterScore || 0), 0) / n,
  };

  const outDir = path.resolve('tmp', 'sonnet-benchmark');
  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(path.join(outDir, 'results.json'), JSON.stringify({ summary, results }, null, 2));
  console.log('\n' + JSON.stringify(summary, null, 2));
  console.log(`\nFull output + sample sonnets written to ${path.join(outDir, 'results.json')}`);
}

// Only hit the API when executed directly; importing only pulls in the graders.
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main();
}
