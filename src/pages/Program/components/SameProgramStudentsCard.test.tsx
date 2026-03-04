import React from 'react';
import { render, screen } from '@testing-library/react';
import SameProgramStudentsCard from './SameProgramStudentsCard';

vi.mock('react-router-dom', async (importOriginal) => {
    const actual =
        (await importOriginal()) as typeof import('react-router-dom');
    return {
        ...actual,
        Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
            <a href={to}>{children}</a>
        )
    };
});

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key })
}));

vi.mock('@components/Tabs', () => ({
    a11yProps: () => ({}),
    CustomTabPanel: ({
        children,
        index,
        value
    }: {
        children: React.ReactNode;
        index: number;
        value: number;
    }) => (index === value ? <div>{children}</div> : null)
}));

vi.mock('@store/constant', () => ({
    default: {
        STUDENT_DATABASE_STUDENTID_LINK: (id: string, hash: string) =>
            `/student/${id}${hash}`,
        TEAM_AGENT_LINK: (id: string) => `/agent/${id}`,
        TEAM_EDITOR_LINK: (id: string) => `/editor/${id}`,
        PROFILE_HASH: '#profile'
    }
}));

vi.mock('../../Utils/util_functions', () => ({
    isApplicationOpen: (student: { closed?: boolean }) => !student.closed
}));

vi.mock('@taiger-common/core', () => ({
    isProgramWithdraw: () => false
}));

describe('SameProgramStudentsCard', () => {
    it('renders column headers', () => {
        render(<SameProgramStudentsCard isLoading={false} students={[]} />);
        expect(screen.getByText('Name')).toBeInTheDocument();
        expect(screen.getByText('Agent')).toBeInTheDocument();
        expect(screen.getByText('Editor')).toBeInTheDocument();
    });

    it('renders loading skeleton when isLoading is true', () => {
        const { container } = render(
            <SameProgramStudentsCard isLoading={true} students={[]} />
        );
        expect(
            container.querySelector('.MuiSkeleton-root')
        ).toBeInTheDocument();
    });

    it('renders In Progress students', () => {
        const students = [
            {
                _id: '1',
                firstname: 'Alice',
                lastname: 'Wong',
                agents: [],
                editors: []
            }
        ];
        render(
            <SameProgramStudentsCard isLoading={false} students={students} />
        );
        expect(screen.getByText('Alice Wong')).toBeInTheDocument();
    });

    it('renders agent links for In Progress students', () => {
        const students = [
            {
                _id: '1',
                firstname: 'Alice',
                lastname: 'Wong',
                agents: [{ _id: 'a1', firstname: 'Bob', lastname: 'Smith' }],
                editors: []
            }
        ];
        render(
            <SameProgramStudentsCard isLoading={false} students={students} />
        );
        expect(screen.getByText('Bob')).toBeInTheDocument();
    });

    it('renders "In Progress" and "Closed" tabs', () => {
        render(<SameProgramStudentsCard isLoading={false} students={[]} />);
        expect(screen.getByText('In Progress')).toBeInTheDocument();
        expect(screen.getByText('Closed')).toBeInTheDocument();
    });
});
