/**
 * Registry of schools that have a real logo asset on disk.
 *
 * Logos live in `public/assets/logo/school_logo/<file>` (the directory already
 * exists and is currently empty). A school is only rendered with an <img> when
 * it appears here — otherwise SchoolAvatar draws a monogram. That keeps the
 * table free of 404s for the ~all schools that have no artwork yet, instead of
 * pointing every row at a file that may not exist.
 *
 * To add a logo:
 *   1. drop the file in public/assets/logo/school_logo/
 *   2. add one entry below, keyed by the slug of the school name
 *
 * Keys are produced by `schoolSlug()` so that punctuation/casing/spacing in the
 * stored school string cannot cause a miss.
 */

// Combining diacritical marks, built via RegExp so the escape survives tooling.
const COMBINING_MARKS = new RegExp('[\\u0300-\\u036f]', 'g');

/** Normalize a school name into a stable lookup key. */
export const schoolSlug = (school: string): string =>
    school
        .toLowerCase()
        .normalize('NFD')
        .replace(COMBINING_MARKS, '') // Zürich -> zurich
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

/** slug -> filename in public/assets/logo/school_logo/ */
export const SCHOOL_LOGO_FILES: Record<string, string> = {
    // 'technical-university-of-munich': 'tum.png',
};

const SCHOOL_LOGO_BASE = '/assets/logo/school_logo';

/** Public URL of a school's logo, or undefined when none is registered. */
export const getSchoolLogoUrl = (school?: string): string | undefined => {
    if (!school) {
        return undefined;
    }
    const file = SCHOOL_LOGO_FILES[schoolSlug(school)];
    return file ? `${SCHOOL_LOGO_BASE}/${file}` : undefined;
};
