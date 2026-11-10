import type { SelectMenuOption } from "@components/ui/SelectMenu";
import { matchesTerms, searchTerms } from "@utils/search";

export function filterOptions<T extends string | number>(
  options: ReadonlyArray<SelectMenuOption<T>>,
  query: string
): ReadonlyArray<SelectMenuOption<T>> {
  const terms = searchTerms(query);
  return terms.length === 0
    ? options
    : options.filter((option) => matchesTerms(terms, [option.label, option.description]));
}
