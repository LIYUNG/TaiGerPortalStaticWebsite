// Mock for query-string module
/* eslint-disable no-undef */
const parse = jest.fn(() => ({}));
const stringify = jest.fn(() => '');
const parseUrl = jest.fn(() => ({ url: '', query: {} }));

module.exports = {
    parse,
    stringify,
    parseUrl
};
/* eslint-enable no-undef */
