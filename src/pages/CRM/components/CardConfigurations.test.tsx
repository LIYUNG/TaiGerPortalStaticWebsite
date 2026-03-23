import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import {
    getLeadCardConfigurations,
    getStudentCardConfigurations
} from './CardConfigurations';
import type { TFunction } from 'i18next';

const mockT: TFunction = vi.fn((key: string) => key) as unknown as TFunction;

describe('CardConfigurations', () => {
    it('getLeadCardConfigurations returns array with expected ids', () => {
        const configs = getLeadCardConfigurations(mockT);
        expect(Array.isArray(configs)).toBe(true);
        const ids = configs.map((c) => c.id);
        expect(ids).toContain('education');
        expect(ids).toContain('programs');
        expect(ids).toContain('contact');
    });

    it('getStudentCardConfigurations returns array with expected ids', () => {
        const configs = getStudentCardConfigurations(mockT);
        expect(Array.isArray(configs)).toBe(true);
        const ids = configs.map((c) => c.id);
        expect(ids).toContain('academic-university');
        expect(ids).toContain('application-preference');
    });

    it('lead card education config has sections', () => {
        const configs = getLeadCardConfigurations(mockT);
        const educationCard = configs.find((c) => c.id === 'education');
        expect(educationCard).toBeDefined();
        expect(educationCard?.sections?.length).toBeGreaterThan(0);
    });

    it('lead card work config has custom render field', () => {
        const configs = getLeadCardConfigurations(mockT);
        const workCard = configs.find((c) => c.id === 'work');
        expect(workCard).toBeDefined();
        const workField = workCard?.fields?.[0];
        expect(workField?.type).toBe('custom');
        expect(typeof workField?.render).toBe('function');
        // Verify the render function returns a React element
        const element = workField?.render({
            workExperience: 'Some experience'
        });
        expect(element).toBeTruthy();
    });
});
