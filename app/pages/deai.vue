<script setup lang="ts">
// de-AI review page. Click through flagged spans for one manuscript page:
// spans colour-coded by severity, BOTH scores shown (Voice + Detect, never merged),
// accept / reject / edit inline. Submit persists to .deai/page-NN.json.
import { Button } from '~/components/ui/button'

interface Flag {
  id: string; tell: string; span: string; voice: number; detect: number
  why?: string; fix: string; decision?: 'pending' | 'accept' | 'reject' | 'edit'; editText?: string
  additive?: boolean
}
interface PageResp {
  page: number; total: number; text: string; detected: boolean
  chapter: string | null; pageDetect: { detect: number; burstiness?: number } | null; flags: Flag[]
}

const route = useRoute()
const router = useRouter()
const page = ref(Number(route.query.p) || 1)
// Review mode: 'deai' (AI-tell removal) or 'brogue' (Hiberno-English dialogue pass).
// Each reads/writes its own cache; switching modes never crosses decisions.
const mode = ref(route.query.mode === 'brogue' ? 'brogue' : 'deai')
const isBrogue = computed(() => mode.value === 'brogue')
const data = ref<PageResp | null>(null)
const loading = ref(false)
const saving = ref(false)
const savedMsg = ref('')

async function load() {
  loading.value = true
  savedMsg.value = ''
  try {
    data.value = await $fetch<PageResp>(`/api/deai/page/${page.value}`, { query: { mode: mode.value } })
    for (const f of data.value.flags) f.decision ??= 'pending'
    router.replace({ query: { p: String(page.value), mode: mode.value } })
  } finally {
    loading.value = false
  }
}
onMounted(load)

function go(n: number) {
  if (!data.value) return
  page.value = Math.min(Math.max(1, n), data.value.total)
  load()
}

function switchMode(m: 'deai' | 'brogue') {
  if (mode.value === m) return
  mode.value = m
  active.value = null
  load()
}

// severity bucket from the higher of the two scores (display only — scores stay separate)
function sev(f: Flag) {
  const m = Math.max(f.voice, f.detect)
  return m >= 7 ? 'high' : m >= 4 ? 'mid' : 'low'
}
const sevRing: Record<string, string> = {
  high: 'bg-red-500/20 underline decoration-red-500 decoration-2',
  mid: 'bg-amber-500/20 underline decoration-amber-500 decoration-2',
  low: 'bg-sky-500/15 underline decoration-sky-500/70 decoration-dotted',
}
const sevDot: Record<string, string> = { high: 'bg-red-500', mid: 'bg-amber-500', low: 'bg-sky-500' }
// additive 'under-felt' suggestions get their own violet treatment — they ADD, not remove
const addRing = 'bg-violet-500/20 underline decoration-violet-500 decoration-2 decoration-dotted'

const active = ref<string | null>(null)

// Build prose segments: wrap each flag's verbatim span. Each flag is located
// independently (not in array order), claiming its first occurrence that doesn't
// overlap an already-claimed span — so flags out of text order still highlight.
const segments = computed(() => {
  if (!data.value) return [] as Array<{ text: string; flag?: Flag }>
  const text = data.value.text
  const hits: Array<{ start: number; end: number; flag: Flag }> = []
  for (const f of data.value.flags) {
    let from = 0
    let i: number
    while ((i = text.indexOf(f.span, from)) !== -1) {
      const end = i + f.span.length
      if (!hits.some(h => i < h.end && end > h.start)) {
        hits.push({ start: i, end, flag: f })
        break
      }
      from = i + 1
    }
  }
  hits.sort((a, b) => a.start - b.start)
  const out: Array<{ text: string; flag?: Flag }> = []
  let pos = 0
  for (const h of hits) {
    if (h.start > pos) out.push({ text: text.slice(pos, h.start) })
    out.push({ text: text.slice(h.start, h.end), flag: h.flag })
    pos = h.end
  }
  if (pos < text.length) out.push({ text: text.slice(pos) })
  return out
})

const pending = computed(() => data.value?.flags.filter(f => (f.decision ?? 'pending') === 'pending').length ?? 0)

function set(f: Flag, decision: Flag['decision']) {
  f.decision = decision
  if (decision === 'edit' && f.editText == null) f.editText = f.fix
  autosave()
}

