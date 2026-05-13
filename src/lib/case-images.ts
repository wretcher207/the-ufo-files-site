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
    src: '/img/archive/f51d-mustang-flight.jpg',
    alt: 'F-51D Mustang aircraft of the type Captain Thomas Mantell flew on January 7, 1948.',
    caption: 'F-51D Mustang in flight / Mantell type / Kentucky ANG',
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
    src: '/img/archive/ruppelt-bluebook.jpg',
    alt: 'Captain Edward J. Ruppelt at Project Blue Book, the successor program to Grudge.',
    caption: 'Edward J. Ruppelt / Blue Book Chief',
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
