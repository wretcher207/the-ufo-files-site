// Inline SVG glyphs for each node type. Stroke uses currentColor so they
// inherit the card's resolved ink color in both modes. Each glyph is a clean
// geometric mark with no raster fill, no grunge, no texture.

const stroke = 'currentColor';

export function DocumentGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 1.5h7l3 3v10h-10z" stroke={stroke} strokeWidth="1" />
      <path d="M10 1.5v3h3" stroke={stroke} strokeWidth="1" />
      <path d="M5 8h6M5 11h6" stroke={stroke} strokeWidth="1" />
    </svg>
  );
}

export function WitnessGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="5" r="2.5" stroke={stroke} strokeWidth="1" />
      <path
        d="M2.5 14c0-3 2.5-5 5.5-5s5.5 2 5.5 5"
        stroke={stroke}
        strokeWidth="1"
      />
    </svg>
  );
}

export function AgencyGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 14h12M3 14V6l5-3 5 3v8" stroke={stroke} strokeWidth="1" />
      <path d="M6 14V9h4v5" stroke={stroke} strokeWidth="1" />
    </svg>
  );
}

export function LocationGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M8 1.5c-2.5 0-4.5 2-4.5 4.5 0 3.5 4.5 8 4.5 8s4.5-4.5 4.5-8c0-2.5-2-4.5-4.5-4.5z"
        stroke={stroke}
        strokeWidth="1"
      />
      <circle cx="8" cy="6" r="1.5" stroke={stroke} strokeWidth="1" />
    </svg>
  );
}

export function EventGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="3" width="12" height="11" stroke={stroke} strokeWidth="1" />
      <path d="M2 6h12M5 1.5v3M11 1.5v3" stroke={stroke} strokeWidth="1" />
    </svg>
  );
}

export function SightingGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <ellipse cx="8" cy="8.5" rx="6" ry="2" stroke={stroke} strokeWidth="1" />
      <path
        d="M5 7.5c0-1.5 1.5-2.5 3-2.5s3 1 3 2.5"
        stroke={stroke}
        strokeWidth="1"
      />
    </svg>
  );
}

export function ContradictionGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 3l10 10M13 3L3 13" stroke={stroke} strokeWidth="1.25" />
    </svg>
  );
}
