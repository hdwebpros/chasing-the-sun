<script setup lang="ts">
// Opener-variety review — sentence openers are a structural, whole-BOOK pattern. TWO views,
// tabbed, sharing the same chapter rail and the same decisions (autosave to page-NN docs):
//   • surgical — run-by-run, one sentence at a time (precise, slow over 3k+ sentences).
//   • chapter  — the whole prologue/interlude/chapter as continuous prose, every opener
//                colour-coded inline, flagged sentences carrying their recast, the chapter's
//                live mix shown against the author's target bands, and accept-all / keep-all
//                bulk controls. Built for blowing through a chapter "in bunches".
// Nothing here touches Drive — applying is the gated `apply-fixes.mjs --openers --apply`.
import { Button } from '~/components/ui/button'
import { classifyOpener } from '#shared/openers-core.mjs'   // same classifier the batch pass uses (#shared alias → /shared)

type Decision = 'pending' | 'accept' | 'reject' | 'edit'
interface Row {
  id: string; page: number; code?: string; opener?: string; span: string; lead?: string
  unique?: boolean; runId?: string; runLen?: number; runCodes?: string; runPos?: number
  alsoVariety?: boolean; why?: string; voiceClass?: string | null
  alts?: { recast?: string | null }; decision?: Decision; editText?: string
}
interface Run { runId: string; page: number; chapter: string; code: string; runLen: number; runCodes: string; context: string; rows: Row[] }
interface ChapterStat { chapter: string; runs: number; flags: number; total: number; pending: number; kept: number; changed: number }
interface Band { min: number; max: number; note?: string }
interface Summary { sentences: number; totals: Record<string, number>; targets?: Record<string, Band>; chapters: { chapter: string; total: number; codes: Record<string, number>; pctS: number; overBudget: boolean }[] }
interface Resp { counts: { total: number; pending: number; kept: number; changed: number }; chapters: ChapterStat[]; runs: Run[]; summary: Summary | null; summaryMtime: string | null }

// chapter ("bunch") view shapes
interface ChFlag { id: string; decision: Decision; editText?: string; opener?: string; runLen?: number; runCodes?: string; alsoVariety?: boolean; voiceClass?: string | null; recast?: string | null; unique?: boolean; lead?: string; why?: string }
interface ChSent { t: string; code: string; para: number; page: number; flag: ChFlag | null }
interface ChResp { chapter: string; sentences: ChSent[]; order: string[] }

const CLASS_LABEL: Record<string, string> = { S: 'subject-led', P: 'prepositional', G: 'participial', A: 'adverbial', C: 'subordinate', J: 'conjunction', I: 'inversion', D: 'dialogue', F: 'fragment' }
const VARIED = ['P', 'G', 'A', 'C', 'J', 'I']
const chip = (c?: string) => c === 'S'
  ? 'bg-red-500/20 text-red-300'
  : c === 'D' || c === 'F' ? 'bg-zinc-500/20 text-zinc-300' : 'bg-emerald-500/20 text-emerald-300'

const data = ref<Resp | null>(null)
const loading = ref(false)
const saving = ref(false)
const savedMsg = ref('')
const activeChapter = ref<string>('')
const hideDecided = ref(true)
const customEditing = reactive(new Set<string>())
const view = ref<'surgical' | 'chapter'>('surgical')

async function load() {
  loading.value = true
  try {
    data.value = await $fetch<Resp>('/api/deai/openers')
    for (const run of data.value.runs) for (const r of run.rows) { r.decision ??= 'pending' }
    if (!activeChapter.value && data.value.chapters.length)
      activeChapter.value = data.value.chapters.find(c => c.pending)?.chapter ?? data.value.chapters[0].chapter
  } finally { loading.value = false }
}
onMounted(load)

const chapters = computed(() => data.value?.chapters ?? [])
const runs = computed<Run[]>(() => {
  if (!data.value) return []
  let rs = data.value.runs.filter(r => r.chapter === activeChapter.value)
  if (hideDecided.value) rs = rs.filter(run => run.rows.some(r => (r.decision ?? 'pending') === 'pending'))
  return rs
})

