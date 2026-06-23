<script setup lang="ts">
// Craft review. One CARD per target span in the manuscript (findings whose edits overlap
// the same text are merged — DRY — so there is ONE decision). When lenses propose the
// SAME edit it shows as a single tracked-changes redline. When they propose DIFFERENT
// edits to the same span, the card lists them as OPTIONS and you pick one before queueing.
// The op (cut/replace/add) is derived from the word-diff. Structural cards show an action
// (and an illustration when one was given). Diagnostic only — a queued card flows to its
// route pass; nothing here writes Drive.
import { Button } from '~/components/ui/button'

interface Reason { lensId: string; lens: string; principle: string; why: string; source?: string; severity: string; route: string }
interface Option { edited: string; lensIds: string[]; reasons: Reason[] }
interface Card {
  id: string; kind: 'edit' | 'action'; page?: number | null; chapter?: string | null
  lensIds: string[]; severity: string; route: string; reasons: Reason[]
  original?: string; options?: Option[] | null
  action?: string; actions?: string[] | null; illustration?: string | null
  anchor?: string | null; context?: string | null
  intent?: 'fix' | 'enhance'
  decision?: string; reviewNote?: string; chosen?: string | null
}
interface Review {
  ready: boolean; units: string[]; totalFindings: number; totalCards: number
  severityCounts: Record<string, number>; routeCounts: Record<string, number>
  lensIdCounts: Record<string, number>; findings: Card[]
}

const data = ref<Review | null>(null)
const loading = ref(true)
async function load() {
  loading.value = true
  try { data.value = await $fetch<Review>('/api/review') } finally { loading.value = false }
}
onMounted(load)

// ---- word-level diff (track changes) --------------------------------------
function tokenize(s: string) { return s.split(/(\s+)/).filter(x => x !== '') }
function diff(a: string, b: string) {
  const A = tokenize(a), B = tokenize(b), n = A.length, m = B.length
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0))
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--)
    dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1])
  const out: { t: 'eq' | 'del' | 'ins'; v: string }[] = []
  const push = (t: 'eq' | 'del' | 'ins', v: string) => { const last = out[out.length - 1]; if (last && last.t === t) last.v += v; else out.push({ t, v }) }
  let i = 0, j = 0
  while (i < n && j < m) {
    if (A[i] === B[j]) { push('eq', A[i]); i++; j++ }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { push('del', A[i]); i++ }
    else { push('ins', B[j]); j++ }
  }
  while (i < n) { push('del', A[i++]) }
  while (j < m) { push('ins', B[j++]) }
  return out
}
const opOf = (d: { t: string }[]) => {
  const del = d.some(x => x.t === 'del'), ins = d.some(x => x.t === 'ins')
  return del && ins ? 'replace' : del ? 'cut' : ins ? 'add' : 'edit'
}
const opLabel: Record<string, string> = { cut: '✂ cut', replace: '↻ replace', add: '＋ add', edit: '✎ edit' }

