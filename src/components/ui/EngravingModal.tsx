import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogOverlay, DialogPortal } from '@/components/ui/dialog';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import { validateEngraving } from '@/hooks/useEngraving';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface EngravingModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  productImage: string;
  engravingImage?: string;
  productName?: string;
  engravingTextColor?: string;
  initialText?: string;
  currentQuantity?: number;
  onSave: (value: { text: string }) => Promise<void> | void;
}

const EMOJI_GRID = ['★', '♥', '✿', '✓', '☺', '☹', '#', '+', '×', '!', '?', '&', '@', '♪', '♫', '☀', '☽', '♠', '♣', '♦', '♧', '⚡', '✨', '🎉'];

export function EngravingModal({ open, onOpenChange, productImage, engravingImage, productName = 'Product', engravingTextColor = '#000000', initialText = '', currentQuantity = 1, onSave }: EngravingModalProps) {
  const [text, setText] = useState(initialText);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showMinOrderAlert, setShowMinOrderAlert] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validation = validateEngraving(text);
  const isValid = validation.ok;

  const handleTextChange = (value: string) => {
    setText(value);
    const result = validateEngraving(value);
    setError(result.message || '');
  };

  const insertEmoji = (emoji: string) => {
    const input = inputRef.current;
    if (!input) return;

    const start = input.selectionStart || text.length;
    const newText = text.slice(0, start) + emoji + text.slice(start);
    setText(newText);
    handleTextChange(newText);
    
    // Focus back to input
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(start + 1, start + 1);
    }, 0);
  };

  const handleSave = async () => {
    if (!isValid) return;
    
    // Check minimum order requirement for switches
    if (productName.toLowerCase().includes('switch') && currentQuantity < 10) {
      setShowMinOrderAlert(true);
      return;
    }
    
    setIsSaving(true);
    try {
      await onSave({ text: validation.value || '' });
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm" />
        <DialogPrimitive.Content
          className="fixed left-[50%] top-[50%] z-[60] w-[95vw] sm:w-[90vw] max-w-md max-h-[90vh] sm:max-h-[85vh] translate-x-[-50%] translate-y-[-50%] bg-white rounded-2xl shadow-2xl overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 sm:p-6 border-b">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Make it yours.</h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Engrave names, icons, or room labels on your smart switches. Personalized, professional laser engraving at no extra hassle.
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="h-8 w-8 p-0">
              <X className="w-4 h-4" />
            </Button>
          </div>

        <div className="flex-1 p-3 sm:p-4 space-y-3 sm:space-y-4 overflow-y-auto">
          {/* Preview */}
          <div className="relative rounded-lg overflow-hidden h-48">
            <div className="relative flex items-center justify-center h-full">
              <img
                src={engravingImage || "/images/engreving_new.png"}
                alt="Product preview"
                className="max-w-[250px] sm:max-w-[300px] max-h-[160px] sm:max-h-[200px] object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/images/engreving_new.png';
                }}
              />
              {text && (
                <div className="absolute bottom-4 sm:bottom-6 right-20 sm:right-36">
                  <div className="font-semibold" style={{ fontSize: '12px', color: engravingTextColor, textShadow: '2px 2px 4px rgba(255,255,255,0.8)' }}>
                    {text}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Text Input */}
          <div className="space-y-2">
            <Input
              ref={inputRef}
              value={text}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder=""
              maxLength={14}
              aria-describedby={error ? 'engraving-error' : 'engraving-help'}
              className={error ? 'border-red-500' : ''}
            />
            <div className="flex justify-between text-xs">
              <span id="engraving-help" className="text-gray-500">
                {[...text].length}/14 characters
              </span>
              {error && (
                <span id="engraving-error" className="text-red-500">
                  {error}
                </span>
              )}
            </div>
          </div>

          {/* Emoji Grid */}
          <div>
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
              {EMOJI_GRID.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => insertEmoji(emoji)}
                  className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 rounded border transition-colors"
                  type="button"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

        </div>
        
        {/* Actions */}
        <div className="flex gap-3 p-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isValid || isSaving}
            className="flex-1"
          >
            {isSaving ? 'Personalizing...' : 'Start Personalizing →'}
          </Button>
        </div>
        </div>
        </DialogPrimitive.Content>
      </DialogPortal>
      
      {/* Minimum Order Alert */}
      <AlertDialog open={showMinOrderAlert} onOpenChange={setShowMinOrderAlert}>
        <div className="fixed inset-0 z-[65] bg-black/60" />
        <AlertDialogContent className="max-w-md fixed left-[50%] top-[50%] z-[70] translate-x-[-50%] translate-y-[-50%]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-semibold text-gray-900">
              Minimum Order Required
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 space-y-3">
              <p>
                To ensure the highest quality customization, we require a minimum order of <strong>10 switches</strong> for engraving services.
              </p>
              <p>
                This allows us to maintain our professional standards and provide you with the best possible results.
              </p>
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Current quantity:</strong> {currentQuantity} switch{currentQuantity !== 1 ? 'es' : ''}<br/>
                  <strong>Required:</strong> 10 switches minimum
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>I Understand</AlertDialogCancel>
            <AlertDialogAction onClick={() => onOpenChange(false)}>
              Adjust Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}