<script setup lang="ts">
// BOOKFOX CHARACTER LEVERS — diagnostic only.
// The 9 character-building techniques from John Matthew Fox (YouTube ItHJinQEZHQ),
// reframed as LEVERS for *Chasing the Sun*: each technique shows what the book
// already nails (protect) and concrete, in-voice suggestions for where to apply it.
// Ordered by how much leverage the technique offers HERE. Inline data, no API.
// Reflects the author's design: William slides hero -> antagonist (a #7 perception-gap
// move, the Walter White case); Lottie rises to hero; the antagonist FORCE is the
// many deaths (not a foil). Reusable craft: craft/character/techniques.md.
// Book-specific write-up (BOOKFOX-CHARACTER-GRADES.md) archived in git history.
useHead({ title: 'Bookfox Character Levers — Chasing the Sun' })

interface Lever { who: string; move: string; cost: string; protect?: boolean }
interface Technique {
  n: number; name: string; def: string; grade: string; opp: string
  nails: string; levers: Lever[]
}

// Ordered HIGH leverage -> LOW. #7 and #9 are the engine; #8 is the foil PAIR.
const techniques: Technique[] = [
  {
    n: 7, name: 'Widen the perception gap', opp: 'Highest', grade: 'A−',
    def: 'Distance between how a character sees themselves and how others / the reader see them. Bookfox’s case study is Walter White: “I did it for my family” — a protagonist slowly revealed as the antagonist of his own story.',
    nails: 'This is the engine of your whole design. William sees himself as provider and protector (“the only plan I have left to protect the living,” l.2232) while the reader watches the abandoner — the man who IS the curse he claims to flee. That hero→antagonist slide is exactly the Walter White move, done well.',
    levers: [
      { who: 'William', cost: 'protect', move: 'The slide only works if the text never rescues him — Walter White lands because the show makes YOU do the judging. Keep the curse’s logic unpunctured: don’t let the narration prove him right. Right now the survivorship “proof” at the end leans toward endorsing him, which pulls him back toward hero and flattens the gap.' },
      { who: 'Hollis', cost: 'beat', move: 'The frame is where the gap can collapse. If Hollis forgives too easily, the slide stops. Give him one beat of NOT absolving — a pen that pauses, a question left hanging — so William’s self-justification hangs in the air unanswered.' },
      { who: 'Lottie', cost: 'protect', move: 'She is the one who sees him “without the scaffolding” (l.2482) — the character whose view tips the reader from hero to truth. Protect that; it’s how the gap gets witnessed from inside the marriage.' },
    ],
  },
  {
    n: 9, name: '3-time character', opp: 'Highest', grade: 'B+',
    def: 'Haunted by the past · wrestling in the present (two layers of problem) · wary of the future. Bookfox calls this the most important technique of the nine.',
    nails: 'William is textbook — Dublin haunts him, Oregon wrestles him, every future grave makes him wary. The book’s spine, and it grades A.',
    levers: [
      { who: 'Lottie', cost: 'beat', move: 'Her frail→matriarch arc is real but the MIDDLE is a time-skip — shown at both ends, never dramatized between, and framed as RECOVERED Kansas competence rather than something she BECOMES. Keep one needy thread alive in the marriage years (“I depended on him for a great deal,” l.1609, is dropped after courtship) so she has something to grow OUT of, answered by the leaving where she becomes the depended-upon.' },
      { who: 'Mary Margaret', cost: 'beat', move: 'She gets a present and a foreclosed future (dies at 24) but no want of her own — she’s the dead mother’s understudy. Plant one private want early and pay it before she dies, so the reader loses a person, not a helper.' },
      { who: 'Doyle', cost: 'beat', move: 'A perfect function, a thin person. One line of his own past in the silent years (l.123) — that he too once stood outside a door he wasn’t wanted at. Turns the carved tool into a man.' },
      { who: 'Rose', cost: '½ scene', move: 'Her future just collapses into Letitia’s convent. Reweight the existing vocation scene (l.2059) so the gift (paint, the world) and the vows actually fight.' },
    ],
  },
  {
    n: 8, name: 'Create foils', opp: 'High', grade: 'B+',
    def: 'A foil is a PERSON who contrasts the protagonist: antagonist = inverted protagonist; sidekick = complement; mentor = older self. (Distinct from the antagonist FORCE — which can be non-human.)',
    nails: 'Doyle is the mentor-foil at A level (the older William you become — “I was Doyle now,” l.1315). And your real engine is the William↔Lottie foil PAIR that SWAPS: as he descends into the antagonist, she rises into the hero — run vs. stay, abandon vs. carry the name. That’s foils done at an advanced level.',
    levers: [
      { who: 'Deaths = antagonist, not foil', cost: 'reframe', move: 'The many deaths are your ANTAGONIST — the opposing force — and a non-human antagonist is completely legitimate and powerful (the sea, the illness, grief, time). A foil is a person, and you already have strong ones (Doyle, Lottie). So you’re not missing foils — keep the vocabulary straight and DON’T bolt on a redundant human villain.', protect: true },
      { who: 'William', cost: 'protect', move: 'He already loses to a human (Summit Avenue: “You are scum… GET OUT!” l.1179, then “They slept outside that night,” l.1180). You don’t need to add a belittler — that beat exists, and the deeper antagonist is William becoming his own. Leave it.', protect: true },
      { who: 'Lottie', cost: 'beat', move: 'Make the SWAP legible: give the hero of the back half her hero’s beat. “No Boog will start from nothing ever again” (l.2645) is HER victory as much as his — let it land as triumph, not get disposed of in a will clause.' },
      { who: 'Hollis', cost: 'beat', move: 'He’s the un-haunted complement-foil. His ordinary fatherhood (the nine-year-old daughter, l.1011) is the ruler against which William’s seven graves are read — strengthen it with the desk photo (see #2).' },
    ],
  },
  {
    n: 2, name: 'Carry something', opp: 'High', grade: 'A',
    def: 'Possessions — physical or metaphorical — reveal character faster than description (Chigurh’s coin; “his grandmother’s distrust of the white man”).',
    nails: 'Your superpower. Folded paper of names, Alex’s worn compass, Teresa’s feathers, Mary Margaret’s travelling brooch, Lottie’s pencil ledger, Doyle’s fused apron. The cheapest lift for any thin character routes through this.',
    levers: [
      { who: 'Alex (the compass)', cost: 'protect', move: 'Alex was a baby (~2) when William left, so he can’t carry it early — but the compass IS the cliffhanger’s answer-object: bought before he was born (l.2248), carried twenty years, set on the desk ALIVE (l.2690). That planted payoff is doing exactly what it should. Protect it.', protect: true },
      { who: 'Hollis', cost: 'beat', move: 'The framed photo is already on his desk in the opening (l.11). Define it as his daughter (l.1011) and let his eye return to it twice — at the “Six” exchange and as the paper crosses the desk. His living-child photo answers William’s dead-children paper. Keep it to two glances, not three.' },
      { who: 'Lottie (the ring)', cost: 'beat', move: 'Her real arc-object — NOT the pencil journal. She TURNS the widow’s ring when frail at the social (l.1600, l.1605, l.1613); by the leaving and reunion it has gone STILL (“her fingers straight, the ring caught the light,” l.2508). The frail→matriarch arc is 80% written in this one object — sharpen both ends and add one midpoint beat where she goes to turn it under pressure and sets her hand flat instead. (The brooch she inherits from Mary does the matriarch half at her collar.)' },
      { who: 'Mary Margaret', cost: 'beat', move: 'She carries the brooch, but it’s her mother’s, not hers. Give her one small object of her own before it becomes a relay item, so she owns something the family didn’t hand her.' },
      { who: 'Charlotte (young)', cost: 'beat', move: 'Lean into the inherited ledger as HER object one beat earlier — a child mimicking the column the way young Letitia mimicked the broom (l.719).' },
    ],
  },
  {
    n: 4, name: 'Three things on intro', opp: 'Medium-High', grade: 'B+',
    def: 'Every new character should SAY something, DO something, and show their PROBLEM — fast, ideally in the first scene.',
    nails: 'Mary’s first scene nails all three (the wrung sheet, the dry wit, the tenement trap). Doyle and the William prologue too.',
    levers: [
      { who: 'Hollis', cost: 'beat', move: 'His intro gives say + do but no PROBLEM, so he has nothing to carry and no arc. The daughter is his planted problem — surface it in the first interlude.' },
      { who: 'Mary Margaret', cost: 'beat', move: 'Defined only relationally for ~1,300 lines (“tagged along,” “her mother’s daughter”). Move one early say/do/want forward so she enters as a person, not a fixture.' },
      { who: 'Rose', cost: 'beat', move: 'She’s born on the page rather than introduced as an actor; her first real doing comes late (the prayer standoff, l.1730). Surface one small Rose action earlier.' },
      { who: 'Alex', cost: 'note', move: 'NOT a fit — he’s an infant when William leaves, so “say/do” can’t apply. You introduce a baby the reader will fear for through the parents’ dread and one physical detail. You already have it: “healthy is a word with an expiration” (l.2055) and the fist “too small to close” (l.2180). See the cliffhanger note above.', protect: true },
    ],
  },
  {
    n: 5, name: 'Make them likable', opp: 'Medium', grade: 'A−',
    def: 'Relatable flaws PLUS any of: morality/values, save-the-cat, suffering, competence. Likable is not flawless — a flawless character reads false.',
    nails: 'William saves the boy in the rain and is competent everywhere; Lottie’s pride that can’t ask for help is a real, relatable flaw.',
    levers: [
      { who: 'Mary', cost: 'beat–½ scene', move: 'SUBTRACTION. She tips into saint in the good years. Her temper is real (“as though the sheet had personally wronged her,” l.150) but the manuscript keeps retracting it (“but she was smiling,” l.352, l.411). Cut those reconciling tags and the saint becomes a wife again — a flawless dead wife is harder to grieve than a real one.' },
      { who: 'Hollis', cost: 'beat', move: 'He’s likable only via tact — no flaw, no stake. Give him one edge: a competence shown with bite, or a small professional failing he covers.' },
    ],
  },
  {
    n: 6, name: 'Odd habit + the WHY', opp: 'Medium', grade: 'B+',
    def: 'A strange tic AND the deeper reason for it (the boy tying string to everything = fear of abandonment).',
    nails: 'Austin: “No one had taught him this. He had watched his father, and become him” (l.861) — the best execution in the book. Mary’s drawer-inventory nails habit + WHY. And Lottie’s widow’s-ring turning is the gold standard: a habit that CHANGES across the arc (turns when frail → goes still as matriarch).',
    levers: [
      { who: 'William', cost: 'beat', move: 'The counting habit is everywhere but its WHY never roots — it reads “good businessman” more than wound. Cut one redundant commercial count and let an existing line root it: a man who was never counted (a no-named bastard) tallies every living body so none can slip the books.' },
      { who: 'Doyle', cost: 'beat', move: 'The “smallest nod” (l.122) is vivid but has no root. One line of where the hardness came from turns the tic into a man.' },
      { who: 'Mary Margaret', cost: 'beat', move: 'Her compulsive usefulness has a WHY, but it’s assigned by narration. Let her reveal it once herself, in her own plain words.' },
    ],
  },
  {
    n: 3, name: 'Contradictory characters', opp: 'Medium-Low', grade: 'A−',
    def: 'One surprising element against the stereotype (the ex-con who is a philosopher and peacemaker). Creates mystery, avoids cliche.',
    nails: 'William the brute who counts and keeps a secret bird journal; Lottie the grieving, depleted widow who reads a freshly painted house better than the painter who made it (l.1632–1636).',
    levers: [
      { who: 'Mary Margaret', cost: 'beat', move: 'The dutiful daughter who, once, wants something improper or selfish — one surprise against the all-service type.' },
      { who: 'Doyle', cost: 'beat', move: 'He shows “a softening around the eyes that he immediately corrected” (l.102). Let one slip through uncorrected.' },
      { who: 'Hollis', cost: 'beat', move: 'The lawyer of “titles and deeds” who quietly breaks one of his own professional rules for this client.' },
    ],
  },
  {
    n: 1, name: 'Laugh in the face of cannibals', opp: 'Use sparingly', grade: 'A−',
    def: 'A counterintuitive reaction to an event that reveals character. Bookfox warns: use it SPARINGLY, and keep it believable.',
    nails: 'The bee-swarm laugh (“I heard them bees can do the backstroke!” l.1752). Lottie signing a foreclosure on her own blood “with a steady hand,” then drinking the cold tea. Already excellent — do not over-add.',
    levers: [
      { who: 'Mary Margaret', cost: 'beat', move: 'Her deathbed is all duty (“Tell me about Ma”). One counterintuitive beat would make her death hers, not a mirror of her mother’s.' },
      { who: 'Lottie', cost: '—', move: 'Protect what’s here — the steady-handed foreclosure is this technique done right. Don’t dilute it by spreading the move thin.', protect: true },
    ],
  },
]

