# Berserk Personality Quiz Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a "Which Berserk Character Are You?" personality quiz as a single self-contained HTML file with 21 characters, trait-based scoring, radar chart, and social sharing.

**Architecture:** Single `index.html` with embedded CSS and JS. Four screens (landing, quiz, calculating, results) toggled via CSS classes. Character/question data as JS objects. Canvas API for radar chart and share card. URL hash for deep-linking results.

**Tech Stack:** Vanilla HTML/CSS/JS, Canvas API, Google Fonts (Cinzel for display text)

**Design Doc:** `docs/plans/2026-02-28-berserk-quiz-design.md`

---

### Task 1: HTML Scaffold + Screen Switching

**Files:**
- Create: `index.html`

**Step 1: Create the base HTML with all four screen containers**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Which Berserk Character Are You?</title>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&display=swap" rel="stylesheet">
  <style>
    /* Reset and base */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Georgia', serif;
      background: #0a0a0a;
      color: #e8e0d4;
      min-height: 100vh;
      overflow-x: hidden;
    }
    h1, h2, h3, .display-font { font-family: 'Cinzel', serif; }

    /* Screen management */
    .screen { display: none; min-height: 100vh; }
    .screen.active { display: flex; flex-direction: column; align-items: center; }
  </style>
</head>
<body>
  <div id="screen-landing" class="screen active">
    <h1>Which Berserk Character Are You?</h1>
    <button id="btn-start">Begin the Struggle</button>
  </div>

  <div id="screen-quiz" class="screen">
    <div id="progress-bar"></div>
    <div id="question-container"></div>
  </div>

  <div id="screen-calculating" class="screen">
    <p>The Eclipse reveals your fate...</p>
  </div>

  <div id="screen-result" class="screen">
    <div id="result-container"></div>
  </div>

  <script>
    function showScreen(id) {
      document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
      document.getElementById('screen-' + id).classList.add('active');
    }
    document.getElementById('btn-start').addEventListener('click', () => showScreen('quiz'));
  </script>
</body>
</html>
```

**Step 2: Open in browser and verify**

Open `index.html` in browser. Verify:
- Dark background, off-white text
- "Which Berserk Character Are You?" title in Cinzel font
- "Begin the Struggle" button visible
- Clicking button switches to the quiz screen (empty for now)

**Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add HTML scaffold with screen switching"
```

---

### Task 2: Landing Page Styling

**Files:**
- Modify: `index.html` (CSS and landing screen HTML)

**Step 1: Style the landing page with dark manga aesthetic**

Add to the `<style>` block:

```css
/* Landing page */
#screen-landing {
  justify-content: center;
  text-align: center;
  padding: 2rem;
  background:
    radial-gradient(ellipse at center, rgba(139,0,0,0.15) 0%, transparent 70%),
    #0a0a0a;
}
#screen-landing h1 {
  font-size: clamp(2rem, 6vw, 4rem);
  font-weight: 900;
  color: #e8e0d4;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  line-height: 1.2;
  margin-bottom: 0.5rem;
  text-shadow: 0 0 40px rgba(139,0,0,0.4);
}
#screen-landing .subtitle {
  font-size: clamp(0.9rem, 2vw, 1.2rem);
  color: #888;
  margin-bottom: 3rem;
  font-style: italic;
}
#btn-start {
  font-family: 'Cinzel', serif;
  font-size: 1.2rem;
  font-weight: 700;
  padding: 1rem 3rem;
  background: transparent;
  color: #8B0000;
  border: 2px solid #8B0000;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  transition: all 0.3s ease;
}
#btn-start:hover {
  background: #8B0000;
  color: #e8e0d4;
  box-shadow: 0 0 30px rgba(139,0,0,0.4);
}
```

Update the landing screen HTML:

```html
<div id="screen-landing" class="screen active">
  <h1>Which Berserk Character Are You?</h1>
  <p class="subtitle">A personality in the world of darkness and struggle</p>
  <button id="btn-start">Begin the Struggle</button>
</div>
```

**Step 2: Open in browser and verify**

- Title is large, uppercase, Cinzel font with red glow
- Subtitle in italics below
- Button has red border, hover turns solid red with glow
- Dark background with subtle red radial gradient

**Step 3: Commit**

```bash
git add index.html
git commit -m "feat: style landing page with dark manga aesthetic"
```

---

### Task 3: Character Data — Trait Profiles

**Files:**
- Modify: `index.html` (add character data in `<script>`)

**Step 1: Add character data array with all 21 characters**

Each character has: `id`, `name`, `traits` (object with 6 scores 1-10), `quote`, `description`, `matchBlurb`. Add this at the top of the `<script>` block:

