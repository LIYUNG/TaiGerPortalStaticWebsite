export const sanitizeMeetingTitle = (title = '') => {
    const safeTitle = typeof title === 'string' ? title : '';
    return safeTitle.replace(/###.*?###/g, '').trim();
};
