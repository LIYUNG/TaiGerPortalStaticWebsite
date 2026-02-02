import { render } from '@testing-library/react';
import SingleBarChart from './SingleBarChart';

describe('SingleBarChart', () => {
    it('renders without crashing', () => {
        render(
            <SingleBarChart
                data={[
                    { name: 'A', uv: 10 },
                    { name: 'B', uv: 20 }
                ]}
            />
        );
        expect(
            document.querySelector('[class*="MuiCharts"]')
        ).toBeInTheDocument();
    });
});
