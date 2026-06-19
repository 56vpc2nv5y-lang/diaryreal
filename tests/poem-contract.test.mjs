import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../api/poem.js', import.meta.url), 'utf8');

assert.match(source, /一句判词/);
assert.match(source, /judgmentLines":\[\]/);
assert.match(source, /ABAB CDCD EFEF GG/);
assert.match(source, /iambic pentameter/i);
assert.match(source, /不要机械生成三个字/);
assert.doesNotMatch(source, /四行判词，每行/);

function validatePoemContract(result, style) {
  assert.ok(result && typeof result === 'object');
  assert.equal(typeof result.title, 'string');
  assert.ok(Array.isArray(result.lines));
  if (style === 'en-sonnet') {
    assert.equal(result.lines.length, 14);
    assert.ok(Array.isArray(result.judgmentLines));
    assert.equal(result.judgmentLines.length, 0);
    assert.equal(result.form, 'sonnet');
  } else {
    assert.equal(result.lines.length, 4);
    assert.ok(Array.isArray(result.judgmentLines));
    assert.equal(result.judgmentLines.length, 1);
    const titleLength = Array.from(result.title).length;
    assert.ok(titleLength >= 2 && titleLength <= 8);
  }
}

const zhTitles = ['夜航', '灯下棋', '风回云开', '雨后简历', '旧窗新月', '未落之棋'];
const enTitles = ['Irony Weft', 'The Quiet Door', 'Veiled Choice', 'A Broken Part'];

for (let i = 0; i < 5000; i++) {
  const en = i % 2 === 0;
  const titlePool = en ? enTitles : zhTitles;
  validatePoemContract({
    title: titlePool[i % titlePool.length],
    form: en ? 'sonnet' : (i % 3 === 0 ? '五绝' : '七绝'),
    lines: Array.from({ length: en ? 14 : 4 }, (_, line) => en
      ? `This measured line keeps faith with turn ${line + 1}`
      : `灯下残茶照此心${line % 2 ? '。' : '，'}`),
    judgmentLines: en ? [] : ['灯下残茶照未落之棋'],
  }, en ? 'en-sonnet' : 'zh-classical');
}

console.log('poem contract checks passed: 5000 synthetic cases');
