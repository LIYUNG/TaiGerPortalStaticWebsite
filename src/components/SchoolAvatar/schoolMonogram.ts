/**
 * Monogram fallback for schools with no logo asset: initials plus a colour
 * derived from the name. Pure and deterministic — the same school always gets
 * the same mark, on every render, session and machine.
 */

/**
 * Words that carry no identity — dropping them keeps the monogram meaningful
 * ("Technical University of Munich" -> TM, not TU).
 */
const STOP_WORDS = new Set([
    'of',
    'the',
    'and',
    'for',
    'at',
    'in',
    'de',
    'der',
    'die',
    'das',
    'von',
    'und',
    'university',
    'universitat',
    'universitaet',
    'universite',
    'universiteit',
    'universidad',
    'hochschule',
    'college',
    'school',
    'institute',
    'institut',
    'academy',
    'faculty'
]);

/**
 * Chosen for legible white text in both light and dark mode, so the avatar
 * needs no theme-dependent branching.
 */
export const MONOGRAM_PALETTE = [
    '#1565c0',
    '#00695c',
    '#4527a0',
    '#ad1457',
    '#2e7d32',
    '#c62828',
    '#e65100',
    '#00838f',
    '#4e342e',
    '#37474f'
];

const hashString = (value: string): number => {
    let hash = 0;
    for (let index = 0; index < value.length; index += 1) {
        hash = (hash << 5) - hash + value.charCodeAt(index);
        hash |= 0; // force int32
    }
    return Math.abs(hash);
};

/** Up to two initials from the identity-carrying words of a school name. */
export const schoolInitials = (school: string): string => {
    const words = school
        .split(/[\s,./-]+/)
        .map((word) => word.replace(/[^\p{L}\p{N}]/gu, ''))
        .filter(Boolean);

    const meaningful = words.filter(
        (word) => !STOP_WORDS.has(word.toLowerCase())
    );
    // Every word was a stop word (e.g. "University of the Arts") — fall back to
    // the raw words rather than rendering an empty avatar.
    const source = meaningful.length > 0 ? meaningful : words;

    return source
        .slice(0, 2)
        .map((word) => word[0]?.toUpperCase() ?? '')
        .join('');
};

/** Stable colour for a school name. */
export const monogramColour = (school: string): string =>
    MONOGRAM_PALETTE[hashString(school) % MONOGRAM_PALETTE.length];
