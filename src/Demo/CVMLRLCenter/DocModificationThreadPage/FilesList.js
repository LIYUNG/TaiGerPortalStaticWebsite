import React from 'react';

import FileItem from './FileItem';

const FilesList = ({ thread }) => {
    const fileList = thread.messages.map((message, i) => (
        <FileItem id={message._id} idx={i} key={i} message={message} />
    ));
    return fileList;
};

export default FilesList;
