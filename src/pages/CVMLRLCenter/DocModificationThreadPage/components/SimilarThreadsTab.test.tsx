import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SimilarThreadsTab from './SimilarThreadsTab';
import type { SimilarThread } from './SimilarThreadsTab';

vi.mock('@store/constant', () => ({
    default: {
        DOCUMENT_MODIFICATION_LINK: (id: string) => `/documents/${id}`
    }
}));

const t = (key: string) => key;

const render_ = (props: { similarThreads: SimilarThread[]; t: typeof t }) =>
    render(
        <MemoryRouter>
            <SimilarThreadsTab {...props} />
        </MemoryRouter>
    );

describe('SimilarThreadsTab', () => {
    it('renders "No similar threads found" when empty array', () => {
        render_({ similarThreads: [], t });
        expect(
            screen.getByText('No similar threads found')
        ).toBeInTheDocument();
    });

    it('renders student name from similar thread', () => {
        const similarThreads: SimilarThread[] = [
            {
                _id: 'thread1',
                student_id: { firstname: 'Alice', lastname: 'Smith' },
                application_id: { application_year: '2024', admission: 'O' },
                file_type: 'Essay'
            }
        ];
        render_({ similarThreads, t });
        expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    });

    it('renders application year and file type', () => {
        const similarThreads: SimilarThread[] = [
            {
                _id: 'thread2',
                student_id: { firstname: 'Bob', lastname: 'Jones' },
                application_id: { application_year: '2023', admission: 'X' },
                file_type: 'ML'
            }
        ];
        render_({ similarThreads, t });
        expect(screen.getByText('2023 - ML')).toBeInTheDocument();
    });

    it('renders Admitted chip for admission "O"', () => {
        const similarThreads: SimilarThread[] = [
            {
                _id: 'thread3',
                student_id: { firstname: 'Carol', lastname: 'White' },
                application_id: { application_year: '2024', admission: 'O' },
                file_type: 'CV'
            }
        ];
        render_({ similarThreads, t });
        expect(screen.getByText('Admitted')).toBeInTheDocument();
    });

    it('renders Rejected chip for admission "X"', () => {
        const similarThreads: SimilarThread[] = [
            {
                _id: 'thread4',
                student_id: { firstname: 'Dave', lastname: 'Brown' },
                application_id: { application_year: '2024', admission: 'X' },
                file_type: 'RL'
            }
        ];
        render_({ similarThreads, t });
        expect(screen.getByText('Rejected')).toBeInTheDocument();
    });

    it('renders Pending chip for unknown admission status', () => {
        const similarThreads: SimilarThread[] = [
            {
                _id: 'thread5',
                student_id: { firstname: 'Eve', lastname: 'Green' },
                application_id: {
                    application_year: '2024',
                    admission: 'pending'
                },
                file_type: 'Essay'
            }
        ];
        render_({ similarThreads, t });
        expect(screen.getByText('Pending')).toBeInTheDocument();
    });
});
