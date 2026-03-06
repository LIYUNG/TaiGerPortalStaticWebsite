import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('./statusUtils', () => ({
    STATUS_FLOW: ['initiated', 'sent', 'signed', 'closed'],
    isTerminalStatus: vi.fn((status: string) => status === 'closed' || status === 'canceled')
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string, opts?: { defaultValue?: string; ns?: string }) => opts?.defaultValue || key })
}));

import StatusMenu from './StatusMenu';

describe('StatusMenu - closed (terminal status)', () => {
    const anchor = document.createElement('button');
    document.body.appendChild(anchor);

    beforeEach(() => {
        render(
            <StatusMenu
                anchorEl={anchor}
                currentStatus="closed"
                onChoose={vi.fn()}
                onClose={vi.fn()}
            />
        );
    });

    it('renders without crashing', () => {
        expect(document.body).toBeTruthy();
    });

    it('renders current status label', () => {
        expect(screen.getByText('Current')).toBeTruthy();
    });
});

describe('StatusMenu - initiated (non-terminal)', () => {
    const anchor = document.createElement('button');
    document.body.appendChild(anchor);

    beforeEach(() => {
        render(
            <StatusMenu
                anchorEl={anchor}
                currentStatus="initiated"
                onChoose={vi.fn()}
                onClose={vi.fn()}
            />
        );
    });

    it('renders without crashing', () => {
        expect(document.body).toBeTruthy();
    });

    it('renders current status', () => {
        expect(screen.getByText('Current')).toBeTruthy();
    });

    it('renders cancel option for non-terminal status', () => {
        expect(screen.getByText('Cancel')).toBeTruthy();
    });
});