function choice(r: Row): 'keep' | 'recast' | 'custom' | null {
  if (r.decision === 'reject') return 'keep'
  if (r.decision !== 'edit') return null
  if (customEditing.has(r.id)) return 'custom'
  if (r.alts?.recast != null && r.editText === r.alts.recast) return 'recast'
  return 'custom'
}
function pick(r: Row, kind: 'keep' | 'recast' | 'custom') {
  if (kind === 'keep') { r.decision = 'reject'; r.editText = undefined; customEditing.delete(r.id) }
  else if (kind === 'recast') { r.decision = 'edit'; r.editText = r.alts?.recast ?? ''; customEditing.delete(r.id) }
  else { r.decision = 'edit'; if (!r.editText) r.editText = r.span; customEditing.add(r.id) }
  autosave(r.page)
}
// preview: when the span is not unique in the book, apply prepends the lead sentence —
// show it muted so the author sees exactly what lands in Drive.
function preview(r: Row): string {
  const t = r.decision === 'edit' ? (r.editText ?? '') : r.span
  return r.unique === false && r.lead ? `${r.lead} ${t}` : t
}
function leadShown(r: { unique?: boolean; lead?: string }): string { return r.unique === false && r.lead ? r.lead + ' ' : '' }

// bulk (surgical): keep every still-pending row in the active chapter
function keepRest() {
  for (const run of runs.value) for (const r of run.rows)
    if ((r.decision ?? 'pending') === 'pending') { r.decision = 'reject'; r.editText = undefined; dirtyPages.add(r.page) }
  if (saveTimer) clearTimeout(saveTimer); saveTimer = setTimeout(flush, 300)
}

const dirtyPages = new Set<number>()
let saveTimer: ReturnType<typeof setTimeout> | null = null
function autosave(page: number) { savedMsg.value = ''; dirtyPages.add(page); if (saveTimer) clearTimeout(saveTimer); saveTimer = setTimeout(flush, 500) }
async function flush() {
  if (!data.value || !dirtyPages.size) return
  saving.value = true
  const all = data.value.runs.flatMap(run => run.rows)
  try {
    for (const page of [...dirtyPages]) {
      const decisions: Record<string, { decision: Decision; editText?: string }> = {}
      for (const r of all.filter(r => r.page === page)) decisions[r.id] = { decision: r.decision ?? 'pending', editText: r.editText }
      await $fetch('/api/deai/decisions', { method: 'POST', body: { page, mode: 'openers', decisions } })
      dirtyPages.delete(page)
    }
    savedMsg.value = 'saved'
  } finally { saving.value = false }
}

// ── chapter ("bunch") view ─────────────────────────────────────────────────────
const chapterSents = ref<ChSent[]>([])
const chapterLoading = ref(false)
const showCodes = ref(false)                              // opener-code superscripts — off by default (clean read)
const chMode = ref<'optimized' | 'original'>('optimized') // optimized = recasts shown in place
const highlightEdits = ref(true)                          // subtle markers on changed / pending sentences
const selectedId = ref<string | null>(null)              // the one flag whose control panel is open
const chCustom = reactive(new Set<string>())

async function loadChapter() {
  if (!activeChapter.value) return
  chapterLoading.value = true
  try {
    const r = await $fetch<ChResp>('/api/deai/openers-chapter', { query: { chapter: activeChapter.value } })
    chapterSents.value = r.sentences
  } finally { chapterLoading.value = false }
}
// fetch chapter prose when the chapter view is active and the chapter changes
watch([view, activeChapter], () => { if (view.value === 'chapter') loadChapter() })
// keep the two views in sync: re-pull main payload when returning to surgical
watch(view, (v, prev) => { if (v === 'surgical' && prev === 'chapter') load() })

// paragraphs (group the stream by paragraph id, preserving order)
const paragraphs = computed(() => {
  const out: { para: number; sents: ChSent[] }[] = []
  for (const s of chapterSents.value) {
    const last = out[out.length - 1]
    if (last && last.para === s.para) last.sents.push(s)
    else out.push({ para: s.para, sents: [s] })
  }
  return out
})
const chFlags = computed(() => chapterSents.value.filter(s => s.flag).map(s => s.flag!) )
const chPending = computed(() => chFlags.value.filter(f => (f.decision ?? 'pending') === 'pending').length)

