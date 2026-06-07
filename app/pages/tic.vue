<script setup lang="ts">
// Tic review — the negation-correction fragment ("Not defeated. Just thinking.") is a
// whole-BOOK frequency tic, so this view is grouped by sub-shape across the book rather
// than page by page: you feel the metronome and thin it. Each row = one whole unit
// (prev sentence + the fragment[s]). Decide keep / cut / vary / merge / your own edit.
// Storage stays page-partitioned (tic-page-NN.json) — decisions autosave through the
// normal per-page /api/deai/decisions endpoint (mode=tic). Nothing touches Drive here;
// applying accepted changes is the separate, gated `apply-fixes.mjs --tic --apply` step.
import { Button } from '~/components/ui/button'

type Decision = 'pending' | 'accept' | 'reject' | 'edit'
interface Row {
  id: string; page: number; tell: string; span: string; context?: string; after?: string
  inDialogue?: boolean; cluster?: number; why?: string; voiceClass?: 'concrete' | 'abstract' | null
  alts?: { cut?: string | null; merge?: string | null; vary?: string | null }
  decision?: Decision; editText?: string; editFull?: boolean
}
type GroupKey = 'single' | 'twobeat' | 'anaphora' | 'dialogue'
interface Tally { total: number; pending: number; kept: number; changed: number }
interface Resp { counts: Record<'all' | GroupKey, Tally>; groups: Record<GroupKey, Row[]> }

const data = ref<Resp | null>(null)
const loading = ref(false)
const saving = ref(false)
const savedMsg = ref('')
const tab = ref<GroupKey>('single')
const hideDecided = ref(false)
// rows the author has explicitly put into free-edit mode. Tracked separately so a custom
// edit that happens to match a canned alt (cut/vary/merge) can't get misread as that alt
// and trap the textarea closed. Survives only for the session; on reload choice() falls
// back to inferring from editText, which is correct for any text that isn't a canned alt.
const customEditing = reactive(new Set<string>())

const TABS: { key: GroupKey; label: string }[] = [
  { key: 'single', label: 'single-beat' },
  { key: 'twobeat', label: 'two-beat' },
  { key: 'anaphora', label: 'anaphora' },
  { key: 'dialogue', label: 'dialogue · parked' },
]

async function load() {
  loading.value = true
  try {
    data.value = await $fetch<Resp>('/api/deai/tic')
    for (const k of Object.keys(data.value.groups) as GroupKey[])
      for (const r of data.value.groups[k]) r.decision ??= 'pending'
  } finally {
    loading.value = false
  }
}
onMounted(load)

const rows = computed<Row[]>(() => {
  if (!data.value) return []
  const rs = data.value.groups[tab.value] ?? []
  return hideDecided.value ? rs.filter(r => (r.decision ?? 'pending') === 'pending') : rs
})

// counts recomputed client-side from the (mutated) rows so tabs + footer stay live
function tally(rs: Row[]): Tally {
  return {
    total: rs.length,
    pending: rs.filter(r => (r.decision ?? 'pending') === 'pending').length,
    kept: rs.filter(r => r.decision === 'reject').length,
    changed: rs.filter(r => r.decision === 'accept' || r.decision === 'edit').length,
  }
}
const counts = computed(() => {
  const g = data.value?.groups
  const empty = { total: 0, pending: 0, kept: 0, changed: 0 }
  if (!g) return { all: empty, single: empty, twobeat: empty, anaphora: empty, dialogue: empty }
  const all = (Object.values(g) as Row[][]).flat()
  return {
    all: tally(all), single: tally(g.single), twobeat: tally(g.twobeat),
    anaphora: tally(g.anaphora), dialogue: tally(g.dialogue),
  }
})

// which choice a row currently reflects (for button highlighting)
function choice(r: Row): 'keep' | 'cut' | 'merge' | 'vary' | 'custom' | null {
  if (r.decision === 'reject') return 'keep'
  if (r.decision !== 'edit') return null
  if (customEditing.has(r.id)) return 'custom' // explicit free-edit wins over text inference
  const t = r.editText ?? ''
  if (r.alts?.cut != null && t === r.alts.cut) return 'cut'
  if (r.alts?.merge != null && t === r.alts.merge) return 'merge'
  if (r.alts?.vary != null && t === r.alts.vary) return 'vary'
  return 'custom'
}

