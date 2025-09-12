import React from 'react';
import MDEditor from '@uiw/react-md-editor';
import rehypeSanitize from "rehype-sanitize";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ value, onChange }) => {
  return (
    // REVISI: Bungkus dengan div yang memiliki border konsisten
    <div className="bg-transparent border border-lime-400/60 rounded-lg overflow-hidden" data-color-mode="dark">
      <MDEditor
        value={value}
        onChange={onChange}
        height={400}
        previewOptions={{
          rehypePlugins: [[rehypeSanitize]],
        }}
        // Hapus style inline agar border diatur oleh div di atas
        style={{
          backgroundColor: 'transparent',
          border: 'none', // Hilangkan border asli komponen
        }}
      />
    </div>
  );
};