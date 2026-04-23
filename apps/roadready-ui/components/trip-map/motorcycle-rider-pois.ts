/**
 * Curated riding highlights: famous twisty roads, scenic byways, and rally towns.
 * `path` entries are approximate polylines for map illustration only — not survey-grade geometry.
 */
export type RiderPoiKind = 'iconic_road' | 'scenic_byway' | 'rally_town' | 'international';

export type RiderPathCoord = { lat: number; lng: number };

export type MotorcycleRiderPoi = {
  id: string;
  name: string;
  /** Representative point (label / popup anchor). */
  lat: number;
  lng: number;
  region: string;
  kind: RiderPoiKind;
  blurb: string;
  /** Approximate corridor along the ride (when known); shown under the marker when overlay is on. */
  path?: readonly RiderPathCoord[];
};

/* —— Approximate paths (visualization only) —— */

const PATH_TAIL_DRAGON: readonly RiderPathCoord[] = [
  { lat: 35.283, lng: -83.987 },
  { lat: 35.295, lng: -83.972 },
  { lat: 35.308, lng: -83.952 },
  { lat: 35.318, lng: -83.921 },
  { lat: 35.328, lng: -83.898 },
  { lat: 35.338, lng: -83.878 },
  { lat: 35.352, lng: -83.852 },
];

const PATH_CHEROHALA: readonly RiderPathCoord[] = [
  { lat: 35.318, lng: -84.128 },
  { lat: 35.335, lng: -84.06 },
  { lat: 35.352, lng: -83.99 },
  { lat: 35.372, lng: -83.92 },
  { lat: 35.395, lng: -83.84 },
];

const PATH_BLUE_RIDGE: readonly RiderPathCoord[] = [
  { lat: 35.262, lng: -82.968 },
  { lat: 35.285, lng: -82.93 },
  { lat: 35.305, lng: -82.885 },
  { lat: 35.328, lng: -82.84 },
  { lat: 35.348, lng: -82.8 },
];

const PATH_SKYLINE: readonly RiderPathCoord[] = [
  { lat: 38.458, lng: -78.452 },
  { lat: 38.522, lng: -78.412 },
  { lat: 38.578, lng: -78.382 },
  { lat: 38.613, lng: -78.358 },
];

const PATH_NATCHEZ: readonly RiderPathCoord[] = [
  { lat: 36.082, lng: -87.042 },
  { lat: 36.118, lng: -86.98 },
  { lat: 36.152, lng: -86.902 },
  { lat: 36.182, lng: -86.845 },
];

const PATH_PIG_TRAIL: readonly RiderPathCoord[] = [
  { lat: 35.785, lng: -93.702 },
  { lat: 35.798, lng: -93.675 },
  { lat: 35.808, lng: -93.658 },
  { lat: 35.818, lng: -93.645 },
  { lat: 35.828, lng: -93.628 },
];

const PATH_TWISTED_SISTERS: readonly RiderPathCoord[] = [
  { lat: 29.992, lng: -99.522 },
  { lat: 30.018, lng: -99.455 },
  { lat: 30.042, lng: -99.382 },
  { lat: 30.028, lng: -99.328 },
  { lat: 29.985, lng: -99.412 },
  { lat: 29.978, lng: -99.488 },
];

const PATH_MILLION_DOLLAR: readonly RiderPathCoord[] = [
  { lat: 38.022, lng: -107.672 },
  { lat: 38.058, lng: -107.735 },
  { lat: 38.095, lng: -107.805 },
  { lat: 38.128, lng: -107.88 },
  { lat: 38.158, lng: -107.95 },
];

const PATH_PIKES_PEAK: readonly RiderPathCoord[] = [
  { lat: 38.805, lng: -104.978 },
  { lat: 38.818, lng: -104.995 },
  { lat: 38.832, lng: -105.018 },
  { lat: 38.848, lng: -105.038 },
];

const PATH_BEARTOOTH: readonly RiderPathCoord[] = [
  { lat: 45.176, lng: -109.248 },
  { lat: 45.095, lng: -109.195 },
  { lat: 45.02, lng: -109.155 },
  { lat: 44.972, lng: -109.138 },
  { lat: 44.945, lng: -109.152 },
];

const PATH_GOING_SUN: readonly RiderPathCoord[] = [
  { lat: 48.562, lng: -114.028 },
  { lat: 48.615, lng: -113.945 },
  { lat: 48.665, lng: -113.865 },
  { lat: 48.697, lng: -113.818 },
];

const PATH_NEEDLES: readonly RiderPathCoord[] = [
  { lat: 43.868, lng: -103.512 },
  { lat: 43.885, lng: -103.485 },
  { lat: 43.902, lng: -103.468 },
  { lat: 43.895, lng: -103.492 },
];

const PATH_STURGIS_LOOP: readonly RiderPathCoord[] = [
  { lat: 44.488, lng: -103.858 },
  { lat: 44.452, lng: -103.62 },
  { lat: 44.412, lng: -103.508 },
  { lat: 44.38, lng: -103.72 },
  { lat: 44.45, lng: -103.82 },
];

