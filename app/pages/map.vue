<script setup lang="ts">
import type { Map as LeafletMap, Marker } from 'leaflet'
import { kindMeta, locations as stPaulLocations, precisionMeta } from '~/data/boog-locations'
import type { BoogLocation, Kind } from '~/data/boog-locations'
import { bostonEssay, bostonIntro, bostonLocations } from '~/data/boston-locations'
import { dublinEssay, dublinIntro, dublinLocations } from '~/data/dublin-locations'

// ---------------------------------------------------------------- the cities

type CityId = 'dublin' | 'boston' | 'stpaul' | 'grantspass'

interface CityEssay {
  title: string
  paras: string[]
  /** A quieter closing paragraph, set smaller than the rest. */
  coda?: string
}

interface City {
  id: CityId
  tab: string
  title: string
  intro: string
  locations: BoogLocation[]
  essay?: CityEssay
  comingSoon?: boolean
}

const cities: City[] = [
  {
    id: 'dublin',
    tab: 'Dublin',
    title: 'The Dublin Map',
    intro: dublinIntro,
    locations: dublinLocations,
    essay: dublinEssay,
  },
  {
    id: 'boston',
    tab: 'Boston',
    title: 'The Boston Map',
    intro: bostonIntro,
    locations: bostonLocations,
    essay: bostonEssay,
  },
  {
    id: 'stpaul',
    tab: 'St. Paul',
    title: 'The St. Paul Map',
    intro: 'Every address William Boog can be placed at in St. Paul, Minnesota, from the first '
      + 'newspaper advertisement in December 1878 to his son Alexander in the 1940 census. Shops, '
      + 'houses, and the lots he and Charlotte bought and sold — assembled from deed abstracts, '
      + 'city directories, census pages, and Rascher’s Atlas. Six pins belong to his daughter '
      + 'Letitia instead: the convent, the two art schools, and the grave of Sister M. Berissima, '
      + 'off her own record card and necrology.',
    locations: stPaulLocations,
    essay: {
      title: 'What the map says about him',
      paras: [
        'The work never leaves downtown. Every shop address from 1878 to 1884 — '
        + 'Third Street, the Franklin corner, West Seventh, two doors on West Tenth — sits inside a '
        + 'few blocks of the same ground. A painter went where the building was, and in those years '
        + 'the building was all downtown.',
        'The living went up. The first house is on Ramsey Street, on the bluff, literally above '
        + 'the river flats where an immigrant with nothing would have landed. Then Linwood, higher '
        + 'still. For a man who arrived with a trade and no property, height was the visible part of '
        + 'having climbed.',
        'Then, once he had money to move, everything moves west at once. Between 1889 and 1892 the '
        + 'deeds cluster along Dayton, Iglehart, Roblyn and Rondo — the corridor Interstate 94 would '
        + 'eventually take. That was where the Irish were settling, and it was also where the city '
        + 'was about to expand. Whether he was following his people or buying in front of the '
        + 'streetcar line, the map won’t say. Both are true of the ground he chose.',
        'One daughter runs counter to all of it. William bought westward and upward; Letitia '
        + 'moved between houses that were never hers and could never be sold. She entered at '
        + 'Marshall and Western in September 1891, ten weeks before her father bought the Dayton '
        + 'Avenue lot four hundred feet from the parish she was the first to leave from. By 1900 '
        + 'the census has her downtown at St. Agatha’s, back on Exchange Street among the shop '
        + 'addresses of his working years. Two Boogs on the same few blocks, neither one holding '
        + 'a deed to any of it.',
      ],
      coda: 'The freeway took the Rondo end of it — the two Roblyn houses and the Merriam Park lot are '
        + 'under roadway now, addresses and all. But the Evergreen house William built on Linwood is '
        + 'still standing, 985 Iglehart is still a live address, and so is 1625 Carroll — where Alex '
        + 'moved after Lottie died, and where the next William grew up.',
    },
  },
  {
    id: 'grantspass',
    tab: 'Grants Pass',
    title: 'The Grants Pass Map',
    intro: 'Where William went when he left. The Oregon record — the claim, the orchards, the last '
      + 'addresses — is still being pulled out of the county books.',
    locations: [],
    comingSoon: true,
  },
]

// ---------------------------------------------------------------- spoilers

/** The map narrates the whole book — nobody should wander in mid-read. */
const spoilerOpen = ref(true)

function spoilerBack() {
  history.back()
}

