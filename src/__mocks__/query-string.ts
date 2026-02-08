// Mock for query-string module
/* eslint-disable no-undef */
const parse = vi.fn(() => ({}));
const stringify = vi.fn(() => '');
const parseUrl = vi.fn(() => ({ url: '', query: {} }));

module.exports = {
    parse,
    stringify,
    parseUrl
};
/* eslint-enable no-undef */