```javascript
const CHARACTERS = [
  {
    id: 'guts',
    name: 'Guts',
    traits: { ambition: 4, bonds: 6, darkness: 9, resilience: 10, intellect: 5, wrath: 10 },
    quote: "If you're always worried about crushing the ants beneath you, you won't be able to walk.",
    description: "You are the Black Swordsman. Forged in suffering, you carry burdens that would break lesser people. Beneath your rage lies a fierce loyalty to those who earn your trust.",
    matchBlurb: "Like Guts, you endure what others cannot and fight hardest for the people closest to you."
  },
  {
    id: 'griffith',
    name: 'Griffith',
    traits: { ambition: 10, bonds: 2, darkness: 8, resilience: 7, intellect: 10, wrath: 2 },
    quote: "Among thousands of comrades and tens of thousands of enemies, only you made me forget my dream.",
    description: "You are the White Hawk. Your vision transcends mortal limits. Charismatic and calculating, you draw others into your orbit — but your dream always comes first.",
    matchBlurb: "Like Griffith, you see farther than everyone else and will sacrifice anything to reach your vision."
  },
  {
    id: 'casca',
    name: 'Casca',
    traits: { ambition: 6, bonds: 9, darkness: 5, resilience: 8, intellect: 7, wrath: 5 },
    quote: "I'm a warrior. I won't be pitied.",
    description: "You are the commander of the Band of the Hawk. Fiercely capable and deeply loyal, you prove yourself through action. Your strength comes from both discipline and heart.",
    matchBlurb: "Like Casca, you lead with competence and care equally about proving yourself and protecting others."
  },
  {
    id: 'skull-knight',
    name: 'Skull Knight',
    traits: { ambition: 5, bonds: 3, darkness: 8, resilience: 10, intellect: 10, wrath: 3 },
    quote: "You should know that all who struggle will not be rewarded. Regardless of your effort, the only destination is the grave.",
    description: "You are the undying sentinel. Ancient and enigmatic, you move through the world with purpose few can comprehend. You bear the weight of knowledge that would drive others to despair.",
    matchBlurb: "Like Skull Knight, you see the bigger picture and act with patience born of hard-won wisdom."
  },
  {
    id: 'schierke',
    name: 'Schierke',
    traits: { ambition: 3, bonds: 8, darkness: 2, resilience: 6, intellect: 10, wrath: 2 },
    quote: "Magic is the power to understand the world's flow and become one with it.",
    description: "You are the young witch of the forest. Wise beyond your years, you see the world through eyes of wonder and knowledge. Your power grows from understanding, not force.",
    matchBlurb: "Like Schierke, your greatest strength is your mind, and your compassion runs deeper than you let on."
  },
  {
    id: 'zodd',
    name: 'Nosferatu Zodd',
    traits: { ambition: 5, bonds: 2, darkness: 8, resilience: 10, intellect: 4, wrath: 9 },
    quote: "On the battlefield, there is no place for hope. What lies there is only cold despair and a sweet victory built on the pain of the defeated.",
    description: "You are the immortal war demon. You live for the thrill of battle and the clash of worthy opponents. Respect is earned only through strength.",
    matchBlurb: "Like Zodd, you thrive in conflict and respect only those who can stand as your equal."
  },
  {
    id: 'serpico',
    name: 'Serpico',
    traits: { ambition: 2, bonds: 8, darkness: 4, resilience: 7, intellect: 9, wrath: 2 },
    quote: "I merely observe. That is all I have ever done.",
    description: "You are the wind swordsman. Calm, perceptive, and deceptively dangerous, you mask your true abilities behind a gentle smile. Your loyalty to those you love is absolute.",
    matchBlurb: "Like Serpico, you see everything, say little, and would quietly destroy anyone who threatens those you care about."
  },
  {
    id: 'farnese',
    name: 'Farnese',
    traits: { ambition: 5, bonds: 7, darkness: 5, resilience: 6, intellect: 6, wrath: 4 },
    quote: "I don't want to be protected. I want to be able to protect.",
    description: "You are the seeker of purpose. Once lost in dogma and fear, you found your true self through growth and vulnerability. Your courage isn't fearlessness — it's choosing to change.",
    matchBlurb: "Like Farnese, your greatest strength is your willingness to transform and find meaning beyond what you were given."
  },
  {
    id: 'rickert',
    name: 'Rickert',
    traits: { ambition: 4, bonds: 8, darkness: 2, resilience: 8, intellect: 8, wrath: 3 },
    quote: "I can't follow you. That's my answer.",
    description: "You are the one who stood his ground. Where others bent the knee, you held firm. You honor the past not through vengeance but through quiet, unshakeable conviction.",
    matchBlurb: "Like Rickert, you have the rare courage to reject power when it betrays your principles."
  },
  {
    id: 'puck',
    name: 'Puck',
    traits: { ambition: 1, bonds: 10, darkness: 1, resilience: 4, intellect: 4, wrath: 1 },
    quote: "Even if you force back what was lost, it still won't be the way it was.",
    description: "You are the light in the darkness. Where others see only suffering, you find humor, warmth, and reason to smile. You heal not with power but with presence.",
    matchBlurb: "Like Puck, you bring levity and heart to every situation, reminding others that joy is never completely lost."
  },
  {
    id: 'isidro',
    name: 'Isidro',
    traits: { ambition: 7, bonds: 6, darkness: 2, resilience: 6, intellect: 3, wrath: 5 },
    quote: "I'm gonna be the greatest swordsman in the world!",
    description: "You are the scrappy upstart. Brash, reckless, and full of fire, you charge headlong into the unknown. What you lack in wisdom you make up for in sheer nerve.",
    matchBlurb: "Like Isidro, your boldness and refusal to be intimidated carry you further than talent alone ever could."
  },
  {
    id: 'judeau',
    name: 'Judeau',
    traits: { ambition: 3, bonds: 10, darkness: 3, resilience: 7, intellect: 8, wrath: 2 },
    quote: "You shouldn't throw your life away for someone else's dream.",
    description: "You are the quiet heart of the group. Perceptive, selfless, and always putting others first, you see what others miss and carry unspoken feelings with grace.",
    matchBlurb: "Like Judeau, you give more than you ask for and notice the things everyone else overlooks."
  },
  {
    id: 'corkus',
    name: 'Corkus',
    traits: { ambition: 6, bonds: 4, darkness: 6, resilience: 4, intellect: 5, wrath: 7 },
    quote: "Don't push your luck! We're mercenaries, not heroes!",
    description: "You are the bitter realist. You see the world for what it is and have no patience for idealism. Cynical and sharp-tongued, you're not always wrong — just never hopeful.",
    matchBlurb: "Like Corkus, you cut through delusion with brutal honesty, even when no one wants to hear it."
  },
  {
    id: 'void',
    name: 'Void',
    traits: { ambition: 10, bonds: 1, darkness: 10, resilience: 8, intellect: 10, wrath: 1 },
    quote: "In this world, is the destiny of mankind controlled by some transcendental entity or law?",
    description: "You are the architect of fate. Detached, cerebral, and operating on a plane beyond mortal concerns, you see causality itself as your domain. Emotion is irrelevant; the pattern is everything.",
    matchBlurb: "Like Void, you think in systems and abstractions, viewing the world from a distance that others find unsettling."
  },
  {
    id: 'slan',
    name: 'Slan',
    traits: { ambition: 7, bonds: 3, darkness: 9, resilience: 6, intellect: 7, wrath: 3 },
    quote: "Pain and pleasure are inseparable... that is what it means to be human.",
    description: "You are the Whore Princess of the Uterine Sea. You find beauty in extremes — pain, pleasure, passion, despair. Life is sensation, and you refuse to experience it halfway.",
    matchBlurb: "Like Slan, you embrace the full spectrum of experience while others flinch from intensity."
  },
  {
    id: 'locus',
    name: 'Locus',
    traits: { ambition: 7, bonds: 5, darkness: 6, resilience: 8, intellect: 8, wrath: 3 },
    quote: "A knight must have a lord to serve. A purpose to devote himself to.",
    description: "You are the Moonlight Knight. Even in darkness, you cling to an ideal of honor and purpose. You serve not out of weakness but from a deep need for meaning.",
    matchBlurb: "Like Locus, you seek a cause worthy of your devotion and carry yourself with quiet dignity."
  },
  {
    id: 'grunbeld',
    name: 'Grunbeld',
    traits: { ambition: 6, bonds: 4, darkness: 6, resilience: 10, intellect: 5, wrath: 6 },
    quote: "Show me the strength of a true warrior.",
    description: "You are the Great Flame Dragon. You respect strength above all else and hold yourself to a warrior's code. Honest combat is sacred to you.",
    matchBlurb: "Like Grunbeld, you believe in earning everything through strength and despise those who take shortcuts."
  },
  {
    id: 'irvine',
    name: 'Irvine',
    traits: { ambition: 3, bonds: 3, darkness: 5, resilience: 7, intellect: 7, wrath: 1 },
    quote: "The moon tonight is beautiful, isn't it?",
    description: "You are the solitary archer. Quiet, observant, and comfortable in solitude, you see the world with an artist's eye. You act with precision, never wasting a single motion.",
    matchBlurb: "Like Irvine, you find peace in stillness and beauty in places others never think to look."
  },
  {
    id: 'ganishka',
    name: 'Ganishka',
    traits: { ambition: 10, bonds: 1, darkness: 9, resilience: 9, intellect: 7, wrath: 8 },
    quote: "I will not kneel before any being, human or demon!",
    description: "You are the rebel emperor. Even among demons, you refused to bow. Your defiance is absolute — you'd rather be destroyed than submit to another's will.",
    matchBlurb: "Like Ganishka, your need for independence burns so fiercely that you'd challenge fate itself."
  },
  {
    id: 'egg',
    name: 'Egg of the Perfect World',
    traits: { ambition: 2, bonds: 2, darkness: 8, resilience: 2, intellect: 6, wrath: 1 },
    quote: "I wanted a world that was beautiful... for everyone.",
    description: "You are the forgotten apostle. Invisible to the world, you carried a wish so pure it became a sacrifice. Your suffering was silent, your hope was for everyone but yourself.",
    matchBlurb: "Like the Egg, your deepest desire is not for yourself but for a world that never saw you."
  },
  {
    id: 'sonia',
    name: 'Sonia',
    traits: { ambition: 5, bonds: 9, darkness: 3, resilience: 5, intellect: 6, wrath: 1 },
    quote: "I can see it... a world reborn in light.",
    description: "You are the blind devotee. Your faith is total, your conviction unshakeable. Where others question and doubt, you see with absolute clarity — or absolute delusion.",
    matchBlurb: "Like Sonia, you give yourself completely to what you believe in, with a certainty that both inspires and unnerves."
  }
];
```

