export type SearchableGuideChapter = {
  title: string;
  summary: string;
  keywords: string;
  steps: string[];
};

export function normalizeGuideSearch(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("vi")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
}

export function filterGuideChapters<T extends SearchableGuideChapter>(chapters: T[], query: string): T[] {
  const normalized = normalizeGuideSearch(query);
  if (!normalized) return chapters;
  const terms = normalized.split(/\s+/).filter(Boolean);
  return chapters.filter(chapter => {
    const haystack = normalizeGuideSearch(`${chapter.title} ${chapter.summary} ${chapter.keywords} ${chapter.steps.join(" ")}`);
    return terms.every(term => haystack.includes(term));
  });
}
