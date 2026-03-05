import { render, screen } from '@testing-library/react';

vi.mock('@components/EditorJs/EditorSimple', () => ({
    default: () => <div data-testid="editor-simple" />
}));

vi.mock('@components/Loading/Loading', () => ({
    default: () => <div data-testid="loading" />
}));

vi.mock('@utils/contants', () => ({
    stringAvatar: (name: string) => ({ children: name[0], sx: {} }),
    convertDate: (d: string) => d ?? ''
}));

import MessageEdit from './MessageEdit';

const baseProps = {
    editorState: { blocks: [{ type: 'paragraph', data: { text: 'Hello' } }] },
    full_name: 'Alice Smith',
    message: {
        _id: 'msg1',
        createdAt: '2024-01-01',
        user_id: { pictureUrl: '' }
    },
    editable: false,
    buttonDisabled: false,
    isDeleting: false,
    isTaiGerView: false,
    idx: 0,
    handleClickSave: vi.fn(),
    handleCancelEdit: vi.fn(),
    onDeleteSingleMessage: vi.fn()
};

describe('MessageEdit', () => {
    test('renders editor when editorState is provided', () => {
        render(<MessageEdit {...baseProps} />);
        expect(screen.getByTestId('editor-simple')).toBeInTheDocument();
    });

    test('shows full name in accordion summary', () => {
        render(<MessageEdit {...baseProps} />);
        expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    });

    test('shows Loading when editorState is null', () => {
        render(<MessageEdit {...baseProps} editorState={null} />);
        expect(screen.getByTestId('loading')).toBeInTheDocument();
    });
});
