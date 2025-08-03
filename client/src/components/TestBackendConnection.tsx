import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { authAPI } from '@/lib/api';

const TestBackendConnection: React.FC = () => {
  const [status, setStatus] = useState<string>('Ready to test');
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setStatus('Testing connection...');
    
    try {
      // Test basic API call
      const response = await fetch('http://localhost:5000/api/categories');
      if (response.ok) {
        setStatus('✅ Backend connection successful');
      } else {
        setStatus(`❌ Backend responded with status: ${response.status}`);
      }
    } catch (error: any) {
      setStatus(`❌ Connection failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testGoogleAuth = async () => {
    setLoading(true);
    setStatus('Testing Google auth endpoint...');
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: 'test_token' })
      });
      
      if (response.status === 500) {
        setStatus('✅ Google auth endpoint accessible (500 expected for fake token)');
      } else {
        setStatus(`⚠️  Google auth endpoint status: ${response.status}`);
      }
    } catch (error: any) {
      setStatus(`❌ Google auth test failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">🔧 Backend Connection Test</h3>
      <div className="space-y-2 mb-4">
        <Button 
          onClick={testConnection} 
          disabled={loading}
          variant="outline"
          className="w-full"
        >
          Test Basic Connection
        </Button>
        <Button 
          onClick={testGoogleAuth} 
          disabled={loading}
          variant="outline"
          className="w-full"
        >
          Test Google Auth Endpoint
        </Button>
      </div>
      <div className="text-sm">
        <strong>Status:</strong> {status}
      </div>
    </div>
  );
};

export default TestBackendConnection; 