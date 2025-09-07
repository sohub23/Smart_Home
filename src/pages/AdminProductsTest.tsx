import AdminNavbar from '@/components/AdminNavbar';

const AdminProductsTest = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">Products Page Test</h1>
        <p className="text-gray-600">This is a test page to verify routing works.</p>
        <div className="mt-8 p-4 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Page Status</h2>
          <p className="text-green-600">✅ Page is loading successfully</p>
          <p className="text-green-600">✅ AdminNavbar is working</p>
          <p className="text-green-600">✅ Routing is functional</p>
        </div>
      </div>
    </div>
  );
};

export default AdminProductsTest;