import { render, screen } from '@testing-library/react';
import OffcanvasBaseDocument from './OffcanvasBaseDocument';

describe('OffcanvasBaseDocument', () => {
    it('renders when open', () => {
        render(
            <OffcanvasBaseDocument
                docName="Test Doc"
                link="https://example.com"
                onChangeURL={jest.fn()}
                onHide={jest.fn()}
                open={true}
                updateDocLink={jest.fn()}
            />
        );
        expect(screen.getByText(/Edit/i)).toBeInTheDocument();
        expect(screen.getByText(/Documentation Link for/)).toBeInTheDocument();
        expect(screen.getByText('Test Doc')).toBeInTheDocument();
    });

    it('does not render content when closed', () => {
        render(
            <OffcanvasBaseDocument
                docName="Test Doc"
                link=""
                onChangeURL={jest.fn()}
                onHide={jest.fn()}
                open={false}
                updateDocLink={jest.fn()}
            />
        );
        expect(screen.queryByText('Test Doc')).not.toBeInTheDocument();
    });
});
