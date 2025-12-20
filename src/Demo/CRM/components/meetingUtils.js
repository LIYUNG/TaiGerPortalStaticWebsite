export const sanitizeMeetingTitle = (title) =>
    title.replace(/###.*?###/g, '').trim();
