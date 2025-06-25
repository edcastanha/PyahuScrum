import React from 'react';
import MDEditor from '@uiw/react-md-editor';
import rehypeHighlight from 'rehype-highlight';
import styles from './MarkdownEditor.module.css';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
  preview?: 'edit' | 'preview' | 'live';
  height?: number;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  preview = 'live',
  height = 400
}) => {
  return (
    <div className={styles.editorContainer} data-color-mode="light">
      <MDEditor
        value={value}
        onChange={onChange}
        preview={preview}
        height={height}
        className={styles.editor}
        textareaProps={{
          placeholder: 'Digite seu conteúdo aqui...'
        }}
        previewOptions={{
          rehypePlugins: [rehypeHighlight]
        }}
      />
    </div>
  );
};

export default MarkdownEditor;
