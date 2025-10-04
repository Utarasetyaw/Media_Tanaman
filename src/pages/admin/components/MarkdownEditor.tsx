import React, { useState, useEffect } from 'react';
import MDEditor from '@uiw/react-md-editor';
import rehypeSanitize from "rehype-sanitize";

interface MarkdownEditorProps {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  readOnly?: boolean;
}

// ▼▼▼ HOOK BARU UNTUK MENDETEKSI UKURAN LAYAR ▼▼▼
const useWindowWidth = () => {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        // Hapus event listener saat komponen tidak lagi digunakan
        return () => window.removeEventListener('resize', handleResize);
    }, []); // Array dependensi kosong, efek ini hanya berjalan sekali

    return windowWidth;
};


export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ value, onChange, readOnly = false }) => {
  const windowWidth = useWindowWidth();

  // Tentukan mode pratinjau berdasarkan ukuran layar dan status readOnly
  const getPreviewMode = () => {
    if (readOnly) {
      return 'preview'; // Selalu mode pratinjau jika readOnly
    }
    // 768px adalah breakpoint 'md' dari Tailwind CSS
    if (windowWidth < 768) {
      return 'edit'; // Di mobile, hanya tampilkan area edit
    }
    return 'live'; // Di desktop, tampilkan live preview
  };

  return (
    <div 
      className={`bg-transparent border border-lime-400/60 rounded-lg overflow-hidden ${readOnly ? 'opacity-70 bg-gray-800/20' : ''}`} 
      data-color-mode="dark"
    >
      <MDEditor
        value={value || ''}
        onChange={readOnly ? undefined : onChange}
        preview={getPreviewMode()} // Gunakan mode pratinjau yang dinamis
        height={windowWidth < 768 ? 300 : 400} // Atur tinggi berbeda untuk mobile & desktop
        minHeight={300}
        previewOptions={{
          rehypePlugins: [[rehypeSanitize]],
        }}
        style={{
          backgroundColor: 'transparent',
          border: 'none',
        }}
        hideToolbar={readOnly}
      />
    </div>
  );
};