const oppColor = (o: string) => {
  if (o === 'Highest') return 'bg-red-500/15 text-red-300 border-red-500/30'
  if (o === 'High') return 'bg-orange-500/15 text-orange-300 border-orange-500/30'
  if (o.startsWith('Medium')) return 'bg-gold-500/15 text-gold-300 border-gold-500/30'
  return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
}
const gradeColor = (g: string) => {
  if (g.startsWith('A')) return 'text-emerald-300'
  if (g.startsWith('B')) return 'text-gold-300'
  if (g.startsWith('C')) return 'text-orange-300'
  return 'text-red-300'
}
const totalLevers = techniques.reduce((s, t) => s + t.levers.filter(l => !l.protect).length, 0)

// reference grid (collapsed by default)
const showGrid = ref(false)
const GRID_TECH = ['Cannibal laugh', 'Carry', 'Contradiction', 'Fast intro', 'Likable', 'Habit+WHY', 'Perception gap', 'Foils', '3-time']
const principals = [
  { name: 'William', grade: 'A−', g: ['A−', 'A+', 'A−', 'A', 'A', 'B+', 'A', 'B+', 'A'] },
  { name: 'Mary', grade: 'A−', g: ['A−', 'A', 'B+', 'A', 'A', 'A−', 'B', 'A', 'A−'] },
  { name: 'Lottie', grade: 'A−', g: ['B', 'A', 'B+', 'A−', 'A−', 'A', 'A', 'A', 'B+'] },
  { name: 'Hollis', grade: 'C−', g: ['N/A', 'D', 'D+', 'C+', 'B−', 'C', 'D', 'B', 'D'] },
]
const cellColor = (g: string) => {
  if (g.startsWith('A')) return 'text-emerald-300'
  if (g.startsWith('B')) return 'text-gold-300'
  if (g.startsWith('C')) return 'text-orange-300'
  if (g.startsWith('D')) return 'text-red-300'
  return 'text-neutral-600'
}
</script>

