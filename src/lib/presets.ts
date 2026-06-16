const LETTER_WORD = /^[a-zA-Z]/;

export function presetSortKey(description: string): string {
  for (const word of description.split(/\s+/)) {
    if (LETTER_WORD.test(word)) {
      return word;
    }
  }
  return description;
}

export function sortPresets<T extends { description: string }>(
  presets: T[],
): T[] {
  return [...presets].sort((a, b) =>
    presetSortKey(a.description).localeCompare(
      presetSortKey(b.description),
      undefined,
      {
        sensitivity: "base",
      },
    ),
  );
}
