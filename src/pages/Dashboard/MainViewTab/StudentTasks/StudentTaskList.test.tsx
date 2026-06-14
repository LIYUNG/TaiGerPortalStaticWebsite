import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (k: string) => k })
}));

import { buildStudentTasks } from './studentTasks';
import StudentTaskList from './StudentTaskList';

vi.mock('./studentTasks', () => ({
    buildStudentTasks: vi.fn()
}));

const mockedBuild = vi.mocked(buildStudentTasks);

const task = (over = {}) => ({
    id: 't',
    title: 'Profile',
    description: 'Finish your profile',
    to: '/survey',
    actionLabel: 'Start',
    priority: 'urgent' as const,
    category: 'profile' as const,
    locked: false,
    ...over
});

const renderList = () =>
    render(
        <MemoryRouter>
            <StudentTaskList isCoursesFilled student={{} as never} />
        </MemoryRouter>
    );

beforeEach(() => mockedBuild.mockReset());

describe('StudentTaskList', () => {
    it('shows the all-caught-up state when there are no tasks', () => {
        mockedBuild.mockReturnValue({
            tasks: [],
            progress: { done: 5, total: 5 }
        });
        renderList();
        expect(screen.getByText("You're all caught up!")).toBeInTheDocument();
    });

    it('highlights the first task as the "Start here" focus with a deep link', () => {
        mockedBuild.mockReturnValue({
            tasks: [task()],
            progress: { done: 4, total: 5 }
        });
        renderList();
        expect(screen.getByText('Start here')).toBeInTheDocument();
        expect(screen.getByText('Profile')).toBeInTheDocument();
        const link = screen.getByRole('link', { name: /Start/ });
        expect(link).toHaveAttribute('href', '/survey');
    });

    it('renders an "Up next" list for the remaining tasks', () => {
        mockedBuild.mockReturnValue({
            tasks: [
                task(),
                task({
                    id: 't2',
                    title: 'My Documents',
                    category: 'documents'
                })
            ],
            progress: { done: 3, total: 5 }
        });
        renderList();
        expect(screen.getByText('Up next')).toBeInTheDocument();
        expect(screen.getByText('My Documents')).toBeInTheDocument();
    });

    it('renders a locked task as a disabled, non-navigating action', () => {
        mockedBuild.mockReturnValue({
            tasks: [
                task(),
                task({ id: 't2', title: 'Locked thread', locked: true })
            ],
            progress: { done: 0, total: 5 }
        });
        renderList();
        // The locked task exposes a disabled "Locked" button, not a link.
        const lockedBtn = screen.getByRole('button', { name: /Locked/ });
        expect(lockedBtn).toBeDisabled();
    });
});
