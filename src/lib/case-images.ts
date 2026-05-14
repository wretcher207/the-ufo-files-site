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
  'stuart-adcock-oak-ridge-march-1950': {
    src: '/img/archive/k25-aerial-1945.jpg',
    alt: 'Aerial view of the K-25 gaseous diffusion plant complex at Oak Ridge, Tennessee, 1945, including the early workforce housing tracts surrounding the site. The Stuart and Adcock reports place the March 1950 aerial phenomena directly over this installation.',
    caption: 'K-25 plant aerial / Oak Ridge Tennessee / 1945 / Manhattan District',
  },
  'la-paz-seventh-report-cabell-directive-twinkle': {
    src: '/img/archive/alamogordo-sub-depot-hangar.jpg',
    alt: 'Sub-depot hangar at Alamogordo Army Airfield, New Mexico, the installation that became Holloman Air Force Base in January 1948 and hosted the Project Twinkle photographic stations La Paz coordinated for the Cabell directive.',
    caption: 'Alamogordo AAF / Sub-Depot Hangar / pre-Holloman',
  },
  'air-defense-command-institutional-baseline-policy-february-1948': {
    src: '/img/archive/twining-memo-1947-p1.jpg',
    alt: 'Page one of the Twining memo, 23 September 1947, "AMC Opinion Concerning Flying Discs," from Headquarters Air Materiel Command at Wright Field to Brig. Gen. George Schulgen. The institutional precedent that shaped the February 1948 Air Defense Command baseline policy: "the phenomenon reported is something real and not visionary or fictitious."',
    caption: 'Twining memo / 23 September 1947 / AMC Wright Field',
  },
  'pervier-tulsa-fbi-agent-corroboration-1950': {
    src: '/img/archive/tulsa-saucers-july-12-1947.jpg',
    alt: '"SAUCERS OVER TULSA?" — newspaper photograph by Enlo Gilmore showing multiple bright objects over Tulsa, Oklahoma, July 12, 1947. The same city where, three years later, FBI Special Agent Pervier corroborated continuing local sightings to the Bureau.',
    caption: 'Tulsa World / 12 July 1947 / photo by Enlo Gilmore',
  },
  'osi-cumulative-sighting-log-full-read-1948-1950': {
    src: '/img/archive/bluebook-status-8-appendix-1952.jpg',
    alt: 'Appendix I to Project Blue Book Status Report No. 8, NARA 595542: a hand-drawn chart of UFO report frequency, June through September 1952, annotated with the Washington D.C. incident, the Air Force press conference, and Life, Look, and New Yorker magazine articles. The institutional visualization of cumulative sighting data the OSI log was designed to capture.',
    caption: 'Frequency of UFO reports / June-September 1952 / Blue Book Status Report 8 / NARA',
  },
  'd3-briefing-halfery-mister-x-may-1950': {
    src: '/img/archive/mcminnville-trent-may-1950.png',
    alt: 'Paul Trent\'s photograph of an unidentified disc-shaped object over McMinnville, Oregon, taken May 11, 1950, eight days before the Bureau\'s D-3 briefing on the Halfery "Mister X" photograph case. Published in LIFE Magazine, 26 June 1950, and the canonical single-attribution UFO photograph of the May 1950 wave the briefing was responding to.',
    caption: 'Paul Trent / McMinnville Oregon / 11 May 1950 / LIFE Magazine',
  },
  'jones-winchell-cuneo-1947-1949': {
    src: '/img/archive/winchell-portrait-1951.jpg',
    alt: 'Walter Winchell on the cover of Radio-TV Mirror, January 1951, two years after his collaboration with Ernest Cuneo and Bureau channels in the 1947-1949 flying-disc correspondence.',
    caption: 'Walter Winchell / Radio-TV Mirror / January 1951',
  },
  'philadelphia-1950-soap-suds-disc': {
    src: '/img/archive/philadelphia-sanborn-1950-plate1.jpg',
    alt: 'Sanborn Fire Insurance Map of Philadelphia, 1950, Volume 1, Plate 1: Vine, Winter, Race, Quarry, and Cherry Streets between N. 12th and N. 14th. The municipal-scale documentation contemporaneous with the 1950 soap-suds disc report.',
    caption: 'Sanborn Fire Insurance Map / Philadelphia / 1950 / Library of Congress',
  },
  'portland-police-department-september-1947': {
    src: '/img/archive/portland-sanborn-1950-key.jpg',
    alt: 'Sanborn Fire Insurance Map of Portland, Multnomah County, Oregon, 1950, Volume 1, Plate 0 — the index plate with key, symbols, and color-coded city blocks along the Willamette River. The same municipal grid Chief Leon Jenkins\'s officers dispatched across on the evening of 11 September 1947.',
    caption: 'Sanborn Fire Insurance Map / Portland Oregon / 1950 / Library of Congress',
  },
  '1947-california-montana-cic': {
    src: '/img/archive/sacramento-bee-1947.jpg',
    alt: 'Sacramento Bee, July 8, 1947, "Army Reveals It Has Flying Disc Found On Ranch In New Mexico." The California press climate during the summer 1947 CIC investigations of the Switzer (Cedar Ravine Road, Placerville) and Madden (Canyon Ferry, Montana) cases.',
    caption: 'Sacramento Bee / 8 July 1947 / California 1947 wave context',
  },
  'bronze-ellipsoid': {
    src: '/img/archive/fbi-hq-building.jpg',
    alt: 'The J. Edgar Hoover FBI Building, Washington D.C. The Bureau\'s composite-sketch artist division and FBI 302 interview product line are the institutional channel through which the September 2023 bronze-ellipsoid witness statements reached the PURSUE release.',
    caption: 'FBI Headquarters / Washington D.C. / 302 interview channel',
  },
  'cuneo-jones-winchell-followup-1949': {
    src: '/img/archive/winchell-portrait-1951.jpg',
    alt: 'Walter Winchell on the cover of Radio-TV Mirror, January 1951. Ernest Cuneo\'s 1949 follow-up correspondence with Bureau channels continued the Winchell flying-disc relay first established in 1947.',
    caption: 'Walter Winchell / Radio-TV Mirror / 1951',
  },
  'danforth-illinois-instrument-examination-september-1947': {
    src: '/img/archive/fbi-hq-building.jpg',
    alt: 'The J. Edgar Hoover FBI Building, Washington D.C. The September 1947 Danforth Illinois instrument examination was coordinated from Headquarters through Assistant Director E. G. Fitch.',
    caption: 'FBI Headquarters / Washington D.C. / Fitch coordination',
  },
  'dewayne-johnson-ucla-dissertation-arnold-second-pass-1950': {
    src: '/img/archive/arnold-aaf-document.jpg',
    alt: 'Kenneth Arnold\'s July 12, 1947 AAF report sketch — the primary-source document that Dewayne Johnson\'s 1950 UCLA dissertation revisited in its second-pass analysis of the Cascade sighting.',
    caption: 'Kenneth Arnold AAF report / 12 July 1947 / Johnson dissertation subject',
  },
  'f-ray-turner-oak-park-saucer-tree-anonymous-threat-letter-1950': {
    src: '/img/archive/hoover-portrait.jpg',
    alt: 'J. Edgar Hoover, Director of the FBI. The Oak Park Illinois anonymous threat letter against F. Ray Turner was routed through Hoover\'s Bureau correspondence apparatus in July 1950.',
    caption: 'J. Edgar Hoover / Library of Congress / FBI Director',
  },
  'fbi-investigative-follow-up-witness-1947': {
    src: '/img/archive/fbi-hq-building.jpg',
    alt: 'The J. Edgar Hoover FBI Building, Washington D.C. Inspector W. V. Cleveland\'s September 1947 follow-up memo to Assistant Director J. P. Coyne originated from FBIHQ.',
    caption: 'FBI Headquarters / Washington D.C. / Cleveland-Coyne memo',
  },
  'government-secret-experiment-theory-august-1947': {
    src: '/img/archive/twining-memo-1947-p1.jpg',
    alt: 'Page one of the Twining memo, 23 September 1947, "AMC Opinion Concerning Flying Discs." The August 1947 "government secret experiment" theory predates and informs Twining\'s rejection of the domestic-aircraft explanation.',
    caption: 'Twining memo / 23 September 1947 / AMC Wright Field',
  },
  'hackensack-new-jersey-august-1947': {
    src: '/img/archive/roswell-daily-record-july-8-1947.jpg',
    alt: 'Roswell Daily Record, July 8, 1947, "RAAF Captures Flying Saucer On Ranch in Roswell Region." The press climate the SAC Newark Hackensack multi-witness investigation operated under one month later.',
    caption: 'Roswell Daily Record / 8 July 1947 / 1947 wave context',
  },
  'hatfield-ellison-myrtle-creek-1947': {
    src: '/img/archive/portland-sanborn-1950-key.jpg',
    alt: 'Sanborn Fire Insurance Map of Portland, Oregon, 1950. The Portland SAC office that took the Hatfield and Ellison Myrtle Creek statements covered all of southwestern Oregon from this same municipal grid.',
    caption: 'Portland Oregon / 1950 / SAC Portland jurisdiction',
  },
  'hixenbaugh-photographs-petrone-informant-1950': {
    src: '/img/archive/fbi-hq-building.jpg',
    alt: 'The J. Edgar Hoover FBI Building, Washington D.C. The July 1950 Hixenbaugh photographs were submitted to the Bureau through the Petrone informant channel.',
    caption: 'FBI Headquarters / Washington D.C. / informant channel',
  },
  'houston-noack-physical-object-1948': {
    src: '/img/archive/p80-shooting-star-1947.jpg',
    alt: 'A Lockheed P-80 Shooting Star at Muroc Army Air Field, 1947. The December 1948 Lonnie Noack physical-object examination near Lone Pine, California, ultimately resolved to AAF tow-target debris of the same Muroc-era operations.',
    caption: 'P-80 Shooting Star / Muroc AAF / tow-target era',
  },
  'intelligence-branch-multi-agency-coordination-1950': {
    src: '/img/archive/cabell-portrait.jpg',
    alt: 'Lt. Gen. Charles P. Cabell, Director of USAF Intelligence in May 1950. The Bureau\'s May 23, 1950 Intelligence Branch multi-agency coordination memo names Cabell\'s office as the AFOIC counterpart for joint FBI-USAF-OSI handling.',
    caption: 'Charles P. Cabell / USAF / Director of Intelligence 1950',
  },
  'kodiak-alaska-oni-january-1950': {
    src: '/img/archive/kodiak-nas-1944.jpg',
    alt: 'U.S. Navy photograph 80-G-279812 of Naval Air Station Kodiak, Alaska, 1944. The same Kodiak installation that hosted the Office of Naval Intelligence radar-visual incident of January 22-23, 1950 (DIC/17ND No. 4-50, declassified through Maccabee FOIA 1977).',
    caption: 'NAS Kodiak Alaska / 1944 / U.S. Navy 80-G-279812',
  },
  'merchant-wichita-falls-patriotic-civilian-august-1948': {
    src: '/img/archive/hoover-portrait.jpg',
    alt: 'J. Edgar Hoover, Director of the FBI. The Wichita Falls "patriotic civilian" Merchant correspondence of August 1948 was routed through Atlanta SAC Foltz into the same civilian-correspondence channel addressed to Hoover.',
    caption: 'J. Edgar Hoover / FBI Director / civilian-correspondence channel',
  },
  'mexico-2003-alien-corpses': {
    src: '/img/archive/mexican-congress.jpg',
    alt: 'Palacio Legislativo de San Lázaro, Mexico City, home of the Mexican Congress. On September 12, 2003 the Congress held the alien-corpses hearing documented four days later in U.S. State Department cable 059uap00013.',
    caption: 'Palacio Legislativo de San Lázaro / Mexico City / 12 September 2003',
  },
  'mid-1950-case-handling-spectrum-north-chicago-alice-texas': {
    src: '/img/archive/fbi-hq-building.jpg',
    alt: 'The J. Edgar Hoover FBI Building, Washington D.C. The July 1950 case-handling spectrum across the FBI Chicago, Houston, and San Antonio field offices, with OSI Kelly AFB, was coordinated from this headquarters.',
    caption: 'FBI Headquarters / Washington D.C. / multi-office coordination',
  },
  'orbs-launching-orbs': {
    src: '/img/archive/pentagon-aerial-2023.jpg',
    alt: 'Aerial view of the Pentagon, headquarters of the Department of War (May 15, 2023). AARO compiled the 2023 Western U.S. "orbs launching orbs" event slides at this address before the May 8, 2026 PURSUE release.',
    caption: 'The Pentagon / DoD photograph / AARO source agency',
  },
  'parker-rix-ledges-lebanon-september-1947': {
    src: '/img/archive/roswell-daily-record-july-8-1947.jpg',
    alt: 'Roswell Daily Record, July 8, 1947. The September 17, 1947 Parker-Rix Ledges Lebanon report (SAC Albany jurisdiction) closed out the 1947 wave that opened with this front page two months earlier.',
    caption: 'Roswell Daily Record / 8 July 1947 / 1947 wave context',
  },
  'raymond-lane-luminous-paint-radioactive-sand-july-1947': {
    src: '/img/archive/hoover-portrait.jpg',
    alt: 'J. Edgar Hoover, Director of the FBI. The Raymond Lane luminous-paint-and-radioactive-sand hoax of July 1947 was relayed through the Detroit FBI Office into the same Hoover-addressed correspondence stream.',
    caption: 'J. Edgar Hoover / FBI Director / Detroit Office hoax line',
  },
  'sarbanis-radio-ham-contactee-alien-message-july-1947': {
    src: '/img/archive/flying-saucer-nara.png',
    alt: 'Declassified flying-saucer image from the National Archives. The July to September 1947 Mrs. A. G. Sarbanis "radio ham" coded-alien-message case, run through Newsday and the New York FBI Office, is part of the same NARA-held 1947 contactee record.',
    caption: 'NARA / flying saucer / 1947 contactee record',
  },
  'section-2-1947-multi-case-extension-and-wenyon-pre-roswell': {
    src: '/img/archive/roswell-daily-record-july-8-1947.jpg',
    alt: 'Roswell Daily Record, July 8, 1947. The pre-Roswell Wenyon case (Rehoboth Delaware, September 1946) and the September 1947 multi-case extension under FBI 62-HQ-83894 Section 2 both bracket this canonical front page.',
    caption: 'Roswell Daily Record / 8 July 1947 / Section 2 anchor',
  },
  'springer-brown-cic-cluster-pre-maury-island-1947': {
    src: '/img/archive/maury-island-artist.jpg',
    alt: 'Artist impression of the Maury Island incident, June 21, 1947. The Springer-Brown CIC cluster of late July 1947 immediately preceded the Maury Island incident in the Pacific Northwest CIC reporting chain.',
    caption: 'Maury Island artist impression / June 1947 / CIC cluster context',
  },
  'summary-aerial-phenomena-section-5-1950': {
    src: '/img/archive/bluebook-status-8-appendix-1952.jpg',
    alt: 'Appendix I to Project Blue Book Status Report No. 8 (NARA 595542): hand-drawn chart of UFO report frequency, June through September 1952. The institutional visualization analogous to the FBI 62-HQ-83894 Section 5 summary aerial phenomena tabulation of July 19, 1950.',
    caption: 'Frequency of UFO reports / Blue Book Status Report 8 / NARA',
  },
  'wenyon-rehoboth-delaware-1946': {
    src: '/img/archive/twining-memo-1947-p1.jpg',
    alt: 'Page one of the Twining memo, 23 September 1947, "AMC Opinion Concerning Flying Discs." The 1946 Wenyon Rehoboth Delaware case is the earliest pre-Roswell incident in FBI 62-HQ-83894, predating Twining\'s formal AMC opinion by exactly one year.',
    caption: 'Twining memo / 23 September 1947 / pre-Roswell baseline',
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
