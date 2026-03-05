import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@store/constant', () => ({
    default: {
        DOCUMENT_MODIFICATION_LINK: (id: string) => `/doc/${id}`,
        INTERVIEW_SINGLE_LINK: (id: string) => `/interview/${id}`
    }
}));

vi.mock('@utils/contants', () => ({
    convertDate: vi.fn((d: string) => d ?? ''),
    convertDateUXFriendly: vi.fn((d: string) => d ?? '')
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key })
}));

import MiniAudit from './MiniAudit';

const emptyAudit: never[] = [];

const mockAudit = [
    {
        _id: 'miniaudit1',
        action: 'update',
        field: 'agents',
        performedBy: { firstname: 'Jane', lastname: 'Smith' },
        changes: {
            after: {
                added: [{ firstname: 'Bob' }],
                removed: []
            }
        },
        createdAt: '2024-02-01T00:00:00Z'
    }
] as never[];

describe('MiniAudit', () => {
    it('renders without crashing with empty audit', () => {
        render(
            <MemoryRouter>
                <MiniAudit audit={emptyAudit} />
            </MemoryRouter>
        );
        expect(screen.getByText('Audit')).toBeInTheDocument();
    });

    it('renders table column headers', () => {
        render(
            <MemoryRouter>
                <MiniAudit audit={emptyAudit} />
            </MemoryRouter>
        );
        expect(screen.getByText('Field')).toBeInTheDocument();
        expect(screen.getByText('Changes')).toBeInTheDocument();
        expect(screen.getByText('Time')).toBeInTheDocument();
    });

    it('renders audit record data', () => {
        render(
            <MemoryRouter>
                <MiniAudit audit={mockAudit} />
            </MemoryRouter>
        );
        expect(screen.getByText('agents')).toBeInTheDocument();
    });
});
