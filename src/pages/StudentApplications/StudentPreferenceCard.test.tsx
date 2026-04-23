import { render, screen } from '@testing-library/react';
import { StudentPreferenceCard } from './StudentPreferenceCard';

const mockStudent = {
    _id: 'stu1',
    firstname: 'John',
    lastname: 'Doe',
    application_preference: {
        target_application_field: 'Computer Science',
        targetApplicationSubjects: ['AI', 'Machine Learning'],
        target_degree: 'Master',
        target_program_language: 'English',
        considered_privat_universities: 'Yes',
        application_outside_germany: 'No',
        special_wished: 'Top universities only'
    }
};

describe('StudentPreferenceCard', () => {
    it('renders preference labels', () => {
        render(<StudentPreferenceCard student={mockStudent} />);
        expect(
            screen.getByText('Target Application Fields')
        ).toBeInTheDocument();
    });

    it('renders the target application field value', () => {
        render(<StudentPreferenceCard student={mockStudent} />);
        expect(screen.getByText('Computer Science')).toBeInTheDocument();
    });

    it('renders targetApplicationSubjects joined by comma', () => {
        render(<StudentPreferenceCard student={mockStudent} />);
        expect(screen.getByText('AI, Machine Learning')).toBeInTheDocument();
    });
});
