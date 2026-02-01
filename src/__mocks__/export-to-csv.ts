// Mock for export-to-csv module
/* eslint-disable no-undef */
const mkConfig = jest.fn(() => ({}));
const generateCsv = jest.fn(() => jest.fn(() => 'mock-csv-data'));
const download = jest.fn(() => jest.fn(() => {}));

module.exports = {
    mkConfig,
    generateCsv,
    download
};
/* eslint-enable no-undef */
