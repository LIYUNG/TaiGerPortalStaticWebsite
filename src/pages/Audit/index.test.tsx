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
    convertDate: vi.fn((d: string) => d ?? '')
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key })
}));

import Audit from './index';

const emptyAudit: never[] = [];

const mockAudit = [
    {
        _id: 'audit1',
        action: 'update',
        field: 'status',
        performedBy: { firstname: 'John', lastname: 'Doe' },
        changes: { after: true },
        createdAt: '2024-01-01T00:00:00Z'
    }
] as never[];

describe('Audit', () => {
    it('renders without crashing with empty audit', () => {
        render(
            <MemoryRouter>
                <Audit audit={emptyAudit} />
            </MemoryRouter>
        );
        expect(screen.getByText('Audit')).toBeInTheDocument();
    });

    it('renders table headers', () => {
        render(
            <MemoryRouter>
                <Audit audit={emptyAudit} />
            </MemoryRouter>
        );
        expect(screen.getByText('Actor')).toBeInTheDocument();
        expect(screen.getByText('Action')).toBeInTheDocument();
        expect(screen.getByText('Field')).toBeInTheDocument();
    });

    it('renders audit records', () => {
        render(
            <MemoryRouter>
                <Audit audit={mockAudit} />
            </MemoryRouter>
        );
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('update')).toBeInTheDocument();
    });
});
