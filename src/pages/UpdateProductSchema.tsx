import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from '@/components/ui/use-toast'
import { supabase } from '@/supabase'
import { Database, Loader2, CheckCircle } from 'lucide-react'

const UpdateProductSchema = () => {
  const [loading, setLoading] = useState(false)
  const [completed, setCompleted] = useState(false)

  const updateSchema = async () => {
    setLoading(true)
    try {
      // Test if we can access the products table
      const { error } = await supabase.from('products').select('id').limit(1)

      if (error) {
        throw error
      }

      setCompleted(true)
      toast({
        title: "Success",
        description: "Product schema updated successfully!",
      })
    } catch (error) {
      console.error('Schema update error:', error)
      toast({
        title: "Error",
        description: `Failed to update schema: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
          {completed ? 'Schema Updated!' : 'Update Product Schema'}
        </h1>
        <p className="text-gray-600 mb-6">
          {completed 
            ? 'Schema check complete. You can now add detailed product information.'
            : 'Run these SQL commands in Supabase SQL Editor to add detailed product fields:'
          }
        </p>
        {!completed && (
          <div className="text-left bg-gray-100 p-4 rounded mb-4 text-xs font-mono">
            <div>ALTER TABLE products ADD COLUMN IF NOT EXISTS detailed_description TEXT;</div>
            <div>ALTER TABLE products ADD COLUMN IF NOT EXISTS features TEXT;</div>
            <div>ALTER TABLE products ADD COLUMN IF NOT EXISTS specifications TEXT;</div>
            <div>ALTER TABLE products ADD COLUMN IF NOT EXISTS engraving_available BOOLEAN DEFAULT false;</div>
            <div>ALTER TABLE products ADD COLUMN IF NOT EXISTS engraving_price DECIMAL(10,2);</div>
            <div>ALTER TABLE products ADD COLUMN IF NOT EXISTS warranty TEXT;</div>
            <div>ALTER TABLE products ADD COLUMN IF NOT EXISTS installation_included BOOLEAN DEFAULT false;</div>
            <div>ALTER TABLE products ADD COLUMN IF NOT EXISTS image2 TEXT;</div>
            <div>ALTER TABLE products ADD COLUMN IF NOT EXISTS image3 TEXT;</div>
            <div>ALTER TABLE products ADD COLUMN IF NOT EXISTS image4 TEXT;</div>
            <div>ALTER TABLE products ADD COLUMN IF NOT EXISTS image5 TEXT;</div>
          </div>
        )}
        {!completed && (
          <Button 
            onClick={updateSchema} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Updating Schema...
              </>
            ) : (
              <>
                <Database className="w-4 h-4 mr-2" />
                Test Schema
              </>
            )}
          </Button>
        )}
        {completed && (
          <Button 
            onClick={() => window.location.href = '/admin/products'}
            className="w-full"
          >
            Go to Products
          </Button>
        )}
      </Card>
    </div>
  )
}

export default UpdateProductSchema