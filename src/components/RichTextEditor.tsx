import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bold, Italic, Underline, List, ListOrdered, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const RichTextEditor = ({ value, onChange, placeholder }: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);

  const sanitizeHTML = (html: string) => {
    const allowedTags = ['b', 'i', 'u', 'strong', 'em', 'ul', 'ol', 'li', 'p', 'br', 'div'];
    const allowedAttrs = ['style'];
    
    return html
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/<(?!\/?(b|i|u|strong|em|ul|ol|li|p|br|div)\b)[^>]*>/gi, '');
  };

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      const sanitizedValue = sanitizeHTML(value || '');
      editorRef.current.innerHTML = sanitizedValue;
    }
  }, [value]);

  const execCommand = (command: string, value?: string) => {
    if (!editorRef.current) return;
    
    // Sanitize and validate commands to prevent code injection
    const sanitizedCommand = command.replace(/[^a-zA-Z]/g, '');
    const allowedCommands = ['bold', 'italic', 'underline', 'insertUnorderedList', 'insertOrderedList', 'justifyLeft', 'justifyCenter', 'justifyRight', 'fontSize'];
    if (!allowedCommands.includes(sanitizedCommand)) return;
    
    // Sanitize fontSize values
    if (sanitizedCommand === 'fontSize' && value) {
      const sanitizedValue = value.replace(/[^0-9]/g, '');
      const allowedSizes = ['1', '3', '4', '6'];
      if (!allowedSizes.includes(sanitizedValue)) return;
      value = sanitizedValue;
    }
    
    try {
      document.execCommand(command, false, value);
      // Get sanitized content without reassigning innerHTML
      const sanitizedHTML = editorRef.current.innerHTML
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '');
      onChange(sanitizedHTML);
    } catch (error) {
      console.error('Command execution failed:', error);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.textContent || '');
    }
  };

  return (
    <div className="border rounded-md">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b bg-gray-50">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => execCommand('bold')}
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => execCommand('italic')}
        >
          <Italic className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => execCommand('underline')}
        >
          <Underline className="w-4 h-4" />
        </Button>
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => execCommand('insertUnorderedList')}
        >
          <List className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => execCommand('insertOrderedList')}
        >
          <ListOrdered className="w-4 h-4" />
        </Button>
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => execCommand('justifyLeft')}
        >
          <AlignLeft className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => execCommand('justifyCenter')}
        >
          <AlignCenter className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => execCommand('justifyRight')}
        >
          <AlignRight className="w-4 h-4" />
        </Button>
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        <select
          className="text-sm border rounded px-2 py-1"
          onChange={(e) => execCommand('fontSize', e.target.value)}
        >
          <option value="3">Normal</option>
          <option value="1">Small</option>
          <option value="4">Large</option>
          <option value="6">Extra Large</option>
        </select>
      </div>
      
      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        className="min-h-[200px] p-4 focus:outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 empty:before:pointer-events-none"
        onInput={handleInput}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
      />
      

    </div>
  );
};

export default RichTextEditor;