<template>
  <div class="min-h-dvh px-4 py-16 sm:py-20">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-8 space-y-3">
        <p class="text-xs uppercase tracking-[0.2em] text-gold-500/50">Bookfox &middot; 9 techniques as levers &middot; diagnostic</p>
        <h1 class="text-3xl sm:text-4xl font-bold text-gold-400 tracking-tight">The 9 Techniques, as Levers</h1>
        <p class="text-neutral-500 text-lg italic">Where each Bookfox technique can move <em>Chasing the Sun</em> &mdash; ranked by leverage</p>
      </div>

      <!-- The design (and a correction) -->
      <div class="mb-6 rounded-2xl border border-sky-500/20 bg-sky-500/5 p-5 sm:p-6 space-y-2 text-sm leading-relaxed text-neutral-300">
        <h2 class="text-base font-bold text-sky-300">Your design is more advanced than a first read shows &mdash; and one correction</h2>
        <p><span class="text-sky-200 font-semibold">William slides from hero to antagonist; Lottie rises to hero.</span> That’s not a gap, it’s the point &mdash; and it lives in <span class="font-semibold">technique&nbsp;7</span> (the perception gap, Bookfox’s Walter White case), with a <span class="font-semibold">technique&nbsp;8</span> foil PAIR that swaps. The right work is to PROTECT the slide, not add a villain.</p>
        <p><span class="text-sky-200 font-semibold">The many deaths are your ANTAGONIST (a force), not a “foil.”</span> A non-human antagonist is legitimate and strong; a foil is a person, and you already have good ones (Doyle, Lottie). Vocabulary only &mdash; the story is right.</p>
        <p class="text-neutral-400"><span class="text-red-300/90 font-semibold">Correction:</span> an earlier pass claimed “William never loses to a human.” Wrong &mdash; the Summit Avenue scene (l.1179&ndash;1180) berates him and leaves the family sleeping outside. That “add a belittling antagonist” lever has been pulled.</p>
      </div>

      <!-- The Alex cliffhanger -->
      <div class="mb-6 rounded-2xl border border-orange-500/20 bg-orange-500/5 p-5 sm:p-6 space-y-2 text-sm leading-relaxed text-neutral-300">
        <h2 class="text-base font-bold text-orange-300">The Alex cliffhanger &mdash; my honest read</h2>
        <p>Alex was a baby (~2) when William left, so “will the last Boog son survive the curse?” as a pull through the slower Oregon years is a <span class="text-orange-200 font-semibold">sound pacing instinct</span> &mdash; and you pose it the literary way, through William’s dread (“I have already buried him in my mind a hundred times,” l.2223), not a narrator tease.</p>
        <p>The one caveat: a cliffhanger runs on the reader caring about the person, and a baby offstage risks being a name we fear for, not a child. You don’t need to age him up or give him lines. Make the baby a felt weight through the parents’ dread and one physical detail &mdash; you already have the perfect one: the fist “so small it couldn’t close all the way” (l.2180), and “healthy is a word with an expiration” (l.2055). Dramatize the night-watch once (“you peek into Alex’s room,” l.2199) and the cliffhanger gets a body. <span class="text-orange-200 font-semibold">Verdict: keep it, don’t age him up, let the compass pay it off.</span></p>
      </div>

      <!-- Lottie's arc -->
      <div class="mb-6 rounded-2xl border border-rose-400/20 bg-rose-400/5 p-5 sm:p-6 space-y-2 text-sm leading-relaxed text-neutral-300">
        <h2 class="text-base font-bold text-rose-300">Lottie’s arc &mdash; you already wrote it, in her hands</h2>
        <p>The intended arc is grieving, depleted, needy widow &rarr; take-charge matriarch. You execute it &mdash; not in plot, but in the BODY, which is the better way. <span class="text-rose-200 font-semibold">The widow’s ring carries it:</span> at the social she TURNS it when nervous (“a widow’s habit. She turned it absently,” l.1600; l.1605; l.1613); by the leaving and the reunion it has gone STILL (“Her fingers were straight. The ring on her right hand caught the last of the light,” l.2508). The frail tell disappears. That IS the arc.</p>
        <p>The <span class="text-rose-200 font-semibold">brooch</span> does the matriarch half: she nervously CHECKS her collar at the social (“Checking that she was still buttoned… She was not entirely any of those things,” l.1616), then wears Mary’s inherited brooch SECURE at that same collar through the back half (l.2270, l.2483, l.2547). Nervous collar &rarr; secured heirloom.</p>
        <p class="text-neutral-400">So the disconnect isn’t that you skipped it &mdash; it’s that you did it unconsciously. Name it precisely: not <em>frail&rarr;capable</em> (she’s capable from the start &mdash; she reads a painted house better than William, l.1632), but <em>leaning-on-a-man &rarr; the one the family leans on</em>. “I depended on him for a great deal” (l.1609) &rarr; “I have always managed what you leave behind” (l.2256) is the whole arc. The only real gap: the MIDDLE is a time-skip, so the becoming is shown at both ends and never dramatized between. Two beats fix it &mdash; see #2 and #9 below. (The erasable pencil journal an earlier pass kept citing is a one-line grace note, not her defining trait; ignore it.)</p>
      </div>

      <!-- Intro -->
      <div class="mb-10 rounded-2xl border border-gold-500/15 bg-gold-500/5 p-5 sm:p-6 space-y-2 text-sm leading-relaxed text-neutral-300">
        <p><span class="text-gold-300 font-semibold">{{ totalLevers }} concrete levers below</span>, grouped by Bookfox technique and ordered by how much each can do for this book. Most are a single beat; most are subtraction or a detail you’ve already planted. Each card shows what the book <em>already nails</em> (protect it) and where to apply the technique.</p>
        <p class="text-neutral-400">Top of the stack: protect the hero→antagonist slide (#7), and give the thin characters a <em>past wound of their own</em> (#9). Diagnostic only; nothing here touches Drive.</p>
      </div>

      <!-- Technique lever cards -->
      <div class="space-y-5">
        <section
          v-for="t in techniques"
          :key="t.n"
          class="rounded-2xl border border-neutral-800 bg-surface-100 overflow-hidden"
        >
          <div class="p-5 sm:p-6 border-b border-neutral-800/60">
            <div class="flex items-start gap-4">
              <span class="shrink-0 w-10 h-10 rounded-xl bg-neutral-800 text-gold-300 font-bold flex items-center justify-center tabular-nums text-lg">{{ t.n }}</span>
              <div class="flex-1 min-w-0">
                <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <h2 class="text-xl font-bold text-gold-300">{{ t.name }}</h2>
                  <span :class="['text-[11px] uppercase tracking-wide px-2 py-0.5 rounded-full border', oppColor(t.opp)]">{{ t.opp }} leverage</span>
                  <span class="text-[11px] text-neutral-500">book grade <span :class="['font-bold', gradeColor(t.grade)]">{{ t.grade }}</span></span>
                </div>
                <p class="text-sm text-neutral-400 leading-relaxed mt-1.5">{{ t.def }}</p>
              </div>
            </div>
            <p class="text-xs text-emerald-300/80 leading-relaxed mt-3 pl-14">
              <span class="uppercase tracking-wide text-emerald-400/60">Already nails it &mdash;</span> {{ t.nails }}
            </p>
          </div>

          <ul class="divide-y divide-neutral-800/60">
            <li v-for="(l, i) in t.levers" :key="i" class="p-4 sm:px-6 flex gap-3" :class="l.protect ? 'bg-emerald-500/[0.04]' : ''">
              <span
                class="shrink-0 text-[11px] font-semibold px-2.5 py-0.5 rounded-full h-fit mt-0.5"
                :class="l.protect ? 'bg-emerald-500/15 text-emerald-300' : 'bg-gold-500/15 text-gold-300'"
              >{{ l.who }}</span>
              <p class="text-sm text-neutral-300 leading-relaxed flex-1">
                {{ l.move }}
                <span class="ml-1 inline-block text-[11px] text-neutral-500 align-baseline">[{{ l.cost }}]</span>
              </p>
            </li>
          </ul>
        </section>
      </div>

      <!-- Reference grid -->
      <div class="mt-12">
        <button
          class="text-xs font-medium px-3 py-1.5 rounded-full transition-colors cursor-pointer"
          :class="showGrid ? 'bg-gold-500/20 text-gold-400 hover:bg-gold-500/30' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'"
          @click="showGrid = !showGrid"
        >{{ showGrid ? 'Hide' : 'Show' }} the principals’ grade grid</button>

        <div v-if="showGrid" class="overflow-x-auto rounded-2xl border border-neutral-800 bg-surface-100 mt-3">
          <table class="w-full text-sm border-collapse">
            <thead>
              <tr class="border-b border-neutral-800">
                <th class="text-left font-semibold text-neutral-400 p-3">Technique</th>
                <th v-for="p in principals" :key="p.name" class="p-3 text-center">
                  <div class="font-bold text-gold-300">{{ p.name }}</div>
                  <div :class="['text-lg font-bold', gradeColor(p.grade)]">{{ p.grade }}</div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(tech, i) in GRID_TECH" :key="i" class="border-b border-neutral-800/60 last:border-0">
                <td class="p-3 text-neutral-300"><span class="text-neutral-600 tabular-nums">{{ i + 1 }}.</span> {{ tech }}</td>
                <td v-for="p in principals" :key="p.name" class="p-3 text-center font-bold tabular-nums" :class="cellColor(p.g[i])">{{ p.g[i] }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Footer -->
      <div class="text-center mt-12 space-y-2">
        <p class="text-xs text-neutral-600">Diagnostic only. Line numbers reference the current manuscript cache &mdash; re-verify against Drive before any edit. Reusable craft: <span class="text-neutral-500">craft/character/techniques.md</span> (full write-up archived in git history).</p>
        <NuxtLink to="/" class="inline-block text-sm text-gold-500/60 hover:text-gold-400 transition-colors">&larr; Back home</NuxtLink>
      </div>
    </div>
  </div>
</template>
