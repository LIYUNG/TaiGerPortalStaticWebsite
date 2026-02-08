// Mock for query-string module
 
const parse = vi.fn(() => ({}));
const stringify = vi.fn(() => '');
const parseUrl = vi.fn(() => ({ url: '', query: {} }));

module.exports = {
    parse,
    stringify,
    parseUrl
};
 
