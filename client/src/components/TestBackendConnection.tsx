import React, { useState } from 'react';

const TestBackendConnection = () => {
  const [status, setStatus] = useState<string>('');
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const testRailwayAPI = async () => {
    setStatus('Testing Railway API...');
    setError('');
    setData(null);

    try {
      // Test the Railway API directly
      const response = await fetch('https://eloquent-reprieve-production.up.railway.app/api/projects');
      const result = await response.json();
      
      if (response.ok) {
        setStatus('✅ Railway API is working!');
        setData(result);
      } else {
        setStatus('❌ Railway API error');
        setError(result.message || 'Unknown error');
      }
    } catch (err: any) {
      setStatus('❌ Railway API connection failed');
      setError(err.message);
    }
  };

  const testVercelAPI = async () => {
    setStatus('Testing Vercel API...');
    setError('');
    setData(null);

    try {
      // Test what Vercel is actually calling
      const response = await fetch('/api/projects');
      const result = await response.json();
      
      if (response.ok) {
        setStatus('✅ Vercel API is working!');
        setData(result);
      } else {
        setStatus('❌ Vercel API error');
        setError(result.message || 'Unknown error');
      }
    } catch (err: any) {
      setStatus('❌ Vercel API connection failed');
      setError(err.message);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 border rounded-lg bg-white shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Backend Connection Test</h2>
      <div className="space-y-4">
        <div className="flex gap-2">
          <button 
            onClick={testRailwayAPI} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Test Railway API
          </button>
          <button 
            onClick={testVercelAPI} 
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Test Vercel API
          </button>
        </div>
        
        {status && (
          <div className={`p-3 rounded ${status.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {status}
          </div>
        )}
        
        {error && (
          <div className="p-3 bg-red-100 text-red-800 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}
        
        {data && (
          <div className="p-3 bg-blue-100 text-blue-800 rounded">
            <strong>Response:</strong>
            <pre className="mt-2 text-xs overflow-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestBackendConnection; 