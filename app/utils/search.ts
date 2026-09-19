const COMBINING_MARKS = new RegExp("[\\u0300-\\u036f]", "g");
const NON_SEARCHABLE = /[^\p{L}\p{N}\p{M}\s]+/gu;
const WHITESPACE_RUN = /\s+/g;

const STANDALONE_LETTERS = new Map([
  ["ß", "ss"],
  ["æ", "ae"],
  ["œ", "oe"],
  ["ø", "o"],
  ["đ", "d"],
  ["ð", "d"],
  ["þ", "th"],
  ["ł", "l"],
  ["ı", "i"],
  ["ŋ", "n"],
  ["ħ", "h"],
]);

const STANDALONE_LETTER_PATTERN = new RegExp(`[${[...STANDALONE_LETTERS.keys()].join("")}]`, "g");

const FOLD_CACHE_LIMIT = 8000;

const foldCache = new Map<string, string>();

export function foldText(value: string): string {
  const cached = foldCache.get(value);
  if (cached !== undefined) return cached;

  const folded = value
    .normalize("NFD")
    .replace(COMBINING_MARKS, "")
    .toLowerCase()
    .replace(STANDALONE_LETTER_PATTERN, (letter) => STANDALONE_LETTERS.get(letter) ?? letter)
    .replace(NON_SEARCHABLE, "")
    .replace(WHITESPACE_RUN, " ")
    .trim();

  if (foldCache.size >= FOLD_CACHE_LIMIT) foldCache.clear();
  foldCache.set(value, folded);
  return folded;
}

export function searchTerms(query: string): string[] {
  const folded = foldText(query);
  return folded.length === 0 ? [] : folded.split(" ");
}

export function matchesTerms(terms: string[], fields: (string | null | undefined)[]): boolean {
  if (terms.length === 0) return true;

  let haystack = "";
  for (const field of fields) {
    if (!field) continue;
    haystack = haystack.length === 0 ? foldText(field) : `${haystack} ${foldText(field)}`;
  }

  return terms.every((term) => haystack.includes(term));
}
