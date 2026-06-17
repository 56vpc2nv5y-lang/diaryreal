// Offline self-test for the sonnet grader (no API key required).
//
//   node tests/sonnet-grader.test.mjs
//
// Verifies the structural/rhyme/meter validators behave correctly, using a
// hand-written valid Shakespearean sonnet (a sample of the shape api/poem.js
// is prompted to produce for the "rainy day" diary) and a broken one.

import { grade } from './sonnet-benchmark.mjs';

const diary = '下了一整天的雨。我在窗边改一份永远改不完的方案，茶凉了三回。傍晚雨停，玻璃上的水痕还在，像替我留着白天没说完的话。';

// A valid sample: ABAB CDCD EFEF GG, ~iambic pentameter, oracle separate from the sonnet.
const goodPoem = {
  signTitle: 'The Unfinished Page',
  motif: 'water-traces on the window glass',
  judgmentLines: [
    'Rain copies one grey line all day.',
    'The draft is mended, never done.',
    'At dusk the weather holds its breath,',
    'and glass keeps words the tongue let fall.',
  ],
  interpretation:
    'The endless edits and the thrice-cold tea are the same act of waiting, ' +
    'and when the rain stops, the streaked glass simply holds what went unsaid that day.',
  timelineLine: 'The glass kept the words I never said.',
  title: 'Rainmark',
  form: 'sonnet',
  lines: [
    'The rain wrote one grey sentence all the day,',
    'and at the glass I bent my draft anew;',
    'the kettle cooled three times along the way,',
    'the same cold tea I drank and never knew.',
    'Each fix I made undid the fix before,',
    'as though the work were tide and not a stone;',
    'I counted hours I could not account for,',
    'and watched the early dark come on alone.',
    'Then, near to dusk, the long rain held its breath,',
    'and left its writing silver on the pane—',
    'thin lines that kept what falling left beneath,',
    'the words I had not said, returned as rain.',
    'The glass remembered what my tongue let fall,',
    'and held the dusk\'s unanswered words for all.',
  ],
  quoteSuggestions: [
    { quote: '玻璃上的水痕还在，像替我留着白天没说完的话', reason: 'concrete image carrying the unsaid', theme: '未言', score: 86 },
  ],
};

// A broken sample: 13 lines, no rhyme, oracle copies a sonnet line, fabricated quote.
const badPoem = {
  signTitle: 'Broken',
  motif: 'rain',
  // Oracle line 1 illegally copies sonnet line 1 verbatim.
  judgmentLines: ['It rained today a lot and I was tired', 'I was busy.', 'Nothing rhymes.', 'The end.'],
  interpretation: 'You will get rich next week.',
  timelineLine: 'Rain.',
  title: 'Bad',
  form: 'sonnet',
  lines: [
    'It rained today a lot and I was tired',
    'I edited a document forever',
    'My tea got cold I think about three times',
    'The rain it stopped around the evening time',
    'There were some marks of water on the window',
    'They looked like words I never got to say',
    'I felt a little sad but also calm',
    'Tomorrow I will try to rest much more',
    'It rained today a lot and I was tired',
    'The city lights were very bright at night',
    'I wonder what the future holds for me',
    'A random line that does not rhyme at all',
    'The thirteenth line and then the poem stops',
  ],
  quoteSuggestions: [
    { quote: 'I will become a millionaire soon', reason: 'fabricated', theme: 'x', score: 99 },
  ],
};

let failures = 0;
function check(label, cond) {
  console.log(`${cond ? '✓' : '✗'} ${label}`);
  if (!cond) failures += 1;
}

const good = grade(diary, goodPoem);
console.log(`\nGOOD sample → rhyme=${good.rhymeScore.toFixed(2)} meter=${good.meterScore.toFixed(2)} issues=[${good.issues.join('; ')}]`);
check('good: 14 lines + oracle pass structure', good.structurePass);
check('good: rhyme score >= 0.85', good.rhymeScore >= 0.85);
check('good: meter score >= 0.85', good.meterScore >= 0.85);
check('good: overall quality pass', good.qualityPass);

const bad = grade(diary, badPoem);
console.log(`\nBAD sample → rhyme=${bad.rhymeScore.toFixed(2)} meter=${bad.meterScore.toFixed(2)} issues=[${bad.issues.join('; ')}]`);
check('bad: fails structure (13 lines / leak / fake quote)', !bad.structurePass);
check('bad: flags 13 lines', bad.issues.some(i => i.includes('lines=13')));
check('bad: flags oracle copying a sonnet line', bad.issues.some(i => i.includes('oracle copies')));
check('bad: flags non-verbatim quote', bad.issues.some(i => i.includes('quote not verbatim')));
check('bad: low rhyme score (< 0.6)', bad.rhymeScore < 0.6);

console.log(`\n${failures === 0 ? 'ALL CHECKS PASSED' : failures + ' CHECK(S) FAILED'}`);
process.exit(failures === 0 ? 0 : 1);