// live mix for THIS chapter (from the rendered stream) vs the author's target bands
const chMix = computed(() => {
  const codes: Record<string, number> = {}
  for (const s of chapterSents.value) codes[s.code] = (codes[s.code] || 0) + 1
  const tot = chapterSents.value.length || 1
  const share = (n: number) => n / tot
  const varied = VARIED.reduce((a, c) => a + (codes[c] || 0), 0)
  return { tot, codes, share, varied: share(varied), pctS: share(codes.S || 0), pctF: share(codes.F || 0), pctD: share(codes.D || 0) }
})
// the text a sentence would carry once optimized — accepted edits + kept originals +
// any still-pending RECOMMENDED recast applied. Independent of the read mode (optimized
// vs original), so the "after" stat reflects the realistic result of the current choices.
function projectedText(s: ChSent): string {
  const f = s.flag
  if (!f) return s.t
  if (f.decision === 'edit') return f.editText || s.t
  if (f.decision === 'reject') return s.t
  if (f.voiceClass === 'monotone' && f.recast) return f.recast
  return s.t
}
// AFTER-optimization mix: re-classify each projected opener with the shared core. Updates
// live as the author accepts / keeps / edits.
const afterMix = computed(() => {
  const codes: Record<string, number> = {}
  for (const s of chapterSents.value) {
    const txt = projectedText(s)
    const code = (s.flag && txt !== s.t) ? classifyOpener(txt).code : s.code
    codes[code] = (codes[code] || 0) + 1
  }
  const tot = chapterSents.value.length || 1
  const share = (n: number) => n / tot
  const varied = VARIED.reduce((a, c) => a + (codes[c] || 0), 0)
  return { tot, codes, share, varied: share(varied), pctS: share(codes.S || 0), pctF: share(codes.F || 0), pctD: share(codes.D || 0) }
})
const targets = computed(() => data.value?.summary?.targets ?? null)
function bandState(share: number, band?: Band): 'low' | 'in' | 'high' | null {
  if (!band) return null
  if (share < band.min) return 'low'
  if (share > band.max) return 'high'
  return 'in'
}
const bandClass: Record<string, string> = { low: 'text-amber-400', in: 'text-emerald-400', high: 'text-red-300' }
function pctStr(n: number) { return (n * 100).toFixed(1) + '%' }
function bandStr(b?: Band) { return b ? `${Math.round(b.min * 100)}–${Math.round(b.max * 100)}%` : '' }

// per-sentence decision controls (chapter view), mirrors surgical pick()
function choiceCh(f: ChFlag): 'keep' | 'recast' | 'custom' | null {
  if (f.decision === 'reject') return 'keep'
  if (f.decision !== 'edit') return null
  if (chCustom.has(f.id)) return 'custom'
  if (f.recast != null && f.editText === f.recast) return 'recast'
  return 'custom'
}
function pickCh(s: ChSent, kind: 'keep' | 'recast' | 'custom') {
  const f = s.flag; if (!f) return
  if (kind === 'keep') { f.decision = 'reject'; f.editText = undefined; chCustom.delete(f.id) }
  else if (kind === 'recast') { f.decision = 'edit'; f.editText = f.recast ?? ''; chCustom.delete(f.id) }
  else { f.decision = 'edit'; if (!f.editText) f.editText = f.recast ?? s.t; chCustom.add(f.id) }
  autosaveCh(s.page)
}

// READING the optimized chapter: what text to SHOW for a sentence. In "optimized" mode the
// recommended recasts are substituted IN PLACE so the chapter reads as the finished prose;
// "original" mode shows the manuscript as-is. A committed decision always wins.
function displayText(s: ChSent): string {
  const f = s.flag
  if (!f) return s.t
  if (f.decision === 'edit') return f.editText || s.t            // accepted recast / custom edit
  if (f.decision === 'reject') return s.t                         // kept original
  if (chMode.value === 'optimized' && f.voiceClass === 'monotone' && f.recast) return f.recast  // pending preview
  return s.t
}
function isChanged(s: ChSent): boolean { return !!s.flag && displayText(s) !== s.t }
// markers are SUBTLE — the point is to read the flow, not to see a wall of widgets.
function sentClass(s: ChSent): string {
  if (!s.flag) return ''
  const sel = selectedId.value === s.flag.id ? ' rounded ring-1 ring-sky-400/70' : ''
  if (!highlightEdits.value) return 'cursor-pointer' + sel
  // mark ONLY the actual edits so the chapter still reads as clean prose; keeps stay
  // unmarked (but every flagged sentence is still clickable to review/keep/edit).
  if (isChanged(s)) return 'cursor-pointer rounded bg-emerald-500/10 underline decoration-dotted decoration-emerald-400/70 underline-offset-4' + sel
  return 'cursor-pointer' + sel
}
const selectedSent = computed(() => selectedId.value ? chapterSents.value.find(s => s.flag?.id === selectedId.value) ?? null : null)
function selectSent(s: ChSent) { if (s.flag) selectedId.value = selectedId.value === s.flag.id ? null : s.flag.id }
// count of recasts currently previewed-but-uncommitted (for the header hint)
const chPreview = computed(() => chFlags.value.filter(f => (f.decision ?? 'pending') === 'pending' && f.voiceClass === 'monotone' && f.recast).length)

