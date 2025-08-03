import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface GoogleAuthProps {
  mode: 'login' | 'register';
  onSuccess?: () => void;
  className?: string;
}

declare global {
  interface Window {
    google: any;
  }
}

const GoogleAuth: React.FC<GoogleAuthProps> = ({ mode, onSuccess, className }) => {
  const { googleLogin, googleRegister } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Load Google Sign-In API
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    script.onload = () => {
      if (window.google) {
        try {
          window.google.accounts.id.initialize({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '214476576993-b4l6n3d4kgkjfe56tradth5dg0osts8h.apps.googleusercontent.com',
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });

                     const buttonElement = document.getElementById('google-signin-button');
          
          if (buttonElement) {
            window.google.accounts.id.renderButton(
              buttonElement,
              {
                theme: 'outline',
                size: 'large',
                text: mode === 'login' ? 'signin_with' : 'signup_with',
                shape: 'rectangular',
                width: 400,
                type: 'standard',
              }
            );
          }
        } catch (error) {
          console.error('Google initialization error:', error);
        }
      }
    };

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [mode]);

  const handleCredentialResponse = async (response: any) => {
    try {
      if (mode === 'login') {
        await googleLogin(response.credential);
      } else {
        await googleRegister(response.credential);
      }

      toast({
        title: 'Success!',
        description: mode === 'login' 
          ? 'Successfully logged in with Google' 
          : 'Successfully registered with Google',
      });

      onSuccess?.();
    } catch (error: any) {
      console.error('Google auth error:', error);
      let errorMessage = 'Google authentication failed';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast({
        title: 'Google Login Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className={className}>
      <div 
        id="google-signin-button" 
        className="flex justify-center"
        style={{ minHeight: '40px' }}
      ></div>
    </div>
  );
};

export default GoogleAuth; 