export function validateEngraving(input: string): { ok: boolean; message?: string; value?: string } {
  if (!input) {
    return { ok: true, value: '' };
  }

  // Normalize and clean
  const cleaned = input.normalize('NFC').trim().replace(/\s+/g, ' ');
  
  // Count visible characters (emoji as 1)
  const charCount = [...cleaned].length;
  
  if (charCount > 14) {
    return { ok: false, message: 'Maximum 14 characters allowed' };
  }
  
  if (charCount < 1) {
    return { ok: false, message: 'Please enter at least 1 character' };
  }
  
  // Allow letters, numbers, spaces, common symbols, emoji
  const allowedPattern = /^[\p{L}\p{N}\p{P}\p{S}\p{Z}\p{Emoji}]+$/u;
  if (!allowedPattern.test(cleaned)) {
    return { ok: false, message: 'Contains invalid characters' };
  }
  
  return { ok: true, value: cleaned };
}