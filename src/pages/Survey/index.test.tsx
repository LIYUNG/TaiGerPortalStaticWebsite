import { render, screen, waitFor } from '@testing-library/react';
import type { AxiosResponse } from 'axios';
import Survey from '.';
import { getStudents, getProgramTickets, getMyAcademicBackground } from '@api';
import { useAuth } from '@components/AuthProvider/index';
import type { AuthContextValue } from '@api/types';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';

import { mockSingleData } from '../../test/testingStudentData';
import { SurveyProvider } from '@components/SurveyProvider';

vi.mock('axios');
vi.mock('@api');
vi.mock('@components/AuthProvider');
vi.mock('@taiger-common/core', async (importOriginal) => {
    const actual =
        (await importOriginal()) as typeof import('@taiger-common/core');
    return {
        ...actual,
        is_TaiGer_role: () => false,
        is_TaiGer_Student: () => true
    };
});

const routes = [
    {
        path: '/survey',
        element: (
            <SurveyProvider
                value={{
                    academic_background:
                        mockSingleData.data[0].academic_background,
                    application_preference:
                        mockSingleData.data[0].application_preference,
                    survey_link: 'dummylink',
                    student_id: mockSingleData.data[0]._id.toString()
                }}
            >
                <Survey />
            </SurveyProvider>
        ),
        errorElement: <div>Error</div>,
        loader: () => {
            return {
                data: { data: mockSingleData.data[0], survey_link: 'dummylink' }
            };
        }
    }
];

class ResizeObserver {
    observe() {}
    disconnect() {}
    unobserve() {}
}

describe('Survey', () => {
    window.ResizeObserver = ResizeObserver;
    test('student survey page not crash', async () => {
        vi.mocked(getStudents).mockResolvedValue({
            data: mockSingleData
        } as AxiosResponse<typeof mockSingleData>);
        vi.mocked(getMyAcademicBackground).mockResolvedValue({
            data: {
                success: true,
                data: mockSingleData.data[0],
                survey_link: [{ key: 'Grading_System', link: 'some_link' }]
            }
        } as AxiosResponse);
        vi.mocked(getProgramTickets).mockResolvedValue({
            data: { success: true, data: [] }
        } as AxiosResponse);
        vi.mocked(useAuth).mockReturnValue({
            user: { role: 'Student', _id: '6366287a94358b085b0fccf7' },
            isAuthenticated: true,
            isLoaded: true,
            login: () => {},
            logout: () => {}
        } as AuthContextValue);

        const router = createMemoryRouter(routes, {
            initialEntries: ['/survey']
        });
        render(<RouterProvider router={router} />);

        await waitFor(
            () => {
                expect(
                    screen.getByPlaceholderText(
                        "Taipei First Girls' High School"
                    )
                ).toHaveValue('Song Shan senior high school');
                expect(screen.getByPlaceholderText('2016')).toHaveValue('2020');
                expect(
                    screen.getByPlaceholderText('National Yilan University')
                ).toHaveValue(
                    'National Taichung University of Science and Technology'
                );
            },
            { timeout: 3000 }
        );
    });
});
