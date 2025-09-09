// Input sanitization utilities to prevent injection attacks

export const sanitizeString = (input: string | null | undefined): string => {
  if (!input) return '';
  return input.replace(/[<>'"&]/g, (match) => {
    const escapeMap: { [key: string]: string } = {
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '&': '&amp;'
    };
    return escapeMap[match];
  });
};

export const sanitizeForLog = (input: any): string => {
  if (typeof input === 'string') {
    return input.replace(/[\r\n\t]/g, ' ').substring(0, 100);
  }
  return String(input).replace(/[\r\n\t]/g, ' ').substring(0, 100);
};

export const validateId = (id: string | null | undefined): string | null => {
  if (!id) return null;
  // Only allow alphanumeric characters, hyphens, and underscores
  const sanitized = id.replace(/[^a-zA-Z0-9\-_]/g, '');
  return sanitized.length > 0 ? sanitized : null;
};

export const validateNumber = (num: any): number | null => {
  const parsed = Number(num);
  return isNaN(parsed) ? null : parsed;
};

export const sanitizeSearchTerm = (term: string | null | undefined): string => {
  if (!term) return '';
  // Remove special characters that could be used for injection
  return term.replace(/[^\w\s\-_.]/g, '').trim().substring(0, 100);
};