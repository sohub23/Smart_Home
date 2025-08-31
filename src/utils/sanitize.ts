/**
 * Sanitization utilities to prevent injection attacks
 */

// Sanitize input for database operations
export const sanitizeDbInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/[<>'"&]/g, '') // Remove potentially dangerous characters
    .replace(/\0/g, '') // Remove null bytes
    .replace(/[\x00-\x1f\x7f-\x9f]/g, '') // Remove control characters
    .trim()
    .slice(0, 1000); // Limit length
};

// Sanitize input for logging to prevent log injection
export const sanitizeLogInput = (input: any): string => {
  if (input === null || input === undefined) return 'null';
  
  const str = typeof input === 'object' ? JSON.stringify(input) : String(input);
  
  return str
    .replace(/[\r\n]/g, ' ') // Replace newlines with spaces
    .replace(/[<>'"&]/g, '') // Remove potentially dangerous characters
    .slice(0, 500); // Limit length for logs
};

// Sanitize search queries to prevent NoSQL injection
export const sanitizeSearchQuery = (query: string): string => {
  if (typeof query !== 'string') return '';
  
  return query
    .replace(/[{}[\]().*+?^$|\\]/g, '') // Remove regex special characters
    .replace(/[<>'"&]/g, '') // Remove potentially dangerous characters
    .replace(/\0/g, '') // Remove null bytes
    .trim()
    .slice(0, 100); // Limit search query length
};

// Validate and sanitize URLs
export const sanitizeUrl = (url: string): string => {
  if (typeof url !== 'string') return '';
  
  // Only allow safe URL patterns
  const urlPattern = /^(https?:\/\/[a-zA-Z0-9.-]+\/[a-zA-Z0-9._/-]*|\/[a-zA-Z0-9._/-]*)$/;
  
  if (!urlPattern.test(url)) {
    return '';
  }
  
  return url.slice(0, 500); // Limit URL length
};

// Validate ID format (alphanumeric with hyphens and underscores only)
export const validateId = (id: string): boolean => {
  if (typeof id !== 'string') return false;
  return /^[a-zA-Z0-9-_]+$/.test(id) && id.length <= 50;
};

// Sanitize file names
export const sanitizeFileName = (fileName: string): string => {
  if (typeof fileName !== 'string') return '';
  
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace unsafe characters with underscore
    .replace(/\.{2,}/g, '.') // Replace multiple dots with single dot
    .slice(0, 100); // Limit filename length
};