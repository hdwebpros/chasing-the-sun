/**
 * William Boog — Dublin, Ireland record, 1841–1873.
 *
 * Derived from the story bible (bible-index.md / bible-full.md, Prologue–Ch 9)
 * plus period sources: the 1862 Dublin Street Directory for Aston's Quay,
 * Buildings of Ireland and Archiseek for SS Michael and John's, the NLI
 * catalogue for the Michael's Lane photograph. All Dublin addresses are
 * verified against the family record (per Ryan, July 2026) — precision is
 * 'geocoded' across the board.
 *
 * Aston's Quay numbering (against intuition): No. 1 stood at Bedford Row, the
 * WEST end, and the numbers ascended EASTWARD to No. 22 at Carlisle (O'Connell)
 * Bridge — proven by the 1862 directory.
 */

import type { BoogLocation } from './boog-locations'
import { faces } from './boog-locations'

export const dublinIntro = 'Every address the family can be placed at in Dublin, from William’s birth in '
  + 'the Stephen Street tenements in 1841 to the dawn they walked away from number thirteen '
  + 'Aston’s Quay in April 1873 — the shop signs still hanging. A boyhood, a trade, a '
  + 'marriage, two small graves, and a name painted over three doors.'

export const dublinEssay = {
  title: 'What the map says about him',
  paras: [
    'The whole Dublin record fits inside one walk. Stephen Street to Michael’s Lane is '
    + 'ten minutes; Michael’s Lane to the church is five; the church to Aston’s Quay is '
    + 'five more. A man was born, starved, apprenticed, married, and made his name inside a '
    + 'square mile of the south city — and the one pin outside it is a grave.',
    'The moves all point the same way: downhill, toward the river. Stephen Street was a '
    + 'tenement; the quay was a shopfront with his name over the door. Number seven had a '
    + 'broken door he rehung true. Number six had room above the door for a real sign. '
    + 'Number thirteen was the corner unit beside McBirney’s, the biggest store on the '
    + 'quay. He never got a house out of Dublin — every rung of the ladder was a door with '
    + 'BOOG painted over it.',
    'And when they left before dawn for Queenstown, he did not take the signs down. The '
    + 'name stayed on number thirteen as proof — a name from nothing, twice: once invented '
    + 'from Boag to hide a birth, once painted on a stall by an eighteen-year-old who owned '
    + 'nothing else. What he carried out instead was the folded paper of his children’s '
    + 'names, two of them already crossed out.',
  ],
  coda: 'The quay row the Boogs knew is gone or rebuilt — McBirney’s traded until 1984 and the '
    + 'block is retail still. The church survives: deconsecrated in 1989, it is the Smock Alley '
    + 'Theatre now, and its parish registers are in the National Library. Glasnevin keeps its '
    + 'dead — a million and a half of them — but George’s grave was never marked, and the only '
    + 'record of it crossed the Atlantic in William’s breast pocket.',
}