**Step 2: Verify in browser console**

Open browser console and run: `console.log(CHARACTERS.length)` — should output `21`.
Run: `CHARACTERS.every(c => Object.keys(c.traits).length === 6)` — should output `true`.

**Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add 21 character trait profiles, quotes, and descriptions"
```

---

### Task 4: Question Data

**Files:**
- Modify: `index.html` (add questions array in `<script>`)

**Step 1: Add 12 questions with trait-weighted answers**

Add after the `CHARACTERS` array:

```javascript
const QUESTIONS = [
  {
    text: "A companion falls behind on a dangerous path. The group is at risk if you stop.",
    answers: [
      { text: "Go back alone to get them — no one gets left behind.", traits: { bonds: 3, wrath: 1 } },
      { text: "The group's survival comes first. Hard truth.", traits: { intellect: 2, ambition: 2 } },
      { text: "Find a clever way to help without stopping the group.", traits: { intellect: 3, bonds: 1 } },
      { text: "They knew the risks. Keep moving.", traits: { darkness: 2, resilience: 2 } }
    ]
  },
  {
    text: "Someone you trusted deeply has betrayed you. What drives your next move?",
    answers: [
      { text: "Rage. They will answer for this.", traits: { wrath: 3, darkness: 1 } },
      { text: "Understanding. I need to know why before I act.", traits: { intellect: 3, bonds: 1 } },
      { text: "Survival. I cut them out and move forward.", traits: { resilience: 3, darkness: 1 } },
      { text: "It doesn't matter. I'll build something greater without them.", traits: { ambition: 3, resilience: 1 } }
    ]
  },
  {
    text: "You have the chance to gain immense power, but it will change who you are. What do you do?",
    answers: [
      { text: "Take it. Power is the only thing that matters in this world.", traits: { ambition: 3, darkness: 1 } },
      { text: "Refuse. I'd rather die as myself than live as something else.", traits: { resilience: 2, bonds: 2 } },
      { text: "Study it first. Understand the cost before deciding.", traits: { intellect: 3, resilience: 1 } },
      { text: "Take it and use it to protect the people I love.", traits: { bonds: 2, wrath: 2 } }
    ]
  },
  {
    text: "In a group, which role do you naturally fill?",
    answers: [
      { text: "The leader — I set the direction and others follow.", traits: { ambition: 3, intellect: 1 } },
      { text: "The protector — I make sure everyone gets through alive.", traits: { bonds: 3, resilience: 1 } },
      { text: "The observer — I watch, learn, and act at the right moment.", traits: { intellect: 2, darkness: 2 } },
      { text: "The wildcard — I don't fit neatly into roles.", traits: { wrath: 2, resilience: 2 } }
    ]
  },
  {
    text: "What do you fear most?",
    answers: [
      { text: "Losing the people closest to me.", traits: { bonds: 3, wrath: 1 } },
      { text: "Being powerless when it matters.", traits: { ambition: 2, resilience: 2 } },
      { text: "Losing myself — becoming something I don't recognize.", traits: { darkness: 2, intellect: 2 } },
      { text: "That nothing I do will ever matter.", traits: { ambition: 2, darkness: 2 } }
    ]
  },
  {
    text: "How do you handle pain?",
    answers: [
      { text: "I channel it into fury. Pain becomes fuel.", traits: { wrath: 3, resilience: 1 } },
      { text: "I endure it silently. It will pass.", traits: { resilience: 3, darkness: 1 } },
      { text: "I analyze it. Pain teaches you what matters.", traits: { intellect: 3, darkness: 1 } },
      { text: "I share it. Suffering alone makes it worse.", traits: { bonds: 3, resilience: 1 } }
    ]
  },
  {
    text: "A cause you believe in demands a terrible sacrifice. How do you respond?",
    answers: [
      { text: "I make the sacrifice without hesitation. The cause is everything.", traits: { ambition: 3, darkness: 1 } },
      { text: "I refuse. No cause is worth losing your humanity.", traits: { bonds: 2, resilience: 2 } },
      { text: "I find another way. There's always a path no one has seen yet.", traits: { intellect: 3, resilience: 1 } },
      { text: "I accept it but carry the weight forever.", traits: { darkness: 2, bonds: 2 } }
    ]
  },
  {
    text: "What kind of strength do you respect most?",
    answers: [
      { text: "Raw, unbreakable willpower — the refusal to go down.", traits: { resilience: 3, wrath: 1 } },
      { text: "Brilliant strategy — winning before the fight begins.", traits: { intellect: 3, ambition: 1 } },
      { text: "Quiet loyalty — standing by someone when it costs you.", traits: { bonds: 3, darkness: 1 } },
      { text: "Pure physical dominance — strength you can see and feel.", traits: { wrath: 2, resilience: 2 } }
    ]
  },
  {
    text: "You discover a hidden truth about the world that most people can't handle. What do you do?",
    answers: [
      { text: "Use the knowledge to gain an advantage.", traits: { ambition: 2, intellect: 2 } },
      { text: "Bear it alone. Knowing is my burden, not theirs.", traits: { darkness: 2, resilience: 2 } },
      { text: "Share it. People deserve the truth, even if it hurts.", traits: { bonds: 2, wrath: 2 } },
      { text: "Study it further. One truth always leads to another.", traits: { intellect: 3, darkness: 1 } }
    ]
  },
  {
    text: "When the world is at its darkest, what keeps you going?",
    answers: [
      { text: "Spite. I refuse to let the world beat me.", traits: { wrath: 2, resilience: 2 } },
      { text: "The people still beside me.", traits: { bonds: 3, resilience: 1 } },
      { text: "A vision of something better — a dream worth bleeding for.", traits: { ambition: 3, darkness: 1 } },
      { text: "Nothing keeps me going. I just don't know how to stop.", traits: { resilience: 2, darkness: 2 } }
    ]
  },
  {
    text: "How do you view people who oppose you?",
    answers: [
      { text: "Obstacles. I go through them or around them.", traits: { ambition: 2, wrath: 2 } },
      { text: "They might have a point. I try to understand them first.", traits: { intellect: 2, bonds: 2 } },
      { text: "They don't concern me unless they get in my way.", traits: { darkness: 2, resilience: 2 } },
      { text: "Enemies. I remember every slight.", traits: { wrath: 3, darkness: 1 } }
    ]
  },
  {
    text: "If you could leave one mark on the world, what would it be?",
    answers: [
      { text: "A kingdom — something vast that endures beyond me.", traits: { ambition: 3, intellect: 1 } },
      { text: "The memory of someone who never gave up.", traits: { resilience: 3, wrath: 1 } },
      { text: "That I protected the people who mattered.", traits: { bonds: 3, darkness: 1 } },
      { text: "Honestly? I don't care about leaving a mark. I just want peace.", traits: { darkness: 1, bonds: 2, resilience: 1 } }
    ]
  }
];
```

**Step 2: Verify in browser console**

Run: `console.log(QUESTIONS.length)` — should output `12`.
Run: `QUESTIONS.every(q => q.answers.length === 4)` — should output `true`.

Verify trait coverage — each trait should appear as a primary (+3 or +2) trait in multiple questions:
```javascript
const coverage = {};
QUESTIONS.forEach(q => q.answers.forEach(a =>
  Object.keys(a.traits).forEach(t => { coverage[t] = (coverage[t]||0) + 1; })
));
console.log(coverage);
```
All 6 traits should appear at least 8 times.

**Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add 12 quiz questions with trait-weighted answers"
```

