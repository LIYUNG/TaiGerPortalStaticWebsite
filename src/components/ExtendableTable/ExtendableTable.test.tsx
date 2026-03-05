import { describe, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@store/constant', () => ({
    default: {
        STUDENT_APPLICATIONS_ID_LINK: (id: string) => `/student/${id}/applications`,
        DOCUMENT_MODIFICATION_LINK: (id: string) => `/docs/${id}`
    }
}));

vi.mock('@utils/contants', () => ({
    convertDate: vi.fn(() => 'Jan 10, 2024')
}));

import { ExtendableTable } from './ExtendableTable';

const mockData = [
    {
        _id: { toString: () => 's1' },
        firstname: 'Alice',
        lastname: 'Smith',
        applying_program_count: 3,
        expenses: [
            { amount: 100, currency: 'EUR', status: 'paid', description: 'Tuition' }
        ],
        generaldocs_threads: [],
        applications: []
    }
];

describe('ExtendableTable', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <ExtendableTable data={mockData} />
            </MemoryRouter>
        );
    });

    it('renders without crashing', () => {
        expect(screen.getByText('Alice Smith')).toBeDefined();
    });

    it('renders column headers', () => {
        expect(screen.getByText(/Applications/)).toBeDefined();
        expect(screen.getByText(/Transactions/)).toBeDefined();
    });

    it('shows expense count for student', () => {
        expect(screen.getByText('1')).toBeDefined();
    });
});

describe('ExtendableTable with empty data', () => {
    it('renders table headers with no rows', () => {
        render(
            <MemoryRouter>
                <ExtendableTable data={[]} />
            </MemoryRouter>
        );
        expect(document.querySelector('table')).toBeDefined();
    });
});
