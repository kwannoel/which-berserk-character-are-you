/**
 * Fuzz test + reverse path trace for the Berserk personality quiz.
 *
 * Verifies:
 *  1. No single character dominates random playthroughs
 *  2. Every character is reachable via at least one answer path
 *
 * Run:  node test/fuzz.js
 */

const fs = require('fs');
const path = require('path');

// Extract and eval the data + scoring code from index.html
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*)<\/script>/);
const code = scriptMatch[1]
  .replace(/const /g, 'var ')
  .replace(/let /g, 'var ')
  .split('function showScreen')[0]
  .split('function startQuiz')[0];
eval(code);

const FUZZ_ROUNDS = 10000;
const REVERSE_ATTEMPTS = 50000;
let exitCode = 0;

// ── Fuzz test ────────────────────────────────────────────────────
console.log(`=== FUZZ TEST: ${FUZZ_ROUNDS} random playthroughs ===\n`);

const counts = {};
for (let i = 0; i < FUZZ_ROUNDS; i++) {
  const indices = Array.from({ length: 12 }, () => Math.floor(Math.random() * 4));
  const answers = indices.map((idx, qi) => QUESTIONS[qi].answers[idx]);
  const result = calculateResult(answers);
  counts[result.match.name] = (counts[result.match.name] || 0) + 1;
}

const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
sorted.forEach(([name, count]) => {
  const pct = (count / (FUZZ_ROUNDS / 100)).toFixed(1);
  const bar = '#'.repeat(Math.round(count / (FUZZ_ROUNDS / 100)));
  console.log('  ' + name.padEnd(25) + pct.padStart(5) + '%  ' + bar);
});

const uniqueCount = Object.keys(counts).length;
console.log(`\n  Unique characters matched: ${uniqueCount} / ${CHARACTERS.length}`);

const missingFromFuzz = CHARACTERS.filter(c => !counts[c.name]);
if (missingFromFuzz.length) {
  console.log('  MISSING from random fuzz: ' + missingFromFuzz.map(c => c.name).join(', '));
}

// Check no character exceeds 25% — would indicate unhealthy dominance
const maxPct = sorted[0][1] / (FUZZ_ROUNDS / 100);
if (maxPct > 25) {
  console.log(`\n  FAIL: ${sorted[0][0]} dominates at ${maxPct.toFixed(1)}% (threshold: 25%)`);
  exitCode = 1;
} else {
  console.log(`\n  PASS: No character exceeds 25% (max: ${sorted[0][0]} at ${maxPct.toFixed(1)}%)`);
}

// ── Reverse path trace ───────────────────────────────────────────
console.log(`\n=== REVERSE PATH TRACE: finding a path to every character ===\n`);

const unreachable = [];

CHARACTERS.forEach(char => {
  // Random search
  let found = false;
  let bestCombo = null;

  for (let attempt = 0; attempt < REVERSE_ATTEMPTS; attempt++) {
    const indices = Array.from({ length: 12 }, () => Math.floor(Math.random() * 4));
    const answers = indices.map((idx, qi) => QUESTIONS[qi].answers[idx]);
    const result = calculateResult(answers);

    if (result.match.id === char.id) {
      found = true;
      bestCombo = indices;
      break;
    }
  }

  if (!found) {
    // Greedy fallback: pick answers that maximize cosine similarity with target
    const greedyIndices = [];
    const accTraits = { ambition: 0, bonds: 0, darkness: 0, resilience: 0, intellect: 0, wrath: 0 };

    for (let qi = 0; qi < QUESTIONS.length; qi++) {
      let bestIdx = 0;
      let bestScore = -1;

      for (let ai = 0; ai < 4; ai++) {
        const tempTraits = { ...accTraits };
        Object.entries(QUESTIONS[qi].answers[ai].traits).forEach(([t, v]) => tempTraits[t] += v);

        const keys = Object.keys(tempTraits);
        let dot = 0, magU = 0, magC = 0;
        keys.forEach(k => {
          dot += tempTraits[k] * char.traits[k];
          magU += tempTraits[k] * tempTraits[k];
          magC += char.traits[k] * char.traits[k];
        });
        const sim = dot / (Math.sqrt(magU) * Math.sqrt(magC));
        if (sim > bestScore) {
          bestScore = sim;
          bestIdx = ai;
        }
      }

      Object.entries(QUESTIONS[qi].answers[bestIdx].traits).forEach(([t, v]) => accTraits[t] += v);
      greedyIndices.push(bestIdx);
    }

    const greedyAnswers = greedyIndices.map((idx, qi) => QUESTIONS[qi].answers[idx]);
    const greedyResult = calculateResult(greedyAnswers);

    if (greedyResult.match.id === char.id) {
      found = true;
      bestCombo = greedyIndices;
    } else {
      unreachable.push({
        target: char.name,
        gotInstead: greedyResult.match.name,
        greedyAnswers: greedyIndices
      });
    }
  }

  const status = found ? 'REACHABLE' : 'UNREACHABLE';
  const combo = bestCombo ? '[' + bestCombo.map(i => 'ABCD'[i]).join('') + ']' : 'N/A';
  console.log('  ' + status.padEnd(13) + char.name.padEnd(25) + (found ? 'via ' + combo : ''));
});

if (unreachable.length) {
  console.log('\n=== UNREACHABLE CHARACTERS ===\n');
  unreachable.forEach(u => {
    console.log('  ' + u.target + ' -> greedy optimization lands on ' + u.gotInstead + ' instead');
    console.log('    Greedy path: [' + u.greedyAnswers.map(i => 'ABCD'[i]).join('') + ']');
  });
  exitCode = 1;
}

// ── Summary ──────────────────────────────────────────────────────
console.log('\n=== SUMMARY ===');
console.log(`  Reachable: ${CHARACTERS.length - unreachable.length} / ${CHARACTERS.length}`);
console.log(`  Unreachable: ${unreachable.length}`);
console.log(`  Result: ${exitCode === 0 ? 'PASS' : 'FAIL'}`);

process.exit(exitCode);
