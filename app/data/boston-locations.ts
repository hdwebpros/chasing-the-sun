/**
 * The Boog family — Boston, Massachusetts record, 1873–c. 1877.
 *
 * Derived from the story bible (bible-index.md / bible-full.md, Ch 10–17) plus
 * the family tree for the children's dates. Addresses supplied and verified by
 * Ryan (July 2026): both residential addresses stand at the same location
 * today, and the Malden cemetery is verified. The wharf and depot coordinates
 * are Ryan's exact placements; the depot building itself is gone, so it wears
 * the 'lost' dashed ring.
 */

import type { BoogLocation } from './boog-locations'
import { faces } from './boog-locations'

export const bostonIntro = 'Every address the family can be placed at in Boston, from the Prince Street '
  + 'tenement they landed in to the depot they left from. Four years, two homes, one trade lost and '
  + 'another learned through a window — and four small graves. The city that was supposed to be the '
  + 'dream turned out to be only the door to it.'

export const bostonEssay = {
  title: 'What the map says about him',
  paras: [
    'The Dublin map was a name painted over three doors. The Boston map has no shopfront at all — '
    + 'no BOOG over anything. The hide house would not take a lone man’s name and the docks would '
    + 'not take his soft bootmaker’s hands, so the trade that made him somebody on Aston’s Quay '
    + 'died at the waterline. What replaced it was learned through the Prince Street window: he '
    + 'watched a house painter work the block opposite until he could do it himself.',
    'Everything the family did in Boston fits in a five-minute walk — Prince Street, the church '
    + 'two blocks up Hanover, Garden Court around the corner, the wharf at the bottom of the '
    + 'street. The two pins outside the neighbourhood are the same two kinds Dublin had outside '
    + 'its square mile: a cemetery and a way out. But Dublin’s cemetery holds one child, and '
    + 'Malden holds four.',
    'That is the arithmetic that points the arrows west. Boston is the only city on this map '
    + 'that took more than it gave — and what it gave is exactly what the next map is made of: a '
    + 'painter’s trade, talk of cheap Minnesota land, and Mary’s one condition, spoken at the '
    + 'depot end of it, that she could not bury another child.',
  ],
  coda: 'Both homes survive — 61 Prince Street and 16 Garden Court are live addresses in the same '
    + 'North End lanes. St. Stephen’s still stands on Hanover Street, the last Bulfinch church in '
    + 'Boston. The Kneeland Street depot is gone without a trace: South Station opened in 1899 and '
    + 'took its trains, then the city took the ground.',
}

