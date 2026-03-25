/**
 * Ingredient scaling utility.
 * Parses leading quantities from ingredient strings, scales them by a ratio,
 * and formats the result with human-friendly fractions.
 */

const UNICODE_FRACTIONS: Record<string, number> = {
  '\u00BC': 0.25, // ¼
  '\u00BD': 0.5,  // ½
  '\u00BE': 0.75, // ¾
  '\u2153': 1 / 3, // ⅓
  '\u2154': 2 / 3, // ⅔
  '\u215B': 0.125, // ⅛
  '\u215C': 0.375, // ⅜
  '\u215D': 0.625, // ⅝
  '\u215E': 0.875, // ⅞
};

const COMMON_FRACTIONS: [number, string][] = [
  [0.125, '1/8'],
  [0.25, '1/4'],
  [1 / 3, '1/3'],
  [0.375, '3/8'],
  [0.5, '1/2'],
  [0.625, '5/8'],
  [2 / 3, '2/3'],
  [0.75, '3/4'],
  [0.875, '7/8'],
];

// Matches: "2", "2.5", "1/2", "2 1/2", "2½", unicode fractions
const QTY_REGEX = new RegExp(
  `^\\s*(\\d+\\s+\\d+\\/\\d+|\\d+\\s*[${Object.keys(UNICODE_FRACTIONS).join('')}]|\\d+\\/\\d+|\\d+\\.\\d+|\\d+|[${Object.keys(UNICODE_FRACTIONS).join('')}])\\s*`
);

function parseQuantity(s: string): { value: number; length: number } | null {
  const match = s.match(QTY_REGEX);
  if (!match) return null;

  const raw = match[1].trim();
  const length = match[0].length;

  // Unicode fraction alone: "½"
  if (raw.length === 1 && UNICODE_FRACTIONS[raw] !== undefined) {
    return { value: UNICODE_FRACTIONS[raw], length };
  }

  // Mixed with unicode: "2½"
  for (const [char, val] of Object.entries(UNICODE_FRACTIONS)) {
    if (raw.includes(char)) {
      const whole = parseInt(raw.replace(char, '').trim(), 10);
      if (!isNaN(whole)) return { value: whole + val, length };
    }
  }

  // Mixed fraction: "2 1/2"
  const mixedMatch = raw.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixedMatch) {
    const whole = parseInt(mixedMatch[1], 10);
    const num = parseInt(mixedMatch[2], 10);
    const den = parseInt(mixedMatch[3], 10);
    if (den !== 0) return { value: whole + num / den, length };
  }

  // Simple fraction: "1/2"
  const fracMatch = raw.match(/^(\d+)\/(\d+)$/);
  if (fracMatch) {
    const num = parseInt(fracMatch[1], 10);
    const den = parseInt(fracMatch[2], 10);
    if (den !== 0) return { value: num / den, length };
  }

  // Decimal: "2.5"
  const decimal = parseFloat(raw);
  if (!isNaN(decimal)) return { value: decimal, length };

  return null;
}

function formatQuantity(value: number): string {
  if (value <= 0) return '0';

  const whole = Math.floor(value);
  const frac = value - whole;

  // If fractional part is very small, just return the whole number
  if (frac < 0.05) return String(whole);

  // If fractional part is close to 1, round up
  if (frac > 0.95) return String(whole + 1);

  // Try to match a common fraction
  for (const [fracVal, fracStr] of COMMON_FRACTIONS) {
    if (Math.abs(frac - fracVal) < 0.05) {
      return whole > 0 ? `${whole} ${fracStr}` : fracStr;
    }
  }

  // Fall back to one decimal place
  const rounded = Math.round(value * 10) / 10;
  return rounded % 1 === 0 ? String(rounded) : rounded.toFixed(1);
}

/**
 * Scale an ingredient string by the given ratio.
 * Returns the ingredient with adjusted quantity, or unchanged if unscalable.
 */
export function scaleIngredient(ingredient: string, ratio: number): string {
  if (ratio === 1) return ingredient;

  const parsed = parseQuantity(ingredient);
  if (!parsed) return ingredient; // unscalable — no leading number

  const scaled = parsed.value * ratio;
  const formatted = formatQuantity(scaled);
  const rest = ingredient.slice(parsed.length);
  // Ensure space between number and remainder
  if (rest && rest[0] !== ' ') {
    return formatted + ' ' + rest;
  }
  return formatted + rest;
}

/**
 * Parse a servings string to extract the numeric value.
 * Handles: "4", "4 servings", "Makes 12", "6-8" (takes first number)
 */
export function parseServings(servings: string | null): number | null {
  if (!servings) return null;
  const match = servings.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}