---

### Task 5: Scoring Algorithm

**Files:**
- Modify: `index.html` (add scoring functions in `<script>`)

**Step 1: Implement calculateResult()**

```javascript
function calculateResult(answers) {
  // Sum trait scores from selected answers
  const userTraits = { ambition: 0, bonds: 0, darkness: 0, resilience: 0, intellect: 0, wrath: 0 };
  answers.forEach(answer => {
    Object.entries(answer.traits).forEach(([trait, value]) => {
      userTraits[trait] += value;
    });
  });

  // Normalize user traits to 1-10 scale
  const maxPossible = Math.max(...Object.values(userTraits));
  const minPossible = Math.min(...Object.values(userTraits));
  const range = maxPossible - minPossible || 1;
  const normalizedUser = {};
  Object.entries(userTraits).forEach(([trait, value]) => {
    normalizedUser[trait] = 1 + ((value - minPossible) / range) * 9;
  });

  // Euclidean distance to each character
  const distances = CHARACTERS.map(char => {
    const dist = Math.sqrt(
      Object.keys(normalizedUser).reduce((sum, trait) => {
        return sum + Math.pow(normalizedUser[trait] - char.traits[trait], 2);
      }, 0)
    );
    return { character: char, distance: dist };
  });

  distances.sort((a, b) => a.distance - b.distance);

  return {
    match: distances[0].character,
    runnerUp: distances[1].character,
    userTraits: normalizedUser
  };
}
```

