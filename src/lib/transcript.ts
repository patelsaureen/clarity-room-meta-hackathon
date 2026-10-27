export type TranscriptSegment = { id: string; text: string; start: number; end: number };

/** Deterministic local segmentation. Offsets use JavaScript UTF-16 indices. */
export function segmentTranscript(source: string): TranscriptSegment[] {
  const matches = [...source.matchAll(/[^.!?\n]+(?:[.!?]+|\n|$)/g)];
  return matches.map((match, index) => {
    const raw = match[0];
    const leading = raw.length - raw.trimStart().length;
    const trailing = raw.length - raw.trimEnd().length;
    const start = (match.index ?? 0) + leading;
    const end = (match.index ?? 0) + raw.length - trailing;
    return { id: `seg-${index + 1}`, text: source.slice(start, end), start, end };
  }).filter((segment) => segment.text.length > 0);
}

export function quoteMatches(source: string, segment: TranscriptSegment): boolean {
  return source.slice(segment.start, segment.end) === segment.text;
}
