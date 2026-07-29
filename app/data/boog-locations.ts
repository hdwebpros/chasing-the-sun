/**
 * William Boog — St. Paul, Minnesota property & business record.
 *
 * Derived from the Obsidian note `boog_st_paul_master_notes` (Rye's research
 * notes, newspaper clippings, deed abstracts, census records, Rascher's Atlas
 * of St. Paul 1891–96). Minnesota only.
 *
 * Coordinates marked `plat` come from the note's resolved legal-description
 * table. Everything else was geocoded (OpenStreetMap/Nominatim) or, where the
 * street itself is gone, placed at block or district level — always flagged.
 * Do not silently upgrade a precision here; it has to be earned by a source.
 */

export type Precision =
  /** Resolved from the legal description against the 1891–96 plats. */
  | 'plat'
  /** Modern street address geocodes cleanly to a real house number. */
  | 'geocoded'
  /** Right street, uncertain house number or block. */
  | 'approximate'
  /** Street erased (Kellogg Blvd project, I-94). Pin is district-level only. */
  | 'lost'

export type Kind = 'business' | 'home' | 'lot' | 'civic'

export interface BoogLocation {
  id: string
  /** Street address as it should be labeled on the map. */
  title: string
  /** Sorting/filtering year — first year this place enters the record. */
  year: number
  /** Human date as the source gives it. */
  date: string
  kind: Kind
  precision: Precision
  lat: number
  lng: number
  /** Legal description, where one exists. */
  legal?: string
  /** The facts, one line each. Source language preserved. */
  facts: string[]
  /** What is still unsettled about this pin. */
  caveat?: string
  /** Link to a primary source that can be read online. */
  source?: string
  /**
   * Overrides the glyph drawn inside the pin. Without it the pin falls back to
   * its kind: a brush for a shop, a bell for a church, a plain dot otherwise.
   */
  symbol?: 'brush' | 'train' | 'bell' | 'cross' | 'tombstone'
  /**
   * Whose place this was. Only set where someone actually lived here — the pin
   * wears their portrait instead of a plain dot. Investment lots get no face.
   */
  face?: { src: string, name: string }
}

/** Portraits reused across pins, so a change lands everywhere at once. */
export const faces = {
  william: { src: '/images/characters/William-Boog-Portrait.jpg', name: 'William Boog' },
  mary: { src: '/images/characters/Mary-Moran-AI.jpg', name: 'Mary Moran' },
  lottie: { src: '/images/characters/Lottie.jpg', name: 'Charlotte “Lottie” Boog' },
  alex: { src: '/images/characters/alex-boog.jpg', name: 'Alexander Boog' },
  letitia: { src: '/images/characters/Letitia.jpg', name: 'Letitia Boog' },
} as const

export const kindMeta: Record<Kind, { label: string, color: string, icon: string }> = {
  business: { label: 'Shop / business', color: '#d4a54a', icon: 'lucide:paintbrush' },
  home: { label: 'Home', color: '#7fb2d9', icon: 'lucide:home' },
  lot: { label: 'Lot / investment', color: '#8fbf7f', icon: 'lucide:square-dashed' },
  civic: { label: 'Civic', color: '#c98fbf', icon: 'lucide:church' },
}

export const precisionMeta: Record<Precision, { label: string, note: string }> = {
  plat: { label: 'Plat-confirmed', note: 'Legal description resolved against the 1891–96 plats.' },
  geocoded: { label: 'Address located', note: 'Fixed to a modern house number or a surveyed corner.' },
  approximate: { label: 'Approximate', note: 'Right block, close placement — but not fixed to a surviving address.' },
  lost: { label: 'Site lost', note: 'The street no longer exists. Pin is a district-level placement only.' },
}

