import { render, screen } from '@testing-library/react';

import CourseTable from './CourseTable';

describe('CourseTable', () => {
    it('renders empty table with headers', () => {
        render(<CourseTable data={[]} tableKey="courseName" />);
        // i18next is mocked via setupTests to return the key
        expect(screen.getByText('Course')).toBeInTheDocument();
        expect(screen.getByText('Credits')).toBeInTheDocument();
        expect(screen.getByText('Grades')).toBeInTheDocument();
    });

    it('renders rows with course data', () => {
        const data = [
            { courseName: 'Mathematics', credits: 6, grades: 'A' },
            { courseName: 'Physics', credits: 4, grades: 'B' }
        ];
        render(<CourseTable data={data} tableKey="courseName" />);
        expect(screen.getByText('Mathematics')).toBeInTheDocument();
        expect(screen.getByText('Physics')).toBeInTheDocument();
        expect(screen.getByText('6')).toBeInTheDocument();
        expect(screen.getByText('4')).toBeInTheDocument();
        expect(screen.getByText('A')).toBeInTheDocument();
        expect(screen.getByText('B')).toBeInTheDocument();
    });

    it('renders with default empty array when data is not provided', () => {
        render(<CourseTable tableKey="courseName" />);
        expect(screen.getByText('Course')).toBeInTheDocument();
        // No rows rendered
        const rows = screen.queryAllByRole('row');
        // Only the header row exists
        expect(rows).toHaveLength(1);
    });
});