export const bostonLocations: BoogLocation[] = [
  {
    id: 'prince-61',
    face: faces.william,
    title: '61 Prince Street',
    year: 1873,
    date: '1873 – c. 1876',
    kind: 'home',
    precision: 'geocoded',
    lat: 42.365122,
    lng: -71.055201,
    facts: [
      'The landing place: a two-room tenement in the Irish North End, seven of them, in the summer of 1873 — off the Queenstown boat and through Castle Garden, where a clerk wrote “laborer” over “bootmaker” and their pounds became $51.20.',
      'From this window William studied a house painter’s technique on the block opposite, bootmaker’s hands flexing — the trade America refused him replaced by one he taught himself by watching.',
      'Joseph, the seventh child, was born here in 1873 and died at seven months of the bad pump water — the first child lost in America. That night Mary drew his X on the folded paper herself.',
      'December 1874: diphtheria took Austin on the 18th and Teresa on Christmas Eve. William cooked, swept, and folded through the winter after, and Mary slowly rose — but her singing never came back.',
      'Evicted around 1876. The address still stands in the same lane today.',
    ],
  },
  {
    id: 'wharf',
    face: faces.mary,
    title: 'The wharf',
    year: 1873,
    date: '1873',
    kind: 'civic',
    precision: 'geocoded',
    lat: 42.366889,
    lng: -71.050778,
    facts: [
      'Where the old trade ended: a man named Kennedy called names from a manifest, and William’s hands — soft from awl and thread, not rope and hook — were passed over. The docks were the last door industrial Boston shut on the bootmaker.',
      'It was here, turned away with the harbor at his back, that the west stopped being a dream he had told Mary in a Dublin lane and started being the plan.',
      'And it was here Mary walked alone and ate an apple — the first thing she had done only for herself since Dublin. “Every door she had ever walked through before this year was on the other side of it.”',
      'The apple became family scripture: years later in St. Paul she told the story to Letitia as proof that every change she ever feared gave her what standing still never would.',
    ],
    caveat: 'The pin is where the family record puts the story — the foot of the North End, a short walk down from Prince Street.',
  },
  {
    id: 'st-stephens',
    title: 'St. Stephen’s — 401 Hanover Street',
    year: 1873,
    date: '1873 – c. 1877',
    kind: 'civic',
    precision: 'geocoded',
    symbol: 'cross',
    lat: 42.365586,
    lng: -71.052819,
    facts: [
      'The family’s first American mass. Mary stood a long moment at the threshold — “I am still here” — wrestling with a faith the crossing had slackened; William sat a half-beat behind the congregation, there only for her.',
      'The name is the joke providence told: a man born on Stephen Street, Dublin crossed an ocean and landed two blocks from St. Stephen’s.',
      'Charles Bulfinch built it in 1804, and it is the only Bulfinch church still standing in Boston. Catholic since 1862, when the Irish flood filled the North End.',
      'In 1870 the widening of Hanover Street had the whole building moved back and jacked up, and the parish kept growing under the crowds — an expanding church always needs painters, and there was a painter two blocks away.',
      'Rose Fitzgerald — born at 4 Garden Court Street, mother of a president — was baptized here in 1890 and buried from here in 1995. The Kennedy calling names on the docks is the book’s nod to the neighbourhood.',
    ],
    caveat: 'The novel seats them in these pews; the parish registers that would prove it have not been pulled.',
  },
  {
    id: 'holy-cross-malden',
    title: 'Holy Cross Cemetery — Malden',
    year: 1874,
    date: '1874–1875',
    kind: 'civic',
    precision: 'geocoded',
    symbol: 'tombstone',
    lat: 42.427248,
    lng: -71.035182,
    facts: [
      'The Boston children lie here: Joseph, seven months, 1874. Austin, seven years, December 18, 1874. Teresa, three, Christmas Eve 1874. And John, born after them, who lived three months of the summer of 1875.',
      'Austin and Teresa were six days apart — diphtheria, the same winter. George and William Junior had stayed behind in Glasnevin; now there were small graves on both sides of the ocean.',
      'The Catholic burial ground north of the city, at 175 Broadway — five miles from Prince Street, the farthest the family’s Boston record reaches.',
      'This is the ground under Mary’s one condition for going west, given before she would board the train: she could not bury another child.',
    ],
  },
  {
    id: 'garden-court-16',
    face: faces.william,
    title: '16 Garden Court Street',
    year: 1876,
    date: 'c. 1876–1877',
    kind: 'home',
    precision: 'geocoded',
    lat: 42.3642,
    lng: -71.053268,
    facts: [
      'After the Prince Street eviction the diminished family moved here, around the corner — and William finished making himself a painter, keeping a notebook of formulas: primers, glazes, the chemistry of the trade.',
      'On the crews the talk was of Bishop Ireland and cheap Minnesota land. William resolved on the West in this house and told no one — least of all Mary.',
      'The last Boston address. From this door they left as a family of four: William, Mary, Mary Margaret, Letitia.',
      'Fourteen years after they left the lane, Rose Fitzgerald Kennedy was born at number four — the same little street, a president’s mother two doors down the record.',
      'The address still stands in the same court today.',
    ],
  },
  {
    id: 'kneeland-depot',
    title: 'Boston & Albany depot — Kneeland Street',
    year: 1877,
    date: 'c. 1877',
    kind: 'civic',
    precision: 'lost',
    symbol: 'train',
    lat: 42.349264,
    lng: -71.057539,
    facts: [
      'The way out: the family of four boarded the westbound train here — Minnesota announced, Mary’s condition given and accepted.',
      'What left on that train: a self-taught painter’s trade, a notebook of formulas, and the folded paper of the children’s names, more of them crossed out than not.',
      'The Boston & Albany’s Kneeland Street passenger depot; the 1881 station on this ground served until South Station opened in 1899 and took its trains.',
      'Nothing of it survives. The pin is the site, not a building.',
    ],
    caveat: 'The 1881 headhouse is the documented building; the family’s train left from this ground a few years before it went up — the same depot site in its earlier form.',
  },
]
