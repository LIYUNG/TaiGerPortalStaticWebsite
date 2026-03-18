import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({ user: { role: 'Admin', _id: 'a1' } })
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_role: vi.fn(() => true)
}));

vi.mock('@store/constant', () => ({
    default: { DASHBOARD_LINK: '/' }
}));

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useLoaderData: () => ({
            data: {
                data: [
                    { _id: 'i1', student: 'Alice', program: 'CS' },
                    { _id: 'i2', student: 'Bob', program: 'EE' }
                ]
            }
        }),
        useNavigate: () => vi.fn()
    };
});

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

vi.mock('./AssignInterviewTrainersPage', () => ({
    default: ({ interviews }: { interviews: unknown[] }) => (
        <div data-testid="assign-interview-trainers-page">
            {interviews.length} interviews
        </div>
    )
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key })
}));

import AssignInterviewTrainers from './index';

describe('AssignInterviewTrainers', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <AssignInterviewTrainers />
            </MemoryRouter>
        );
    });

    it('renders without crashing', () => {
        expect(document.body).toBeTruthy();
    });

    it('renders breadcrumbs navigation', () => {
        expect(screen.getByTestId('breadcrumbs')).toBeTruthy();
    });

    it('renders company name in breadcrumb', () => {
        expect(screen.getByText('TaiGer')).toBeTruthy();
    });

    it('renders the assign interview trainers page with data', () => {
        expect(
            screen.getByTestId('assign-interview-trainers-page')
        ).toBeTruthy();
        expect(screen.getByText('2 interviews')).toBeTruthy();
    });
});