const cityId = ref<CityId>('dublin')
const city = computed(() => cities.find(c => c.id === cityId.value)!)

useHead({ title: () => `${city.value.title} — Chasing the Sun` })

// ---------------------------------------------------------------- filtering

const yearBounds = computed(() => {
  const years = city.value.locations.map(l => l.year)
  return years.length
    ? { min: Math.min(...years), max: Math.max(...years) }
    : { min: 0, max: 0 }
})

const year = ref(yearBounds.value.max)
const activeKinds = ref<Kind[]>(['business', 'home', 'lot', 'civic'])
const selectedId = ref<string | null>(null)
const showApproximate = ref(true)

const ordered = computed(() => [...city.value.locations].sort((a, b) => a.year - b.year))

/** Only offer the kind filters this city's record actually contains. */
const cityKinds = computed(() => {
  const present = new Set(city.value.locations.map(l => l.kind))
  return (Object.keys(kindMeta) as Kind[]).filter(k => present.has(k))
})

const visible = computed(() =>
  ordered.value.filter(l =>
    l.year <= year.value
    && activeKinds.value.includes(l.kind)
    && (showApproximate.value || l.precision === 'plat' || l.precision === 'geocoded'),
  ),
)

const selected = computed(() => ordered.value.find(l => l.id === selectedId.value) ?? null)

/** Step through the chronology from the detail panel without going back to the list. */
const neighbours = computed(() => {
  const i = ordered.value.findIndex(l => l.id === selectedId.value)
  return { prev: i > 0 ? ordered.value[i - 1] : null, next: i >= 0 && i < ordered.value.length - 1 ? ordered.value[i + 1] : null }
})

function toggleKind(kind: Kind) {
  activeKinds.value = activeKinds.value.includes(kind)
    ? activeKinds.value.filter(k => k !== kind)
    : [...activeKinds.value, kind]
}

function switchCity(id: CityId) {
  if (id === cityId.value)
    return
  cityId.value = id
  selectedId.value = null
  year.value = yearBounds.value.max
  activeKinds.value = ['business', 'home', 'lot', 'civic']
  nextTick(syncMap)
}

// ---------------------------------------------------------------- the map

const mapEl = ref<HTMLElement | null>(null)
let map: LeafletMap | null = null
let L: typeof import('leaflet') | null = null
const markers = new globalThis.Map<string, Marker>()

/**
 * Three pin faces: a portrait where someone lived, a glyph where something
 * happened (brush for a shop, bell for the church, train for the depot, cross
 * for the chapel he was christened in, tombstone for a grave), a plain dot for
 * the investment lots. The ring stays the precision signal in all three —
 * solid for a coordinate we can stand behind, dashed for a soft one.
 */
type Glyph = 'brush' | 'train' | 'bell' | 'cross' | 'tombstone'

function pinGlyph(loc: BoogLocation): Glyph | null {
  if (loc.symbol)
    return loc.symbol
  if (loc.kind === 'business')
    return 'brush'
  if (loc.kind === 'civic')
    return 'bell'
  return null
}

function pinKind(loc: BoogLocation) {
  if (loc.face)
    return 'portrait' as const
  if (pinGlyph(loc))
    return 'glyph' as const
  return 'dot' as const
}

const PIN_BASE = { portrait: 30, glyph: 24, dot: 14 }

function pinSize(loc: BoogLocation, isSelected: boolean) {
  return PIN_BASE[pinKind(loc)] + (isSelected ? 6 : 0)
}

/** lucide paths, inlined — divIcon html can't mount a component. */
const GLYPH_PATHS: Record<Glyph, string> = {
  brush: `<path d="m14.622 17.897-10.68-2.913"/>
    <path d="M18.376 2.622a1 1 0 1 1 3.002 3.002L17.36 9.643a.5.5 0 0 0 0 .707l.944.944a2.41 2.41 0 0 1 0 3.408l-.944.944a.5.5 0 0 1-.707 0L8.354 7.348a.5.5 0 0 1 0-.707l.944-.944a2.41 2.41 0 0 1 3.408 0l.944.944a.5.5 0 0 0 .707 0z"/>
    <path d="M9 8c-1.804 2.71-3.97 3.46-6.583 3.948a.507.507 0 0 0-.302.819l7.32 8.883a1 1 0 0 0 1.185.204C12.735 20.405 16 16.792 16 15"/>`,
  train: `<path d="M8 3.1V7a4 4 0 0 0 8 0V3.1"/><path d="m9 15-1-1"/><path d="m15 15 1-1"/>
    <path d="M9 19c-2.8 0-5-2.2-5-5v-4a8 8 0 0 1 16 0v4c0 2.8-2.2 5-5 5Z"/>
    <path d="m8 19-2 3"/><path d="m16 19 2 3"/>`,
  bell: `<path d="M10.268 21a2 2 0 0 0 3.464 0"/>
    <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/>`,
  cross: `<path d="M12 3v18"/><path d="M6.5 8.5h11"/>`,
  tombstone: `<path d="M6 21V11a6 6 0 0 1 12 0v10"/><path d="M4 21h16"/>
    <path d="M12 8.5v5"/><path d="M9.5 10.5h5"/>`,
}

