import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('./statusUtils', () => ({
    isTerminalStatus: vi.fn((status: string) => status === 'closed' || status === 'canceled'),
    getStatusColor: vi.fn((status: string) =>
        ({ initiated: 'info', sent: 'warning', signed: 'success', closed: 'default', canceled: 'error' }[status] || 'default')
    )
}));

import DealItem from './DealItem';
import type { TFunction } from 'i18next';

const mockT: TFunction = vi.fn((key: string, opts?: { defaultValue?: string }) => opts?.defaultValue || key) as unknown as TFunction;

const mockDeal = {
    _id: 'deal1',
    status: 'initiated',
    initiatedAt: '2024-01-01T00:00:00Z',
    note: 'Test deal note',
    dealSizeNtd: 50000
};

const defaultProps = {
    deal: mockDeal as unknown as import('@taiger-common/model').CRMDealItem,
    t: mockT,
    onOpenStatusMenu: vi.fn(),
    onEditDeal: vi.fn(),
    isUpdating: false
};

describe('DealItem', () => {
    beforeEach(() => {
        render(<DealItem {...defaultProps} />);
    });

    it('renders without crashing', () => {
        expect(document.body).toBeTruthy();
    });

    it('renders the deal note', () => {
        expect(screen.getByText('Test deal note')).toBeTruthy();
    });

    it('renders deal size', () => {
        expect(screen.getByText(/50,000/)).toBeTruthy();
    });

    it('renders expand/collapse button when events exist', () => {
        expect(document.querySelector('[aria-label="toggle-deal-timeline"]')).toBeTruthy();
    });
});
