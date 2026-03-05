import React from 'react';
import { render, screen } from '@testing-library/react';
import ProgramDetailsCard from './ProgramDetailsCard';

vi.mock('i18next', () => ({ default: { t: (k: string) => k } }));

const gradient = { start: '#abc', end: '#def' };

const mockThread = {
    program_id: {
        semester: 'WS',
        lang: 'English'
    }
} as any;

describe('ProgramDetailsCard', () => {
    it('renders semester and language', () => {
        render(
            <ProgramDetailsCard
                programGradient={gradient}
                thread={mockThread}
            />
        );
        expect(screen.getByText('WS')).toBeInTheDocument();
        expect(screen.getByText('English')).toBeInTheDocument();
    });

    it('renders Program Details header', () => {
        render(
            <ProgramDetailsCard
                programGradient={gradient}
                thread={mockThread}
            />
        );
        expect(screen.getByText('Program Details')).toBeInTheDocument();
    });

    it('returns null when program_id is missing', () => {
        const { container } = render(
            <ProgramDetailsCard programGradient={gradient} thread={{} as any} />
        );
        expect(container.firstChild).toBeNull();
    });
});
