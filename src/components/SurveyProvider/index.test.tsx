import { describe, it, expect } from 'vitest';
import * as SurveyProvider from './index';

// The SurveyProvider index.tsx is a barrel (re-export) file.
// We verify the named exports are accessible.
describe('SurveyProvider barrel exports', () => {
    it('exports InterviewExperienceStep', () => {
        expect(SurveyProvider.InterviewExperienceStep).toBeDefined();
    });

    it('exports ProgramFeedbackStep', () => {
        expect(SurveyProvider.ProgramFeedbackStep).toBeDefined();
    });

    it('exports FinalThoughtsStep', () => {
        expect(SurveyProvider.FinalThoughtsStep).toBeDefined();
    });

    it('exports StarRating', () => {
        expect(SurveyProvider.StarRating).toBeDefined();
    });
});
