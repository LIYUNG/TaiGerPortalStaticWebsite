// Mock for export-to-csv module

const mkConfig = vi.fn(() => ({}));
const generateCsv = vi.fn(() => vi.fn(() => 'mock-csv-data'));
const download = vi.fn(() => vi.fn(() => {}));

module.exports = {
    mkConfig,
    generateCsv,
    download
};
