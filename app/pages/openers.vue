<script setup lang="ts">
// Opener-variety review — sentence openers are a structural, whole-BOOK pattern, so
// this view is grouped by CHAPTER and by RUN (a stretch of same-class openers). Each
// run shows its opener-code strip lit up (S S S S = the bare subject-led monoculture)
// so you SEE the monotony; you then recast one or two openers to break it. Most rows
// stay — varying every line is its own tell. Storage is page-partitioned
// (openers-page-NN.json); decisions autosave through /api/deai/decisions (mode=openers).
// Nothing here touches Drive — applying is the gated `apply-fixes.mjs --openers --apply`.
import { Button } from '~/components/ui/button'

type Decision = 'pending' | 'accept' | 'reject' | 'edit'
interface Row {
  id: string; page: number; code?: string; opener?: string; span: string; lead?: string
  unique?: boolean; runId?: string; runLen?: number; runCodes?: string; runPos?: number
  alsoVariety?: boolean; why?: string; voiceClass?: string | null
  alts?: { recast?: string | null }; decision?: Decision; editText?: string
}
interface Run { runId: string; page: number; chapter: string; code: string; runLen: number; runCodes: string; context: string; rows: Row[] }
interface ChapterStat { chapter: string; runs: number; flags: number; total: number; pending: number; kept: number; changed: number }
interface Summary { sentences: number; totals: Record<string, number>; chapters: { chapter: string; total: number; codes: Record<string, number>; pctS: number; overBudget: boolean }[] }
interface Resp { counts: { total: number; pending: number; kept: number; changed: number }; chapters: ChapterStat[]; runs: Run[]; summary: Summary | null; summaryMtime: string | null }

const CLASS_LABEL: Record<string, string> = { S: 'subject-led', P: 'prepositional', G: 'participial', A: 'adverbial', C: 'subordinate', J: 'conjunction', I: 'inversion', D: 'dialogue', F: 'fragment' }
const isVaried = (c: string) => c !== 'S'
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
function leadShown(r: Row): string { return r.unique === false && r.lead ? r.lead + ' ' : '' }

// bulk: keep every still-pending row in the active chapter (the deliberate-punch S-runs)
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

// the distribution bar is a SNAPSHOT from the last classify.mjs run — it does NOT reflect
// pending UI decisions. Label it with the summary file's mtime so that's unambiguous.
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

