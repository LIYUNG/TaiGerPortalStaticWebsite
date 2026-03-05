import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@mui/x-charts/BarChart', () => ({
    BarChart: () => <div data-testid="bar-chart" />
}));

import AgentDashboard from './AgentDashboard';

const mockDistribution = [
    {
        name: 'Agent Alice',
        admission: { '2024': 3, '2025': 2 },
        noAdmission: { '2024': 1, '2025': 4 }
    },
    {
        name: 'Agent Bob',
        admission: { '2024': 2 },
        noAdmission: { '2025': 1 }
    }
];

describe('AgentDashboard', () => {
    beforeEach(() => {
        render(<AgentDashboard agentStudentDistribution={mockDistribution} />);
    });

    it('renders without crashing', () => {
        expect(document.body).toBeTruthy();
    });

    it('renders section header', () => {
        expect(screen.getByText('Active Students distribution')).toBeTruthy();
    });

    it('renders agent names', () => {
        expect(screen.getByText('Agent Alice')).toBeTruthy();
        expect(screen.getByText('Agent Bob')).toBeTruthy();
    });

    it('renders bar charts for each agent', () => {
        const charts = screen.getAllByTestId('bar-chart');
        expect(charts.length).toBe(2);
    });
});
