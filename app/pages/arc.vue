<script setup lang="ts">
// HIBERNO-ARC review. The headline is the gradient chart: William & co.'s measured
// Americanization (baseline staircase + slip dips) across the book vs the target
// band, so the immigrant-becomes-American arc is legible at a glance. Below it, the
// deviation table (filter by act / verdict / speaker) with queue/dismiss decisions.
// Diagnostic only — actual line rewrites flow through the brogue apply pipeline.
import { Button } from '~/components/ui/button'

interface Fix { id: string; find: string; replace: string; note: string; decision?: string; editText?: string }
interface Line {
  id: string; bucket: string; chunk: string; line: number; speaker: string
  am: number; verdict: string; markers: string[]; slipLicense: string | null
  emotional?: boolean; addresseeIrish?: string; note: string; fixDirection: string
  span: string; decision?: string; reviewNote?: string; fixes?: Fix[]; scoreable?: boolean
}
interface BucketRow {
  bucket: string; label: string; target: number; baselineMeasured: number | null
  slipMeasured: number | null; nLines: number; nSlips: number; nDeviations: number; arcVerdict: string
}
interface Chapter { chunk: string; label: string; act: string; baselineAm: number | null; slipAm: number | null; n: number; deviations: number }
interface Arc { ready: boolean; buckets: BucketRow[]; chapters: Chapter[]; verdictCounts: Record<string, number>; totalLines: number; lines: Line[] }

const data = ref<Arc | null>(null)
const loading = ref(true)
async function load() {
  loading.value = true
  try { data.value = await $fetch<Arc>('/api/arc') } finally { loading.value = false }
}
onMounted(load)

const TARGET_BY_ACT: Record<string, number> = { Act1: 0, Act2: 33, Act3: 66, Act4: 80, Act5: 92, Frame: 92 }
const ACT_COLOR: Record<string, string> = {
  Act1: '#22c55e', Act2: '#84cc16', Act3: '#eab308', Act4: '#f97316', Act5: '#ef4444', Frame: '#8b5cf6',
}

// ---- chart geometry --------------------------------------------------------
const W = 920, H = 300, PAD_L = 40, PAD_R = 16, PAD_T = 16, PAD_B = 64
const plotW = W - PAD_L - PAD_R, plotH = H - PAD_T - PAD_B
const yPix = (am: number) => PAD_T + ((100 - am) / 100) * plotH // Am 100 (American) at top
const chaptersNarrative = computed(() => data.value?.chapters ?? [])
const xPix = (i: number) => {
  const n = chaptersNarrative.value.length
  return PAD_L + (n <= 1 ? 0 : (i / (n - 1)) * plotW)
}
// target staircase (per chapter act) and measured baseline polyline points
const targetPts = computed(() => chaptersNarrative.value.map((c, i) => `${xPix(i)},${yPix(TARGET_BY_ACT[c.act] ?? 92)}`).join(' '))
const baselinePts = computed(() =>
  chaptersNarrative.value.map((c, i) => c.baselineAm == null ? null : `${xPix(i)},${yPix(c.baselineAm)}`).filter(Boolean).join(' '))
const slipPts = computed(() =>
  chaptersNarrative.value.map((c, i) => c.slipAm == null ? null : { x: xPix(i), y: yPix(c.slipAm), c }).filter(Boolean) as any[])
const baseDots = computed(() =>
  chaptersNarrative.value.map((c, i) => c.baselineAm == null ? null : { x: xPix(i), y: yPix(c.baselineAm), c }).filter(Boolean) as any[])

// ---- filters + table -------------------------------------------------------
const fBucket = ref('all'); const fVerdict = ref('all'); const fSpeaker = ref('all'); const fChapter = ref('all')
const hideDone = ref(false); const devOnly = ref(true)
const speakers = computed(() => ['all', ...Array.from(new Set((data.value?.lines ?? []).filter(l => l.scoreable !== false).map(l => l.speaker))).sort()])
const verdicts = computed(() => ['all', ...Object.keys(data.value?.verdictCounts ?? {})])
// when a single chapter is pinned, drop devOnly so the whole chapter (good lines
// included) is visible — that is the point of inspecting one chapter.
const rows = computed(() => (data.value?.lines ?? []).filter(l =>
  l.scoreable !== false && // bare names / one-word replies / numbers are not scored
  ((fChapter.value !== 'all') || !devOnly.value || (l.verdict !== 'ON-TARGET' && l.verdict !== 'CATCHPHRASE') || (l.fixes && l.fixes.length > 0)) &&
  (fChapter.value === 'all' || l.chunk === fChapter.value) &&
  (fBucket.value === 'all' || l.bucket === fBucket.value) &&
  (fVerdict.value === 'all' || l.verdict === fVerdict.value) &&
  (fSpeaker.value === 'all' || l.speaker === fSpeaker.value) &&
  (!hideDone.value || !lineResolved(l))))

