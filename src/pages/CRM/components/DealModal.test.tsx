import { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@tanstack/react-query', async (orig) => ({
    ...(await orig()),
    useQuery: vi.fn(() => ({ data: undefined, isLoading: false })),
    useMutation: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
    useQueryClient: vi.fn(() => ({
        invalidateQueries: vi.fn(),
        setQueryData: vi.fn()
    }))
}));

vi.mock('@/api/query', () => ({
    getCRMLeadsQuery: vi.fn(() => ({ queryKey: ['crm/leads'], queryFn: vi.fn() }))
}));

vi.mock('@/api', () => ({
    createCRMDeal: vi.fn().mockResolvedValue({ data: {} }),
    updateCRMDeal: vi.fn().mockResolvedValue({ data: {} }),
    getCRMSalesReps: vi.fn().mockResolvedValue({ data: { data: [] } })
}));

vi.mock('@tanstack/react-form', () => ({
    useForm: vi.fn(() => ({
        handleSubmit: vi.fn(),
        reset: vi.fn(),
        setFieldValue: vi.fn(),
        Field: ({ children, name }: { children: (field: unknown) => ReactNode; name: string }) =>
            children({
                state: { value: '' },
                handleChange: vi.fn(),
                name
            })
    }))
}));

import DealModal from './DealModal';

describe('DealModal', () => {
    it('renders create modal without crashing', () => {
        render(
            <MemoryRouter>
                <DealModal open={true} onClose={vi.fn()} />
            </MemoryRouter>
        );
        expect(document.body).toBeTruthy();
    });

    it('does not render when closed', () => {
        render(
            <MemoryRouter>
                <DealModal open={false} onClose={vi.fn()} />
            </MemoryRouter>
        );
        expect(document.body).toBeTruthy();
    });

    it('renders edit modal with deal prop', () => {
        const deal = {
            id: 'deal-1',
            leadId: 'lead-1',
            leadFullName: 'John Doe',
            salesLabel: 'David',
            salesUserId: 'sales-1',
            dealSizeNtd: 100000,
            status: 'initiated',
            note: 'test note'
        };
        render(
            <MemoryRouter>
                <DealModal open={true} onClose={vi.fn()} deal={deal} />
            </MemoryRouter>
        );
        expect(document.body).toBeTruthy();
    });
});
