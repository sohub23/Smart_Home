import { useState } from 'react'
import { supabase } from './client'

export const useSupabase = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const executeQuery = async (queryFn: () => Promise<any>) => {
    setLoading(true)
    setError(null)
    try {
      const result = await queryFn()
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { supabase, loading, error, executeQuery }
}