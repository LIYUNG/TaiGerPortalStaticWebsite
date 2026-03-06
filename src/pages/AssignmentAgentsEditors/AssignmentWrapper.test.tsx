import { createElement } from 'react';
import { render, screen } from '@testing-library/react';

import AssignmentWrapper from './AssignmentWrapper';
import { useAuth } from '@components/AuthProvider';
import { mockTwoNoAgentNoStudentsData } from '../../test/testingNoAgentNoEditorStudentData';

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
        submitUpdateAgentlist: vi.fn(),
        submitUpdateEditorlist: vi.fn(),
        ConfirmError: vi.fn()
    })
}));

vi.mock('./AssignAgents/AssignAgentsPage', () => ({
    default: () => createElement('div', { 'data-testid': 'assign-agents-page' })
}));

vi.mock('./AssignEditors/AssignEditorsPage', () => ({
    default: () =>
        createElement('div', { 'data-testid': 'assign-editors-page' })
}));

vi.mock('../Utils/ModalHandler/ModalMain', () => ({
    default: () => null
}));

describe('AssignmentWrapper (agent role)', () => {
    beforeEach(() => {
        vi.mocked(useAuth).mockReturnValue({
            user: { role: 'Admin', _id: '609c498ae2f954388837d2f9' },
            isAuthenticated: true,
            isLoaded: true,
            login: vi.fn(),
            logout: vi.fn()
        } as never);
    });

    it('renders assignment_agents container', () => {
        render(<AssignmentWrapper role="agent" />);
        expect(screen.getByTestId('assignment_agents')).toBeInTheDocument();
    });

    it('renders AssignAgentsPage', () => {
        render(<AssignmentWrapper role="agent" />);
        expect(screen.getByTestId('assign-agents-page')).toBeInTheDocument();
    });
});

describe('AssignmentWrapper (editor role)', () => {
    beforeEach(() => {
        vi.mocked(useAuth).mockReturnValue({
            user: { role: 'Admin', _id: '609c498ae2f954388837d2f9' },
            isAuthenticated: true,
            isLoaded: true,
            login: vi.fn(),
            logout: vi.fn()
        } as never);
    });

    it('renders assignment_editors container', () => {
        render(<AssignmentWrapper role="editor" />);
        expect(screen.getByTestId('assignment_editors')).toBeInTheDocument();
    });

    it('renders AssignEditorsPage', () => {
        render(<AssignmentWrapper role="editor" />);
        expect(screen.getByTestId('assign-editors-page')).toBeInTheDocument();
    });
});
