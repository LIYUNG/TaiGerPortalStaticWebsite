import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@components/Charts/SingleBarChart', () => ({
    default: () => <div data-testid="single-bar-chart" />
}));

import KPIDashboardTab from './KPIDashboardTab';

const defaultProps = {
    CVdataWithDuration: [{ name: 'Alice-Smith', uv: 5 }],
    MLdataWithDuration: [{ name: 'Bob-Jones', uv: 10 }],
    RLdataWithDuration: []
};

describe('KPIDashboardTab', () => {
    beforeEach(() => {
        render(<KPIDashboardTab {...defaultProps} />);
    });

    it('renders without crashing', () => {
        expect(document.body).toBeTruthy();
    });

    it('renders CV KPI card', () => {
        expect(screen.getByText('Closed CV KPI')).toBeTruthy();
    });

    it('renders ML KPI card', () => {
        expect(screen.getByText('Closed ML KPI')).toBeTruthy();
    });

    it('renders RL KPI card', () => {
        expect(screen.getByText('Closed RL KPI')).toBeTruthy();
    });
});
