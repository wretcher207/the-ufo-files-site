export type ThreadId =
  | '1947-origin'
  | '1948-49-hardening'
  | '1949-50-disinfo'
  | '1950s-1973-tail'
  | 'gap-1974-2025'
  | 'pursue-2026';

export interface Thread {
  id: ThreadId;
  serial: string;
  title: string;
  span: string;
  blurb: string;
  archive: 'fbi' | 'pursue';
}

export const THREADS: Thread[] = [
  {
    id: '1947-origin',
    serial: 'FBI 62-HQ-83894 / Sec 2',
    title: '1947, origin year',
    span: 'June 1947 onward',
    blurb:
      "Kenneth Arnold's Cascade sighting. The FBI's first institutional response patterns. Maury Island, Muroc, Rhodes. By August 19, intel agencies are privately discussing whether the saucers are a classified US experiment.",
    archive: 'fbi',
  },
  {
    id: '1948-49-hardening',
    serial: 'FBI 62-HQ-83894 / 1948-49',
    title: '1948-49, institutional hardening',
    span: 'Mantell to Project Grudge',
    blurb:
      "The Mantell P-51 fatality. Air Defense Command's baseline. Project Grudge and the Vital Installations correspondence. Oak Ridge. The Cuneo, Jones, Winchell channel: proof that source proximity, not source content, triggered Bureau action.",
    archive: 'fbi',
  },
  {
    id: '1949-50-disinfo',
    serial: 'FBI 62-HQ-83894 / 1949-50',
    title: '1949-50, the disinformation year',
    span: 'Twinkle, Hottel, Scully',
    blurb:
      "The single richest section of the file. Project Twinkle. The Belmont OSI master log. The Hottel memo, properly read. Hoover's Communist-affiliation cross-check on Frank Scully. Multi-agency coordination for the saucer problem.",
    archive: 'fbi',
  },
  {
    id: '1950s-1973-tail',
    serial: 'FBI 62-HQ-83894 / Sec 10',
    title: '1950s through 1973, the long tail',
    span: 'Civilian correspondence after Blue Book',
    blurb:
      "The Hoover-directed pattern: politely decline to investigate. Section 10 catches the post-Blue Book civilian writers, including the James Collins Chesapeake abduction claim from January 1967.",
    archive: 'fbi',
  },
  {
    id: 'gap-1974-2025',
    serial: 'NO ARCHIVE PUBLISHED',
    title: '1974 through 2025, the silence',
    span: 'Fifty years no records',
    blurb:
      "From 1974 through 2025 the government published nothing on this question. Blue Book closed in 1969. The FBI handed the file off. Air Force units destroyed records. Then in May 2026 the Pentagon released a folder of incidents that happened inside the gap: Kazakhstan 1994, Mexico 2003, the western-US orb cluster, USPER. The cases were always there. They were not in any archive a citizen could touch.",
    archive: 'pursue',
  },
  {
    id: 'pursue-2026',
    serial: 'WAR.GOV/UFO/REL-01',
    title: 'PURSUE Release 01',
    span: '2026 Pentagon disclosure',
    blurb:
      'The May 8, 2026 Department of War release. 162 records reviewed by AARO. Apollo 17 VM6, the Bronze Ellipsoid, the USPER orb-helicopter chase, the western-US orbs-launching-orbs cluster. The four cases that mattered.',
    archive: 'pursue',
  },
];

export function threadById(id: ThreadId): Thread | undefined {
  return THREADS.find((t) => t.id === id);
}
