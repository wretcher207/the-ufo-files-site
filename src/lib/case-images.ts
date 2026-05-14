/**
 * Maps case + entity slugs to local image paths.
 * All images live under public/img/archive/.
 * All public domain (FBI Vault, NASA, Wikimedia Commons / US gov works).
 */

export interface ArchivalImage {
  src: string;
  alt: string;
  caption: string;
}

const CASE_IMAGES: Record<string, ArchivalImage> = {
  'guy-hottel-three-saucers-new-mexico-1950': {
    src: '/img/archive/hottel-memo-1950.jpg',
    alt: "Page one of the March 22, 1950 FBI memorandum from Guy Hottel to J. Edgar Hoover.",
    caption: 'FBI memorandum / 22 March 1950 / 62-83894 / Guy Hottel to Hoover',
  },
  'kenneth-arnold-cascade-1947': {
    src: '/img/archive/arnold-aaf-document.jpg',
    alt: "Kenneth Arnold's July 12, 1947 hand-drawn sketch of nine objects observed near Mount Rainier.",
    caption: 'Kenneth Arnold AAF report / 12 July 1947',
  },
  'kenneth-arnold-sighting-narrative-cascade-june-1947': {
    src: '/img/archive/arnold-aaf-document.jpg',
    alt: "Kenneth Arnold's July 12, 1947 hand-drawn sketch of nine objects observed near Mount Rainier.",
    caption: 'Kenneth Arnold AAF report / 12 July 1947',
  },
  'kenneth-arnold-biographical-statement-1947': {
    src: '/img/archive/arnold-aaf-document.jpg',
    alt: "Kenneth Arnold's July 12, 1947 hand-drawn sketch.",
    caption: 'Kenneth Arnold AAF report / 12 July 1947',
  },
  'maury-island-1947': {
    src: '/img/archive/maury-island-artist.jpg',
    alt: 'Artist impression of the Maury Island incident, June 21, 1947.',
    caption: 'Artist impression / Maury Island / June 1947',
  },
  'davidson-brown-crash-mission-report': {
    src: '/img/archive/maury-island-artist.jpg',
    alt: 'Maury Island incident artist impression; Davidson and Brown died on the return flight.',
    caption: 'Brown-Davidson B-25 / 1 August 1947 / Kelso Washington',
  },
  'mantell-p51-fatality-january-1948-dayton-clipping': {
    src: '/img/archive/mantell-marker.jpg',
    alt: 'Historical marker at the site of Captain Thomas F. Mantell Jr.\'s crash near Franklin, Kentucky, January 7, 1948.',
    caption: 'Mantell historical marker / Franklin Kentucky / Kentucky ANG',
  },
  'rhodes-phoenix-photographs-1947': {
    src: '/img/archive/rhodes-1947-photos.png',
    alt: 'William Rhodes photographs of an unidentified object over Phoenix, Arizona, July 7, 1947.',
    caption: 'William Rhodes / Phoenix Arizona / 7 July 1947',
  },
  'apollo-17-vm6': {
    src: '/img/archive/apollo17-pan-mare-imbrium.png',
    alt: 'Apollo 17 panoramic camera frame, Mare Imbrium and Pytheas crater, December 1972.',
    caption: 'Apollo 17 panoramic camera / AS17-M-2444 / NASA',
  },
  'hoover-scully-communist-investigation-october-1950': {
    src: '/img/archive/hoover-portrait.jpg',
    alt: 'Official Library of Congress portrait of J. Edgar Hoover, Director of the FBI.',
    caption: 'J. Edgar Hoover / Library of Congress / official portrait',
  },
  'pre-scully-crashed-saucer-rumor-network-1950': {
    src: '/img/archive/scully-portrait.jpg',
    alt: 'Frank Scully, author of "Behind the Flying Saucers" (1950), circa 1957.',
    caption: 'Frank Scully / author / circa 1957',
  },
  'pre-scully-crashed-saucer-rumor-network-march-april-1950': {
    src: '/img/archive/aztec-hoax.png',
    alt: 'The "Aztec crash" hoax photograph circulated in the rumor network leading up to Scully\'s book.',
    caption: 'Aztec crash hoax photograph / 1950',
  },
  'project-grudge-vital-installations-1948-1949': {
    src: '/img/archive/grudge-status-report-1-1951.jpg',
    alt: 'Title page of Project Grudge Status Report No. 1, 30 November 1951, Air Technical Intelligence Center, Wright-Patterson AFB. Classification cancelled 9 September 1960 by Major Robert J. Friend.',
    caption: 'Project Grudge Status Report No. 1 / 30 November 1951 / ATIC Wright-Patterson',
  },
  'section-10-1966-1973-civilian-correspondent-cluster-post-blue-book': {
    src: '/img/archive/quintanilla-bluebook.jpg',
    alt: 'Major Hector Quintanilla, Project Chief of Blue Book from August 1963.',
    caption: 'Hector Quintanilla / Blue Book Chief 1963-1969',
  },
  'james-collins-chesapeake-abduction-january-1967': {
    src: '/img/archive/flying-saucer-nara.png',
    alt: 'Flying saucer image from the National Archives.',
    caption: 'NARA / flying saucer / declassified',
  },
  'kazakhstan-1994-747': {
    src: '/img/archive/boeing-747-flight.jpg',
    alt: 'A Boeing 747-200, the aircraft type used by Tajik Air on the January 27, 1994 Almaty to Dushanbe flight.',
    caption: 'Boeing 747-200 / aircraft type / Tajik Air route',
  },
  'usper-statement': {
    src: '/img/archive/pentagon-aerial-2023.jpg',
    alt: 'Aerial view of the Pentagon, Department of War headquarters, May 15, 2023.',
    caption: 'The Pentagon / DOD photograph / 15 May 2023',
  },
  'oak-ridge-gasser-atomic-propulsion-1947-1949': {
    src: '/img/archive/x10-graphite-reactor.jpg',
    alt: 'The X-10 Graphite Reactor face at Oak Ridge National Laboratory, the principal site cited in the 1947 to 1949 gasser correspondence.',
    caption: 'X-10 Graphite Reactor / Oak Ridge / Manhattan District',
  },
  'cabell-afoic-cc-1-multi-agency-protocol-september-1950': {
    src: '/img/archive/cabell-portrait.jpg',
    alt: 'Official USAF portrait of Lt. Gen. Charles P. Cabell, Director of Intelligence and later Deputy Director of Central Intelligence.',
    caption: 'Charles P. Cabell / USAF / Director of Intelligence',
  },
  'muroc-1947-cic-affidavits': {
    src: '/img/archive/p80-shooting-star-1947.jpg',
    alt: 'A pilot in the cockpit of a Lockheed P-80 Shooting Star at Muroc Army Air Field, 1947, the year of the CIC affidavits.',
    caption: 'P-80 Shooting Star / Muroc AAF / 1947',
  },
  'peyerl-1944-german-aircraft': {
    src: '/img/archive/horten-ho229-smithsonian.jpg',
    alt: 'The Horten Ho 229 V3 prototype fuselage preserved at the Smithsonian, a German wartime jet of the type Peyerl described in his 1967 FBI Miami statement.',
    caption: 'Horten Ho 229 V3 / Smithsonian / wartime German jet',
  },
  'phoenix-blythe-radar-intercept-509th-bomb-group-june-1950': {
    src: '/img/archive/sacramento-bee-1947.jpg',
    alt: 'Sacramento Bee, July 8, 1947, "Army Reveals It Has Flying Disc Found On Ranch In New Mexico," naming the 509th Bomb Group at Roswell.',
    caption: 'Sacramento Bee / 8 July 1947 / 509th Bomb Group',
  },
  'frank-scully-communist-teletype-october-1950': {
    src: '/img/archive/scully-portrait.jpg',
    alt: 'Frank Scully, author of "Behind the Flying Saucers" (1950), the subject of the October 1950 FBI communist-investigation teletype.',
    caption: 'Frank Scully / author / circa 1957',
  },
  'civilian-correspondence-hoover-pattern-1949-1950': {
    src: '/img/archive/hoover-portrait.jpg',
    alt: 'J. Edgar Hoover, Director of the FBI, addressee of the 1949-1950 civilian UFO correspondence covered in this case.',
    caption: 'J. Edgar Hoover / Library of Congress / FBI Director',
  },
  'stanfield-lapaz-holloman-february-1950': {
    src: '/img/archive/alamogordo-post-headquarters.jpg',
    alt: 'Post headquarters at the Alamogordo Army Airfield, renamed Holloman Air Force Base in January 1948, the site cited in the Stanfield and La Paz reports.',
    caption: 'Alamogordo AAF / Post Headquarters / pre-Holloman',
  },
  'fbi-intelligence-coordination-ufo-protocol-1950': {
    src: '/img/archive/fbi-hq-building.jpg',
    alt: 'The J. Edgar Hoover FBI Building on Pennsylvania Avenue, Washington D.C., headquarters of the Federal Bureau of Investigation.',
    caption: 'J. Edgar Hoover FBI Building / Washington D.C.',
  },
  'fitch-ladd-institutional-memo-flying-discs-august-1947': {
    src: '/img/archive/roswell-daily-record-july-8-1947.jpg',
    alt: 'Roswell Daily Record, July 8, 1947, "RAAF Captures Flying Saucer On Ranch in Roswell Region," the public coverage that triggered the Bureau leadership debate over its investigative mandate.',
    caption: 'Roswell Daily Record / 8 July 1947 / public domain',
  },
  'gowen-field-idaho-aircraft-sighting-1947': {
    src: '/img/archive/gowen-field-b17e-1943.jpg',
    alt: 'B-17E Flying Fortresses of the 411th Bombardment Squadron on the ramp at Gowen Field, Boise, Idaho, 1943, four years before the September 1947 unidentified aircraft sighting in the same airspace.',
    caption: 'Gowen Field / 411th Bomb Sq B-17Es / 1943 / USAAF',
  },
  'belmont-twinkle-master-memo-osi-log-1949-1950': {
    src: '/img/archive/ruppelt-bluebook.jpg',
    alt: 'Captain Edward J. Ruppelt at Project Blue Book, Wright-Patterson Air Force Base, March 1953. Blue Book absorbed the Project Twinkle file referenced in the Belmont master memo and OSI cumulative log.',
    caption: 'Edward J. Ruppelt / Blue Book Chief / Wright-Patterson 1953',
  },
};

const ENTITY_IMAGES: Record<string, ArchivalImage> = {
  'j-edgar-hoover': {
    src: '/img/archive/hoover-portrait.jpg',
    alt: 'Official Library of Congress portrait of J. Edgar Hoover.',
    caption: 'J. Edgar Hoover / Library of Congress',
  },
  'kenneth-arnold': {
    src: '/img/archive/arnold-aaf-document.jpg',
    alt: "Kenneth Arnold's July 12, 1947 AAF report sketch.",
    caption: 'Kenneth Arnold / AAF report / 1947',
  },
  'department-of-war': {
    src: '/img/archive/pentagon-aerial-2023.jpg',
    alt: 'Aerial view of the Pentagon, headquarters of the Department of War.',
    caption: 'The Pentagon / DOD photograph / 15 May 2023',
  },
};

export function caseImage(slug: string): ArchivalImage | null {
  return CASE_IMAGES[slug] ?? null;
}

export function entityImage(slug: string): ArchivalImage | null {
  return ENTITY_IMAGES[slug] ?? null;
}

export function hasImage(slug: string): boolean {
  return slug in CASE_IMAGES || slug in ENTITY_IMAGES;
}