const verdictColor: Record<string, string> = {
  'OVER-IRISH': 'text-amber-400', 'UNDER-IRISH': 'text-sky-400', 'MISSED-SLIP': 'text-red-400',
  'OVER-SLIP': 'text-fuchsia-400', 'ON-TARGET': 'text-emerald-400', 'CATCHPHRASE': 'text-violet-400',
}

// ---- ONE decision per line ------------------------------------------------
// A line carrying a crafted fix is decided BY the fix (accept/reject/edit) — the
// line-level needs-fix/dismiss buttons would be a second, conflicting mechanism,
// so they only show for lines with no suggestion yet (pure triage: ask for a fix
// vs leave as-is). A line is "resolved" (dim + hideable) once that single control
// has been used: every fix decided, or — when there are none — an explicit dismiss.
const hasFixes = (l: Line) => !!(l.fixes && l.fixes.length)
function lineResolved(l: Line) {
  if (hasFixes(l)) return l.fixes!.every(fx => (fx.decision ?? 'pending') !== 'pending')
  return (l.decision ?? 'pending') === 'dismiss'
}

let saveTimer: ReturnType<typeof setTimeout> | null = null
function setDecision(l: Line, d: string) {
  l.decision = l.decision === d ? 'pending' : d
  queueSave()
}
function setFixDecision(fx: Fix, d: string) {
  fx.decision = fx.decision === d ? 'pending' : d
  if (d === 'edit' && fx.editText == null) fx.editText = fx.replace
  queueSave()
}
function queueSave() {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(save, 400)
}
const savedMsg = ref('')
async function save() {
  if (!data.value) return
  const decisions: Record<string, any> = {}
  for (const l of data.value.lines) {
    decisions[l.id] = { decision: l.decision ?? 'pending', note: l.reviewNote }
    for (const fx of l.fixes ?? []) decisions[fx.id] = { decision: fx.decision ?? 'pending', editText: fx.editText }
  }
  await $fetch('/api/arc/decisions', { method: 'POST', body: { decisions } })
  savedMsg.value = 'saved ✓'
}

// ---- fixes + Drive apply ---------------------------------------------------
const allFixes = computed(() => (data.value?.lines ?? []).flatMap(l => (l.fixes ?? []).map(fx => ({ fx, l }))))
const acceptedCount = computed(() => allFixes.value.filter(({ fx }) => fx.decision === 'accept' || fx.decision === 'edit').length)
const applyBusy = ref(false)
const applyOut = ref('')
async function runApply(apply: boolean, commit = false) {
  applyBusy.value = true; applyOut.value = ''
  try {
    const r = await $fetch<{ output: string; ok: boolean; applied: boolean }>('/api/arc/apply', { method: 'POST', body: { apply, commit } })
    applyOut.value = r.output || (r.ok ? 'done' : 'error')
    if (apply) await load()
  } finally { applyBusy.value = false }
}
</script>