function glyphSvg(glyph: Glyph, stroke: string, px: number) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}" viewBox="0 0 24 24"
    fill="none" stroke="${stroke}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
    ${GLYPH_PATHS[glyph]}
  </svg>`
}

function pinHtml(loc: BoogLocation, isSelected: boolean) {
  const color = kindMeta[loc.kind].color
  const soft = loc.precision === 'approximate' || loc.precision === 'lost'
  const size = pinSize(loc, isSelected)
  const frame = `
    width:${size}px;
    height:${size}px;
    border-radius:9999px;
    border:2px ${soft ? 'dashed' : 'solid'} ${color};
    box-shadow:0 0 0 ${isSelected ? 6 : 0}px ${color}33, 0 1px 4px rgba(0,0,0,.7);
    transition:width .2s, height .2s, box-shadow .2s;`

  if (loc.face) {
    return `<span style="display:block;overflow:hidden;background:#0d0d10;${frame}">
      <img src="${loc.face.src}" alt="" draggable="false"
        style="width:100%;height:100%;object-fit:cover;object-position:50% 22%;${soft ? 'opacity:.7;' : ''}" />
    </span>`
  }

  const glyph = pinGlyph(loc)
  if (glyph) {
    return `<span style="display:flex;align-items:center;justify-content:center;
      background:${soft ? 'rgba(13,13,16,.9)' : color};${frame}">
      ${glyphSvg(glyph, soft ? color : '#14110b', Math.round(size * 0.55))}
    </span>`
  }

  return `<span style="display:block;background:${soft ? 'transparent' : color};${frame}"></span>`
}

/** Hover label — the title alone doesn't say when, and when is the whole point. */
function tooltipHtml(loc: BoogLocation) {
  const who = loc.face ? `<em>${loc.face.name}</em> &middot; ` : ''
  return `<strong>${loc.title}</strong><span>${who}${loc.date}</span>`
}

function refreshMarkers() {
  if (!map || !L)
    return
  const shouldShow = new Set(visible.value.map(l => l.id))

  for (const [id, marker] of markers) {
    if (!shouldShow.has(id)) {
      marker.remove()
      markers.delete(id)
    }
  }

  for (const loc of visible.value) {
    let marker = markers.get(loc.id)
    const isSelected = loc.id === selectedId.value
    const size = pinSize(loc, isSelected)
    const icon = L.divIcon({
      html: pinHtml(loc, isSelected),
      className: 'boog-pin',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    })

    if (!marker) {
      marker = L.marker([loc.lat, loc.lng], {
        icon,
        zIndexOffset: isSelected ? 1000 : 0,
      })
        .bindTooltip(tooltipHtml(loc), {
          direction: 'top',
          offset: [0, -size / 2 - 4],
          className: 'boog-tip',
        })
        .on('click', () => { selectedId.value = loc.id })
        .addTo(map)
      markers.set(loc.id, marker)
    }
    else {
      marker.setIcon(icon)
      marker.setZIndexOffset(isSelected ? 1000 : 0)
      marker.setTooltipContent(tooltipHtml(loc))
    }
  }
}

function destroyMap() {
  map?.remove()
  map = null
  markers.clear()
}

/**
 * (Re)bind Leaflet to whatever container the template is showing. The
 * coming-soon panel unmounts the map div, so a returning tab gets a fresh
 * element — a map bound to the old one renders blank and must be rebuilt.
 */
function syncMap() {
  if (!L)
    return
  if (city.value.comingSoon || !mapEl.value) {
    destroyMap()
    return
  }
  if (map && map.getContainer() !== mapEl.value)
    destroyMap()

  if (!map) {
    map = L.map(mapEl.value, { zoomControl: false, scrollWheelZoom: true })

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      maxZoom: 19,
    }).addTo(map)

    L.control.zoom({ position: 'bottomright' }).addTo(map)
  }

  refreshMarkers()
  fitAll()
}

onMounted(async () => {
  L = (await import('leaflet')).default
  await import('leaflet/dist/leaflet.css')
  syncMap()
})

/** Back to the view that holds every pin — panning to a selection loses it. */
function fitAll() {
  if (!map || !L || !ordered.value.length)
    return
  map.fitBounds(L.latLngBounds(ordered.value.map(l => [l.lat, l.lng])), { padding: [60, 60] })
}

onUnmounted(destroyMap)

watch([visible, selectedId], refreshMarkers)

watch(selectedId, (id) => {
  if (!id || !map)
    return
  const loc = ordered.value.find(l => l.id === id)
  if (loc)
    map.panTo([loc.lat, loc.lng], { animate: true })
})

/** Selecting a pin the year-scrubber has hidden should pull the year forward. */
function selectFromList(loc: BoogLocation) {
  if (loc.year > year.value)
    year.value = loc.year
  selectedId.value = loc.id
}
</script>

<template>
  <!-- Spoiler gate — client-only: a body teleport open at SSR time can't hydrate -->
  <ClientOnly>
    <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-300 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="spoilerOpen"
        class="fixed inset-0 z-[200] flex items-center justify-center bg-surface-400/90 backdrop-blur-md px-4"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="spoiler-title"
      >
        <div class="w-full max-w-md rounded-2xl border border-gold-500/25 bg-surface-200 p-8 text-center shadow-2xl shadow-black/60">
          <Icon name="lucide:triangle-alert" class="h-8 w-8 text-gold-400 mx-auto mb-4" />
          <h2 id="spoiler-title" class="text-2xl font-bold text-gold-400 tracking-tight">
            Spoilers ahead
          </h2>
          <p class="text-sm text-neutral-400 mt-3 leading-relaxed">
            This map follows the family through the whole book — every address,
            every grave, every turn of the story. If you haven't finished
            <em>Chasing the Sun</em>, it will spoil it.
          </p>
          <div class="mt-7 flex flex-col sm:flex-row justify-center gap-3">
            <button
              class="rounded-full border border-neutral-700 px-5 py-2.5 text-sm text-neutral-300 hover:text-gold-400 hover:border-gold-500/50 transition-colors cursor-pointer"
              @click="spoilerBack()"
            >
              Take me back
            </button>
            <button
              class="rounded-full border border-gold-500/50 bg-gold-500/10 px-5 py-2.5 text-sm font-medium text-gold-400 hover:bg-gold-500/20 transition-colors cursor-pointer"
              @click="spoilerOpen = false"
            >
              I've read it — show the map
            </button>
          </div>
        </div>
      </div>
      </Transition>
    </Teleport>
  </ClientOnly>

  <div class="min-h-dvh px-4 py-16 sm:py-20">
    <div class="max-w-6xl mx-auto">
      <!-- City tabs — the journey, west to west -->
      <nav class="flex justify-center gap-2 mb-8">
        <button
          v-for="c in cities"
          :key="c.id"
          class="rounded-full border px-4 py-1.5 text-sm transition-colors cursor-pointer"
          :class="c.id === cityId
            ? 'border-gold-500/50 bg-gold-500/10 text-gold-400'
            : 'border-neutral-800 text-neutral-500 hover:text-neutral-300'"
          @click="switchCity(c.id)"
        >
          {{ c.tab }}
          <span v-if="c.comingSoon" class="ml-1 text-[10px] uppercase tracking-wider text-neutral-600">soon</span>
        </button>
      </nav>

      <!-- Heading -->
      <header class="text-center mb-10 space-y-3">
        <h1 class="text-3xl sm:text-4xl font-bold text-gold-400 tracking-tight">
          {{ city.title }}
        </h1>
        <p class="text-neutral-400 max-w-2xl mx-auto leading-relaxed">
          {{ city.intro }}
        </p>
      </header>

      <!-- Coming soon -->
      <div
        v-if="city.comingSoon"
        class="rounded-2xl border border-neutral-800 bg-surface-200/60 px-6 py-24 text-center"
      >
        <Icon name="lucide:map-pinned" class="h-8 w-8 text-gold-500/50 mx-auto mb-4" />
        <p class="text-2xl font-bold tracking-[0.2em] text-gold-400/80 uppercase">Coming soon</p>
        <p class="text-sm text-neutral-500 mt-3 max-w-md mx-auto leading-relaxed">
          The Oregon real estate record is a bear. It's being wrestled.
        </p>
      </div>

      <template v-else>
        <!-- Controls -->
        <div class="mb-4 rounded-2xl border border-neutral-800 bg-surface-200/60 p-5 space-y-5">
          <!-- Year scrubber -->
          <div>
            <div class="flex items-baseline justify-between mb-2">
              <label for="year" class="text-sm text-neutral-400">
                Showing everything on the record through
              </label>
              <span class="text-2xl font-bold text-gold-400 tabular-nums">{{ year }}</span>
            </div>
            <input
              id="year"
              v-model.number="year"
              type="range"
              :min="yearBounds.min"
              :max="yearBounds.max"
              step="1"
              class="w-full accent-gold-500 cursor-pointer"
            >
            <div class="flex justify-between text-xs text-neutral-600 mt-1">
              <span>{{ yearBounds.min }}</span>
              <span>{{ yearBounds.max }}</span>
            </div>
          </div>

          <!-- Filters -->
          <div class="flex flex-wrap items-center gap-2">
            <button
              v-for="kind in cityKinds"
              :key="kind"
              class="flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors cursor-pointer"
              :class="activeKinds.includes(kind)
                ? 'border-neutral-600 bg-surface-50 text-neutral-200'
                : 'border-neutral-800 text-neutral-600 hover:text-neutral-400'"
              @click="toggleKind(kind)"
            >
              <span
                class="h-2.5 w-2.5 rounded-full"
                :style="{ background: activeKinds.includes(kind) ? kindMeta[kind].color : 'transparent', border: `1.5px solid ${kindMeta[kind].color}` }"
              />
              {{ kindMeta[kind].label }}
            </button>

            <label
              v-if="city.locations.some(l => l.precision === 'approximate' || l.precision === 'lost')"
              class="ml-auto flex items-center gap-2 text-sm text-neutral-400 cursor-pointer"
            >
              <input v-model="showApproximate" type="checkbox" class="accent-gold-500 cursor-pointer">
              Include approximate &amp; lost sites
            </label>
          </div>

          <!-- How to read a pin -->
          <p v-if="cityId === 'stpaul'" class="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-neutral-500">
            <span class="flex items-center gap-1.5">
              <img src="/images/characters/William-Boog-Portrait.jpg" alt="" class="h-5 w-5 rounded-full object-cover border border-neutral-700" style="object-position: 50% 22%">
              a portrait means that person lived there
            </span>
            <span class="flex items-center gap-1.5">
              <span class="flex h-5 w-5 items-center justify-center rounded-full bg-gold-500/90" v-html="glyphSvg('brush', '#14110b', 12)" />
              a brush means he worked there
            </span>
            <span class="flex items-center gap-1.5">
              <span class="flex h-5 w-5 items-center justify-center rounded-full bg-[#c98fbf]" v-html="glyphSvg('bell', '#14110b', 12)" />
              a bell is the chapel he bought it for
            </span>
            <span class="flex items-center gap-1.5">
              <span class="flex h-5 w-5 items-center justify-center rounded-full bg-[#c98fbf]" v-html="glyphSvg('train', '#14110b', 12)" />
              a train is the depot he left from
            </span>
            <span class="flex items-center gap-1.5">
              <span class="h-3 w-3 rounded-full border-[1.5px] border-[#8fbf7f] bg-[#8fbf7f]" />
              a dot is land — bought to sell, never lived on
            </span>
            <span class="flex items-center gap-1.5">
              <span class="h-3 w-3 rounded-full border-[1.5px] border-dashed border-neutral-500" />
              a dashed ring means the coordinate is soft
            </span>
          </p>
          <p v-else-if="cityId === 'boston'" class="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-neutral-500">
            <span class="flex items-center gap-1.5">
              <img src="/images/characters/William-Boog-Portrait.jpg" alt="" class="h-5 w-5 rounded-full object-cover border border-neutral-700" style="object-position: 50% 22%">
              William's portrait — where the family lived
            </span>
            <span class="flex items-center gap-1.5">
              <img src="/images/characters/Mary-Moran-AI.jpg" alt="" class="h-5 w-5 rounded-full object-cover border border-neutral-700" style="object-position: 50% 22%">
              Mary's portrait — the wharf where she ate her apple
            </span>
            <span class="flex items-center gap-1.5">
              <span class="flex h-5 w-5 items-center justify-center rounded-full bg-[#c98fbf]" v-html="glyphSvg('cross', '#14110b', 12)" />
              a cross is their church
            </span>
            <span class="flex items-center gap-1.5">
              <span class="flex h-5 w-5 items-center justify-center rounded-full bg-[#c98fbf]" v-html="glyphSvg('tombstone', '#14110b', 12)" />
              a stone is the children's ground
            </span>
            <span class="flex items-center gap-1.5">
              <span class="flex h-5 w-5 items-center justify-center rounded-full bg-[#c98fbf]" v-html="glyphSvg('train', '#14110b', 12)" />
              a train is the depot they left from
            </span>
            <span class="flex items-center gap-1.5">
              <span class="h-3 w-3 rounded-full border-[1.5px] border-dashed border-neutral-500" />
              a dashed ring means the building is gone
            </span>
          </p>
          <p v-else-if="cityId === 'dublin'" class="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-neutral-500">
            <span class="flex items-center gap-1.5">
              <img src="/images/characters/William-Boog-Portrait.jpg" alt="" class="h-5 w-5 rounded-full object-cover border border-neutral-700" style="object-position: 50% 22%">
              William's portrait — where he lived or worked
            </span>
            <span class="flex items-center gap-1.5">
              <img src="/images/characters/Mary-Moran-AI.jpg" alt="" class="h-5 w-5 rounded-full object-cover border border-neutral-700" style="object-position: 50% 22%">
              Mary's portrait — where he found her
            </span>
            <span class="flex items-center gap-1.5">
              <span class="flex h-5 w-5 items-center justify-center rounded-full bg-[#c98fbf]" v-html="glyphSvg('cross', '#14110b', 12)" />
              a cross is the church that has him in its registers
            </span>
            <span class="flex items-center gap-1.5">
              <span class="flex h-5 w-5 items-center justify-center rounded-full bg-[#c98fbf]" v-html="glyphSvg('tombstone', '#14110b', 12)" />
              a stone is a grave
            </span>
          </p>
        </div>

        <!-- Map + list -->
        <div class="grid lg:grid-cols-[1fr_22rem] gap-4">
          <!-- Map -->
          <div class="relative isolate z-0 rounded-2xl overflow-hidden border border-neutral-800">
            <ClientOnly>
              <div ref="mapEl" class="h-[26rem] sm:h-[34rem] lg:h-[38rem] w-full bg-surface-400" />
              <template #fallback>
                <div class="h-[26rem] sm:h-[34rem] lg:h-[38rem] w-full bg-surface-400 flex items-center justify-center text-sm text-neutral-600">
                  Loading map&hellip;
                </div>
              </template>
            </ClientOnly>

            <!-- Reset view -->
            <button
              class="absolute top-3 right-3 z-[400] flex items-center gap-1.5 rounded-xl border border-neutral-800 bg-surface-300/90 backdrop-blur-sm px-3 py-1.5 text-xs text-neutral-400 hover:text-gold-400 transition-colors cursor-pointer"
              @click="fitAll()"
            >
              <Icon name="lucide:maximize-2" class="h-3.5 w-3.5" />
              Fit all
            </button>

            <!-- Precision key -->
            <div class="absolute bottom-3 left-3 z-[400] rounded-xl border border-neutral-800 bg-surface-300/90 backdrop-blur-sm px-3 py-2 text-xs text-neutral-400 space-y-1">
              <div class="flex items-center gap-2">
                <span class="h-2.5 w-2.5 rounded-full bg-gold-400" />
                Confirmed address or plat
              </div>
              <div class="flex items-center gap-2">
                <span class="h-2.5 w-2.5 rounded-full border-2 border-dashed border-gold-400" />
                Approximate — or the street is gone
              </div>
            </div>
          </div>

          <!-- Right column: the detail of whatever is selected, else the chronology -->
          <aside
            class="rounded-2xl border bg-surface-200/60 overflow-hidden flex flex-col"
            :class="selected ? 'border-gold-500/25' : 'border-neutral-800'"
          >
            <!-- Detail -->
            <template v-if="selected">
              <div class="px-4 py-3 border-b border-neutral-800 flex items-center justify-between gap-2">
                <button
                  class="flex items-center gap-1.5 text-xs uppercase tracking-wide text-neutral-500 hover:text-gold-400 transition-colors cursor-pointer"
                  @click="selectedId = null"
                >
                  <Icon name="lucide:arrow-left" class="h-3.5 w-3.5" />
                  Chronology
                </button>
                <div class="flex items-center gap-1">
                  <button
                    class="p-1 rounded text-neutral-600 hover:text-gold-400 transition-colors cursor-pointer disabled:opacity-25 disabled:hover:text-neutral-600"
                    :disabled="!neighbours.prev"
                    aria-label="Previous location"
                    @click="neighbours.prev && selectFromList(neighbours.prev)"
                  >
                    <Icon name="lucide:chevron-up" class="h-4 w-4" />
                  </button>
                  <button
                    class="p-1 rounded text-neutral-600 hover:text-gold-400 transition-colors cursor-pointer disabled:opacity-25 disabled:hover:text-neutral-600"
                    :disabled="!neighbours.next"
                    aria-label="Next location"
                    @click="neighbours.next && selectFromList(neighbours.next)"
                  >
                    <Icon name="lucide:chevron-down" class="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div class="overflow-y-auto max-h-[34rem] lg:max-h-[35rem] p-5">
                <div class="flex items-start gap-3">
                  <img
                    v-if="selected.face"
                    :src="selected.face.src"
                    :alt="selected.face.name"
                    class="h-12 w-12 shrink-0 rounded-full object-cover border border-neutral-700"
                    style="object-position: 50% 22%"
                  >
                  <div>
                    <p class="text-xs uppercase tracking-widest text-gold-500/70">{{ selected.date }}</p>
                    <h3 class="text-lg font-bold text-gold-400 mt-0.5 leading-snug">{{ selected.title }}</h3>
                    <p v-if="selected.face" class="text-xs text-neutral-500 mt-1">
                      {{ selected.face.name }}{{ selected.kind === 'home' ? ' lived here' : ' — on the record at this address' }}
                    </p>
                  </div>
                </div>

                <div class="flex flex-wrap items-center gap-2 mt-3 mb-4">
                  <span class="rounded-full border border-neutral-700 px-2.5 py-0.5 text-xs text-neutral-400">
                    {{ kindMeta[selected.kind].label }}
                  </span>
                  <span
                    class="rounded-full px-2.5 py-0.5 text-xs"
                    :class="['plat', 'geocoded'].includes(selected.precision)
                      ? 'border border-neutral-700 text-neutral-400'
                      : 'border border-dashed border-gold-600/60 text-gold-500/90'"
                    :title="precisionMeta[selected.precision].note"
                  >
                    {{ precisionMeta[selected.precision].label }}
                  </span>
                </div>

                <ul class="space-y-2 text-sm text-neutral-300 leading-relaxed">
                  <li v-for="fact in selected.facts" :key="fact" class="flex gap-2">
                    <span class="text-gold-600/60">&mdash;</span>
                    <span>{{ fact }}</span>
                  </li>
                </ul>

                <p v-if="selected.legal" class="mt-4 text-xs text-neutral-500 italic">
                  {{ selected.legal }}
                </p>

                <p v-if="selected.caveat" class="mt-4 border-l-2 border-gold-600/40 pl-3 text-sm text-neutral-400 leading-relaxed">
                  <span class="text-gold-500/80 font-semibold">Still open:</span> {{ selected.caveat }}
                </p>

                <a
                  v-if="selected.source"
                  :href="selected.source"
                  target="_blank"
                  rel="noopener"
                  class="mt-4 inline-flex items-center gap-1.5 text-xs text-gold-500/80 hover:text-gold-400 transition-colors"
                >
                  <Icon name="lucide:newspaper" class="h-3.5 w-3.5" />
                  <span>{{ cityId === 'stpaul' ? 'Read the clipping' : 'Read the source' }}</span>
                </a>
              </div>
            </template>

            <!-- Chronological list -->
            <template v-else>
              <div class="px-4 py-3 border-b border-neutral-800 flex items-baseline justify-between">
                <h2 class="text-sm font-semibold text-neutral-300 tracking-wide uppercase">
                  Chronology
                </h2>
                <span class="text-xs text-neutral-600">{{ visible.length }} of {{ ordered.length }}</span>
              </div>
              <ol class="overflow-y-auto max-h-[34rem] lg:max-h-[35rem] divide-y divide-neutral-800/60">
                <li v-for="loc in ordered" :key="loc.id">
                  <button
                    class="w-full text-left px-4 py-3 transition-colors cursor-pointer hover:bg-surface-50"
                    :class="loc.year > year ? 'opacity-35' : ''"
                    @click="selectFromList(loc)"
                  >
                    <div class="flex items-start gap-2.5">
                      <img
                        v-if="loc.face"
                        :src="loc.face.src"
                        :alt="loc.face.name"
                        class="h-6 w-6 shrink-0 rounded-full object-cover"
                        :style="{
                          objectPosition: '50% 22%',
                          border: `1.5px ${['plat', 'geocoded'].includes(loc.precision) ? 'solid' : 'dashed'} ${kindMeta[loc.kind].color}`,
                        }"
                      >
                      <span
                        v-else-if="pinGlyph(loc)"
                        class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                        :style="{
                          background: ['plat', 'geocoded'].includes(loc.precision) ? kindMeta[loc.kind].color : 'transparent',
                          border: `1.5px ${['plat', 'geocoded'].includes(loc.precision) ? 'solid' : 'dashed'} ${kindMeta[loc.kind].color}`,
                        }"
                        v-html="glyphSvg(pinGlyph(loc)!, ['plat', 'geocoded'].includes(loc.precision) ? '#14110b' : kindMeta[loc.kind].color, 14)"
                      />
                      <span
                        v-else
                        class="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
                        :style="{
                          background: ['plat', 'geocoded'].includes(loc.precision) ? kindMeta[loc.kind].color : 'transparent',
                          border: `1.5px ${['plat', 'geocoded'].includes(loc.precision) ? 'solid' : 'dashed'} ${kindMeta[loc.kind].color}`,
                        }"
                      />
                      <div class="min-w-0">
                        <p class="text-sm text-neutral-200 leading-snug">{{ loc.title }}</p>
                        <p class="text-xs text-neutral-500">{{ loc.date }}</p>
                      </div>
                    </div>
                  </button>
                </li>
              </ol>
            </template>
          </aside>
        </div>

        <!-- The read of the map -->
        <section v-if="city.essay" class="mt-14">
          <h2 class="text-xl font-bold text-gold-400 mb-5">{{ city.essay.title }}</h2>
          <div class="rounded-2xl border border-neutral-800 bg-surface-200/50 p-6 sm:p-8 max-w-3xl space-y-4">
            <p v-for="para in city.essay.paras" :key="para" class="text-[0.95rem] text-neutral-300 leading-relaxed">
              {{ para }}
            </p>
            <p v-if="city.essay.coda" class="text-sm text-neutral-500 leading-relaxed">
              {{ city.essay.coda }}
            </p>
          </div>
        </section>
      </template>

      <div class="text-center mt-16">
        <NuxtLink to="/" class="inline-block text-sm text-gold-500/60 hover:text-gold-400 transition-colors">
          &larr; Back home
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style>
/* Leaflet's own chrome, dressed for the dark surface. */
.leaflet-container {
  background: var(--color-surface-400);
  font-family: inherit;
}

.leaflet-control-attribution {
  background: rgb(13 13 16 / 0.8) !important;
  color: #525252 !important;
  font-size: 10px;
}

.leaflet-control-attribution a {
  color: #737373 !important;
}

.leaflet-bar a {
  background: rgb(13 13 16 / 0.9) !important;
  color: var(--color-gold-400) !important;
  border-color: #262626 !important;
}

.leaflet-bar a:hover {
  background: var(--color-surface-50) !important;
}

.boog-pin {
  cursor: pointer;
}

/* Hover label. Leaflet's default tooltip is a white box — this is not that. */
.boog-tip.leaflet-tooltip {
  background: rgb(13 13 16 / 0.94);
  border: 1px solid #262626;
  border-radius: 6px;
  box-shadow: 0 4px 14px rgb(0 0 0 / 0.6);
  color: #d4d4d4;
  padding: 5px 9px;
  font-family: inherit;
  white-space: nowrap;
}

.boog-tip strong {
  display: block;
  color: var(--color-gold-400);
  font-size: 12px;
  font-weight: 600;
}

.boog-tip span {
  display: block;
  margin-top: 1px;
  color: #737373;
  font-size: 11px;
}

.boog-tip em {
  color: #a3a3a3;
  font-style: normal;
}

.boog-tip.leaflet-tooltip-top::before {
  border-top-color: #262626;
}
</style>
