// XSS Protection utilities
import DOMPurify from 'dompurify';

// Safe HTML sanitization for display
export const sanitizeHTML = (html: string): string => {
  if (!html || typeof html !== 'string') return '';
  
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'u', 'strong', 'em', 'p', 'br', 'ul', 'ol', 'li', 'span', 'div'],
    ALLOWED_ATTR: ['class'],
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['script', 'object', 'embed', 'link', 'style', 'iframe'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur']
  });
};

// Safe text sanitization for display (escapes HTML)
export const sanitizeText = (text: string | null | undefined): string => {
  if (!text) return '';
  if (typeof text !== 'string') return String(text);
  
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Safe attribute sanitization
export const sanitizeAttribute = (attr: string | null | undefined): string => {
  if (!attr) return '';
  if (typeof attr !== 'string') return String(attr);
  
  return attr
    .replace(/[<>"'&]/g, (match) => {
      const escapeMap: { [key: string]: string } = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      };
      return escapeMap[match] || match;
    })
    .substring(0, 1000); // Limit length
};

// Safe URL sanitization
export const sanitizeURL = (url: string | null | undefined): string => {
  if (!url) return '';
  if (typeof url !== 'string') return '';
  
  // Only allow http, https, and relative URLs
  const urlPattern = /^(https?:\/\/|\/)/i;
  if (!urlPattern.test(url)) return '';
  
  return encodeURI(url).substring(0, 2000);
};

// Safe ID sanitization
export const sanitizeId = (id: string | null | undefined): string => {
  if (!id) return '';
  if (typeof id !== 'string') return String(id);
  
  return id.replace(/[^a-zA-Z0-9\-_]/g, '').substring(0, 100);
};