import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Database, Key, Globe } from 'lucide-react';
import { supabase } from '@/supabase/client';

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'warning' | 'loading';
  message: string;
  details?: string;
}

const ConnectionTest = () => {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    const results: TestResult[] = [];

    // Test 1: Environment Variables
    results.push({
      name: 'Environment Variables',
      status: 'loading',
      message: 'Checking environment configuration...'
    });
    setTests([...results]);

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      results[0] = {
        name: 'Environment Variables',
        status: 'error',
        message: 'Missing environment variables',
        details: `URL: ${supabaseUrl ? '✓' : '✗'}, ANON_KEY: ${supabaseKey ? '✓' : '✗'}`
      };
    } else {
      results[0] = {
        name: 'Environment Variables',
        status: 'success',
        message: 'Environment variables configured',
        details: `URL: ${supabaseUrl}`
      };
    }
    setTests([...results]);

    // Test 2: Network Connection
    results.push({
      name: 'Network Connection',
      status: 'loading',
      message: 'Testing network connectivity...'
    });
    setTests([...results]);

    try {
      const response = await fetch(supabaseUrl, { method: 'HEAD' });
      results[1] = {
        name: 'Network Connection',
        status: 'success',
        message: 'Network connection successful',
        details: `Status: ${response.status}`
      };
    } catch (error) {
      results[1] = {
        name: 'Network Connection',
        status: 'error',
        message: 'Network connection failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
    setTests([...results]);

    // Test 3: Supabase Client
    results.push({
      name: 'Supabase Client',
      status: 'loading',
      message: 'Testing Supabase client initialization...'
    });
    setTests([...results]);

    try {
      const { data, error } = await supabase.from('product_categories').select('count');
      
      if (error) {
        results[2] = {
          name: 'Supabase Client',
          status: 'error',
          message: 'Supabase authentication failed',
          details: error.message
        };
      } else {
        results[2] = {
          name: 'Supabase Client',
          status: 'success',
          message: 'Supabase client working',
          details: 'Successfully connected to database'
        };
      }
    } catch (error) {
      results[2] = {
        name: 'Supabase Client',
        status: 'error',
        message: 'Supabase client error',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
    setTests([...results]);

    // Test 4: Database Tables
    results.push({
      name: 'Database Tables',
      status: 'loading',
      message: 'Checking database tables...'
    });
    setTests([...results]);

    try {
      const tables = ['products', 'product_categories', 'orders', 'customers'];
      const tableResults = [];

      for (const table of tables) {
        try {
          const { error } = await supabase.from(table).select('*').limit(1);
          tableResults.push(`${table}: ${error ? '✗' : '✓'}`);
        } catch {
          tableResults.push(`${table}: ✗`);
        }
      }

      const successCount = tableResults.filter(r => r.includes('✓')).length;
      
      results[3] = {
        name: 'Database Tables',
        status: successCount === tables.length ? 'success' : successCount > 0 ? 'warning' : 'error',
        message: `${successCount}/${tables.length} tables accessible`,
        details: tableResults.join(', ')
      };
    } catch (error) {
      results[3] = {
        name: 'Database Tables',
        status: 'error',
        message: 'Failed to check tables',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
    setTests([...results]);

    setIsRunning(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'loading': return <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800 border-green-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'loading': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Supabase Connection Test</h1>
          <p className="text-gray-600">Comprehensive connectivity and configuration check</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Globe className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">URL</p>
                  <p className="font-mono text-xs">{import.meta.env.VITE_SUPABASE_URL}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Key className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">ANON Key</p>
                  <p className="font-mono text-xs">{import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20)}...</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Database className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <Badge className={getStatusColor(tests.length > 0 ? tests[tests.length - 1]?.status : 'loading')}>
                    {isRunning ? 'Testing...' : tests.length > 0 ? 'Complete' : 'Ready'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Connection Tests</CardTitle>
            <Button onClick={runTests} disabled={isRunning} className="flex items-center space-x-2">
              <RefreshCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
              <span>Run Tests</span>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tests.map((test, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 rounded-lg border bg-white">
                  <div className="flex-shrink-0 mt-0.5">
                    {getStatusIcon(test.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">{test.name}</h3>
                      <Badge className={getStatusColor(test.status)}>
                        {test.status}
                      </Badge>
                    </div>
                    <p className="text-gray-600 mt-1">{test.message}</p>
                    {test.details && (
                      <p className="text-sm text-gray-500 mt-2 font-mono bg-gray-50 p-2 rounded">
                        {test.details}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConnectionTest;