import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (k: string) => k })
}));

vi.mock('@store/constant', () => ({
    default: {
        DASHBOARD_LINK: '/dashboard'
    }
}));

vi.mock('../../../config', () => ({
    appConfig: { companyName: 'TaiGer' }
}));

vi.mock('@components/BreadcrumbsNavigation/BreadcrumbsNavigation', () => ({
    BreadcrumbsNavigation: ({ items }: { items: { label: string }[] }) => (
        <nav data-testid="breadcrumbs">
            {items.map((item, i) => (
                <span key={i}>{item.label}</span>
            ))}
        </nav>
    )
}));

vi.mock('@pages/Dashboard/MainViewTab/NoAgentsStudentsCard/NoAgentsStudentsCard', () => ({
    default: () => <tr data-testid="no-agents-card"><td /></tr>
}));

import AssignAgentsPage from './AssignAgentsPage';

const mockStudents = [
    {
        _id: 's1',
        firstname: 'Jane',
        lastname: 'Doe',
        email: 'jane@example.com',
        agents: [],
        application_preference: { expected_application_date: '2025-09' }
    }
] as any;

describe('AssignAgentsPage', () => {
    it('renders without crashing', () => {
        render(
            <MemoryRouter>
                <AssignAgentsPage students={[]} submitUpdateAgentlist={vi.fn()} />
            </MemoryRouter>
        );
        expect(screen.getByTestId('breadcrumbs')).toBeTruthy();
    });

    it('renders No Agents Students heading', () => {
        render(
            <MemoryRouter>
                <AssignAgentsPage students={mockStudents} submitUpdateAgentlist={vi.fn()} />
            </MemoryRouter>
        );
        expect(screen.getByText(/No Agents Students/i)).toBeTruthy();
    });

    it('renders student rows', () => {
        render(
            <MemoryRouter>
                <AssignAgentsPage students={mockStudents} submitUpdateAgentlist={vi.fn()} />
            </MemoryRouter>
        );
        expect(screen.getByTestId('no-agents-card')).toBeTruthy();
    });
});