const PATH_PCH_BIG_SUR: readonly RiderPathCoord[] = [
  { lat: 36.402, lng: -121.968 },
  { lat: 36.375, lng: -121.93 },
  { lat: 36.352, lng: -121.905 },
  { lat: 36.332, lng: -121.888 },
];

const PATH_ANGELES_CREST: readonly RiderPathCoord[] = [
  { lat: 34.205, lng: -118.128 },
  { lat: 34.228, lng: -118.11 },
  { lat: 34.248, lng: -118.098 },
  { lat: 34.262, lng: -118.088 },
];

const PATH_UTAH12: readonly RiderPathCoord[] = [
  { lat: 37.772, lng: -111.608 },
  { lat: 37.788, lng: -111.628 },
  { lat: 37.805, lng: -111.648 },
  { lat: 37.822, lng: -111.658 },
];

const PATH_OVERSEAS: readonly RiderPathCoord[] = [
  { lat: 24.642, lng: -81.118 },
  { lat: 24.678, lng: -81.092 },
  { lat: 24.712, lng: -81.072 },
  { lat: 24.748, lng: -81.048 },
];

const PATH_TALIMENA: readonly RiderPathCoord[] = [
  { lat: 34.708, lng: -94.582 },
  { lat: 34.732, lng: -94.608 },
  { lat: 34.758, lng: -94.632 },
  { lat: 34.742, lng: -94.618 },
];

const PATH_CABOT: readonly RiderPathCoord[] = [
  { lat: 46.832, lng: -60.95 },
  { lat: 46.862, lng: -60.88 },
  { lat: 46.892, lng: -60.795 },
  { lat: 46.875, lng: -60.84 },
];

const PATH_STELVIO: readonly RiderPathCoord[] = [
  { lat: 46.508, lng: 10.382 },
  { lat: 46.518, lng: 10.415 },
  { lat: 46.525, lng: 10.442 },
  { lat: 46.529, lng: 10.451 },
];

const PATH_TRANSFAGARASAN: readonly RiderPathCoord[] = [
  { lat: 45.552, lng: 24.575 },
  { lat: 45.575, lng: 24.595 },
  { lat: 45.595, lng: 24.612 },
  { lat: 45.612, lng: 24.628 },
];

const PATH_GREAT_OCEAN: readonly RiderPathCoord[] = [
  { lat: -38.68, lng: 143.62 },
  { lat: -38.715, lng: 143.64 },
  { lat: -38.752, lng: 143.665 },
  { lat: -38.785, lng: 143.69 },
];

