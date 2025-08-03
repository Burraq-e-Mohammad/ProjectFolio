import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

const TestGoogleAuth: React.FC = () => {
  const [status, setStatus] = useState<string>('Initializing...');
  const [googleLoaded, setGoogleLoaded] = useState<boolean>(false);
  const [buttonRendered, setButtonRendered] = useState<boolean>(false);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    checkGoogleAuth();
  }, []);

  const checkGoogleAuth = async () => {
    const newErrors: string[] = [];
    
    try {
      // 1. Check if Google API is loaded
      if (window.google && window.google.accounts) {
        setGoogleLoaded(true);
        setStatus('Google API loaded successfully');
      } else {
        newErrors.push('Google API not loaded');
        setStatus('Google API not available');
      }

      // 2. Check if button element exists
      const buttonElement = document.getElementById('google-signin-button');
      if (buttonElement) {
        setButtonRendered(true);
      } else {
        newErrors.push('Google sign-in button element not found');
      }

      // 3. Check for any console errors
      const originalError = console.error;
      const originalWarn = console.warn;
      const capturedErrors: string[] = [];
      
      console.error = (...args) => {
        capturedErrors.push(args.join(' '));
        originalError.apply(console, args);
      };
      
      console.warn = (...args) => {
        capturedErrors.push(args.join(' '));
        originalWarn.apply(console, args);
      };

      // Wait a bit for any errors to be captured
      setTimeout(() => {
        console.error = originalError;
        console.warn = originalWarn;
        
        if (capturedErrors.length > 0) {
          newErrors.push(...capturedErrors);
        }
        
        setErrors(newErrors);
      }, 2000);

    } catch (error: any) {
      newErrors.push(`Error checking Google Auth: ${error.message}`);
      setErrors(newErrors);
    }
  };

  const testGoogleInitialization = () => {
    try {
      if (!window.google) {
        setStatus('❌ Google API not loaded');
        return;
      }

      // Test Google initialization
      window.google.accounts.id.initialize({
        client_id: '214476576993-b4l6n3d4kgkjfe56tradth5dg0osts8h.apps.googleusercontent.com',
        callback: (response: any) => {
          console.log('Google callback received:', response);
          setStatus('✅ Google callback working');
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      setStatus('✅ Google initialization successful');
    } catch (error: any) {
      setStatus(`❌ Google initialization failed: ${error.message}`);
    }
  };

  const testButtonRendering = () => {
    try {
      const buttonElement = document.getElementById('google-signin-button');
      if (!buttonElement) {
        setStatus('❌ Button element not found');
        return;
      }

      window.google.accounts.id.renderButton(buttonElement, {
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
        width: 400,
        type: 'standard',
      });

      setStatus('✅ Button rendering attempted');
    } catch (error: any) {
      setStatus(`❌ Button rendering failed: ${error.message}`);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">🔍 Google Auth Debug</h3>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Google API:</strong> {googleLoaded ? '✅ Loaded' : '❌ Not loaded'}
          </div>
          <div>
            <strong>Button Element:</strong> {buttonRendered ? '✅ Found' : '❌ Not found'}
          </div>
        </div>

        <div className="space-y-2">
          <Button 
            onClick={testGoogleInitialization} 
            variant="outline"
            size="sm"
            className="w-full"
          >
            Test Google Initialization
          </Button>
          <Button 
            onClick={testButtonRendering} 
            variant="outline"
            size="sm"
            className="w-full"
          >
            Test Button Rendering
          </Button>
          <Button 
            onClick={checkGoogleAuth} 
            variant="outline"
            size="sm"
            className="w-full"
          >
            Refresh Status
          </Button>
        </div>

        <div className="text-sm">
          <strong>Status:</strong> {status}
        </div>

        {errors.length > 0 && (
          <div className="text-sm">
            <strong>Errors:</strong>
            <ul className="list-disc list-inside mt-1 text-red-600">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="text-xs text-gray-500">
          <strong>Current URL:</strong> {window.location.href}
        </div>
      </div>
    </div>
  );
};

export default TestGoogleAuth; 