function pick(r: Row, kind: 'keep' | 'cut' | 'merge' | 'vary' | 'custom') {
  if (kind === 'custom') {
    // free-edit covers the WHOLE unit, landing included — seed with span + the landing so
    // you can reshape "…wide. Deep." into one sentence. editFull tells apply-fixes to find
    // span + after (not span alone). Keep any non-empty text already in the box.
    r.decision = 'edit'
    if (r.editText == null || r.editText === '') r.editText = fullUnit(r)
    r.editFull = !!r.after
    customEditing.add(r.id)
    autosave(r.page)
    return
  }
  customEditing.delete(r.id)
  r.editFull = false // cut/vary/merge replace the span only; the landing stays untouched
  if (kind === 'keep') { r.decision = 'reject'; r.editText = undefined }
  else if (kind === 'cut') { r.decision = 'edit'; r.editText = r.alts?.cut ?? '' }
  else if (kind === 'merge') { r.decision = 'edit'; r.editText = r.alts?.merge ?? '' }
  else if (kind === 'vary') { r.decision = 'edit'; r.editText = r.alts?.vary ?? '' }
  autosave(r.page)
}

// bulk: keep every still-pending concrete (your-voice) unit in the current view at once
function keepAllConcrete() {
  for (const r of rows.value) {
    if (r.voiceClass === 'concrete' && (r.decision ?? 'pending') === 'pending') {
      r.decision = 'reject'; r.editText = undefined; dirtyPages.add(r.page)
    }
  }
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(flush, 300)
}
const pendingConcrete = computed(() =>
  rows.value.filter(r => r.voiceClass === 'concrete' && (r.decision ?? 'pending') === 'pending').length)

// the negation fragment within a unit = the span minus its prev-sentence prefix (= cut)
function frag(r: Row): string {
  const cut = r.alts?.cut ?? ''
  return cut && r.span.startsWith(cut) ? r.span.slice(cut.length) : r.span
}
function prev(r: Row): string {
  const cut = r.alts?.cut ?? ''
  return cut && r.span.startsWith(cut) ? cut : ''
}
function result(r: Row): string {
  if (r.decision === 'edit') return r.editText ?? ''
  return r.span // keep / pending
}
// the whole displayed unit (span + the trailing landing) — what a full free-edit replaces
function fullUnit(r: Row): string {
  return r.after ? `${r.span} ${r.after}` : r.span
}

const heat = (n = 0) => n >= 8 ? 'bg-red-500/15 text-red-300' : n >= 5 ? 'bg-amber-500/15 text-amber-300' : 'bg-sky-500/10 text-sky-300'