// bulk (chapter): accept every pending recast / keep everything pending
function acceptAllRecasts() {
  for (const s of chapterSents.value) {
    const f = s.flag; if (!f) continue
    if ((f.decision ?? 'pending') === 'pending' && f.recast) { f.decision = 'edit'; f.editText = f.recast; chCustom.delete(f.id); chDirty.add(s.page) }
  }
  if (chTimer) clearTimeout(chTimer); chTimer = setTimeout(flushCh, 300)
}
function keepAllChapter() {
  for (const s of chapterSents.value) {
    const f = s.flag; if (!f) continue
    if ((f.decision ?? 'pending') === 'pending') { f.decision = 'reject'; f.editText = undefined; chCustom.delete(f.id); chDirty.add(s.page) }
  }
  if (chTimer) clearTimeout(chTimer); chTimer = setTimeout(flushCh, 300)
}

const chDirty = new Set<number>()
let chTimer: ReturnType<typeof setTimeout> | null = null
function autosaveCh(page: number) { savedMsg.value = ''; chDirty.add(page); if (chTimer) clearTimeout(chTimer); chTimer = setTimeout(flushCh, 500) }
async function flushCh() {
  if (!chDirty.size) return
  saving.value = true
  try {
    for (const page of [...chDirty]) {
      const decisions: Record<string, { decision: Decision; editText?: string }> = {}
      for (const s of chapterSents.value) if (s.page === page && s.flag) decisions[s.flag.id] = { decision: s.flag.decision ?? 'pending', editText: s.flag.editText }
      await $fetch('/api/deai/decisions', { method: 'POST', body: { page, mode: 'openers', decisions } })
      chDirty.delete(page)
    }
    savedMsg.value = 'saved'
  } finally { saving.value = false }
}

// distribution bar snapshot (whole-book; from last classify.mjs run)
const measured = computed(() => {
  const iso = data.value?.summaryMtime
  if (!iso) return ''
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return new Date(iso).toLocaleDateString()
})
const dist = computed(() => {
  const t = data.value?.summary?.totals
  if (!t) return []
  const tot = Object.values(t).reduce((a, b) => a + b, 0)
  return ['S', 'P', 'G', 'A', 'C', 'J', 'I', 'D', 'F'].filter(c => t[c]).map(c => ({ c, n: t[c], pct: tot ? t[c] / tot : 0 }))
})
</script>

