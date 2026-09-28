/**
 * Normalizes any class string into standard format: "9th", "10th", "11th", "12th", etc.
 * Handles inputs like:
 * - "Class 9th", "Class 9", "class 9", "9th", "9", "IX", "Class IX", "9 th" -> "9th"
 * - "Class 10th", "Class 10", "class 10", "10th", "10", "X", "Class X", "10 th" -> "10th"
 * - "Class 11th", "Class 11", "11th", "11", "XI", "Class XI" -> "11th"
 * - "Class 12th", "Class 12", "12th", "12", "XII", "Class XII" -> "12th"
 * - "8th", "Class 8", "VIII" -> "8th"
 */
export function normalizeClassName(rawClass: string | undefined | null): string {
  if (!rawClass) return '10th';
  const str = String(rawClass).trim();
  if (!str) return '10th';

  // Roman numeral map
  const romanMap: Record<string, string> = {
    'i': '1st',
    'ii': '2nd',
    'iii': '3rd',
    'iv': '4th',
    'v': '5th',
    'vi': '6th',
    'vii': '7th',
    'viii': '8th',
    'ix': '9th',
    'x': '10th',
    'xi': '11th',
    'xii': '12th'
  };

  const lower = str.toLowerCase();

  // If full roman match or prefixed
  const romanOnly = lower.replace(/^(class|grade|standard|std)\s*/i, '').replace(/\s*(class|grade|standard|std)$/i, '').replace(/[^a-z]/g, '').trim();
  if (romanMap[romanOnly]) {
    return romanMap[romanOnly];
  }

  // Look for any number in the string
  const numMatch = str.match(/(\d+)/);
  if (numMatch) {
    const num = parseInt(numMatch[1], 10);
    if (num === 1) return '1st';
    if (num === 2) return '2nd';
    if (num === 3) return '3rd';
    return `${num}th`;
  }

  return str;
}

/**
 * Checks if two class names match after normalization
 */
export function isClassMatch(classA: string | undefined | null, classB: string | undefined | null): boolean {
  if (!classA || !classB) return false;
  if (classA === 'All' || classB === 'All') return true;
  return normalizeClassName(classA) === normalizeClassName(classB);
}
