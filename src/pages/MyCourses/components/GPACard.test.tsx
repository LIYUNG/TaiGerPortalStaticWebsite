import React from 'react';
import { render, screen } from '@testing-library/react';

import GPACard from './GPACard';
import type { IStudentResponse } from '@taiger-common/model';

const makeStudent = (overrides = {}): IStudentResponse =>
    ({
        academic_background: {
            university: {
                My_GPA_Uni: 3.5,
                Highest_GPA_Uni: 4.0,
                Passing_GPA_Uni: 2.0,
                ...overrides
            }
        }
    } as unknown as IStudentResponse);

describe('GPACard', () => {
    it('renders GPA Information title', () => {
        render(<GPACard student={makeStudent()} myGermanGPA={2.3} />);
        expect(screen.getByText('GPA Information')).toBeInTheDocument();
    });

    it('renders My GPA section', () => {
        render(<GPACard student={makeStudent()} myGermanGPA={2.3} />);
        expect(screen.getByText('My GPA')).toBeInTheDocument();
    });

    it('renders German GPA Equivalent section', () => {
        render(<GPACard student={makeStudent()} myGermanGPA={2.3} />);
        expect(screen.getByText('German GPA Equivalent')).toBeInTheDocument();
    });

    it('displays student My_GPA_Uni value', () => {
        render(<GPACard student={makeStudent({ My_GPA_Uni: 3.5 })} myGermanGPA={2.3} />);
        expect(screen.getByText('3.5')).toBeInTheDocument();
    });

    it('displays the german GPA value', () => {
        render(<GPACard student={makeStudent()} myGermanGPA={1.3} />);
        expect(screen.getByText('1.3')).toBeInTheDocument();
    });

    it('shows N/A when My_GPA_Uni is missing', () => {
        render(
            <GPACard
                student={makeStudent({ My_GPA_Uni: undefined })}
                myGermanGPA={0}
            />
        );
        const naElements = screen.getAllByText('N/A');
        expect(naElements.length).toBeGreaterThan(0);
    });

    it('displays passing grade', () => {
        render(<GPACard student={makeStudent({ Passing_GPA_Uni: 2.0 })} myGermanGPA={2.3} />);
        expect(screen.getByText(/Passing Grade:/)).toBeInTheDocument();
    });

    it('displays German scale note', () => {
        render(<GPACard student={makeStudent()} myGermanGPA={2.3} />);
        expect(
            screen.getByText('German Scale: 1.0 (Best) - 4.0 (Passing)')
        ).toBeInTheDocument();
    });
});