// autosave: batch dirty rows by page, POST each affected page (decisions endpoint is per-page)
const dirtyPages = new Set<number>()
let saveTimer: ReturnType<typeof setTimeout> | null = null
function autosave(page: number) {
  savedMsg.value = ''
  dirtyPages.add(page)
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(flush, 500)
}
async function flush() {
  if (!data.value || !dirtyPages.size) return
  saving.value = true
  const all = (Object.values(data.value.groups) as Row[][]).flat()
  try {
    for (const page of [...dirtyPages]) {
      const decisions: Record<string, { decision: Decision; editText?: string; editFull?: boolean }> = {}
      for (const r of all.filter(r => r.page === page))
        decisions[r.id] = { decision: r.decision ?? 'pending', editText: r.editText, editFull: r.editFull }
      await $fetch('/api/deai/decisions', { method: 'POST', body: { page, mode: 'tic', decisions } })
      dirtyPages.delete(page)
    }
    savedMsg.value = 'saved'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-4xl px-4 py-6 font-serif">
    <div class="flex items-center gap-3 mb-1 text-sm">
      <h1 class="font-semibold">tic review</h1>
      <span class="text-muted-foreground">negation-correction fragment</span>
      <NuxtLink to="/deai" class="ml-auto text-xs text-muted-foreground underline">→ de-AI / brogue</NuxtLink>
    </div>
    <p class="text-xs text-muted-foreground mb-4">
      A whole-book frequency tic — judge the rhythm, not the line. Most stay.
      <b>keep</b> = leave as written · <b>cut</b> = drop the fragment, keep the prior sentence ·
      <b>vary/merge</b> = in-voice rewrite (filled by the suggestion pass) · <b>edit</b> = your own.
    </p>

    <div v-if="loading" class="text-muted-foreground text-sm">loading…</div>

    <div v-else-if="data">
      <!-- group tabs -->
      <div class="flex flex-wrap items-center gap-1 mb-3 text-xs">
        <button v-for="t in TABS" :key="t.key"
                class="rounded border px-2.5 py-1"
                :class="tab === t.key ? 'bg-foreground text-background' : 'text-muted-foreground'"
                @click="tab = t.key">
          {{ t.label }}
          <span class="opacity-70">{{ counts[t.key].total }}</span>
          <span v-if="counts[t.key].pending" class="ml-1 rounded bg-sky-500/20 px-1">{{ counts[t.key].pending }} left</span>
        </button>
        <button v-if="pendingConcrete" class="ml-auto rounded border border-emerald-500/40 text-emerald-400 px-2 py-1"
                @click="keepAllConcrete">keep all {{ pendingConcrete }} your-voice</button>
        <label class="flex items-center gap-1 text-muted-foreground" :class="{ 'ml-auto': !pendingConcrete }">
          <input type="checkbox" v-model="hideDecided" /> hide decided
        </label>
      </div>

      <div v-if="tab === 'dialogue'" class="mb-3 rounded border border-dashed p-3 text-xs text-muted-foreground">
        These sit inside character dialogue — voice, not narration, and brogue's turf.
        They default to <b>keep</b>; thin one only if it genuinely reads as a tic in speech.
      </div>

      <!-- rows -->
      <div class="space-y-2">
        <div v-if="!rows.length" class="rounded border border-dashed p-6 text-sm text-muted-foreground text-center">
          nothing here {{ hideDecided ? '— all decided in this group' : '' }}
        </div>

        <div v-for="r in rows" :key="r.id"
             class="rounded-lg border p-3 text-sm"
             :class="(r.decision && r.decision !== 'pending') ? 'opacity-70' : ''">
          <div class="flex items-center gap-2 mb-1.5 text-xs">
            <span class="rounded px-1.5 py-0.5 font-mono" :class="heat(r.cluster)"
                  :title="`${r.cluster} instances within ±4 pages`">p{{ r.page }} · ×{{ r.cluster }}</span>
            <span class="text-muted-foreground">{{ r.tell.replace('neg-', '') }}</span>
            <span v-if="r.voiceClass === 'abstract'" class="rounded bg-red-500/20 text-red-300 px-1.5 py-0.5"
                  title="dissolves into abstraction / explains — the tic">tic · dissolves</span>
            <span v-else-if="r.voiceClass === 'concrete'" class="rounded bg-emerald-500/15 text-emerald-300 px-1.5 py-0.5"
                  title="lands on a concrete chosen detail — your signature reversal (VOICE.md)">your voice · lands</span>
            <span v-if="choice(r) === 'keep'" class="ml-auto text-muted-foreground">kept</span>
            <span v-else-if="r.decision === 'edit'" class="ml-auto text-emerald-400">changed</span>
            <span v-else class="ml-auto text-sky-400">pending</span>
          </div>

          <!-- the unit: prev muted · the fragment(s) emphasized · the concrete LANDING muted -->
          <p class="leading-relaxed mb-2">
            <span class="text-muted-foreground/70">{{ prev(r) }}</span><span class="font-semibold text-foreground bg-amber-500/15 rounded px-0.5">{{ frag(r) }}</span><span v-if="r.after" class="text-muted-foreground/70"> {{ r.after }}</span>
          </p>

          <!-- result preview when changed: replacement + (for span-only edits) the landing
               that still follows it. A full free-edit (editFull) already contains the landing,
               so don't append it again. -->
          <p v-if="r.decision === 'edit'" class="mb-2 text-xs">
            <span class="text-muted-foreground">→ </span>
            <span v-if="(r.editText ?? '').trim()" class="text-emerald-400">{{ result(r) }}</span>
            <span v-else class="text-amber-400 italic">(whole unit deleted)</span>
            <!-- a custom edit IS the whole result — only the canned picks keep the landing -->
            <span v-if="r.after && choice(r) !== 'custom'" class="text-muted-foreground/60"> {{ r.after }}</span>
          </p>

          <textarea v-if="choice(r) === 'custom'" v-model="r.editText" @input="autosave(r.page)"
                    placeholder="your replacement for the whole unit…"
                    class="w-full rounded border bg-background p-2 mb-2 text-sm" rows="2" />

          <div class="flex flex-wrap gap-1">
            <Button size="sm" :variant="choice(r) === 'keep' ? 'default' : 'outline'" @click="pick(r, 'keep')">keep</Button>
            <Button size="sm" :variant="choice(r) === 'cut' ? 'default' : 'outline'" @click="pick(r, 'cut')"
                    :disabled="r.alts?.cut == null" :title="r.alts?.cut == null ? 'no clean cut (fragment opens the paragraph)' : ''">cut</Button>
            <Button v-if="r.alts?.vary != null" size="sm" :variant="choice(r) === 'vary' ? 'default' : 'outline'" @click="pick(r, 'vary')">vary</Button>
            <Button v-if="r.alts?.merge != null" size="sm" :variant="choice(r) === 'merge' ? 'default' : 'outline'" @click="pick(r, 'merge')">merge</Button>
            <Button size="sm" :variant="choice(r) === 'custom' ? 'default' : 'outline'" @click="pick(r, 'custom')">edit</Button>
          </div>
        </div>
      </div>
    </div>

    <!-- footer -->
    <div v-if="data" class="sticky bottom-0 mt-6 flex items-center gap-3 border-t bg-background/90 py-3 text-xs backdrop-blur">
      <span class="text-muted-foreground">
        book: {{ counts.all.kept }} kept · {{ counts.all.changed }} changed · {{ counts.all.pending }} pending of {{ counts.all.total }}
      </span>
      <span class="ml-auto text-muted-foreground">{{ saving ? 'saving…' : savedMsg ? 'saved ✓' : 'choices save automatically' }}</span>
    </div>
  </div>
</template>
