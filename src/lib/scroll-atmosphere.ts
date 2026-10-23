/** Background colours are tied to reading progress, never to a clock. */
export const atmospherePalettes = {
  light: ["#eef4fa", "#f3f0f8", "#faf1ed", "#f9f6ed"],
  dark: ["#14181c", "#20252a", "#292e33", "#203238"],
} as const;

export function scrollProgress(
  scrollTop: number,
  pageHeight: number,
  viewportHeight: number,
) {
  const distance = pageHeight - viewportHeight;
  return distance > 0 ? Math.min(1, Math.max(0, scrollTop / distance)) : 0;
}

/** A section travels from below the viewport (0) to above it (1). */
export function sectionProgress(top: number, height: number, viewport: number) {
  const distance = Math.max(0, height) + Math.max(0, viewport);
  return distance > 0
    ? Math.min(1, Math.max(0, (viewport - top) / distance))
    : 0;
}

export function atmosphereColor(progress: number, dark = false) {
  const palette = dark ? atmospherePalettes.dark : atmospherePalettes.light;
  const position = Math.min(1, Math.max(0, progress)) * (palette.length - 1);
  const index = Math.min(palette.length - 2, Math.floor(position));
  const raw = position - index;
  const mix = raw * raw * (3 - 2 * raw);
  const from = palette[index];
  const to = palette[index + 1];
  const channels = [1, 3, 5].map((offset) => {
    const a = parseInt(from.slice(offset, offset + 2), 16);
    const b = parseInt(to.slice(offset, offset + 2), 16);
    return Math.round(a + (b - a) * mix)
      .toString(16)
      .padStart(2, "0");
  });
  return `#${channels.join("")}`;
}
