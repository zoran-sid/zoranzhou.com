export const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
export function normalizedNumbers(text: string, sourceHint = text): string[] {
  // Equivalent calendar expressions must not be treated as lost numbers.
  let normalized = text.replace(
    /(\d{1,2})\s*世纪\s*(\d{1,2})\s*年代/g,
    (_, century, decade) =>
      String((Number(century) - 1) * 100 + Number(decade)),
  );
  normalized = normalized.replace(/(\d+(?:\.\d+)?)\s*万/g, (_, n) =>
    String(Number(n) * 10000),
  );
  normalized = normalized.replace(
    /(\d+(?:\.\d+)?)\s*(thousand|million|billion)\b/gi,
    (_, n, unit) =>
      String(
        Number(n) *
          { thousand: 1000, million: 1000000, billion: 1000000000 }[
            unit.toLowerCase() as "million"
          ],
      ),
  );
  const words: Record<string, number> = {
    zero: 0,
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10,
    eleven: 11,
    twelve: 12,
    thirteen: 13,
    fourteen: 14,
    fifteen: 15,
    sixteen: 16,
    seventeen: 17,
    eighteen: 18,
    nineteen: 19,
    twenty: 20,
    thirty: 30,
    forty: 40,
    fifty: 50,
    sixty: 60,
    seventy: 70,
    eighty: 80,
    ninety: 90,
  };
  normalized = normalized.replace(
    /\b(twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)[ -](one|two|three|four|five|six|seven|eight|nine)\b/gi,
    (_, a, b) => String(words[a.toLowerCase()] + words[b.toLowerCase()]),
  );
  normalized = normalized.replace(
    new RegExp(`\\b(${Object.keys(words).join("|")})\\b`, "gi"),
    (word) => String(words[word.toLowerCase()]),
  );
  normalized = normalized.replace(
    /\b(\d{1,2}):(\d{2})\s*([ap])\.?m\.?/gi,
    (whole, h, m, period) => {
      const hour = (Number(h) % 12) + (period.toLowerCase() === "p" ? 12 : 0);
      return sourceHint.includes(`${hour}:${m}`) ? `${hour}:${m}` : `${h}:${m}`;
    },
  );
  months.forEach((month, i) => {
    normalized = normalized.replace(
      new RegExp(
        `\\b${month}\\b${month === "May" ? "(?!\\s+(?:I|you|we|they|he|she|it|my|our|your)\\b)" : ""}`,
        "g",
      ),
      String(i + 1),
    );
  });
  return (normalized.match(/\d+(?:[.,]\d+)*/g) ?? []).map((n) => {
    const value = n.replace(/,(?=\d{3}(?:\D|$))/g, "");
    return /^\d+(?:\.\d+)?$/.test(value) ? String(Number(value)) : value;
  });
}
export function normalizeEnglish(text: string, terms: string[] = []) {
  let result = text;
  for (const term of new Set(terms)) {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    result = result.replace(new RegExp(`([a-zA-Z])(${escaped})`, "g"), "$1 $2");
    result = result.replace(
      new RegExp(`(${escaped})([a-zA-Z]{2,})`, "g"),
      "$1 $2",
    );
  }
  return result.replace(/([.!?;][”"'’)]*)(?=[A-Z][a-z])/g, "$1 ");
}

export function normalizeTranslation(source: string, translated: string) {
  let result = normalizeEnglish(translated);
  if (!source.includes("*"))
    result = result.replace(/(\*{1,2})(?=\S)([^*]*?\S)\1/g, "$2");
  const punctuation = source.trimStart().match(/^[。！？；，、：]/)?.[0];
  if (punctuation && !/^[.!?;,:]/.test(result.trimStart())) {
    const mapping: Record<string, string> = {
      "。": ".",
      "！": "!",
      "？": "?",
      "；": ";",
      "，": ",",
      "、": ",",
      "：": ":",
    };
    result = `${mapping[punctuation]} ${result.trimStart()}`;
  }
  return result;
}
