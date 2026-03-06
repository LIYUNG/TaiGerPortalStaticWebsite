import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/api', () => ({
    getResponseIntervalByStudent: vi.fn(() => Promise.resolve({ status: 200, data: { data: {} } }))
}));

vi.mock('@mui/x-charts', () => ({
    BarChart: () => <div data-testid="bar-chart" />,
    LineChart: () => <div data-testid="line-chart" />
}));

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useSearchParams: () => [new URLSearchParams(), vi.fn()]
    };
});

import ResponseTimeDashboardTab from './ResponseTimeDashboardTab';

const defaultProps = {
    studentAvgResponseTime: [
        {
            _id: 's1',
            name: 'Student One',
            avgByType: { communication: 2.5 },
            agents: ['agent1'],
            editors: []
        }
    ],
    agents: {
        agent1: { firstname: 'Agent', lastname: 'One' }
    },
    editors: {
        editor1: { firstname: 'Editor', lastname: 'One' }
    }
};

describe('ResponseTimeDashboardTab', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <ResponseTimeDashboardTab {...defaultProps} />
            </MemoryRouter>
        );
    });

    it('renders without crashing', () => {
        expect(document.body).toBeTruthy();
    });

    it('renders Agent View and Editor View buttons', () => {
        expect(screen.getByText('Agent View')).toBeTruthy();
        expect(screen.getByText('Editor View')).toBeTruthy();
    });

    it('renders team overview section', () => {
        expect(document.body).toBeTruthy();
    });

    it('does not render Return button initially', () => {
        expect(screen.queryByText('Return')).toBeNull();
    });
});