**Step 2: Test in browser console**

Create mock answers that should map to known characters:

```javascript
// Mock answers that should produce high ambition + intellect + darkness = Griffith or Void
const mockGriffith = [
  { traits: { ambition: 3, darkness: 1 } },
  { traits: { ambition: 3, resilience: 1 } },
  { traits: { ambition: 3, darkness: 1 } },
  { traits: { ambition: 3, intellect: 1 } },
  { traits: { ambition: 2, darkness: 2 } },
  { traits: { intellect: 3, darkness: 1 } },
  { traits: { ambition: 3, darkness: 1 } },
  { traits: { intellect: 3, ambition: 1 } },
  { traits: { ambition: 2, intellect: 2 } },
  { traits: { ambition: 3, darkness: 1 } },
  { traits: { ambition: 2, wrath: 2 } },
  { traits: { ambition: 3, intellect: 1 } }
];
const result = calculateResult(mockGriffith);
console.log(result.match.name); // Should be Griffith or Void (high ambition+intellect+darkness)
console.log(result.runnerUp.name);
```

**Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add Euclidean distance scoring algorithm"
```

---

### Task 6: Quiz Flow Engine

**Files:**
- Modify: `index.html` (add quiz UI logic and CSS)

**Step 1: Add quiz flow CSS**

```css
/* Quiz screen */
#screen-quiz {
  justify-content: flex-start;
  padding: 2rem;
  max-width: 700px;
  margin: 0 auto;
  width: 100%;
}
.progress-bar-container {
  width: 100%;
  height: 4px;
  background: #1a1a1a;
  margin-bottom: 3rem;
  position: relative;
}
.progress-bar-fill {
  height: 100%;
  background: #8B0000;
  transition: width 0.4s ease;
}
.question-number {
  font-family: 'Cinzel', serif;
  font-size: 0.85rem;
  color: #555;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
}
.question-text {
  font-size: clamp(1.1rem, 2.5vw, 1.4rem);
  line-height: 1.6;
  margin-bottom: 2rem;
  font-style: italic;
  color: #ccc;
}
.answers {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
}
.answer-btn {
  background: #111;
  border: 1px solid #222;
  color: #e8e0d4;
  padding: 1rem 1.25rem;
  text-align: left;
  font-size: 1rem;
  font-family: 'Georgia', serif;
  cursor: pointer;
  transition: all 0.2s ease;
  line-height: 1.5;
}
.answer-btn:hover {
  border-color: #8B0000;
  background: #1a0000;
}
.answer-btn.selected {
  border-color: #8B0000;
  background: rgba(139,0,0,0.15);
}

/* Fade transition */
.question-container { transition: opacity 0.3s ease; }
.question-container.fade-out { opacity: 0; }
```

**Step 2: Add quiz flow JS**

```javascript
let currentQuestion = 0;
const selectedAnswers = [];

function startQuiz() {
  currentQuestion = 0;
  selectedAnswers.length = 0;
  showScreen('quiz');
  renderQuestion();
}

function renderQuestion() {
  const q = QUESTIONS[currentQuestion];
  const container = document.getElementById('question-container');
  const progressFill = document.querySelector('.progress-bar-fill');

  progressFill.style.width = ((currentQuestion / QUESTIONS.length) * 100) + '%';

  container.innerHTML = `
    <p class="question-number">Question ${currentQuestion + 1} of ${QUESTIONS.length}</p>
    <p class="question-text">${q.text}</p>
    <div class="answers">
      ${q.answers.map((a, i) => `
        <button class="answer-btn" data-index="${i}">${a.text}</button>
      `).join('')}
    </div>
  `;

  container.querySelectorAll('.answer-btn').forEach(btn => {
    btn.addEventListener('click', () => selectAnswer(parseInt(btn.dataset.index)));
  });
}

function selectAnswer(index) {
  const q = QUESTIONS[currentQuestion];
  selectedAnswers.push(q.answers[index]);

  // Mark selected
  document.querySelectorAll('.answer-btn').forEach((btn, i) => {
    btn.classList.toggle('selected', i === index);
    btn.disabled = true;
  });

  // Advance after brief delay
  setTimeout(() => {
    currentQuestion++;
    if (currentQuestion >= QUESTIONS.length) {
      showCalculating();
    } else {
      const container = document.getElementById('question-container');
      container.classList.add('fade-out');
      setTimeout(() => {
        renderQuestion();
        container.classList.remove('fade-out');
      }, 300);
    }
  }, 400);
}

function showCalculating() {
  showScreen('calculating');
  setTimeout(() => {
    const result = calculateResult(selectedAnswers);
    renderResult(result);
    showScreen('result');
  }, 2000);
}
```

Update the start button handler: replace the existing event listener with:
```javascript
document.getElementById('btn-start').addEventListener('click', startQuiz);
```

Update the quiz screen HTML:
```html
<div id="screen-quiz" class="screen">
  <div class="progress-bar-container">
    <div class="progress-bar-fill"></div>
  </div>
  <div id="question-container" class="question-container"></div>
