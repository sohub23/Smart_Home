import AdminNavbar from '@/components/AdminNavbar';

const TestEnhanced = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <AdminNavbar />
      <main className="p-6 max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold">Enhanced Products Test Page</h1>
        <p>This page is working!</p>
      </main>
    </div>
  );
};

export default TestEnhanced;