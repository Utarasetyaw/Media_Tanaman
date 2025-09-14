import React, { useState, useEffect } from 'react';
import MDEditor from '@uiw/react-md-editor';
import rehypeSanitize from "rehype-sanitize";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ value, onChange }) => {
  // State untuk menyimpan lebar layar saat ini
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // useEffect untuk memantau perubahan ukuran layar
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    // Fungsi cleanup untuk menghapus event listener saat komponen dibongkar
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Array dependensi kosong agar efek ini hanya berjalan sekali saat mount

  // Tentukan tinggi editor secara dinamis berdasarkan lebar layar
  // 768px adalah breakpoint 'md' dari Tailwind CSS
  const editorHeight = windowWidth < 768 ? 250 : 400;

  return (
    <div className="bg-transparent border border-lime-400/60 rounded-lg overflow-hidden" data-color-mode="dark">
      <MDEditor
        value={value}
        onChange={onChange}
        // Gunakan tinggi yang sudah dinamis
        height={editorHeight}
        previewOptions={{
          rehypePlugins: [[rehypeSanitize]],
        }}
        style={{
          backgroundColor: 'transparent',
          border: 'none', // Hilangkan border asli komponen
        }}
      />
    </div>
  );
};