async function save() {
  if (!data.value) return
  saving.value = true
  try {
    const decisions: Record<string, { decision: Flag['decision']; editText?: string }> = {}
    for (const f of data.value.flags) decisions[f.id] = { decision: f.decision, editText: f.editText }
    const r = await $fetch<{ changed: number }>('/api/deai/decisions', {
      method: 'POST', body: { page: page.value, mode: mode.value, decisions },
    })
    savedMsg.value = 'saved'
  } finally {
    saving.value = false
  }
}

// The replacement that will actually be applied for a flag, or null to keep the
// original (pending/reject). edit → the author's text; accept → the suggested fix.
function effectiveText(f: Flag): string | null {
  if (f.decision === 'edit') return f.editText ?? f.fix
  if (f.decision === 'accept') return f.fix
  return null
}

// The text that would replace the span. An empty string means the suggestion is to
// DELETE the span outright (a "cut") — accept will find/replace it with nothing.
function suggestedText(f: Flag): string {
  return (f.decision === 'edit' ? (f.editText ?? f.fix) : f.fix) ?? ''
}
function isCut(f: Flag): boolean {
  return suggestedText(f).trim() === ''
}
// An additive suggestion ADDS an in-voice emotional beat rather than removing a tell.
function isAdd(f: Flag): boolean {
  return f.additive === true
}

