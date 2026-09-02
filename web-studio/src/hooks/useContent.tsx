import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import type { ContentDocument, ContentEnvelope, StudioWord } from "@/lib/content";
import { emptyContent, fetchPublicContent } from "@/lib/publicApi";

/**
 * The live content feed, shared by every public page.
 *
 * One query key means the document is fetched once per session and reused
 * across routes, so moving between Vocab and Explore costs nothing.
 */
export function useContentQuery(): UseQueryResult<ContentEnvelope> {
  return useQuery({
    queryKey: ["content"],
    queryFn: fetchPublicContent,
    staleTime: 5 * 60 * 1000,
  });
}

export function useContent(): {
  content: ContentDocument;
  isLoading: boolean;
  isError: boolean;
} {
  const query = useContentQuery();
  return {
    content: query.data?.content ?? emptyContent,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}

/** Every word in the document, de-duplicated by id. */
export function allUniqueWords(content: ContentDocument): StudioWord[] {
  const seen = new Map<string, StudioWord>();
  const add = (word: StudioWord): void => {
    if (word.id && !seen.has(word.id)) seen.set(word.id, word);
  };

  for (const set of content.vocabSets) set.words.forEach(add);
  for (const unit of content.units) {
    for (const lesson of unit.lessons) lesson.words.forEach(add);
  }
  content.popularWords.forEach(add);
  content.phrases.forEach(add);

  return [...seen.values()];
}