// whole-book distribution bar (from the measurement summary)
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
    <p class="text-xs text-muted-foreground mb-3">
      A structural, whole-book pattern. <b>keep</b> = leave it (a bare-subject run during action/revelation is deliberate punch) ·
      <b>use suggestion</b> = accept the in-voice rewrite shown below the sentence · <b>edit</b> = write your own.
      Suggestions are generated per chapter — a chapter without them shows “no suggestion yet”; ask Claude to run the suggestion pass on it.
      Vary one or two openers per run — never all of them.
    </p>

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
        <span>snapshot from last <span class="font-mono">classify.mjs</span><span v-if="measured"> · measured {{ measured }}</span> — does not reflect pending decisions; re-run sync + classify to refresh</span>
        <button class="ml-auto rounded border px-2 py-0.5 hover:bg-muted" :disabled="loading" @click="load">{{ loading ? 'refreshing…' : 'refresh' }}</button>
      </div>
    </div>

    <div v-if="loading" class="text-muted-foreground text-sm">loading…</div>

    <div v-else-if="data" class="flex gap-4">
      <!-- chapter rail -->
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

      <!-- runs in the active chapter -->
      <div class="min-w-0 flex-1">
        <div class="mb-3 flex items-center gap-2 text-xs">
          <h2 class="font-semibold">{{ activeChapter }}</h2>
          <button class="ml-auto rounded border px-2 py-1 text-emerald-400 border-emerald-500/40" @click="keepRest">keep all pending here</button>
          <label class="flex items-center gap-1 text-muted-foreground"><input type="checkbox" v-model="hideDecided" /> hide decided</label>
        </div>

        <div v-if="!runs.length" class="rounded border border-dashed p-6 text-center text-sm text-muted-foreground">
          nothing pending in this chapter
        </div>

        <div v-for="run in runs" :key="run.runId" class="mb-4 rounded-lg border p-3">
          <!-- run meta + the opener-code strip (the visual monotony) -->
          <div class="mb-2 flex flex-wrap items-center gap-2 text-xs">
            <span class="rounded bg-red-500/15 px-1.5 py-0.5 font-mono text-red-300">p{{ run.page }} · {{ run.runLen }}×{{ run.code }}</span>
            <span class="text-muted-foreground">{{ run.runLen }} {{ CLASS_LABEL[run.code] }} openers in a row</span>
            <span class="flex gap-0.5 font-mono">
              <span v-for="(c, i) in run.runCodes.split(' ')" :key="i" class="rounded px-1" :class="chip(c)">{{ c }}</span>
            </span>
          </div>

          <!-- the run prose, for reading -->
          <p class="mb-3 border-l-2 border-muted pl-2 text-sm leading-relaxed text-muted-foreground/80">{{ run.context }}</p>

          <!-- one actionable row per repeated opener (run position 0 is context only) -->
          <div class="space-y-2">
            <div v-for="r in run.rows" :key="r.id" class="rounded border p-2 text-sm"
                 :class="(r.decision && r.decision !== 'pending') ? 'opacity-70' : ''">
              <div class="mb-1 flex items-center gap-2 text-xs">
                <span class="rounded px-1.5 py-0.5 font-mono" :class="chip(r.code)">{{ r.code }}</span>
                <span class="text-muted-foreground">opens “{{ r.opener }}…”</span>
                <span v-if="r.alsoVariety" class="rounded bg-amber-500/15 px-1.5 py-0.5 text-amber-300" title="same first WORD repeats too — /variety also owns this">+ variety</span>
                <span v-if="r.voiceClass === 'signature'" class="rounded bg-emerald-500/15 px-1.5 py-0.5 text-emerald-300" title="deliberate subject-led punch — keep (VOICE.md)">signature</span>
                <span v-else-if="r.voiceClass === 'monotone'" class="rounded bg-red-500/20 px-1.5 py-0.5 text-red-300" title="flat repetition — recast candidate">monotone</span>
                <span class="ml-auto" :class="choice(r) === 'keep' ? 'text-muted-foreground' : r.decision === 'edit' ? 'text-emerald-400' : 'text-sky-400'">
                  {{ choice(r) === 'keep' ? 'kept' : r.decision === 'edit' ? 'recast' : 'pending' }}
                </span>
              </div>

              <p class="mb-1.5 leading-relaxed"><span class="font-semibold bg-amber-500/10 rounded px-0.5">{{ r.span }}</span></p>

              <!-- the in-voice SUGGESTION, shown inline so you can read it before deciding -->
              <p v-if="r.alts?.recast && choice(r) !== 'custom'" class="mb-1.5 rounded bg-emerald-500/5 px-2 py-1 text-xs">
                <span class="text-emerald-500/80">suggested →</span> <span class="text-muted-foreground/60">{{ leadShown(r) }}</span><span class="text-emerald-300">{{ r.alts.recast }}</span>
              </p>
              <p v-else-if="r.voiceClass === 'signature' && choice(r) !== 'custom'" class="mb-1.5 text-xs italic text-emerald-500/70">
                recommendation: keep — this opener is doing real work (deliberate subject-led beat); varying it would hurt the rhythm.
              </p>
              <p v-else-if="!r.alts?.recast && choice(r) !== 'custom'" class="mb-1.5 text-xs italic text-muted-foreground/60">
                no suggestion generated for this chapter yet — keep it, write your own, or ask Claude to run the suggestion pass on this chapter.
              </p>

              <!-- custom edit preview + box -->
              <p v-if="choice(r) === 'custom'" class="mb-1.5 text-xs">
                <span class="text-muted-foreground">your edit → </span><span class="text-muted-foreground/60">{{ leadShown(r) }}</span><span class="text-emerald-400">{{ r.editText || '(empty)' }}</span>
              </p>
              <textarea v-if="choice(r) === 'custom'" v-model="r.editText" @input="autosave(r.page)"
                        placeholder="your rewrite — a varied opener for this sentence…"
                        class="mb-1.5 w-full rounded border bg-background p-2 text-sm" rows="2" />

              <div class="flex flex-wrap gap-1">
                <Button size="sm" :variant="choice(r) === 'keep' ? 'default' : 'outline'" @click="pick(r, 'keep')">keep</Button>
                <Button size="sm" :variant="choice(r) === 'recast' ? 'default' : 'outline'" @click="pick(r, 'recast')"
                        :disabled="r.alts?.recast == null" :title="r.alts?.recast == null ? 'no suggestion yet — ask Claude to run the suggestion pass on this chapter' : 'use: ' + r.alts.recast">use suggestion</Button>
                <Button size="sm" :variant="choice(r) === 'custom' ? 'default' : 'outline'" @click="pick(r, 'custom')">edit</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="data" class="sticky bottom-0 mt-6 flex items-center gap-3 border-t bg-background/90 py-3 text-xs backdrop-blur">
      <span class="text-muted-foreground">book: {{ data.counts.kept }} kept · {{ data.counts.changed }} recast · {{ data.counts.pending }} pending of {{ data.counts.total }}</span>
      <span class="ml-auto text-muted-foreground">{{ saving ? 'saving…' : savedMsg ? 'saved ✓' : 'choices save automatically' }}</span>
    </div>
  </div>
</template>