</div>
```

**Step 3: Open in browser and verify**

- Click "Begin the Struggle" — quiz screen appears
- First question shown with 4 answer buttons
- Progress bar at top starts at 0%
- Clicking an answer highlights it briefly, then transitions to next question
- Progress bar advances with each question
- After question 12, switches to "calculating" screen

**Step 4: Commit**

```bash
git add index.html
git commit -m "feat: add quiz flow engine with progress bar and transitions"
```

---

### Task 7: Results Page

**Files:**
- Modify: `index.html` (add result rendering and CSS)

**Step 1: Add results CSS**

```css
/* Results screen */
#screen-result {
  padding: 2rem;
  text-align: center;
  max-width: 700px;
  margin: 0 auto;
  width: 100%;
}
.result-character-name {
  font-family: 'Cinzel', serif;
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 900;
  color: #8B0000;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
  text-shadow: 0 0 30px rgba(139,0,0,0.3);
}
.result-label {
  font-size: 0.9rem;
  color: #555;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  margin-bottom: 0.5rem;
}
.result-quote {
  font-style: italic;
  font-size: 1.1rem;
  color: #888;
  margin: 1.5rem 0;
  line-height: 1.6;
  padding: 0 1rem;
  border-left: 2px solid #8B0000;
  text-align: left;
}
.result-description {
  font-size: 1.05rem;
  line-height: 1.7;
  color: #ccc;
  margin: 1.5rem 0;
  text-align: left;
}
.result-match-blurb {
  font-size: 0.95rem;
  color: #999;
  margin: 1rem 0 2rem;
  text-align: left;
}
.result-runner-up {
  margin: 2rem 0;
  padding: 1rem;
  background: #111;
  border: 1px solid #222;
  text-align: left;
}
.result-runner-up .label {
  font-family: 'Cinzel', serif;
  font-size: 0.8rem;
  color: #555;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  margin-bottom: 0.25rem;
}
.result-runner-up .name {
  font-family: 'Cinzel', serif;
  font-size: 1.2rem;
  color: #8B0000;
}
.result-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 2rem;
}
.result-actions button {
  font-family: 'Cinzel', serif;
  font-size: 0.9rem;
  padding: 0.75rem 1.5rem;
  background: transparent;
  color: #8B0000;
  border: 1px solid #8B0000;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  transition: all 0.3s ease;
}
.result-actions button:hover {
  background: #8B0000;
  color: #e8e0d4;
}
```

**Step 2: Add renderResult function**

```javascript
function renderResult(result) {
  const { match, runnerUp, userTraits } = result;
  const container = document.getElementById('result-container');

  container.innerHTML = `
    <p class="result-label">You are</p>
    <h1 class="result-character-name">${match.name}</h1>
    <div class="result-portrait" id="result-portrait"></div>
    <blockquote class="result-quote">"${match.quote}"</blockquote>
    <p class="result-description">${match.description}</p>
    <p class="result-match-blurb">${match.matchBlurb}</p>
    <canvas id="radar-chart" width="350" height="350"></canvas>
    <div class="result-runner-up">
      <p class="label">You were also close to...</p>
      <p class="name">${runnerUp.name}</p>
    </div>
    <div class="result-actions">
      <button id="btn-copy-link">Copy Link</button>
      <button id="btn-download-card">Download Card</button>
      <button id="btn-retake">Try Again</button>
    </div>
  `;

  // Wire up buttons
  document.getElementById('btn-retake').addEventListener('click', () => {
    window.location.hash = '';
    showScreen('landing');
  });

  document.getElementById('btn-copy-link').addEventListener('click', () => {
    const url = window.location.origin + window.location.pathname + '#r=' + match.id;
    navigator.clipboard.writeText(url).then(() => {
      const btn = document.getElementById('btn-copy-link');
      btn.textContent = 'Copied!';
      setTimeout(() => { btn.textContent = 'Copy Link'; }, 2000);
    });
  });

  // Radar chart and download card wired in later tasks
}
```

**Step 3: Open in browser and verify**

Complete the full quiz. After calculating screen:
- "You are [CHARACTER NAME]" in large red Cinzel text
- Quote displayed with red left border
- Description and match blurb shown
- Runner-up section at bottom
- Three action buttons (Copy Link, Download Card, Try Again)
- "Try Again" returns to landing page

**Step 4: Commit**

```bash
git add index.html
git commit -m "feat: add results page with character profile and actions"
```

---

### Task 8: Radar Chart

**Files:**
- Modify: `index.html` (add radar chart drawing function)

**Step 1: Add drawRadarChart function**

```javascript
function drawRadarChart(canvasId, userTraits, characterTraits) {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const cx = w / 2;
  const cy = h / 2;
  const radius = Math.min(cx, cy) - 50;
  const traits = ['ambition', 'bonds', 'darkness', 'resilience', 'intellect', 'wrath'];
  const labels = ['Ambition', 'Bonds', 'Darkness', 'Resilience', 'Intellect', 'Wrath'];
  const numAxes = traits.length;
  const angleStep = (2 * Math.PI) / numAxes;
  const startAngle = -Math.PI / 2; // Start from top

  ctx.clearRect(0, 0, w, h);

  // Draw grid rings
  for (let ring = 2; ring <= 10; ring += 2) {
    ctx.beginPath();
    for (let i = 0; i <= numAxes; i++) {
      const angle = startAngle + i * angleStep;
      const r = (ring / 10) * radius;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Draw axis lines and labels
  for (let i = 0; i < numAxes; i++) {
    const angle = startAngle + i * angleStep;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Labels
    const labelR = radius + 25;
    const lx = cx + labelR * Math.cos(angle);
    const ly = cy + labelR * Math.sin(angle);
    ctx.fillStyle = '#666';
    ctx.font = '11px Georgia';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(labels[i], lx, ly);
  }

  // Helper to draw a trait polygon
  function drawPolygon(traitValues, fillColor, strokeColor) {
    ctx.beginPath();
    for (let i = 0; i <= numAxes; i++) {
      const idx = i % numAxes;
      const angle = startAngle + idx * angleStep;
      const val = traitValues[traits[idx]] / 10;
      const r = val * radius;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.fillStyle = fillColor;
    ctx.fill();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Character polygon (background)
  drawPolygon(characterTraits, 'rgba(139,0,0,0.15)', 'rgba(139,0,0,0.4)');

  // User polygon (foreground)
  drawPolygon(userTraits, 'rgba(232,224,212,0.1)', 'rgba(232,224,212,0.7)');
}
```

**Step 2: Call drawRadarChart from renderResult**

Add at the end of `renderResult()`:

```javascript
drawRadarChart('radar-chart', userTraits, match.traits);
```

**Step 3: Open in browser and verify**

Complete quiz. On results page:
- Hexagonal radar chart visible below the quote
- Two overlaid polygons: red = character, off-white = your scores
- 6 labeled axes around the perimeter
- Grid rings visible in background

**Step 4: Commit**

```bash
git add index.html
git commit -m "feat: add Canvas radar chart with user vs character overlay"
```

---

### Task 9: Calculating Animation

**Files:**
- Modify: `index.html` (style calculating screen)

**Step 1: Add calculating screen CSS and HTML**

```css
/* Calculating screen */
#screen-calculating {
  justify-content: center;
  text-align: center;
  background:
    radial-gradient(ellipse at center, rgba(139,0,0,0.1) 0%, transparent 70%),
    #0a0a0a;
}
.calculating-text {
  font-family: 'Cinzel', serif;
  font-size: clamp(1.2rem, 3vw, 1.8rem);
  color: #555;
  animation: pulse 1.5s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; color: #8B0000; }
}
```

Update calculating screen HTML:
```html
<div id="screen-calculating" class="screen">
  <p class="calculating-text">The Eclipse reveals your fate...</p>
</div>
```

**Step 2: Open in browser and verify**

- Calculating screen has pulsing text
- Text fades between gray and dark red
- Transitions to results after ~2 seconds

**Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add calculating screen with pulse animation"
```

---

### Task 10: Character SVG Portraits

**Files:**
- Modify: `index.html` (add SVG data and rendering)

**Step 1: Create stylized SVG portraits for all 21 characters**

Add a `CHARACTER_SVGS` object mapping character IDs to inline SVG strings. Each SVG should be a high-contrast, manga-inspired bust portrait (~200x250 viewBox). The SVGs use only black, white, dark red, and gray — matching the dark manga aesthetic.

```javascript
const CHARACTER_SVGS = {
  // Each entry is a complete <svg> string for the character
  // Style: high-contrast linework, manga-inspired, dark palette
  // Key distinguishing features per character:
  // guts: missing eye, brand scar, massive sword silhouette, spiky hair
  // griffith: flowing hair, hawk helmet outline, ethereal/angelic features
  // casca: short hair, armor, strong jaw, determined expression
  // skull-knight: skull helmet, ornate armor silhouette
  // schierke: witch hat, young face, large eyes
  // zodd: horns, massive build, bestial features
  // serpico: slim face, windswept hair, closed eyes / gentle smile
  // farnese: long hair, noble bearing, flame motif
  // rickert: youthful, determined brow, workshop tools
  // puck: tiny, wings, elf ears, cheerful
  // isidro: wild hair, bandana, mischievous grin
  // judeau: throwing knives silhouette, kind eyes, headband
  // corkus: scowl, unkempt hair, scarred
  // void: exposed brain, sealed eyes, fingers gesture
  // slan: flowing hair, dark wings silhouette
  // locus: crescent moon visor, knight armor, lance
  // grunbeld: dragon shield, heavy armor, crystal motif
  // irvine: long hair, bow, wolf-like ears
  // ganishka: massive crown, fog/smoke motif, fierce expression
  // egg: round form, cracks, single eye
  // sonia: blindfold or closed eyes, serene, light motif
};
```

For each character, create a minimal but recognizable SVG portrait. These should be ~1-3KB each as inline SVG strings. Use simple shapes, bold strokes, and silhouette techniques.

Add portrait rendering in `renderResult()`:
```javascript
// In renderResult, after setting innerHTML:
const portraitEl = document.getElementById('result-portrait');
if (CHARACTER_SVGS[match.id]) {
  portraitEl.innerHTML = CHARACTER_SVGS[match.id];
}
```

Add portrait CSS:
```css
.result-portrait {
  margin: 1.5rem 0;
}
.result-portrait svg {
  width: 180px;
  height: 225px;
  filter: drop-shadow(0 0 20px rgba(139,0,0,0.3));
}
```

**Step 2: Open in browser and verify**

Complete quiz. On results page:
- SVG portrait appears between character name and quote
- Dark, high-contrast style consistent with manga aesthetic
- Portrait has a subtle red drop-shadow glow

**Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add stylized SVG character portraits for all 21 characters"
```

---

### Task 11: URL Hash Routing

**Files:**
- Modify: `index.html` (add hash routing logic)

**Step 1: Add hashRouting function**

```javascript
function checkHashRoute() {
  const hash = window.location.hash;
  const match = hash.match(/^#r=(.+)$/);
  if (match) {
    const characterId = match[1];
    const character = CHARACTERS.find(c => c.id === characterId);
    if (character) {
      // Show result directly with character's own traits as "user" traits
      const runnerUpIndex = CHARACTERS.indexOf(character) === 0 ? 1 : 0;
      renderResult({
        match: character,
        runnerUp: CHARACTERS[runnerUpIndex],
        userTraits: character.traits
      });
      showScreen('result');
      return true;
    }
  }
  return false;
}

// Run on page load
window.addEventListener('DOMContentLoaded', () => {
  if (!checkHashRoute()) {
    showScreen('landing');
  }
});

// Update hash when showing result
// In renderResult, add after the function sets up the page:
window.location.hash = 'r=' + match.id;
```

**Step 2: Open in browser and verify**

- Navigate to `index.html#r=guts` — should show Guts result directly, skipping quiz
- Navigate to `index.html#r=griffith` — should show Griffith result
- Navigate to `index.html` with no hash — should show landing page
- Complete quiz normally — URL hash should update to `#r=[character]`
- Copy Link button should produce a working URL

**Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add URL hash routing for direct result linking"
```

---

### Task 12: Downloadable Share Card

**Files:**
- Modify: `index.html` (add card generation)

**Step 1: Add generateShareCard function**

```javascript
function generateShareCard(result) {
  const { match, userTraits } = result;
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, 1200, 630);

  // Subtle vignette
  const gradient = ctx.createRadialGradient(600, 315, 100, 600, 315, 600);
  gradient.addColorStop(0, 'rgba(139,0,0,0.1)');
  gradient.addColorStop(1, 'transparent');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1200, 630);

  // "You are" label
  ctx.fillStyle = '#555';
  ctx.font = '18px Georgia';
  ctx.textAlign = 'center';
  ctx.fillText('YOU ARE', 600, 120);

  // Character name
  ctx.fillStyle = '#8B0000';
  ctx.font = 'bold 64px Cinzel, serif';
  ctx.fillText(match.name.toUpperCase(), 600, 190);

  // Quote
  ctx.fillStyle = '#888';
  ctx.font = 'italic 20px Georgia';
  const quoteText = `"${match.quote}"`;
  wrapText(ctx, quoteText, 600, 250, 900, 28);

  // Mini radar chart on the card
  drawRadarChartOnCanvas(ctx, 600, 430, 120, userTraits, match.traits);

  // Branding
  ctx.fillStyle = '#333';
  ctx.font = '14px Georgia';
  ctx.fillText('Which Berserk Character Are You?', 600, 610);

  return canvas;
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let currentY = y;
  for (const word of words) {
    const testLine = line + word + ' ';
    if (ctx.measureText(testLine).width > maxWidth && line !== '') {
      ctx.fillText(line.trim(), x, currentY);
      line = word + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, currentY);
}

function drawRadarChartOnCanvas(ctx, cx, cy, radius, userTraits, charTraits) {
  // Same logic as drawRadarChart but draws on provided ctx at given position
  const traits = ['ambition', 'bonds', 'darkness', 'resilience', 'intellect', 'wrath'];
  const numAxes = traits.length;
  const angleStep = (2 * Math.PI) / numAxes;
  const startAngle = -Math.PI / 2;

  // Grid
  for (let ring = 2; ring <= 10; ring += 2) {
    ctx.beginPath();
    for (let i = 0; i <= numAxes; i++) {
      const angle = startAngle + i * angleStep;
      const r = (ring / 10) * radius;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Axis lines
  for (let i = 0; i < numAxes; i++) {
    const angle = startAngle + i * angleStep;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + radius * Math.cos(angle), cy + radius * Math.sin(angle));
    ctx.strokeStyle = '#333';
    ctx.stroke();
  }

  function drawPoly(traitValues, fill, stroke) {
    ctx.beginPath();
    for (let i = 0; i <= numAxes; i++) {
      const idx = i % numAxes;
      const angle = startAngle + idx * angleStep;
      const val = traitValues[traits[idx]] / 10;
      const x = cx + val * radius * Math.cos(angle);
      const y = cy + val * radius * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  drawPoly(charTraits, 'rgba(139,0,0,0.15)', 'rgba(139,0,0,0.4)');
  drawPoly(userTraits, 'rgba(232,224,212,0.1)', 'rgba(232,224,212,0.7)');
}
```

**Step 2: Wire up the download button in renderResult**

```javascript
document.getElementById('btn-download-card').addEventListener('click', () => {
  const card = generateShareCard(result);
  const link = document.createElement('a');
  link.download = `berserk-quiz-${match.id}.png`;
  link.href = card.toDataURL('image/png');
  link.click();
});
```

Note: `result` must be accessible in the event handler. Store it in a variable accessible from the closure, e.g., define `let currentResult;` at module scope and set it in `renderResult`.

**Step 3: Open in browser and verify**

- Complete quiz
- Click "Download Card" — a PNG file downloads
- Open the PNG: dark background, character name in red, quote, mini radar chart, branding at bottom
- Image is ~1200x630 (social media friendly)

**Step 4: Commit**

```bash
git add index.html
git commit -m "feat: add downloadable share card with Canvas-to-PNG"
```

---

### Task 13: Responsive Design + Polish

**Files:**
- Modify: `index.html` (CSS tweaks)

**Step 1: Add responsive CSS and final polish**

```css
/* Responsive */
@media (max-width: 600px) {
  #screen-quiz, #screen-result {
    padding: 1.25rem;
  }
  .answer-btn {
    padding: 0.85rem 1rem;
    font-size: 0.95rem;
  }
  .result-portrait svg {
    width: 140px;
    height: 175px;
  }
  #radar-chart {
    width: 280px;
    height: 280px;
  }
}

/* Smooth scrolling */
html { scroll-behavior: smooth; }

/* Selection color */
::selection {
  background: rgba(139,0,0,0.4);
  color: #e8e0d4;
}

/* Focus styles for accessibility */
button:focus-visible {
  outline: 2px solid #8B0000;
  outline-offset: 2px;
}

/* Meta theme */
```

Also add meta tags to `<head>`:
```html
<meta name="theme-color" content="#0a0a0a">
<meta name="description" content="A personality quiz to discover which Berserk character you are. 21 characters, trait-based matching.">
<meta property="og:title" content="Which Berserk Character Are You?">
<meta property="og:description" content="Discover your Berserk alter ego through a personality quiz.">
```

**Step 2: Open in browser and verify**

- Test at desktop width — everything centered and readable
- Test at mobile width (~375px) — buttons, text, chart all scale properly
- Tab through buttons — red focus outline visible
- Text selection uses red highlight

**Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add responsive design, accessibility, and meta tags"
```

---

### Task 14: End-to-End Verification

**Files:**
- No changes — verification only

**Step 1: Full quiz playthrough**

1. Open `index.html` in browser
2. Landing page: title, subtitle, "Begin the Struggle" button
3. Click start — quiz begins, question 1/12 shown
4. Answer all 12 questions — progress bar advances
5. Calculating screen — pulsing text for ~2 seconds
6. Results page: character name, SVG portrait, quote, description, match blurb, radar chart, runner-up, action buttons
7. Click "Copy Link" — URL copied, paste into new tab — result page loads directly
8. Click "Download Card" — PNG downloads with character name, quote, radar chart
9. Click "Try Again" — returns to landing page

**Step 2: Hash routing verification**

- Navigate to `index.html#r=void` — Void result shows directly
- Navigate to `index.html#r=egg` — Egg of the Perfect World result shows
- Navigate to `index.html#r=nonexistent` — should fall through to landing page

**Step 3: Scoring sanity check**

Run through quiz picking answers that are clearly "Guts-like" (fury, resilience, loyalty). Verify result is Guts or a close match. Repeat with "Griffith-like" answers (ambition, intellect, sacrifice for dreams).

**Step 4: Final commit (if any fixes were needed)**

```bash
git add index.html
git commit -m "fix: end-to-end verification fixes"
```
