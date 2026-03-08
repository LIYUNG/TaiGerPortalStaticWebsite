import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CVMLRLDashboard from './CVMLRLDashboard';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key })
}));

vi.mock('@utils/contants', () => ({
    c1_mrt: []
}));

vi.mock('../Utils/ModalHandler/ModalMain', () => ({
    default: () => <div data-testid="modal-main" />
}));

vi.mock('@components/Tabs', () => ({
    CustomTabPanel: ({ children, index, value }: { children: React.ReactNode; index: number; value: number }) =>
        index === value ? <div data-testid={`tab-panel-${index}`}>{children}</div> : null,
    a11yProps: () => ({})
}));

vi.mock('@components/MaterialReactTable', () => ({
    default: ({ data }: { data: unknown[] }) => (
        <div data-testid="material-react-table">{data?.length ?? 0} rows</div>
    )
}));

const mockTasks = [
    {
        id: '1',
        show: true,
        isFinalVersion: false,
        latest_message_left_by_id: 'user1',
        file_type: 'CV',
        student_id: 'student1'
    },
    {
        id: '2',
        show: true,
        isFinalVersion: false,
        latest_message_left_by_id: '- None - ',
        file_type: 'ML',
        student_id: 'student2'
    },
    {
        id: '3',
        show: true,
        isFinalVersion: true,
        latest_message_left_by_id: 'user1',
        file_type: 'RL',
        student_id: 'student3'
    }
];

describe('CVMLRLDashboard', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <CVMLRLDashboard open_tasks_arr={mockTasks} />
            </MemoryRouter>
        );
    });

    it('renders the tabs', () => {
        expect(screen.getByRole('tab', { name: /In Progress/i })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /No Input/i })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /Closed/i })).toBeInTheDocument();
    });

    it('renders the In Progress tab content by default', () => {
        expect(screen.getByTestId('tab-panel-0')).toBeInTheDocument();
        expect(screen.getByTestId('material-react-table')).toBeInTheDocument();
    });

    it('renders a banner in the active tab panel', () => {
        expect(screen.getByTestId('banner')).toBeInTheDocument();
    });

    it('renders correctly with empty open_tasks_arr', () => {
        render(
            <MemoryRouter>
                <CVMLRLDashboard open_tasks_arr={[]} />
            </MemoryRouter>
        );
        expect(screen.getAllByRole('tab').length).toBeGreaterThan(0);
    });
});
