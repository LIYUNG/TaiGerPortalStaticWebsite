import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProgramCard } from './ProgramCard';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (k: string) => k })
}));

vi.mock('@store/constant', () => ({
    default: { SINGLE_PROGRAM_LINK: (id: string) => `/program/${id}` }
}));

vi.mock('../../Utils/util_functions', () => ({
    calculateProgramLockStatus: vi.fn(() => ({ isLocked: false }))
}));

const program = {
    _id: 'p1',
    school: 'MIT',
    program_name: 'CS MSc',
    degree: 'M.Sc.',
    country: 'US',
    semester: 'WS',
    lang: 'English',
    toefl: '100',
    ielts: '7.0',
    application_deadline: '01-15',
    updatedAt: '2025-06-01T00:00:00.000Z',
    programSubjects: ['CS'],
    tags: ['STEM']
};

const renderCard = (selected = false) => {
    const onToggleSelect = vi.fn();
    render(
        <MemoryRouter>
            <ProgramCard
                onToggleSelect={onToggleSelect}
                program={program}
                selected={selected}
            />
        </MemoryRouter>
    );
    return { onToggleSelect };
};

describe('ProgramCard', () => {
    it('renders school + program as links and the meta fields (incl. TOEFL/IELTS)', () => {
        renderCard();
        expect(screen.getByText('MIT')).toBeInTheDocument();
        expect(screen.getByText('CS MSc')).toBeInTheDocument();
        expect(screen.getByText('M.Sc.')).toBeInTheDocument();
        expect(screen.getByText('100')).toBeInTheDocument(); // TOEFL
        expect(screen.getByText('7.0')).toBeInTheDocument(); // IELTS
    });

    it('renders the last-update date footer', () => {
        renderCard();
        expect(screen.getByText(/Last update:/i)).toBeInTheDocument();
    });

    it('fires onToggleSelect with the program id when the checkbox is clicked', () => {
        const { onToggleSelect } = renderCard(false);
        fireEvent.click(screen.getByRole('checkbox'));
        expect(onToggleSelect).toHaveBeenCalledWith('p1');
    });

    it('reflects the selected state on the checkbox', () => {
        renderCard(true);
        expect(screen.getByRole('checkbox')).toBeChecked();
    });
});
