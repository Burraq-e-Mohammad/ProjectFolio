import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

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
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Backend Connection Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={testRailwayAPI} variant="outline">
            Test Railway API
          </Button>
          <Button onClick={testVercelAPI} variant="outline">
            Test Vercel API
          </Button>
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
      </CardContent>
    </Card>
  );
};

export default TestBackendConnection; 