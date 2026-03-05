import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@hooks/useApplications', () => ({
    useApplications: vi.fn(() => ({ data: [], isLoading: false }))
}));

vi.mock('@components/MuiDataGrid', () => ({
    MuiDataGrid: () => <div data-testid="mui-data-grid" />
}));

vi.mock('@components/Loading/Loading', () => ({
    default: () => <div data-testid="loading" />
}));

vi.mock('@mui/x-charts', () => ({
    BarChart: () => <div data-testid="bar-chart" />,
    PieChart: () => <div data-testid="pie-chart" />
}));

vi.mock('react-google-charts', () => ({
    Chart: () => <div data-testid="geo-chart" />
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key })
}));

import Overview from './Overview';

describe('Overview', () => {
    it('renders without crashing', () => {
        render(
            <MemoryRouter>
                <Overview />
            </MemoryRouter>
        );
        // Should render tab list for Analysis Views and Geography Views
        const tablists = screen.getAllByRole('tablist');
        expect(tablists.length).toBeGreaterThan(0);
    });

    it('renders student and application tabs', () => {
        render(
            <MemoryRouter>
                <Overview />
            </MemoryRouter>
        );
        expect(screen.getByRole('tab', { name: /Student/i })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /Application/i })).toBeInTheDocument();
    });

    it('renders map and country breakdown tabs', () => {
        render(
            <MemoryRouter>
                <Overview />
            </MemoryRouter>
        );
        expect(screen.getByRole('tab', { name: /Map View/i })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /Country Breakdown/i })).toBeInTheDocument();
    });
});
