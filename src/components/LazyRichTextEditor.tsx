import { lazy, Suspense } from 'react';

const RichTextEditor = lazy(() => import('./RichTextEditor'));

interface LazyRichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const LazyRichTextEditor = ({ value, onChange, placeholder }: LazyRichTextEditorProps) => {
  return (
    <Suspense fallback={
      <div className="border rounded-md p-4 min-h-[200px] bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading editor...</div>
      </div>
    }>
      <RichTextEditor value={value} onChange={onChange} placeholder={placeholder} />
    </Suspense>
  );
};

export default LazyRichTextEditor;