import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AdminNavbar from '@/components/AdminNavbar';

const AdminProductsSimple = () => {
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <AdminNavbar />
      <main className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
              Enhanced Product Management
            </h1>
            <p className="text-gray-600">Manage categories, subcategories, and products with variants</p>
          </div>
          <Button className="flex items-center space-x-2">
            <span>Add Product</span>
          </Button>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Products will be listed here</h2>
          <p className="text-gray-600">Enhanced product management system is loading...</p>
        </Card>
      </main>
    </div>
  );
};

export default AdminProductsSimple;