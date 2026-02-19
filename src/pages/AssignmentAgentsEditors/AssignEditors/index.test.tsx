import { createElement } from 'react';
import { render, screen } from '@testing-library/react';

import AssignEditors from './index';
import { useAuth } from '@components/AuthProvider';
import { mockTwoNoAgentNoStudentsData } from '../../../test/testingNoAgentNoEditorStudentData';

vi.mock('react-router-dom', () => ({
    Navigate: () => null
}));

vi.mock('@components/AuthProvider');

vi.mock('@hooks/useStudentsV3', () => ({
    useStudentsV3: () => ({
        data: mockTwoNoAgentNoStudentsData.data
    })
}));

vi.mock('@hooks/useStudents', () => ({
    __esModule: true,
    default: (props: { students?: unknown[] }) => ({
        students: props.students ?? [],
        res_modal_message: '',
        res_modal_status: 0,
        submitUpdateEditorlist: vi.fn(),
        ConfirmError: vi.fn()
    })
}));

vi.mock('./AssignEditorsPage', () => ({
    default: () => createElement('div', { 'data-testid': 'assign-editors-page' })
}));

vi.mock('../../Utils/ModalHandler/ModalMain', () => ({
    default: () => null
}));

describe('AssignEditors', () => {
    beforeEach(() => {
        vi.mocked(useAuth).mockReturnValue({
            user: { role: 'Admin', _id: '609c498ae2f954388837d2f9' },
            isAuthenticated: true,
            isLoaded: true,
            login: vi.fn(),
            logout: vi.fn()
        } as never);
    });

    it('renders without crashing', () => {
        render(<AssignEditors />);
        expect(screen.getByTestId('assignment_editors')).toBeInTheDocument();
    });

    it('renders AssignEditorsPage with mock students', () => {
        render(<AssignEditors />);
        expect(screen.getByTestId('assign-editors-page')).toBeInTheDocument();
    });
});