// Save automatically on every change, debounced so rapid clicks/typing batch.
let saveTimer: ReturnType<typeof setTimeout> | null = null
function autosave() {
  savedMsg.value = ''
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(save, 500)
}
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-6 font-serif">
    <!-- header / nav -->
    <div class="flex items-center gap-3 mb-4 text-sm">
      <h1 class="font-semibold">{{ isBrogue ? 'brogue review' : 'de-AI review' }}</h1>
      <div class="inline-flex rounded border overflow-hidden text-xs">
        <button class="px-2 py-1" :class="!isBrogue ? 'bg-foreground text-background' : 'text-muted-foreground'"
                @click="switchMode('deai')">de-AI</button>
        <button class="px-2 py-1" :class="isBrogue ? 'bg-foreground text-background' : 'text-muted-foreground'"
                @click="switchMode('brogue')">brogue</button>
      </div>
      <span v-if="data" class="text-muted-foreground">
        {{ data.chapter || '—' }} · page {{ data.page }}/{{ data.total }}
      </span>
      <span v-if="data?.pageDetect" class="ml-auto flex items-center gap-3 text-muted-foreground">
        page detect <b class="text-foreground">{{ data.pageDetect.detect }}</b>/10
        <template v-if="data.pageDetect.burstiness != null">burst {{ data.pageDetect.burstiness }}</template>
      </span>
      <div class="flex items-center gap-1" :class="{ 'ml-auto': !data?.pageDetect }">
        <Button size="sm" variant="outline" :disabled="loading || page <= 1" @click="go(page - 1)">‹</Button>
        <input type="number" class="w-16 rounded border bg-background px-2 py-1 text-center"
               v-model.number="page" @keyup.enter="go(page)" />
        <Button size="sm" variant="outline" :disabled="loading || (data && page >= data.total)" @click="go(page + 1)">›</Button>
      </div>
    </div>

    <div v-if="loading" class="text-muted-foreground text-sm">loading…</div>

    <div v-else-if="data && !data.detected"
         class="rounded border border-dashed p-6 text-sm text-muted-foreground">
      No detection cached for page {{ data.page }}.
      Run the <code>{{ mode }}</code> detect step for this page first, then reload.
    </div>

    <div v-else-if="data" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- prose with highlighted spans -->
      <div class="whitespace-pre-wrap leading-relaxed text-[1.05rem]">
        <template v-for="(seg, i) in segments" :key="i">
          <!-- accepted / edited: show the replacement in place, original struck through -->
          <span v-if="seg.flag && effectiveText(seg.flag) !== null"
                class="cursor-pointer rounded px-0.5"
                :class="active === seg.flag.id ? 'ring-2 ring-offset-1 ring-foreground/40' : ''"
                @click="active = seg.flag.id">
            <del v-if="!isAdd(seg.flag)" class="text-muted-foreground/50 decoration-1">{{ seg.text }}</del>
            <ins v-if="effectiveText(seg.flag)" class="text-foreground no-underline rounded px-0.5"
                 :class="isAdd(seg.flag) ? 'bg-violet-500/20' : 'bg-emerald-500/20'">{{ effectiveText(seg.flag) }}</ins>
            <span v-else class="text-amber-500/90 text-xs align-middle">✂</span>
          </span>
          <!-- pending / reject: original highlighted by severity -->
          <mark v-else-if="seg.flag"
                :class="[isAdd(seg.flag) ? addRing : sevRing[sev(seg.flag)], 'cursor-pointer rounded px-0.5 text-foreground',
                         active === seg.flag.id ? 'ring-2 ring-offset-1 ring-foreground/40' : '']"
                @click="active = seg.flag.id">{{ seg.text }}</mark>
          <span v-else>{{ seg.text }}</span>
        </template>
      </div>

      <!-- flag list -->
      <div class="space-y-3">
        <div v-if="!data.flags.length" class="rounded border border-dashed p-6 text-sm text-muted-foreground">
          clean page — 0 flags
        </div>

        <div v-for="f in data.flags" :key="f.id"
             :id="`flag-${f.id}`"
             class="rounded-lg border p-3 text-sm transition"
             :class="[active === f.id ? 'ring-2 ring-foreground/30' : '',
                      f.decision === 'reject' ? 'opacity-50' : '']"
             @mouseenter="active = f.id">
          <div class="flex items-center gap-2 mb-1">
            <span class="h-2 w-2 rounded-full" :class="isAdd(f) ? 'bg-violet-500' : sevDot[sev(f)]" />
            <span class="font-medium">{{ f.tell }}</span>
            <span v-if="isAdd(f)" class="rounded bg-violet-500/20 text-violet-300 px-1.5 py-0.5 text-[10px] uppercase tracking-wide">＋ add emotion</span>
            <span class="ml-auto flex items-center gap-2 text-xs">
              <span class="rounded bg-muted px-1.5 py-0.5"
                    :title="isBrogue ? 'lift — how much more authentic/alive the line reads' : 'off-voice (Claude judgment)'">{{ isBrogue ? 'L' : 'V' }} {{ f.voice }}</span>
              <span class="rounded bg-muted px-1.5 py-0.5"
                    :title="isBrogue ? 'parody risk — higher = scrutinize, may read as overcooked stage-Irish' : 'statistical AI-likelihood (stats)'">{{ isBrogue ? 'P' : 'D' }} {{ f.detect }}</span>
            </span>
          </div>
          <p v-if="f.why" class="text-muted-foreground mb-2">{{ f.why }}</p>
          <div class="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1 mb-2">
            <span class="text-muted-foreground">span</span><code class="text-red-400">{{ f.span }}</code>
            <span class="text-muted-foreground">{{ isAdd(f) ? 'enrich' : isCut(f) ? 'suggest' : (f.decision === 'edit' ? 'your edit' : 'fix') }}</span>
            <code v-if="isAdd(f)" class="text-violet-300">＋ {{ suggestedText(f) }}</code>
            <code v-else-if="isCut(f)" class="text-amber-400">✂ cut — delete the highlighted span (hit accept)</code>
            <code v-else class="text-emerald-400">{{ suggestedText(f) }}</code>
          </div>
          <textarea v-if="f.decision === 'edit'" v-model="f.editText" @input="autosave"
                    placeholder="type your replacement…"
                    class="w-full rounded border bg-background p-2 mb-2 text-sm" rows="2" />
          <div class="flex gap-1">
            <Button size="sm" :variant="f.decision === 'accept' ? 'default' : 'outline'" @click="set(f, 'accept')">accept</Button>
            <Button size="sm" :variant="f.decision === 'reject' ? 'default' : 'outline'" @click="set(f, 'reject')">reject</Button>
            <Button size="sm" :variant="f.decision === 'edit' ? 'default' : 'outline'" @click="set(f, 'edit')">edit</Button>
          </div>
        </div>
      </div>
    </div>

    <!-- footer / autosave status -->
    <div v-if="data?.detected" class="sticky bottom-0 mt-6 flex items-center gap-3 border-t bg-background/90 py-3 text-sm backdrop-blur">
      <span class="text-muted-foreground">{{ pending }} pending</span>
      <span class="ml-auto text-xs text-muted-foreground">
        {{ saving ? 'saving…' : savedMsg ? 'saved ✓ — choices persist automatically' : 'choices save automatically' }}
      </span>
    </div>
  </div>
</template>
