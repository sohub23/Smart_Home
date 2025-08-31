import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from '@/components/ui/use-toast'
import { supabase } from '@/supabase'
import { Database, Loader2, CheckCircle, ExternalLink } from 'lucide-react'

const SetupStorage = () => {
  const [loading, setLoading] = useState(false)
  const [completed, setCompleted] = useState(false)

  const createBucket = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.storage.createBucket('product-images', {
        public: true
      })
      
      if (error && !error.message.includes('already exists')) {
        throw error
      }

      setCompleted(true)
      toast({
        title: "Success",
        description: "Storage bucket created successfully!",
      })
    } catch (error) {
      console.error('Bucket creation error:', error)
      toast({
        title: "Error",
        description: `Failed to create bucket: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <Card className="p-8 max-w-lg w-full">
        {completed ? (
          <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
        ) : (
          <Database className="w-16 h-16 mx-auto mb-4 text-blue-600" />
        )}
        <h1 className="text-2xl font-bold mb-4 text-center">
          {completed ? 'Storage Ready!' : 'Setup Storage Bucket'}
        </h1>
        
        {!completed ? (
          <div className="space-y-4">
            <p className="text-gray-600 text-center">
              Create the storage bucket for image uploads.
            </p>
            <Button 
              onClick={createBucket} 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Bucket...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
                  Create Storage Bucket
                </>
              )}
            </Button>
            
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
              <h3 className="font-semibold text-yellow-800 mb-2">Manual Setup (if needed):</h3>
              <ol className="text-sm text-yellow-700 space-y-1">
                <li>1. Go to Supabase Dashboard → Storage</li>
                <li>2. Click "New bucket"</li>
                <li>3. Name: <code className="bg-yellow-100 px-1 rounded">product-images</code></li>
                <li>4. Enable "Public bucket" ✅</li>
                <li>5. Click "Create bucket"</li>
              </ol>
              <a 
                href="https://supabase.com/dashboard/project/sftxrzqdmgaushcvvdli/storage/buckets" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center mt-2 text-blue-600 hover:text-blue-800"
              >
                Open Supabase Storage <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <p className="text-gray-600">
              Storage bucket is ready! You can now upload category images.
            </p>
            <Button 
              onClick={() => window.location.href = '/admin/products'}
              className="w-full"
            >
              Go to Products
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}

export default SetupStorage