export const locations: BoogLocation[] = [
  {
    id: 'third-17',
    title: '17 West Third Street',
    year: 1878,
    date: '1 Dec 1878',
    kind: 'business',
    precision: 'geocoded',
    lat: 44.94405,
    lng: -93.097932,
    facts: [
      'Williams & Boog — the first partnership on the record.',
      'Advertised as "under the Chamber of Commerce."',
      'Third Street was renamed Kellogg Boulevard in 1929; the block was substantially rebuilt in the boulevard project.',
      'The site is now 317 Washington Street — Herbie’s on the Park, matched against a plat map. Nothing of the 1878 building survives.',
    ],
  },
  {
    id: 'franklin-corner',
    title: 'Corner of 6th, 7th & Franklin Streets',
    year: 1879,
    date: '27 Apr 1879',
    kind: 'business',
    precision: 'geocoded',
    lat: 44.9464167,
    lng: -93.1005278,
    facts: [
      'Williams & Boog. The advertisement ran under the heading "Removal."',
      'The corner sits at 44°56′47.1″N 93°06′01.9″W today. Franklin itself was largely taken by I-94, so nothing of the storefront survives.',
    ],
  },
  {
    id: 'seventh-63',
    title: '63 West 7th Street',
    year: 1880,
    date: '5 Mar 1880',
    kind: 'business',
    precision: 'geocoded',
    lat: 44.947301,
    lng: -93.0990185,
    facts: ['Williams and Boog. City directory listing.'],
  },
  {
    id: 'ramsey-140',
    face: faces.william,
    title: '140 Ramsey Street (now 377 Ramsey)',
    year: 1877,
    date: '1877 city directory',
    kind: 'home',
    precision: 'geocoded',
    lat: 44.9414417,
    lng: -93.1153057,
    facts: [
      'The first St. Paul address in the record — William is listed living here in the 1877 city directory, a year before the first advertisement for the shop.',
      'The family home, rented — still here in 1880, dwelling #33 on that year’s enumeration.',
      'A fourplex. The Boogs had one unit of four in the building.',
      'Daughter Rose was born here in Feb 1878.',
      'Today 377 Ramsey Street — matched by city directory against the old plat. The street was renumbered, and the stretch was called Grand Avenue in the Boogs’ day.',
      'The pin marks the lot, not the building: the house standing there now went up in 1900, twenty years after the Boogs left.',
    ],
  },
  {
    id: 'tenth-42',
    title: '42 West 10th Street',
    year: 1883,
    date: '20 May 1883',
    kind: 'business',
    precision: 'geocoded',
    lat: 44.9491036,
    lng: -93.1002579,
    facts: [
      'His own shop — the first one that is his alone.',
      'Advertised hiring five painters.',
    ],
  },
  {
    id: 'tenth-58',
    title: '58 West 10th Street',
    year: 1884,
    date: '12 May 1884',
    kind: 'business',
    precision: 'geocoded',
    lat: 44.9489321,
    lng: -93.1006266,
    facts: ['Calcimining advertisement.'],
  },
  {
    id: 'summit-136',
    title: '136 Summit Avenue',
    year: 1884,
    date: '31 Dec 1884',
    kind: 'business',
    precision: 'geocoded',
    lat: 44.9481018,
    lng: -93.1066975,
    facts: [
      'Buys a one-story paint shop on Summit for $500 — his own shop, "next to the skating rink."',
      'The purchase has no street number in the record; the advertisement ten weeks later, 15 Mar 1885, gives the address as 136 Summit.',
      'The nearest building today is the Summit Hill Apartments, a short walk from the Cathedral — the 1885 storefront is long gone.',
    ],
  },
  {
    id: 'linwood-1020',
    title: '1020 Linwood Avenue',
    year: 1885,
    date: '13 Aug 1885',
    kind: 'lot',
    precision: 'plat',
    lat: 44.9349687,
    lng: -93.1432607,
    legal: 'Lot 11, Block 2, Bryant’s Park Addition',
    facts: [
      'Acquired Aug 1885 — the first land in his own name.',
      'Retained when the house lot next door (1016) sold in Apr 1891.',
      '21 Jun 1901 — assessed for tree planting, sixteen years after he bought it.',
    ],
  },
  {
    id: 'linwood-1016',
    face: faces.william,
    title: '1016 Linwood Avenue — the Evergreen house',
    year: 1885,
    date: '24 Dec 1885',
    kind: 'home',
    precision: 'plat',
    lat: 44.9349457,
    lng: -93.1431086,
    legal: 'Lot 10, Block 2, Bryant’s Park Addition',
    facts: [
      'The Evergreen house — the first house William built rather than rented. The street was then called Evergreen Avenue.',
      'Purchased 24 Dec 1885 for $450; building permit issued 27 Jul 1888.',
      'Mary died in this house.',
      '26 Apr 1891 — sold, three years after it went up.',
      '25 Sep 1892 — bought back in Charlotte’s name as part of the Johnson package.',
    ],
  },
  {
    id: 'st-lukes',
    title: 'St. Luke’s chapel — Summit & Lexington',
    year: 1888,
    date: 'Dec 1888',
    kind: 'civic',
    precision: 'geocoded',
    lat: 44.9419004,
    lng: -93.1460667,
    facts: [
      'Co-donates the bell at the chapel, one of four donors.',
      'Reported in the Globe, 23 Dec 1888.',
      'The site is now the Church of St. Thomas More, 1079 Summit Avenue at Lexington.',
    ],
  },
  {
    id: 'boulevard-no-2',
    title: 'Boulevard No. 2 — Dayton Avenue, Griggs to Syndicate',
    year: 1889,
    date: 'Oct 1889',
    kind: 'lot',
    precision: 'approximate',
    lat: 44.9474167,
    lng: -93.1598056,
    legal: 'Lot 12, Block 19, Boulevard No. 2',
    facts: [
      'Purchased from N. L. Bryant for $1,100.',
      'One of the last acquisitions in William’s own name.',
      'Part of the parcel was taken for the Selby line — reported in the St. Paul Pioneer Press, 26 Feb 1890, four months after he bought it.',
      'The ground sits at roughly 44°56′50.7″N 93°09′35.3″W, on the Dayton corridor between Griggs and Syndicate.',
      'This puts it about a mile east of 1895 Dayton, which retires the old worry that the two deeds described the same ground. They are separate parcels.',
    ],
    caveat: 'No street number was ever recovered for this one, and the search for it is closed. The block is right and the deed is solid; the pin sits on the corridor rather than on a doorstep. The discarded "~1865 Dayton" was another AI model’s guess, never plat-derived.',
    source: 'https://newspaperhub.mnhs.org/?a=d&d=sppp18900226.1.9&e=-------en-20--1--img-txIN------------',
  },
  {
    id: 'randolph-906',
    title: '906 Randolph Avenue',
    year: 1891,
    date: '15 Feb 1891',
    kind: 'lot',
    precision: 'plat',
    lat: 44.9267469,
    lng: -93.1383586,
    legal: 'Lot 12, Block 1, Watson’s Addition',
    facts: [
      'Sold to William Boag for $1,650. "Boag" is the ancestral spelling of the family name, not a transcription error.',
      'Conveyed back to Charlotte by Martha Johnson in Sep 1892.',
      'Watson’s Block 1 is bounded by Randolph (N), Juno (S), Milton (W), Victoria (E) — Rascher’s Atlas pp. 317–318.',
      'The corner is a gas station today. Whatever stood on the lot in 1891 was cleared for it.',
    ],
    caveat: 'How the lot reached Martha Johnson between Feb 1891 and Sep 1892 is unrecorded.',
  },
  {
    id: 'iglehart-985',
    face: faces.letitia,
    title: '985 Iglehart Avenue',
    year: 1891,
    date: '20 Sep 1891',
    kind: 'lot',
    precision: 'geocoded',
    lat: 44.9495079,
    lng: -93.1418345,
    legal: 'Lot 1, Block 2, Curry’s Subdivision + Lot 13, Buell & Mackubin’s Out Lots',
    facts: [
      'Letitia sells to William, 20 Sep 1891.',
      'Back to Charlotte in the Sep 1892 Johnson package.',
      'Verified to 985 Iglehart — still a live street address.',
      'The house standing on it went up in 1896, four years after the lot came back to Charlotte. Nothing in the record shows the family selling it in between, so whether they built it or it went up under someone else is open.',
    ],
    caveat: 'The earlier readings — "~1112 Carroll Ave," then 982 Iglehart — were working estimates. 985 is the confirmed number.',
  },
  {
    id: 'dayton-1895',
    title: '1895 Dayton Avenue',
    year: 1891,
    date: '15 Nov 1891',
    kind: 'lot',
    precision: 'plat',
    lat: 44.9474887,
    lng: -93.1803125,
    legal: 'Lot 12, Block 2, Second Addition to Merriam Park',
    facts: [
      'Charlotte purchases, 15 Nov 1891.',
      'The lot appears on the plat between 1889 and 1897, with no house standing on it in 1891.',
      '1595 and 1895 Dayton are both real addresses — not a records error.',
      'No longer in contention with Boulevard No. 2: that lot has been placed a mile east on Dayton, so the two deeds describe two parcels.',
      'A house stands there now, built in 1933 — an unrelated dwelling, forty years after the Boogs. The pin marks the lot, not the building.',
    ],
  },
  {
    id: 'roblyn-1596',
    face: faces.lottie,
    title: '1596 Roblyn Avenue',
    year: 1891,
    date: 'Nov 1891',
    kind: 'home',
    precision: 'approximate',
    lat: 44.95175,
    lng: -93.1679722,
    facts: [
      'One of two adjacent lots bought for $950 the pair, in Charlotte’s name.',
      '1910 Census — Charlotte at 1600 Rondo.',
      '1930 Census — Charlotte at 1596 Roblyn.',
      'Charlotte died at 1596 Roblyn Avenue.',
      'Rondo and Roblyn are the same street: in 1913 the western extension of Rondo, between Pascal and Cretin, was renamed Roblyn Avenue. The census pages record one address, not a move.',
      'Destroyed for the I-94 project, along with the rest of Rondo. The house stood at 44°57′06.3″N 93°10′04.7″W; there is nothing left to stand in front of.',
    ],
    caveat: 'This address no longer exists — the freeway took the block and the numbers with it. The pin is a close placement on ground that is now roadway, not a standing address.',
  },
  {
    id: 'roblyn-1600',
    face: faces.alex,
    title: '1600 Roblyn Avenue',
    year: 1891,
    date: 'Nov 1891',
    kind: 'home',
    precision: 'approximate',
    lat: 44.95175,
    lng: -93.1682,
    facts: [
      'The second of the pair, next door to 1596.',
      '1930 Census — Alexander at 1600 Roblyn, next door to his mother.',
      'Listed as 1600 Rondo in 1910 — the same address under the pre-1913 name.',
      'Destroyed for I-94 with its neighbour. The two houses share one surveyed point; this pin is nudged a lot west so the pair can be told apart on the map.',
    ],
    caveat: 'Gone with the rest of Rondo. The placement is close — within a lot or two — but there is no surviving address behind it.',
  },
  {
    id: 'merriam-blk4',
    title: 'Lot 12, Block 4, Merriam Park',
    year: 1892,
    date: '12 Jun 1892',
    kind: 'lot',
    precision: 'approximate',
    lat: 44.9532778,
    lng: -93.1844167,
    legal: 'Lot 12, Block 4, Merriam Park',
    facts: [
      'Charlotte A. Boog sells to Ernest Albrecht for $1,100. No acquisition record.',
      'Block 4 is located: Rascher’s Atlas Vol. 2, p. 195 — bounded by Milwaukee Ave (N), Astoria (W), Merriam (E), open park ground (S), St. Anthony along the southwest.',
      'Taken for I-94. The lot sits at roughly 44°57′11.8″N 93°11′03.9″W; the nearest thing standing is Merriam Park itself.',
      'Dayton Avenue appears nowhere on p. 195, which keeps this parcel distinct from 1895 Dayton.',
    ],
    caveat: 'A close estimate rather than a fixed address — the block is right, but the freeway removed the ground and the lot lines with it.',
  },
  {
    id: 'dayton-1595',
    face: faces.william,
    title: '1595 Dayton Avenue',
    year: 1892,
    date: '4 Dec 1892',
    kind: 'home',
    precision: 'plat',
    lat: 44.9476202,
    lng: -93.167833,
    legal: 'Lot 13, Block 1, Oakland Park Addition',
    facts: [
      'Charlotte purchases for $2,100 — the family moves in.',
      '5 Dec 1898 — wallpaper-cleaning advertisement run from this address.',
      '1900 Census, Ward 11 — William at 1595 Dayton. His last St. Paul house.',
      'The enumeration reads 1595 clearly; this is not a misreading of 1895 Dayton, which the family owned separately.',
    ],
  },
  {
    id: 'union-depot',
    title: 'Union Depot — 214 East 4th Street',
    year: 1900,
    date: 'Spring 1900',
    kind: 'civic',
    precision: 'geocoded',
    symbol: 'train',
    lat: 44.9473029,
    lng: -93.0857476,
    facts: [
      'Where William left. He boards alone for Grants Pass in the spring of 1900, and the family stays behind.',
      'This is the departure, not the arrival. William reached St. Paul in 1876 or 1877, before Union Depot existed — whatever platform he first stepped onto belonged to some other road, and the record here does not say which.',
      'Three depots, one site. The first opened 1881 and burned in 1884; the rebuild is what William walked through in 1900; it burned again on 3 October 1913. The head house standing today went up between 1917 and 1923 on the same block, between Sibley and Wacouta. The ground has never moved.',
    ],
  },
  {
    id: 'carroll-1625',
    face: faces.alex,
    title: '1625 Carroll Avenue',
    year: 1940,
    date: '1940 Census',
    kind: 'home',
    precision: 'geocoded',
    lat: 44.9504496,
    lng: -93.168881,
    facts: [
      'Alexander, forty-nine years downstream of the Roblyn purchase. He moved here after Lottie died.',
      'His son William — the author’s grandfather — grew up in this house.',
      'Still standing. Past the last page of the book, but the one address on this map where the family line kept going.',
      'The only Carroll Avenue address left in the record now that Curry’s resolves to Iglehart.',
    ],
  },

  // ------------------------------------------------------------------------
  // The convent record — Letitia Agnes Boog, Sister M. Berissima (1869–1943).
  //
  // Sourced from her Sisters of St. Joseph of Carondelet, St. Paul Province
  // record card and her printed necrology (family copies, July 2026), plus the
  // 1900 federal census and the "entered the Sisterhoods" newspaper list.
  // Card dates: entrance 7 Sept 1891 · reception 19 Mar 1892 · first vows
  // 19 Mar 1894 · final vows 15 Aug 1899 · died 8 Jan 1943.
  // ------------------------------------------------------------------------
  {
    id: 'st-marks',
    title: 'Church of St. Mark — 2001 Dayton Avenue',
    year: 1891,
    date: 'Sept 1891',
    kind: 'civic',
    precision: 'geocoded',
    symbol: 'cross',
    lat: 44.947341,
    lng: -93.18493,
    facts: [
      'The family’s parish once the Dayton Avenue ground was theirs — 1895 Dayton is four hundred feet west of this corner.',
      'Letitia was the first member of St. Mark’s Parish to enter the Novitiate of the Sisters of St. Joseph. Her necrology says so outright.',
      'The parish was founded in 1889. She entered two years later, so the family arrived and its first daughter left almost in the same breath.',
    ],
    caveat: 'Nothing standing here today is a building she knew. The parish school went up in 1913 (staffed by the Sisters of St. Joseph) and the English Gothic church in 1918–19, both long after she left. The pin marks the parish, not the buildings.',
  },
  {
    id: 'st-josephs-academy',
    face: faces.letitia,
    title: 'St. Joseph’s Academy — 355 Marshall Avenue',
    year: 1891,
    date: '7 Sept 1891',
    kind: 'civic',
    precision: 'geocoded',
    symbol: 'cross',
    lat: 44.9490603,
    lng: -93.1150951,
    facts: [
      'The Sisters of St. Joseph’s house at Marshall and Western — a girls’ academy from 1851 to 1971, and the order’s ground in St. Paul when Letitia entered.',
      'She entered on 7 September 1891, aged twenty-two, and was received as Sister M. Berissima on 19 March 1892.',
      'The building is still there. Raised in 1863 with additions in 1871, 1877 and 1888 — the newest wing three years old the autumn she walked in.',
      'Oldest Catholic school building in Minnesota; on the National Register.',
      'Christ’s Household of Faith bought the campus in 1976 and runs a school on it now.',
    ],
    caveat: 'The address is certain and the order’s presence here is certain; that the novitiate itself sat at this address in September 1891 is inference, not record. The purpose-built novitiate on Randolph is 1912. The CSJ archives could settle it.',
  },
  {
    id: 'st-agathas',
    face: faces.letitia,
    title: 'St. Agatha’s Conservatory — 26 East Exchange Street',
    year: 1900,
    date: '1900 census',
    kind: 'civic',
    precision: 'geocoded',
    symbol: 'cross',
    lat: 44.9491623,
    lng: -93.0972695,
    facts: [
      'Minnesota’s first fine-arts school, opened 1884 by the Sisters of St. Joseph — founded by Ellen and Eliza Ireland, the archbishop’s sisters, with Ellen Howard.',
      'Letitia studied here before she entered, then came back to teach art. Her necrology puts it plainly: she taught "at Saint Agatha’s Conservatory where she had formerly been a student."',
      'The 1900 census lists her living at this address.',
      'Oil on canvas and on fired china — the two trades she carried the rest of her life.',
      'The six-storey Beaux Arts building here now went up in 1908–10 to John H. Wheeler’s design, replacing what stood on the ground before it. The conservatory closed in 1962; the building is the Celeste of St. Paul Hotel + Bar today, and still tells its convent history.',
    ],
    caveat: 'The 1908–10 building is not the one she boarded in — but the address is hers, and the census proves the site was in use eight years before the new construction.',
  },
  {
    id: 'derham-hall',
    face: faces.letitia,
    title: 'Derham Hall, College of St. Catherine — 2004 Randolph Avenue',
    year: 1904,
    date: '1904–1910',
    kind: 'civic',
    precision: 'geocoded',
    symbol: 'cross',
    lat: 44.926973,
    lng: -93.185111,
    facts: [
      'The Sisters of St. Joseph opened the college in 1905 under Mother Seraphine Ireland. Derham Hall, built 1903–04, was the first building — named for Hugh Derham, who gave the $20,000 that raised it.',
      'Letitia was in the pioneer group that opened it and ran the art class for nine years. Her record card dates the posting 1904–1910.',
      'Her painting of St. Catherine hangs near the main entrance. She painted the portrait of Mr. Derham as well.',
      'The most famous Berissima Boog is in the admissions office today.',
      'This is where the copyist made an original. Her own letters from Florence call her "a perfectionist and a skilled copyist, and that is the whole of it" — then they hung her work by the front door.',
    ],
  },
  {
    id: 'carondelet-randolph',
    title: 'Sisters of St. Joseph of Carondelet — 1884 Randolph Avenue',
    year: 1943,
    date: '11 Jan 1943',
    kind: 'civic',
    precision: 'geocoded',
    symbol: 'cross',
    lat: 44.9269551,
    lng: -93.1799486,
    facts: [
      'The St. Paul Province house. Some of Letitia’s paintings are held here.',
      'Her funeral was next door at Our Lady of the Presentation Chapel, 1880 Randolph.',
      'The Carondelet Center at 1890 Randolph, on the same ground, was built in 1912 as the order’s purpose-built novitiate — twenty-one years after she entered.',
    ],
  },
  {
    id: 'resurrection-cemetery',
    title: 'Resurrection Cemetery, Mendota Heights',
    year: 1943,
    date: '8 Jan 1943',
    kind: 'civic',
    precision: 'geocoded',
    symbol: 'tombstone',
    lat: 44.876286,
    lng: -93.1508847,
    facts: [
      'Letitia died of pneumonia at St. Mary’s Hospital in Minneapolis on 8 January 1943, in the seventy-fourth year of her age and the fifty-first of her religious life.',
      'Buried here. Her record card names her parents on the line above: William Boog — Dublin, Ireland; Mary Anne Moran — Dublin, Ireland.',
      'Between the novitiate and the grave she taught twenty-five years at St. John’s Academy in Jamestown, North Dakota, and six at St. James in Grand Forks. Most of her working life was spent well outside this map.',
    ],
  },
]
