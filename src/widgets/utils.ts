/** Convert **bold** markdown in text to accent-colored spans */
export function accentMark(text: string): string {
  if (!text) return '';
  return text.replace(
    /\*\*(.+?)\*\*/g,
    '<span style="color:var(--mw-accent)">$1</span>'
  );
}
