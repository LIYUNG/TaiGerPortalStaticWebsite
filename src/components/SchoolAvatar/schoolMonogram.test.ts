import { describe, it, expect } from 'vitest';

import { monogramColour, schoolInitials } from './schoolMonogram';
import { schoolSlug, getSchoolLogoUrl } from './schoolLogoRegistry';

describe('schoolInitials', () => {
    it('skips stop words so the initials carry identity', () => {
        expect(schoolInitials('Technical University of Munich')).toBe('TM');
        expect(schoolInitials('University of Cambridge')).toBe('C');
    });

    it('falls back to raw words when every word is a stop word', () => {
        // Would otherwise render an empty avatar.
        expect(schoolInitials('University College')).toBe('UC');
    });

    it('handles punctuation and extra whitespace', () => {
        expect(schoolInitials('  RWTH   Aachen  ')).toBe('RA');
        expect(schoolInitials('Ludwig-Maximilians-Universität')).toBe('LM');
    });

    it('returns empty string for an empty name', () => {
        expect(schoolInitials('')).toBe('');
    });
});

describe('monogramColour', () => {
    it('is deterministic for the same school', () => {
        expect(monogramColour('ETH Zurich')).toBe(monogramColour('ETH Zurich'));
    });

    it('always resolves to a palette colour', () => {
        expect(monogramColour('Some Unknown School')).toMatch(/^#[0-9a-f]{6}$/);
    });
});

describe('schoolSlug', () => {
    it('normalizes case, punctuation and accents', () => {
        expect(schoolSlug('Universität Zürich')).toBe('universitat-zurich');
        expect(schoolSlug('  ETH  Zurich!  ')).toBe('eth-zurich');
    });
});

describe('getSchoolLogoUrl', () => {
    it('returns undefined when no logo is registered (monogram fallback)', () => {
        expect(getSchoolLogoUrl('Nowhere University')).toBeUndefined();
        expect(getSchoolLogoUrl(undefined)).toBeUndefined();
    });
});
