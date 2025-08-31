import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from '@/components/ui/use-toast'
import { seedProducts } from '@/supabase/seedData'
import { Database, Loader2 } from 'lucide-react'

const SeedData = () => {
  const [loading, setLoading] = useState(false)

  const handleSeedData = async () => {
    setLoading(true)
    try {
      await seedProducts()
      toast({
        title: "Success",
        description: "All products have been added to the database!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to seed products. Check console for details.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <Card className="p-8 max-w-md w-full text-center">
        <Database className="w-16 h-16 mx-auto mb-4 text-blue-600" />
        <h1 className="text-2xl font-bold mb-4">Seed Database</h1>
        <p className="text-gray-600 mb-6">
          Click the button below to add all website products to the Supabase database.
        </p>
        <Button 
          onClick={handleSeedData} 
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Seeding Products...
            </>
          ) : (
            <>
              <Database className="w-4 h-4 mr-2" />
              Seed Products
            </>
          )}
        </Button>
      </Card>
    </div>
  )
}

export default SeedData