export const MOTORCYCLE_RIDER_POIS: readonly MotorcycleRiderPoi[] = [
  {
    id: 'tail-dragon',
    name: 'Tail of the Dragon (US 129)',
    lat: 35.3179,
    lng: -83.9207,
    region: 'North Carolina / Tennessee',
    kind: 'iconic_road',
    blurb: 'Dense switchbacks — respect limits and other road users.',
    path: PATH_TAIL_DRAGON,
  },
  {
    id: 'cherohala',
    name: 'Cherohala Skyway',
    lat: 35.3604,
    lng: -83.9373,
    region: 'Tennessee / North Carolina',
    kind: 'scenic_byway',
    blurb: 'High ridge ride with long sight lines and big elevation.',
    path: PATH_CHEROHALA,
  },
  {
    id: 'blue-ridge',
    name: 'Blue Ridge Parkway',
    lat: 35.3054,
    lng: -82.8854,
    region: 'North Carolina',
    kind: 'scenic_byway',
    blurb: 'Classic Appalachian parkway — mind speed limits and wildlife.',
    path: PATH_BLUE_RIDGE,
  },
  {
    id: 'skyline',
    name: 'Skyline Drive',
    lat: 38.6126,
    lng: -78.3575,
    region: 'Virginia (Shenandoah)',
    kind: 'scenic_byway',
    blurb: 'Ridge-top national park road; seasonal closures possible.',
    path: PATH_SKYLINE,
  },
  {
    id: 'natchez-trace',
    name: 'Natchez Trace Parkway',
    lat: 36.1564,
    lng: -86.8492,
    region: 'Tennessee',
    kind: 'scenic_byway',
    blurb: 'Smooth, commercial-traffic-free federal parkway.',
    path: PATH_NATCHEZ,
  },
  {
    id: 'pig-trail',
    name: 'Pig Trail (AR 23)',
    lat: 35.8121,
    lng: -93.6542,
    region: 'Arkansas Ozarks',
    kind: 'iconic_road',
    blurb: 'Tight forest run — popular with sport and adventure bikes.',
    path: PATH_PIG_TRAIL,
  },
  {
    id: 'twisted-sisters',
    name: 'Twisted Sisters (Ranch Roads 335/336/337)',
    lat: 30.0126,
    lng: -99.3895,
    region: 'Texas Hill Country',
    kind: 'iconic_road',
    blurb: 'Three linked loops — cattle guards and sharp drops.',
    path: PATH_TWISTED_SISTERS,
  },
  {
    id: 'million-dollar',
    name: 'Million Dollar Highway (US 550)',
    lat: 38.0219,
    lng: -107.6716,
    region: 'Colorado (Ouray–Silverton)',
    kind: 'iconic_road',
    blurb: 'Cliffside mountain highway — weather changes fast.',
    path: PATH_MILLION_DOLLAR,
  },
  {
    id: 'pikes-peak',
    name: 'Pikes Peak Highway',
    lat: 38.8408,
    lng: -105.0423,
    region: 'Colorado',
    kind: 'scenic_byway',
    blurb: 'Summit road — reservations and vehicle rules apply.',
    path: PATH_PIKES_PEAK,
  },
  {
    id: 'beartooth',
    name: 'Beartooth Highway',
    lat: 44.967,
    lng: -109.262,
    region: 'Montana / Wyoming',
    kind: 'scenic_byway',
    blurb: 'High-alpine pass — often closed in winter.',
    path: PATH_BEARTOOTH,
  },
  {
    id: 'going-sun',
    name: 'Going-to-the-Sun Road',
    lat: 48.6974,
    lng: -113.8183,
    region: 'Montana (Glacier NP)',
    kind: 'scenic_byway',
    blurb: 'National park — timed entry / vehicle limits in season.',
    path: PATH_GOING_SUN,
  },
  {
    id: 'needles',
    name: 'Needles Highway',
    lat: 43.8879,
    lng: -103.4775,
    region: 'South Dakota (Black Hills)',
    kind: 'iconic_road',
    blurb: 'Narrow tunnels and granite spires — great with Needles Eye.',
    path: PATH_NEEDLES,
  },
  {
    id: 'sturgis',
    name: 'Sturgis & Black Hills',
    lat: 44.4097,
    lng: -103.5091,
    region: 'South Dakota',
    kind: 'rally_town',
    blurb: 'Rally hub with endless day loops (Spearfish, Custer, Deadwood).',
    path: PATH_STURGIS_LOOP,
  },
  {
    id: 'pch-bixby',
    name: 'Big Sur Coast (PCH)',
    lat: 36.3573,
    lng: -121.903,
    region: 'California',
    kind: 'scenic_byway',
    blurb: 'Ocean cliffs — check Caltrans for closures and fog.',
    path: PATH_PCH_BIG_SUR,
  },
  {
    id: 'angeles-crest',
    name: 'Angeles Crest Highway',
    lat: 34.2594,
    lng: -118.0903,
    region: 'California',
    kind: 'iconic_road',
    blurb: 'LA-adjacent mountain sweepers — traffic on weekends.',
    path: PATH_ANGELES_CREST,
  },
  {
    id: 'utah12',
    name: 'Utah Scenic Byway 12',
    lat: 37.798,
    lng: -111.643,
    region: 'Utah',
    kind: 'scenic_byway',
    blurb: 'Escalante “Hogback” ridges — stunning desert riding.',
    path: PATH_UTAH12,
  },
  {
    id: 'overseas',
    name: 'Overseas Highway',
    lat: 24.7137,
    lng: -81.0904,
    region: 'Florida Keys',
    kind: 'scenic_byway',
    blurb: 'Ocean bridges — crosswinds and tourists in season.',
    path: PATH_OVERSEAS,
  },
  {
    id: 'talimena',
    name: 'Talimena Scenic Drive',
    lat: 34.7384,
    lng: -94.6237,
    region: 'Oklahoma / Arkansas',
    kind: 'scenic_byway',
    blurb: 'Ouachita ridgeline — fall color is peak season.',
    path: PATH_TALIMENA,
  },
  {
    id: 'cabot',
    name: 'Cabot Trail',
    lat: 46.8187,
    lng: -60.8688,
    region: 'Nova Scotia, Canada',
    kind: 'scenic_byway',
    blurb: 'Coastal highlands loop — moose and weather are real factors.',
    path: PATH_CABOT,
  },
  {
    id: 'stelvio',
    name: 'Stelvio Pass',
    lat: 46.5289,
    lng: 10.4509,
    region: 'Italy',
    kind: 'international',
    blurb: 'Hairpins galore — busy in summer; respect alpine conditions.',
    path: PATH_STELVIO,
  },
  {
    id: 'transfagarasan',
    name: 'Transfăgărășan',
    lat: 45.5988,
    lng: 24.6164,
    region: 'Romania',
    kind: 'international',
    blurb: 'Carpathian pass — seasonal opening; dramatic tunnels.',
    path: PATH_TRANSFAGARASAN,
  },
  {
    id: 'great-ocean',
    name: 'Great Ocean Road',
    lat: -38.75,
    lng: 143.67,
    region: 'Victoria, Australia',
    kind: 'international',
    blurb: 'Cliffs and surf — left traffic; tourist coaches in summer.',
    path: PATH_GREAT_OCEAN,
  },
];

export const RIDER_POI_KIND_LABEL: Record<RiderPoiKind, string> = {
  iconic_road: 'Iconic road',
  scenic_byway: 'Scenic byway',
  rally_town: 'Rally / hub',
  international: 'International',
};
