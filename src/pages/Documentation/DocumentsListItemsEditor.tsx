import EditorNew from '@components/EditorJs/EditorNew';
import type { EditorNewProps } from '@components/EditorJs/EditorNew';

const DocumentsListItemsEditor = (props: EditorNewProps) => {
    return (
        <EditorNew
            category={props.category}
            doc_title={props.doc_title}
            editorState={props.editorState}
            handleClickEditToggle={props.handleClickEditToggle}
            handleClickSave={props.handleClickSave}
            readOnly={false}
        />
    );
};

export default DocumentsListItemsEditor;
