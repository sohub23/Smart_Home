export const sanitizeLogInput = (input: any): string => {
  if (typeof input === 'string') {
    return input.replace(/[\r\n\t]/g, ' ').substring(0, 200)
  }
  if (typeof input === 'object' && input !== null) {
    return JSON.stringify(input).replace(/[\r\n\t]/g, ' ').substring(0, 200)
  }
  return String(input).replace(/[\r\n\t]/g, ' ').substring(0, 200)
}

export const sanitizeInput = (input: string): string => {
  return input.replace(/[<>\"'&]/g, '').trim()
}

export const sanitizeDbInput = (input: string): string => {
  return input.replace(/[<>\"'&;]/g, '').trim()
}

export const sanitizeSearchQuery = (query: string): string => {
  return query.replace(/[^a-zA-Z0-9\s-]/g, '').trim()
}

export const validateId = (id: string): boolean => {
  return /^[a-zA-Z0-9-_]+$/.test(id)
}

export const validateUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(id)
}