// ---- provenance (who is behind a suggestion) -------------------------------
// Derived from each finding's `source` string (ground truth), NOT asserted per lens —
// so "Bookfox" only shows when the research actually cites Bookfox. Three buckets:
// bookfox (gold) · craft canon, i.e. some other named authority (sky) · de-AI tell (rose).
// Four buckets: Bookfox (gold) · an outside named authority — Strunk, Orwell, Gardner,
// Mantel, Maass, Matesic… (sky) · my own project-synthesis doc, i.e. "my other stuff"
// (slate) · de-AI tell-hunting (rose). Decided per finding from its `source`.
type Prov = { tag: string; kind: 'bookfox' | 'canon' | 'inhouse' | 'deai' }
function authorityOf(src = ''): Prov {
  if (/AI-MISTAKES/i.test(src)) return { tag: 'de-AI', kind: 'deai' }
  if (/bookfox|john matthew fox/i.test(src)) return { tag: 'Bookfox', kind: 'bookfox' }
  if (/in-house|synthesis|-REVIEW|Recommendations-doc|\.md|project (tic|synthesis)|review-doc|PAPER-AND-DEATHS|CHAPTER-HOOKS|TRIAD|^C-\d|^R\d/i.test(src))
    return { tag: 'in-house', kind: 'inhouse' }
  let head = (src.split(/[,;(]/)[0] || '').trim()
  if (head.length > 24) head = head.slice(0, 24) + '…'
  return { tag: head || 'craft', kind: 'canon' }
}
const provClass: Record<Prov['kind'], string> = {
  bookfox: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
  canon: 'bg-sky-500/10 text-sky-300/90 border border-sky-500/20',
  inhouse: 'bg-slate-500/15 text-slate-300 border border-slate-500/30',
  deai: 'bg-rose-500/15 text-rose-300 border border-rose-500/30',
}
// a card's provenance set, for filtering/sorting (craft leads, de-AI sinks)
const provKinds = (c: Card) => new Set((c.reasons || []).map(r => authorityOf(r.source).kind))
const isDeaiOnly = (c: Card) => { const k = provKinds(c); return k.size === 1 && k.has('deai') }
const hasBookfox = (c: Card) => provKinds(c).has('bookfox')

// ---- lens display ----------------------------------------------------------
const LENS_TITLE: Record<string, string> = {
  'scene-techniques': 'Scene — eight techniques', 'chapter-hooks': 'Scene — chapter hooks',
  'vivify': 'Character — vivify', 'character-techniques': 'Character — techniques',
  'sentence-craft': 'Sentence — build', 'sentence-power': 'Sentence — power', 'sentence-variety': 'Sentence — variety',
  'pro-level': 'Voice — pro-level', 'pacing': 'Pacing', 'tension': 'Tension',
  'setting': 'Setting', 'worldbuilding': 'Worldbuilding', 'resonance': 'Emotion — resonance',
  'recurring-device': 'Device — motif', 'worst-lines': 'Dialogue — worst lines',
  'spicy': 'Intimacy', 'voice': 'Voice — sound like yourself', 'ai-fingerprints': 'Voice — AI fingerprints',
}
const LENS_ORDER = [
  'scene-techniques', 'chapter-hooks', 'vivify', 'character-techniques',
  'sentence-craft', 'sentence-power', 'sentence-variety', 'pro-level',
  'pacing', 'tension', 'setting', 'worldbuilding', 'resonance',
  'recurring-device', 'worst-lines', 'spicy', 'voice', 'ai-fingerprints',
]
const sevRank: Record<string, number> = { high: 0, mid: 1, low: 2 }
const sevColor: Record<string, string> = { high: 'text-red-400', mid: 'text-amber-300', low: 'text-sky-400' }
const sevBg: Record<string, string> = { high: 'border-red-500/40', mid: 'border-amber-400/30', low: 'border-sky-500/20' }
const routeColor: Record<string, string> = {
  deai: 'bg-rose-500/15 text-rose-300', variety: 'bg-fuchsia-500/15 text-fuchsia-300',
  manual: 'bg-slate-500/20 text-slate-300',
}

// ---- filters ---------------------------------------------------------------
const fLens = ref('all'); const fSev = ref('all')
const fProv = ref('craft') // all | bookfox | craft (craft = anything but de-AI) | deai
const fIntent = ref('all') // all | fix | enhance
const hideReviewed = ref(false)

const lensOptions = computed(() => {
  const present = Object.keys(data.value?.lensIdCounts ?? {})
  return ['all', ...LENS_ORDER.filter(id => present.includes(id))]
})
const matchProv = (c: Card) =>
  fProv.value === 'all' ? true :
  fProv.value === 'bookfox' ? hasBookfox(c) :
  fProv.value === 'deai' ? isDeaiOnly(c) :
  /* craft */ !isDeaiOnly(c)
const cards = computed(() => (data.value?.findings ?? []).filter(c =>
  matchProv(c) &&
  (fIntent.value === 'all' || (c.intent ?? 'fix') === fIntent.value) &&
  (fLens.value === 'all' || c.lensIds.includes(fLens.value)) &&
  (fSev.value === 'all' || c.severity === fSev.value) &&
  (!hideReviewed.value || (c.decision ?? 'pending') === 'pending'))
  .sort((a, b) => (sevRank[a.severity] ?? 9) - (sevRank[b.severity] ?? 9) || (a.page ?? 1e9) - (b.page ?? 1e9)))

const isMulti = (c: Card) => c.kind === 'edit' && (c.options?.length ?? 0) > 1
const soleEdit = (c: Card) => c.options?.[0]?.edited ?? ''
const labelOf = (c: Card) => c.kind === 'edit' ? opLabel[opOf(diff(c.original || '', soleEdit(c)))] : '✎ revise'
const lensName = (id: string) => LENS_TITLE[id] ?? id

// ---- triage (queue / dismiss / pick an option / leave a note) -------------
function setDecision(c: Card, d: string) {
  // chosen == null means "no option picked"; an empty-string chosen is a real pick
  // (a full-cut option whose `edited` is '') — don't treat it as unpicked.
  if (d === 'queued' && isMulti(c) && c.chosen == null) return // must pick an option first
  c.decision = c.decision === d ? 'pending' : d
  queueSave()
}
function pickOption(c: Card, edited: string) { c.chosen = c.chosen === edited ? null : edited; queueSave() }
const noteOpen = ref<Record<string, boolean>>({})
function toggleNote(id: string) { noteOpen.value[id] = !noteOpen.value[id] }

let saveTimer: ReturnType<typeof setTimeout> | null = null
function queueSave() { savedMsg.value = ''; if (saveTimer) clearTimeout(saveTimer); saveTimer = setTimeout(save, 500) }
const savedMsg = ref('')
async function save() {
  if (!data.value) return
  const decisions: Record<string, any> = {}
  for (const c of data.value.findings)
    decisions[c.id] = { decision: c.decision ?? 'pending', note: c.reviewNote ?? '', chosen: c.chosen ?? null }
  await $fetch('/api/review/decisions', { method: 'POST', body: { decisions } })
  savedMsg.value = 'saved ✓'
}
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-6 font-serif">
    <div class="flex items-baseline gap-3 mb-1">
      <h1 class="text-lg font-semibold">Craft Review</h1>
      <span class="text-sm text-muted-foreground">One card per spot. Pick an option, then queue or dismiss. Diagnostic only.</span>
    </div>

    <div v-if="loading" class="text-sm text-muted-foreground py-10">loading…</div>
    <div v-else-if="!data?.ready" class="rounded border border-dashed p-6 text-sm text-muted-foreground">
      No data yet. Run the review engine on a chapter, then <code>node .claude/skills/review/collate.mjs</code>.
    </div>

    <template v-else>
      <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mb-4">
        <span>{{ data.units?.join(', ') }}</span>
        <span>{{ data.totalCards }} cards ({{ data.totalFindings }} findings merged)</span>
        <span><b class="text-red-400">{{ data.severityCounts.high || 0 }}</b> high · <b class="text-amber-300">{{ data.severityCounts.mid || 0 }}</b> mid · <b class="text-sky-400">{{ data.severityCounts.low || 0 }}</b> low</span>
      </div>

      <div class="flex flex-wrap items-center gap-2 mb-4 text-sm sticky top-0 bg-background/95 py-2 z-10 backdrop-blur">
        <select v-model="fLens" class="rounded border bg-background px-2 py-1 text-xs">
          <option v-for="id in lensOptions" :key="id" :value="id">{{ id === 'all' ? 'all lenses' : (LENS_TITLE[id] ?? id) }}</option>
        </select>
        <select v-model="fSev" class="rounded border bg-background px-2 py-1 text-xs">
          <option value="all">all severities</option><option value="high">high</option><option value="mid">mid</option><option value="low">low</option>
        </select>
        <select v-model="fProv" class="rounded border bg-background px-2 py-1 text-xs" title="who the suggestion is grounded in">
          <option value="craft">craft (hide de-AI)</option>
          <option value="bookfox">Bookfox only</option>
          <option value="deai">de-AI only</option>
          <option value="all">all sources</option>
        </select>
        <select v-model="fIntent" class="rounded border bg-background px-2 py-1 text-xs" title="fix = corrects a weakness · enhance = elevates already-fine prose">
          <option value="all">fix + enhance</option>
          <option value="fix">fixes only</option>
          <option value="enhance">✦ enhancements only</option>
        </select>
        <label class="flex items-center gap-1 text-xs text-muted-foreground"><input type="checkbox" v-model="hideReviewed" /> hide reviewed</label>
        <span class="ml-auto text-xs text-muted-foreground">{{ cards.length }} shown · {{ savedMsg }}</span>
      </div>

      <div class="space-y-3">
        <div v-for="c in cards" :key="c.id"
             class="rounded-lg border p-3 text-sm" :class="[sevBg[c.severity], (c.decision ?? 'pending') !== 'pending' ? 'opacity-60' : '']">
          <!-- header -->
          <div class="flex items-center gap-2 mb-2 text-xs">
            <span v-if="c.intent === 'enhance'" class="rounded bg-violet-500/20 px-1.5 py-0.5 font-semibold text-violet-300" title="enhancement opportunity — the prose is fine; a named craft technique would elevate it">✦ enhance</span>
            <span class="font-bold uppercase" :class="sevColor[c.severity]">{{ c.severity }}</span>
            <span class="rounded bg-muted px-1.5 py-0.5 font-medium">{{ isMulti(c) ? c.options!.length + ' options' : labelOf(c) }}</span>
            <span v-if="c.page" class="text-muted-foreground">p{{ c.page }}</span>
            <span class="ml-auto shrink-0 rounded px-1.5 py-0.5" :class="routeColor[c.route] ?? 'bg-muted'">→ {{ c.route }}</span>
          </div>

          <!-- single edit: one tracked-changes redline + the reasons behind it -->
          <template v-if="c.kind === 'edit' && !isMulti(c)">
            <div class="rounded border bg-muted/20 p-2 mb-2 leading-relaxed">
              <template v-for="(seg, i) in diff(c.original || '', soleEdit(c))" :key="i"><span
                :class="seg.t === 'del' ? 'line-through text-red-400/70 decoration-red-500/50'
                      : seg.t === 'ins' ? 'bg-emerald-500/25 text-emerald-200 rounded-sm'
                      : 'text-foreground/90'">{{ seg.v }}</span></template>
            </div>
            <ul class="space-y-1 mb-2">
              <li v-for="(r, i) in c.reasons" :key="i" class="text-xs">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span class="shrink-0 rounded bg-muted px-1 py-0.5 text-[10px] text-foreground/70">{{ lensName(r.lensId) }}</span>
                  <span class="shrink-0 rounded px-1 py-0.5 text-[10px]" :class="provClass[authorityOf(r.source).kind]">{{ authorityOf(r.source).tag }}</span>
                  <span class="text-muted-foreground">{{ r.why }}</span>
                </div>
                <div v-if="r.source" class="pl-1 text-[10px] text-muted-foreground/50 italic">{{ r.source }}</div>
              </li>
            </ul>
          </template>

          <!-- competing edits to the same span: pick ONE -->
          <template v-else-if="c.kind === 'edit' && isMulti(c)">
            <div class="text-[11px] text-muted-foreground mb-1">{{ c.options!.length }} lenses want different edits here — pick the one you want (or dismiss the card):</div>
            <label v-for="(o, i) in c.options" :key="i"
                   class="block rounded border p-2 mb-1.5 cursor-pointer transition-colors"
                   :class="c.chosen === o.edited ? 'border-emerald-500/60 bg-emerald-500/[0.06]' : 'border-border hover:border-muted-foreground/40'">
              <div class="flex items-start gap-2">
                <input type="radio" class="mt-1" :checked="c.chosen === o.edited" @click="pickOption(c, o.edited)" />
                <div class="min-w-0">
                  <div class="leading-relaxed">
                    <template v-for="(seg, k) in diff(c.original || '', o.edited)" :key="k"><span
                      :class="seg.t === 'del' ? 'line-through text-red-400/70 decoration-red-500/50'
                            : seg.t === 'ins' ? 'bg-emerald-500/25 text-emerald-200 rounded-sm'
                            : 'text-foreground/90'">{{ seg.v }}</span></template>
                  </div>
                  <div v-for="(r, k) in o.reasons" :key="k" class="mt-1 text-xs">
                    <div class="flex items-center gap-1.5 flex-wrap">
                      <span class="shrink-0 rounded bg-muted px-1 py-0.5 text-[10px] text-foreground/70">{{ lensName(r.lensId) }}</span>
                      <span class="shrink-0 rounded px-1 py-0.5 text-[10px]" :class="provClass[authorityOf(r.source).kind]">{{ authorityOf(r.source).tag }}</span>
                      <span class="text-muted-foreground">{{ r.why }}</span>
                    </div>
                    <div v-if="r.source" class="pl-1 text-[10px] text-muted-foreground/50 italic">{{ r.source }}</div>
                  </div>
                </div>
              </div>
            </label>
          </template>

          <!-- structural action -->
          <template v-else>
            <div v-if="c.context" class="rounded border border-border bg-muted/30 p-2 mb-2 text-xs text-foreground/80 font-serif leading-relaxed">
              <span class="mr-1 select-none text-[10px] uppercase tracking-wide text-muted-foreground/60">in the manuscript</span>
              <span class="italic">…{{ c.context }}…</span>
            </div>
            <div class="rounded border border-amber-500/30 bg-amber-500/[0.05] p-2 mb-2 text-amber-200/90">
              {{ c.action }}
              <ul v-if="c.actions" class="mt-1 list-disc pl-4 text-xs text-amber-200/70">
                <li v-for="(a, i) in c.actions" :key="i">{{ a }}</li>
              </ul>
              <div v-if="c.illustration" class="mt-2 rounded bg-background/40 p-1.5 text-xs text-amber-100/80 italic">
                e.g. {{ c.illustration }}
              </div>
            </div>
            <ul class="space-y-1 mb-2">
              <li v-for="(r, i) in c.reasons" :key="i" class="text-xs">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span class="shrink-0 rounded bg-muted px-1 py-0.5 text-[10px] text-foreground/70">{{ lensName(r.lensId) }}</span>
                  <span class="shrink-0 rounded px-1 py-0.5 text-[10px]" :class="provClass[authorityOf(r.source).kind]">{{ authorityOf(r.source).tag }}</span>
                  <span class="text-muted-foreground">{{ r.why }}</span>
                </div>
                <div v-if="r.source" class="pl-1 text-[10px] text-muted-foreground/50 italic">{{ r.source }}</div>
              </li>
            </ul>
          </template>

          <!-- triage row -->
          <div class="flex items-center gap-2">
            <span class="text-[10px] text-muted-foreground/60 mr-auto">{{ c.lensIds.map(lensName).join(' · ') }}</span>
            <button class="text-[11px] text-muted-foreground/70 hover:text-foreground underline-offset-2 hover:underline" @click="toggleNote(c.id)">
              {{ c.reviewNote ? '✎ note·' : '✎ note' }}
            </button>
            <Button size="sm" :variant="c.decision === 'queued' ? 'default' : 'outline'"
                    :disabled="isMulti(c) && c.chosen == null" :title="isMulti(c) && c.chosen == null ? 'pick an option first' : ''"
                    @click="setDecision(c, 'queued')">queue</Button>
            <Button size="sm" :variant="c.decision === 'dismiss' ? 'default' : 'outline'" @click="setDecision(c, 'dismiss')">dismiss</Button>
          </div>

          <!-- feedback note: tell me a suggestion is off (e.g. "no one says this") -->
          <div v-if="noteOpen[c.id]" class="mt-2">
            <textarea v-model="c.reviewNote" @input="queueSave" rows="2"
                      placeholder="What's off about these suggestions? (e.g. 'no one says “mouth was a tight line”', 'cut leaves a fragment')"
                      class="w-full rounded border bg-background px-2 py-1 text-xs"></textarea>
          </div>
        </div>
        <div v-if="!cards.length" class="rounded border border-dashed p-6 text-sm text-muted-foreground text-center">no cards match these filters</div>
      </div>
    </template>
  </div>
</template>
