import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from '@/components/ui/use-toast'
import { supabase } from '@/supabase'
import { Database, Loader2, CheckCircle } from 'lucide-react'

const SetupDatabase = () => {
  const [loading, setLoading] = useState(false)
  const [completed, setCompleted] = useState(false)

  const createTables = async () => {
    setLoading(true)
    try {
      // Create category_images table
      const { error } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS category_images (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            category TEXT NOT NULL,
            image_url TEXT NOT NULL,
            title TEXT,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT NOW()
          );
          
          -- Enable RLS
          ALTER TABLE category_images ENABLE ROW LEVEL SECURITY;
          
          -- Allow public read access
          CREATE POLICY IF NOT EXISTS "Public read access" ON category_images
          FOR SELECT USING (true);
          
          -- Allow authenticated insert/update/delete
          CREATE POLICY IF NOT EXISTS "Authenticated write access" ON category_images
          FOR ALL USING (true);
        `
      })

      if (error) {
        throw error
      }

      setCompleted(true)
      toast({
        title: "Success",
        description: "Database tables created successfully!",
      })
    } catch (error) {
      console.error('Database setup error:', error)
      toast({
        title: "Error",
        description: `Failed to create tables: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <Card className="p-8 max-w-md w-full text-center">
        {completed ? (
          <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
        ) : (
          <Database className="w-16 h-16 mx-auto mb-4 text-blue-600" />
        )}
        <h1 className="text-2xl font-bold mb-4">
          {completed ? 'Setup Complete!' : 'Setup Database'}
        </h1>
        <p className="text-gray-600 mb-6">
          {completed 
            ? 'Your database is ready. You can now use the category images feature.'
            : 'Click the button below to create the required database tables for category images.'
          }
        </p>
        {!completed && (
          <Button 
            onClick={createTables} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Tables...
              </>
            ) : (
              <>
                <Database className="w-4 h-4 mr-2" />
                Create Tables
              </>
            )}
          </Button>
        )}
        {completed && (
          <Button 
            onClick={() => window.location.href = '/admin/categories'}
            className="w-full"
          >
            Go to Categories
          </Button>
        )}
      </Card>
    </div>
  )
}

export default SetupDatabase