export const dublinLocations: BoogLocation[] = [
  {
    id: 'stephen-38',
    face: faces.william,
    title: '38 Stephen Street Lower',
    year: 1841,
    date: '12 Nov 1841',
    kind: 'home',
    precision: 'geocoded',
    lat: 53.341366,
    lng: -6.264734,
    facts: [
      'Born here 12 Nov 1841, to an unmarried young woman, and handed to James and Mary Boog to raise as their own — the surname itself an invention, Scottish Boag respelled Boog.',
      'Named William because ordinary boys lived.',
      'By 1849 the Great Starvation had walked Stephen Street end to end and taken every third door.',
      'At twelve he stood in the rain outside Doyle’s bootmaker workshop until they took him on unpaid; at eighteen he painted BOOG — BOOTS & SHOES on his own stall — his name fixed for the first time on something in the physical world.',
      'The street’s curve is older than the addresses: it follows the line of a 12th-century embankment outside the medieval walls, named for St Stephen’s leper hospital.',
    ],
    caveat: 'The house number is from the family record. The Georgian houses that became these tenements are largely gone — the pin marks the address, not a surviving door.',
  },
  {
    id: 'michaels-lane',
    face: faces.mary,
    title: 'Michael’s Lane',
    year: 1859,
    date: 'c. 1859–1864',
    kind: 'business',
    precision: 'geocoded',
    lat: 53.343889,
    lng: -6.272361,
    facts: [
      'Where William first saw fifteen-year-old washerwoman Mary Moran through an open wash-house door, steam billowing out into the lane.',
      'Five years of collisions, hand-stitched gloves, and sunset walks ran through this block — walking out together by 1862, understood as a pair by the winter of 1863.',
      'It was in these years he told her his dream: to follow the sun west.',
      'The lane dropped off St Michael’s Hill under the shadow of Christ Church toward Cook Street; for generations its backs were occupied by the clothes brokers of the Liberties.',
      'A photograph catalogued simply “Michael’s Lane, Dublin” is held by the National Library of Ireland (Lawrence Collection) — one of the famous images of the lanes as the Boogs knew them. It is the picture to search for.',
    ],
    caveat: 'The pin is the lane, not a numbered door — Mary’s wash-house and the tenement she shared with her sisters were never given numbers in the record.',
    source: 'https://catalogue.nli.ie/Record/vtls000040941',
  },
  {
    id: 'ss-michael-john',
    title: 'SS Michael and John’s — Lower Exchange Street',
    year: 1864,
    date: 'Spring 1864',
    kind: 'civic',
    precision: 'geocoded',
    symbol: 'cross',
    lat: 53.344988,
    lng: -6.269179,
    facts: [
      'William and Mary married here in spring 1864 — a nearly empty church, ringless, too poor afterward to live together. The distance between their two doors was less than a quarter mile, and it might as well have been the Atlantic.',
      'Built 1815 on the shell of the 1662 Smock Alley Theatre — one of Dublin’s first Catholic churches after the Penal Laws.',
      'Reputedly the first Catholic church since the Reformation to ring a bell for Mass; the legal threat that followed was faced down by Daniel O’Connell.',
      'Deconsecrated in 1989 and now the Smock Alley Theatre again — the building came full circle. The parish registers survive at the National Library of Ireland.',
    ],
    source: 'https://www.archiseek.com/1813-former-church-of-st-michael-and-john-essex-quay-dublin/',
  },
  {
    id: 'aston-7',
    face: faces.william,
    title: '7 Aston’s Quay',
    year: 1865,
    date: '1865',
    kind: 'business',
    precision: 'geocoded',
    lat: 53.346296,
    lng: -6.261209,
    facts: [
      'The first home of their own — a filthy shopfront with a broken door, out of the tenements at last. William rehung the door true and painted W. BOOG — BOOTMAKER in clean block letters.',
      'At dusk the last of the copper light caught the letters of his name above the door.',
      'Firstborn George died here of whooping cough at eleven months.',
      'In 1862 the door had belonged to Benj. Hawkins, carver and gilder; the quay was a row of picture-framers, stationers, gunsmiths and booksellers on the Liffey’s south bank.',
    ],
    caveat: 'The quay’s numbering ran No. 1 at Bedford Row ascending east to the bridge — this door is placed from the 1862 directory against the surviving McBirney’s block.',
    source: 'https://www.libraryireland.com/Dublin-Street-Directory-1862/51.php',
  },
  {
    id: 'aston-6',
    face: faces.william,
    title: '6 Aston’s Quay',
    year: 1867,
    date: 'c. 1867',
    kind: 'business',
    precision: 'geocoded',
    lat: 53.346271,
    lng: -6.261299,
    facts: [
      'After George’s burial the family moved one door to the left and called it progress.',
      'Twice the size of number seven, with space above the door for a real sign.',
      'Austin (1867), Mary Margaret (1868) and Letitia (1869) were born on the quay, each name added to the folded paper William carried.',
      'In 1862 this had been Saml. Fetherston’s — engraver, dealer in pictures and antiquities. Fittingly for the street, No. 1 up the row was P. Brady, bootmaker.',
    ],
    caveat: 'One door west of number seven, about ten metres — the pair read as neighbours on the map just as they were.',
    source: 'https://www.libraryireland.com/Dublin-Street-Directory-1862/51.php',
  },
  {
    id: 'aston-13',
    face: faces.william,
    title: '13 Aston’s Quay',
    year: 1870,
    date: '1870 – Apr 1873',
    kind: 'business',
    precision: 'geocoded',
    lat: 53.34644,
    lng: -6.260668,
    facts: [
      'The gamble: the corner shop at Lee’s Lane, one block from Carlisle Bridge, next door to McBirney’s — the biggest store on the quay. Trade boomed.',
      'An advertisement in the Irish Times, 7 Apr 1870, signed “William Boog, 13 Aston’s Quay.” The pub men christened him Mr. Fancy Boots.',
      'Teresa and William Junior were born here; William Junior died at eleven months, like George — two names crossed out on the folded paper.',
      'April 1873: the family left number thirteen before dawn for Queenstown and the SS City of Paris, 863 souls on the manifest. The signs still hung above the door. He did not take them down.',
      'Decades later his granddaughter Rose painted this shopfront from dinner-table stories alone: Wm. Boog. Bootmaker. Number thirteen Aston’s Quay.',
      'In 1862 the unit was Joseph Kenny’s fishing-tackle manufactory — genuinely a corner door, with Lee’s Lane running off the quay between Nos 13 and 14.',
    ],
    caveat: 'The Lee’s Lane corner beside the McBirney’s block, per the 1862 directory. The novel puts it “at the foot of Carlisle Bridge” — the directory stretches that by about seventy metres.',
    source: 'https://www.libraryireland.com/Dublin-Street-Directory-1862/51.php',
  },
  {
    id: 'glasnevin',
    title: 'Glasnevin Cemetery — Finglas Road',
    year: 1866,
    date: 'c. 1866',
    kind: 'civic',
    precision: 'geocoded',
    symbol: 'tombstone',
    lat: 53.370186,
    lng: -6.277143,
    facts: [
      'George Boog, dead of whooping cough at eleven months, was buried here in an unmarked grave — iron gates standing open under the gray Irish sky.',
      'The only mark of him in the world rode home in William’s breast pocket: the X after his name on the folded paper.',
      'William Junior, the second son lost at eleven months, most likely lies here too — the record names Glasnevin only for George, but Mary refused America for years because of two buried sons.',
      'Opened in 1832 through Daniel O’Connell’s campaign, a cemetery where Catholics could at last be buried with dignity; around a million and a half burials now — more than the living city. The pin stands at O’Connell’s round tower by the Finglas Road gate.',
    ],
    caveat: 'An unmarked grave has no coordinate. The pin is the cemetery’s landmark tower, not the plot — the plot was the point.',
  },
]