<template>
  <div class="mx-auto max-w-5xl px-4 py-6 font-serif">
    <div class="flex items-baseline gap-3 mb-1">
      <h1 class="text-lg font-semibold">Hiberno-Arc</h1>
      <span class="text-sm text-muted-foreground">Americanization gradient — does the immigrant's voice erode (with slips) the way the book intends?</span>
    </div>

    <div v-if="loading" class="text-sm text-muted-foreground py-10">loading…</div>
    <div v-else-if="!data?.ready" class="rounded border border-dashed p-6 text-sm text-muted-foreground">
      No data yet. Run the scan, then <code>node scripts/hiberno-collate.mjs</code>.
    </div>

    <template v-else>
      <!-- ===== gradient chart ===== -->
      <div class="rounded-lg border p-3 mb-5 bg-card">
        <svg :viewBox="`0 0 ${W} ${H}`" class="w-full">
          <!-- y gridlines / labels -->
          <g v-for="g in [0,25,50,75,100]" :key="g">
            <line :x1="PAD_L" :x2="W-PAD_R" :y1="yPix(g)" :y2="yPix(g)" stroke="currentColor" stroke-opacity="0.08" />
            <text :x="PAD_L-6" :y="yPix(g)+3" text-anchor="end" font-size="9" fill="currentColor" opacity="0.4">{{ g }}</text>
          </g>
          <text :x="12" :y="PAD_T+8" font-size="9" fill="currentColor" opacity="0.5">American →</text>
          <text :x="12" :y="H-PAD_B-2" font-size="9" fill="currentColor" opacity="0.5">Irish</text>
          <!-- target staircase -->
          <polyline :points="targetPts" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4" opacity="0.7" />
          <!-- measured baseline -->
          <polyline :points="baselinePts" fill="none" stroke="#0ea5e9" stroke-width="2" />
          <circle v-for="(d,i) in baseDots" :key="'b'+i" :cx="d.x" :cy="d.y" r="2.5" fill="#0ea5e9" />
          <!-- slip dips -->
          <circle v-for="(d,i) in slipPts" :key="'s'+i" :cx="d.x" :cy="d.y" r="3" fill="#f43f5e" stroke="white" stroke-width="0.5" />
          <!-- x labels (every other chapter to avoid crowding) -->
          <g v-for="(c,i) in chaptersNarrative" :key="'x'+i">
            <text v-if="i % 2 === 0" :x="xPix(i)" :y="H-PAD_B+14" text-anchor="end" font-size="8"
                  :fill="ACT_COLOR[c.act]" transform-origin="center"
                  :transform="`rotate(-45 ${xPix(i)} ${H-PAD_B+14})`">{{ c.label }}</text>
          </g>
        </svg>
        <div class="flex flex-wrap gap-4 text-xs text-muted-foreground mt-1 px-2">
          <span><span class="inline-block w-4 border-t-2 border-dashed border-slate-500 align-middle"></span> target band</span>
          <span><span class="inline-block w-4 border-t-2 border-sky-500 align-middle"></span> measured baseline</span>
          <span><span class="inline-block w-2 h-2 rounded-full bg-rose-500 align-middle"></span> slip (emotional / with Irish)</span>
        </div>
      </div>

      <!-- ===== per-bucket summary ===== -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mb-6">
        <div v-for="b in data.buckets" :key="b.bucket" class="rounded-lg border p-3 text-sm">
          <div class="flex items-center justify-between mb-1">
            <span class="font-medium" :style="{ color: ACT_COLOR[b.bucket.replace(/[ab]$/,'')] }">{{ b.label }}</span>
            <span class="text-xs text-muted-foreground">{{ b.nLines }} lines</span>
          </div>
          <div class="flex items-baseline gap-2 mb-1">
            <span class="text-2xl font-semibold tabular-nums">{{ b.baselineMeasured ?? '—' }}</span>
            <span class="text-xs text-muted-foreground">/ target {{ b.target }}</span>
            <span class="text-xs ml-auto" :class="b.baselineMeasured != null && Math.abs(b.baselineMeasured-b.target) > 18 ? 'text-red-400' : 'text-emerald-400'">
              {{ b.baselineMeasured == null ? '' : (b.baselineMeasured - b.target > 0 ? '+' : '') + (b.baselineMeasured - b.target) }}
            </span>
          </div>
          <div class="text-xs text-muted-foreground mb-1">slips {{ b.slipMeasured ?? '—' }} ({{ b.nSlips }}) · {{ b.nDeviations }} deviations</div>
          <p class="text-xs text-muted-foreground/90 leading-snug">{{ b.arcVerdict }}</p>
        </div>
      </div>

      <!-- ===== Drive apply panel ===== -->
      <div class="rounded-lg border p-3 mb-5 text-sm" :class="acceptedCount ? 'border-emerald-500/40' : ''">
        <div class="flex flex-wrap items-center gap-2">
          <span class="font-medium">Apply to Drive</span>
          <span class="text-xs text-muted-foreground">{{ acceptedCount }} accepted fix(es) ready · dry-run is safe, nothing writes without “Apply”</span>
          <div class="ml-auto flex gap-1">
            <Button size="sm" variant="outline" :disabled="applyBusy" @click="runApply(false)">preview (dry-run)</Button>
            <Button size="sm" :disabled="applyBusy || !acceptedCount" @click="runApply(true, true)">Apply + commit</Button>
          </div>
        </div>
        <pre v-if="applyOut" class="mt-2 max-h-48 overflow-auto rounded bg-muted/60 p-2 text-[11px] whitespace-pre-wrap">{{ applyOut }}</pre>
      </div>

      <!-- ===== deviation table ===== -->
      <div class="flex flex-wrap items-center gap-2 mb-3 text-sm">
        <select v-model="fBucket" class="rounded border bg-background px-2 py-1 text-xs">
          <option value="all">all acts</option>
          <option v-for="b in data.buckets" :key="b.bucket" :value="b.bucket">{{ b.label }}</option>
        </select>
        <select v-model="fChapter" class="rounded border bg-background px-2 py-1 text-xs">
          <option value="all">all chapters</option>
          <option v-for="c in data.chapters" :key="c.chunk" :value="c.chunk">{{ c.label }}</option>
        </select>
        <select v-model="fVerdict" class="rounded border bg-background px-2 py-1 text-xs">
          <option v-for="v in verdicts" :key="v" :value="v">{{ v === 'all' ? 'all verdicts' : v }}</option>
        </select>
        <select v-model="fSpeaker" class="rounded border bg-background px-2 py-1 text-xs">
          <option v-for="s in speakers" :key="s" :value="s">{{ s === 'all' ? 'all speakers' : s }}</option>
        </select>
        <label class="flex items-center gap-1 text-xs text-muted-foreground"><input type="checkbox" v-model="devOnly" /> deviations + fixes only</label>
        <label class="flex items-center gap-1 text-xs text-muted-foreground"><input type="checkbox" v-model="hideDone" /> hide reviewed</label>
        <span class="ml-auto text-xs text-muted-foreground">{{ rows.length }} lines · {{ savedMsg }}</span>
      </div>

      <div class="space-y-2">
        <div v-for="l in rows" :key="l.id"
             class="rounded-lg border p-3 text-sm" :class="lineResolved(l) ? 'opacity-55' : ''">
          <div class="flex items-center gap-2 mb-1 text-xs">
            <span class="font-semibold" :class="verdictColor[l.verdict]">{{ l.verdict }}</span>
            <span class="text-muted-foreground">{{ l.speaker }}</span>
            <span class="text-muted-foreground">· {{ l.label || l.chunk }} · L{{ l.line }}</span>
            <span v-if="l.slipLicense" class="rounded bg-rose-500/15 text-rose-300 px-1.5 py-0.5">slip {{ l.slipLicense }}</span>
            <span class="ml-auto rounded bg-muted px-1.5 py-0.5 tabular-nums" title="Americanization 0=Irish 100=American">Am {{ l.am }}</span>
          </div>
          <p class="text-foreground/90 mb-1">“{{ l.span }}”</p>
          <p class="text-xs text-muted-foreground"><b>why:</b> {{ l.note }}</p>
          <p v-if="l.fixDirection && !(l.fixes && l.fixes.length)" class="text-xs text-amber-300/90 mb-2"><b>direction:</b> {{ l.fixDirection }}</p>

          <!-- crafted fixes (the actual rewrite) — accept/reject/edit + apply from here -->
          <div v-for="fx in l.fixes || []" :key="fx.id" class="rounded border border-emerald-500/30 bg-emerald-500/5 p-2 my-2">
            <div class="text-xs grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 mb-1">
              <span class="text-muted-foreground">find</span><code class="text-red-400/90">{{ fx.find }}</code>
              <span class="text-muted-foreground">{{ fx.decision === 'edit' ? 'your edit' : 'fix' }}</span>
              <code class="text-emerald-400">{{ fx.decision === 'edit' ? (fx.editText ?? fx.replace) : fx.replace }}</code>
            </div>
            <p class="text-xs text-muted-foreground mb-2">{{ fx.note }}</p>
            <textarea v-if="fx.decision === 'edit'" v-model="fx.editText" @input="queueSave"
                      class="w-full rounded border bg-background p-2 mb-2 text-sm" rows="2" />
            <div class="flex gap-1">
              <Button size="sm" :variant="fx.decision === 'accept' ? 'default' : 'outline'" @click="setFixDecision(fx, 'accept')">accept</Button>
              <Button size="sm" :variant="fx.decision === 'reject' ? 'default' : 'outline'" @click="setFixDecision(fx, 'reject')">reject</Button>
              <Button size="sm" :variant="fx.decision === 'edit' ? 'default' : 'outline'" @click="setFixDecision(fx, 'edit')">edit</Button>
            </div>
          </div>

          <!-- triage controls only when there is no crafted fix to decide on;
               once a fix exists, accept/reject/edit above is the single mechanism -->
          <div v-if="!hasFixes(l)" class="flex gap-1">
            <Button size="sm" :variant="l.decision === 'queued' ? 'default' : 'outline'" @click="setDecision(l, 'queued')">needs fix</Button>
            <Button size="sm" :variant="l.decision === 'dismiss' ? 'default' : 'outline'" @click="setDecision(l, 'dismiss')">leave as-is</Button>
          </div>
        </div>
        <div v-if="!rows.length" class="rounded border border-dashed p-6 text-sm text-muted-foreground text-center">no lines match</div>
      </div>
    </template>
  </div>
</template>
