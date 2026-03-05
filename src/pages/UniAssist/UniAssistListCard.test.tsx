import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@taiger-common/core', () => ({
    isProgramDecided: vi.fn(() => false)
}));

const mockCheckUniAssist = vi.hoisted(() => vi.fn(() => false));
vi.mock('../Utils/util_functions', () => ({
    check_student_needs_uni_assist: mockCheckUniAssist
}));

vi.mock('./UniAssistProgramBlock', () => ({
    UniAssistProgramBlock: () => <div>UniAssistProgramBlock</div>
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (k: string) => k })
}));

import UniAssistListCard from './UniAssistListCard';

const mockStudent = {
    _id: 's1',
    firstname: 'Alice',
    lastname: 'Wang',
    applications: []
};

describe('UniAssistListCard - not needed', () => {
    beforeEach(() => {
        mockCheckUniAssist.mockReturnValue(false);
        render(
            <MemoryRouter>
                <UniAssistListCard student={mockStudent as any} />
            </MemoryRouter>
        );
    });

    it('renders not needed message', () => {
        expect(
            screen.getByText(/uni-assist is not needed/i)
        ).toBeInTheDocument();
    });
});

describe('UniAssistListCard - needed', () => {
    it('renders uni-assist needed info when needed', () => {
        mockCheckUniAssist.mockReturnValue(true);
        render(
            <MemoryRouter>
                <UniAssistListCard student={mockStudent as any} />
            </MemoryRouter>
        );
        expect(
            screen.getByText(/following program needs uni-assist/i)
        ).toBeInTheDocument();
    });
});