<template>
  <div class="mx-auto max-w-5xl px-4 py-6 font-serif">
    <div class="flex items-center gap-3 mb-1 text-sm">
      <h1 class="font-semibold">opener variety</h1>
      <span class="text-muted-foreground">sentence openers — break the subject-led monoculture</span>
      <NuxtLink to="/tic" class="ml-auto text-xs text-muted-foreground underline">→ tic</NuxtLink>
    </div>

    <!-- view tabs -->
    <div class="mb-3 flex items-center gap-1 text-xs">
      <button class="rounded px-3 py-1" :class="view === 'surgical' ? 'bg-foreground text-background' : 'border hover:bg-muted'" @click="view = 'surgical'">surgical · sentence-by-sentence</button>
      <button class="rounded px-3 py-1" :class="view === 'chapter' ? 'bg-foreground text-background' : 'border hover:bg-muted'" @click="view = 'chapter'">chapter · read in bunches</button>
      <span class="ml-3 text-muted-foreground">{{ view === 'surgical' ? 'precise, one run at a time' : 'whole chapter as prose — accept/keep in bulk' }}</span>
    </div>

    <!-- whole-book distribution: the measurement headline -->
    <div v-if="dist.length" class="mb-4 rounded-lg border p-3">
      <div class="flex h-3 w-full overflow-hidden rounded">
        <div v-for="d in dist" :key="d.c" :style="{ width: (d.pct * 100) + '%' }"
             :class="d.c === 'S' ? 'bg-red-500/70' : d.c === 'D' || d.c === 'F' ? 'bg-zinc-500/50' : 'bg-emerald-500/70'"
             :title="`${CLASS_LABEL[d.c]} ${(d.pct * 100).toFixed(1)}%`" />
      </div>
      <div class="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
        <span v-for="d in dist" :key="d.c"><span class="font-mono" :class="d.c === 'S' ? 'text-red-300' : ''">{{ d.c }}</span> {{ CLASS_LABEL[d.c] }} {{ (d.pct * 100).toFixed(1) }}%</span>
      </div>
      <div class="mt-1.5 flex items-center gap-2 border-t pt-1.5 text-[11px] text-muted-foreground/70">
        <span>whole-book snapshot from last <span class="font-mono">classify.mjs</span><span v-if="measured"> · measured {{ measured }}</span> — does not reflect pending decisions; re-run sync + classify to refresh</span>
        <button class="ml-auto rounded border px-2 py-0.5 hover:bg-muted" :disabled="loading" @click="load">{{ loading ? 'refreshing…' : 'refresh' }}</button>
      </div>
    </div>

    <div v-if="loading" class="text-muted-foreground text-sm">loading…</div>

    <div v-else-if="data" class="flex gap-4">
      <!-- chapter rail (shared by both views) -->
      <aside class="w-52 shrink-0 text-xs">
        <div class="sticky top-4 max-h-[80vh] overflow-auto pr-1">
          <button v-for="c in chapters" :key="c.chapter"
                  class="mb-0.5 flex w-full items-center gap-1.5 rounded px-2 py-1 text-left"
                  :class="activeChapter === c.chapter ? 'bg-foreground text-background' : 'hover:bg-muted'"
                  @click="activeChapter = c.chapter">
            <span class="truncate">{{ c.chapter }}</span>
            <span class="ml-auto opacity-60">{{ c.runs }}</span>
            <span v-if="c.pending" class="rounded bg-sky-500/20 px-1 text-sky-300">{{ c.pending }}</span>
          </button>
        </div>
      </aside>

      <!-- ── SURGICAL view ── -->
      <div v-if="view === 'surgical'" class="min-w-0 flex-1">
        <div class="mb-3 flex items-center gap-2 text-xs">
          <h2 class="font-semibold">{{ activeChapter }}</h2>
          <button class="ml-auto rounded border px-2 py-1 text-emerald-400 border-emerald-500/40" @click="keepRest">keep all pending here</button>
          <label class="flex items-center gap-1 text-muted-foreground"><input type="checkbox" v-model="hideDecided" /> hide decided</label>
        </div>

        <div v-if="!runs.length" class="rounded border border-dashed p-6 text-center text-sm text-muted-foreground">
          nothing pending in this chapter
        </div>

        <div v-for="run in runs" :key="run.runId" class="mb-4 rounded-lg border p-3">
          <div class="mb-2 flex flex-wrap items-center gap-2 text-xs">
            <span class="rounded bg-red-500/15 px-1.5 py-0.5 font-mono text-red-300">p{{ run.page }} · {{ run.runLen }}×{{ run.code }}</span>
            <span class="text-muted-foreground">{{ run.runLen }} {{ CLASS_LABEL[run.code] }} openers in a row</span>
            <span class="flex gap-0.5 font-mono">
              <span v-for="(c, i) in run.runCodes.split(' ')" :key="i" class="rounded px-1" :class="chip(c)">{{ c }}</span>
            </span>
          </div>

          <p class="mb-3 border-l-2 border-muted pl-2 text-sm leading-relaxed text-muted-foreground/80">{{ run.context }}</p>

          <div class="space-y-2">
            <div v-for="r in run.rows" :key="r.id" class="rounded border p-2 text-sm"
                 :class="(r.decision && r.decision !== 'pending') ? 'opacity-70' : ''">
              <div class="mb-1 flex items-center gap-2 text-xs">
                <span class="rounded px-1.5 py-0.5 font-mono" :class="chip(r.code)">{{ r.code }}</span>
                <span class="text-muted-foreground">opens “{{ r.opener }}…”</span>
                <span v-if="r.alsoVariety" class="rounded bg-amber-500/15 px-1.5 py-0.5 text-amber-300" title="same first WORD repeats too — /variety also owns this">+ variety</span>
                <span v-if="r.voiceClass === 'signature'" class="rounded bg-emerald-500/15 px-1.5 py-0.5 text-emerald-300" title="deliberate subject-led punch — keep">signature</span>
                <span v-else-if="r.voiceClass === 'monotone'" class="rounded bg-red-500/20 px-1.5 py-0.5 text-red-300" title="flat repetition — recast candidate">monotone</span>
                <span class="ml-auto" :class="choice(r) === 'keep' ? 'text-muted-foreground' : r.decision === 'edit' ? 'text-emerald-400' : 'text-sky-400'">
                  {{ choice(r) === 'keep' ? 'kept' : r.decision === 'edit' ? 'recast' : 'pending' }}
                </span>
              </div>

              <p class="mb-1.5 leading-relaxed"><span class="font-semibold bg-amber-500/10 rounded px-0.5">{{ r.span }}</span></p>

              <p v-if="r.alts?.recast && choice(r) !== 'custom'" class="mb-1.5 rounded bg-emerald-500/5 px-2 py-1 text-xs">
                <span class="text-emerald-500/80">suggested →</span> <span class="text-muted-foreground/60">{{ leadShown(r) }}</span><span class="text-emerald-300">{{ r.alts.recast }}</span>
              </p>
              <p v-else-if="r.voiceClass === 'signature' && choice(r) !== 'custom'" class="mb-1.5 text-xs italic text-emerald-500/70">
                recommendation: keep — this opener is doing real work (deliberate subject-led beat); varying it would hurt the rhythm.
              </p>
              <p v-else-if="!r.alts?.recast && choice(r) !== 'custom'" class="mb-1.5 text-xs italic text-muted-foreground/60">
                no suggestion generated for this chapter yet — keep it, write your own, or ask Claude to run the suggestion pass on this chapter.
              </p>

              <p v-if="choice(r) === 'custom'" class="mb-1.5 text-xs">
                <span class="text-muted-foreground">your edit → </span><span class="text-muted-foreground/60">{{ leadShown(r) }}</span><span class="text-emerald-400">{{ r.editText || '(empty)' }}</span>
              </p>
              <textarea v-if="choice(r) === 'custom'" v-model="r.editText" @input="autosave(r.page)"
                        placeholder="your rewrite — a varied opener for this sentence…"
                        class="mb-1.5 w-full rounded border bg-background p-2 text-sm" rows="2" />

              <div class="flex flex-wrap gap-1">
                <Button size="sm" :variant="choice(r) === 'keep' ? 'default' : 'outline'" @click="pick(r, 'keep')">keep</Button>
                <Button size="sm" :variant="choice(r) === 'recast' ? 'default' : 'outline'" @click="pick(r, 'recast')"
                        :disabled="r.alts?.recast == null" :title="r.alts?.recast == null ? 'no suggestion yet' : 'use: ' + r.alts.recast">use suggestion</Button>
                <Button size="sm" :variant="choice(r) === 'custom' ? 'default' : 'outline'" @click="pick(r, 'custom')">edit</Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── CHAPTER ("bunch") view — read the whole chapter as finished prose ── -->
      <div v-else class="min-w-0 flex-1">
        <div class="mb-2 flex flex-wrap items-center gap-2 text-xs">
          <h2 class="font-semibold">{{ activeChapter }}</h2>
          <span class="text-muted-foreground">{{ chMix.tot }} sentences · {{ chFlags.length }} flagged · {{ chPending }} pending</span>
          <div class="ml-auto flex items-center gap-0.5 rounded border p-0.5">
            <button class="rounded px-2 py-0.5" :class="chMode === 'optimized' ? 'bg-foreground text-background' : 'hover:bg-muted'" @click="chMode = 'optimized'" title="recasts substituted in place — the finished read">optimized</button>
            <button class="rounded px-2 py-0.5" :class="chMode === 'original' ? 'bg-foreground text-background' : 'hover:bg-muted'" @click="chMode = 'original'" title="the manuscript as it stands">original</button>
          </div>
          <label class="flex items-center gap-1 text-muted-foreground"><input type="checkbox" v-model="highlightEdits" /> mark edits</label>
          <label class="flex items-center gap-1 text-muted-foreground"><input type="checkbox" v-model="showCodes" /> codes</label>
          <button class="rounded border border-emerald-500/40 px-2 py-1 text-emerald-400" @click="acceptAllRecasts">accept all recasts</button>
          <button class="rounded border px-2 py-1 text-muted-foreground" @click="keepAllChapter">keep all</button>
        </div>

        <!-- chapter mix vs target bands — measured (now) → after optimization -->
        <div v-if="targets" class="mb-3 rounded-lg border p-2 text-[11px]">
          <div class="flex flex-wrap gap-x-4 gap-y-1">
            <span><span class="font-mono">S</span> <span class="text-muted-foreground/60">{{ pctStr(chMix.pctS) }}</span> → <span :class="bandClass[bandState(afterMix.pctS, targets.S) ?? 'in']">{{ pctStr(afterMix.pctS) }}</span> <span class="text-muted-foreground/50">target {{ bandStr(targets.S) }}</span></span>
            <span><span class="font-mono text-emerald-300">varied</span> <span class="text-muted-foreground/60">{{ pctStr(chMix.varied) }}</span> → <span :class="bandClass[bandState(afterMix.varied, targets.varied) ?? 'in']">{{ pctStr(afterMix.varied) }}</span> <span class="text-muted-foreground/50">target {{ bandStr(targets.varied) }}</span></span>
            <span><span class="font-mono">F</span> <span :class="bandClass[bandState(afterMix.pctF, targets.F) ?? 'in']">{{ pctStr(afterMix.pctF) }}</span> <span class="text-muted-foreground/50">{{ bandStr(targets.F) }}</span></span>
            <span><span class="font-mono">D</span> <span :class="bandClass[bandState(afterMix.pctD, targets.D) ?? 'in']">{{ pctStr(afterMix.pctD) }}</span> <span class="text-muted-foreground/50">{{ bandStr(targets.D) }}</span></span>
            <span v-for="c in VARIED" :key="c" class="text-muted-foreground"><span class="font-mono">{{ c }}</span> {{ pctStr(afterMix.share(afterMix.codes[c] || 0)) }}</span>
          </div>
          <div class="mt-1 text-muted-foreground/60">{{ pctStr(chMix.pctS) }} now → <b>{{ pctStr(afterMix.pctS) }}</b> after applying every recommended/queued recast in this chapter · <span class="text-amber-400">amber</span>=below band · <span class="text-emerald-400">green</span>=in band · <span class="text-red-300">red</span>=over</div>
        </div>

        <div v-if="chMode === 'optimized' && chPreview" class="mb-3 rounded bg-emerald-500/5 px-2 py-1 text-[11px] text-emerald-300/80">
          Reading with <b>{{ chPreview }}</b> recommended recast{{ chPreview === 1 ? '' : 's' }} applied in place (shown <span class="underline decoration-dotted decoration-emerald-400/70 underline-offset-4">underlined</span>). Click any marked sentence to keep the original or edit it; <b>accept all recasts</b> commits them.
        </div>

        <div v-if="chapterLoading" class="text-sm text-muted-foreground">loading chapter…</div>
        <div v-else-if="!chapterSents.length" class="rounded border border-dashed p-6 text-center text-sm text-muted-foreground">
          no prose stream — run <span class="font-mono">classify.mjs</span> to (re)generate it.
        </div>

        <!-- the whole chapter, as continuous prose; recasts substituted in optimized mode -->
        <article v-else class="font-serif text-[16px] leading-8" :class="selectedSent ? 'pb-44' : ''">
          <p v-for="(p, pi) in paragraphs" :key="pi" class="mb-3">
            <template v-for="(s, si) in p.sents" :key="si"><span
              :class="sentClass(s)"
              @click="s.flag && selectSent(s)"
              :title="s.flag ? `${s.flag.voiceClass === 'monotone' ? 'recast candidate' : s.flag.voiceClass === 'signature' ? 'keep — deliberate' : 'flagged'} · ${s.flag.runLen}×${s.code} run` : ''"
            >{{ displayText(s) }}</span><sup v-if="showCodes" class="ml-0.5 font-mono text-[9px]" :class="s.code === 'S' ? 'text-red-400/70' : VARIED.includes(s.code) ? 'text-emerald-400/70' : 'text-muted-foreground/40'">{{ s.code }}</sup>{{ ' ' }}</template>
          </p>
        </article>
      </div>
    </div>

    <!-- docked editor: only the ONE selected sentence; prose stays clean -->
    <div v-if="view === 'chapter' && selectedSent && selectedSent.flag" class="sticky bottom-12 z-20 mx-auto mb-2 max-w-5xl rounded-lg border bg-background/95 p-3 shadow-lg backdrop-blur">
      <div class="mb-1.5 flex items-center gap-2 text-xs">
        <span class="rounded px-1.5 py-0.5 font-mono" :class="chip(selectedSent.code)">{{ selectedSent.code }}</span>
        <span class="text-muted-foreground">opens “{{ selectedSent.flag.opener }}…” · {{ selectedSent.flag.runLen }}×{{ selectedSent.code }} run</span>
        <span v-if="selectedSent.flag.alsoVariety" class="rounded bg-amber-500/15 px-1.5 py-0.5 text-amber-300">+ variety</span>
        <span v-if="selectedSent.flag.voiceClass === 'signature'" class="rounded bg-emerald-500/15 px-1.5 py-0.5 text-emerald-300">signature · keep</span>
        <span v-else-if="selectedSent.flag.voiceClass === 'monotone'" class="rounded bg-red-500/20 px-1.5 py-0.5 text-red-300">monotone · recast</span>
        <button class="ml-auto text-muted-foreground hover:text-foreground" @click="selectedId = null">close ✕</button>
      </div>
      <p class="mb-1 text-sm"><span class="text-muted-foreground">original:</span> {{ selectedSent.t }}</p>
      <p v-if="selectedSent.flag.recast && choiceCh(selectedSent.flag) !== 'custom'" class="mb-2 text-sm"><span class="text-emerald-500/80">suggested:</span> <span class="text-muted-foreground/60">{{ leadShown(selectedSent.flag) }}</span><span class="text-emerald-300">{{ selectedSent.flag.recast }}</span></p>
      <p v-else-if="!selectedSent.flag.recast && choiceCh(selectedSent.flag) !== 'custom'" class="mb-2 text-xs italic text-muted-foreground/60">no suggestion — this opener reads as a deliberate beat. Keep it or write your own.</p>
      <textarea v-if="choiceCh(selectedSent.flag) === 'custom'" v-model="selectedSent.flag.editText" @input="autosaveCh(selectedSent.page)"
                placeholder="your rewrite — a varied opener for this sentence…" class="mb-2 w-full rounded border bg-background p-2 text-sm" rows="2" />
      <div class="flex flex-wrap gap-1">
        <Button size="sm" :variant="choiceCh(selectedSent.flag) === 'recast' ? 'default' : 'outline'" :disabled="selectedSent.flag.recast == null"
                :title="selectedSent.flag.recast == null ? 'no suggestion' : 'use: ' + selectedSent.flag.recast" @click="pickCh(selectedSent, 'recast')">use suggestion</Button>
        <Button size="sm" :variant="choiceCh(selectedSent.flag) === 'keep' ? 'default' : 'outline'" @click="pickCh(selectedSent, 'keep')">keep original</Button>
        <Button size="sm" :variant="choiceCh(selectedSent.flag) === 'custom' ? 'default' : 'outline'" @click="pickCh(selectedSent, 'custom')">edit</Button>
      </div>
    </div>

    <div v-if="data" class="sticky bottom-0 mt-6 flex items-center gap-3 border-t bg-background/90 py-3 text-xs backdrop-blur">
      <span class="text-muted-foreground">book: {{ data.counts.kept }} kept · {{ data.counts.changed }} recast · {{ data.counts.pending }} pending of {{ data.counts.total }}</span>
      <span class="ml-auto text-muted-foreground">{{ saving ? 'saving…' : savedMsg ? 'saved ✓' : 'choices save automatically' }}</span>
    </div>
  </div>
</template>
