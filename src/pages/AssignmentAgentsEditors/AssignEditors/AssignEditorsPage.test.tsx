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

vi.mock(
    '@pages/Dashboard/MainViewTab/NoEditorsStudentsCard/NoEditorsStudentsCard',
    () => ({
        default: () => (
            <tr data-testid="no-editors-card">
                <td />
            </tr>
        )
    })
);

import AssignEditorsPage from './AssignEditorsPage';

const mockStudents = [
    {
        _id: 's1',
        firstname: 'Jane',
        lastname: 'Doe',
        email: 'jane@example.com',
        editors: [],
        agents: [],
        application_preference: { expected_application_date: '2025-09' }
    }
] as any;

describe('AssignEditorsPage', () => {
    it('renders without crashing', () => {
        render(
            <MemoryRouter>
                <AssignEditorsPage
                    students={[]}
                    submitUpdateEditorlist={vi.fn()}
                />
            </MemoryRouter>
        );
        expect(screen.getByTestId('breadcrumbs')).toBeTruthy();
    });

    it('renders No Editors Students heading', () => {
        render(
            <MemoryRouter>
                <AssignEditorsPage
                    students={mockStudents}
                    submitUpdateEditorlist={vi.fn()}
                />
            </MemoryRouter>
        );
        expect(screen.getByText(/No Editors Students/i)).toBeTruthy();
    });

    it('renders editor card rows', () => {
        render(
            <MemoryRouter>
                <AssignEditorsPage
                    students={mockStudents}
                    submitUpdateEditorlist={vi.fn()}
                />
            </MemoryRouter>
        );
        expect(screen.getByTestId('no-editors-card')).toBeTruthy();
    });
});
