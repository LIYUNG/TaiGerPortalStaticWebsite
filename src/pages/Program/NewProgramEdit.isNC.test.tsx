import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import NewProgramEdit from './NewProgramEdit';

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({ user: { role: 'Admin', _id: 'a1' } })
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_Admin: vi.fn(() => true)
}));

vi.mock('../../config', () => ({
    appConfig: { companyName: 'TaiGer' }
}));

vi.mock('@utils/contants', () => ({
    isProgramValid: vi.fn(() => true),
    BINARY_STATE_ARRAY_OPTIONS: [
        { value: 'no', label: 'No' },
        { value: 'yes', label: 'Yes' }
    ],
    COUNTRIES_ARRAY_OPTIONS: [{ value: 'DE', label: 'Germany' }],
    DEGREE_CATOGARY_ARRAY_OPTIONS: [
        { value: '-', label: '-' },
        { value: 'Master', label: 'Master' }
    ],
    LANGUAGES_ARRAY_OPTIONS: [
        { value: '-', label: '-' },
        { value: 'en', label: 'English' }
    ],
    SEMESTER_ARRAY_OPTIONS: [
        { value: '-', label: '-' },
        { value: 'WS', label: 'Winter Semester' }
    ],
    UNI_ASSIST_ARRAY_OPTIONS: [{ value: 'yes', label: 'Yes' }],
    YES_NO_BOOLEAN_OPTIONS: [
        { value: true, label: 'Yes' },
        { value: false, label: 'No' }
    ],
    showFieldAlert: vi.fn(() => false),
    PROGRAM_SUBJECTS_DETAILED: [],
    SCHOOL_TAGS_DETAILED: []
}));

vi.mock('@taiger-common/model', () => ({
    DIFFICULTY: { EASY: 'Easy', MEDIUM: 'Medium', HARD: 'Hard' }
}));

vi.mock('@components/Input/searchableMuliselect', () => ({
    default: () => <div data-testid="searchable-multi-select" />
}));

const renderForm = (props: Record<string, unknown> = {}) => {
    const handleSubmit_Program = vi.fn();
    render(
        <MemoryRouter>
            <NewProgramEdit
                handleClick={vi.fn()}
                handleSubmit_Program={handleSubmit_Program}
                isSubmitting={false}
                programs={[]}
                type="new"
                {...props}
            />
        </MemoryRouter>
    );
    return { handleSubmit_Program };
};

const ncCheckbox = () =>
    document.querySelector('input[name="isNC"]') as HTMLInputElement;

/**
 * The submit button is gated on `isChanged`, so a pristine form cannot be
 * submitted. Dirty one field first — exactly what a user filling in a new
 * program does — then submit.
 */
const fillAndSubmit = () => {
    const programName = document.querySelector(
        'input[name="program_name"]'
    ) as HTMLInputElement;
    fireEvent.change(programName, { target: { value: 'Computer Science' } });
    fireEvent.click(screen.getByRole('button', { name: /^create$/i }));
};

describe('NewProgramEdit — isNC', () => {
    it('defaults to checked when creating a program', () => {
        renderForm();
        expect(ncCheckbox().checked).toBe(true);
    });

    it('persists the default into the submitted payload', () => {
        // The real trap: handleSubmit posts only `programChanges`, so a default
        // seeded into initProgram would render checked yet never be saved.
        const { handleSubmit_Program } = renderForm();
        fillAndSubmit();
        expect(handleSubmit_Program).toHaveBeenCalledWith(
            expect.objectContaining({ isNC: true })
        );
    });

    it('submits isNC:false when the user unchecks it', () => {
        const { handleSubmit_Program } = renderForm();
        fireEvent.click(ncCheckbox());
        fillAndSubmit();
        const payload = handleSubmit_Program.mock.calls[0][0];
        // Either an explicit false or omitted entirely is correct — the backend
        // treats an absent flag as "not NC" (legacy programs predate it).
        expect(payload.isNC ?? false).toBe(false);
    });

    it('does not flip an existing non-NC program back to NC when editing', () => {
        renderForm({
            program: {
                _id: 'p1',
                school: 'TU Berlin',
                program_name: 'CS',
                isNC: false,
                is_rl_specific: false
            },
            type: 'edit'
        });
        expect(ncCheckbox().checked).toBe(false);
    });

    it('keeps an existing NC program checked when editing', () => {
        renderForm({
            program: {
                _id: 'p1',
                school: 'TU Berlin',
                program_name: 'CS',
                isNC: true,
                is_rl_specific: false
            },
            type: 'edit'
        });
        expect(ncCheckbox().checked).toBe(true);
    });

    it('can be unchecked for a program with unrestricted admission', () => {
        renderForm();
        fireEvent.click(ncCheckbox());
        expect(ncCheckbox().checked).toBe(false);
    });

    it('shows the school-level attributes as read-only, not as inputs', () => {
        renderForm();
        // isPrivateSchool/isPartnerSchool are owned by School Configuration —
        // there must be no editable control for them on the program form.
        expect(
            document.querySelector('input[name="isPrivateSchool"]')
        ).toBeNull();
        expect(
            document.querySelector('input[name="isPartnerSchool"]')
        ).toBeNull();
        expect(screen.getByText(/school attributes/i)).toBeTruthy();
    });
});
