import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { authAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface User {
  _id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  isVerified: boolean;
  role: string;
  createdAt: string;
  googleId?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  googleLogin: (token: string) => Promise<void>;
  googleRegister: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  updateUser: (user: User) => void;
  isAuthenticated: boolean;
  resetInactivityTimer: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const inactivityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds
  const WARNING_TIMEOUT = 13 * 60 * 1000; // 13 minutes (2 minutes before logout)

  // Function to reset the inactivity timer
  const resetInactivityTimer = () => {
    // Clear existing timeouts
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }
    
    if (user) {
      // Set warning timeout (2 minutes before logout)
      warningTimeoutRef.current = setTimeout(() => {
        showInactivityWarning();
      }, WARNING_TIMEOUT);

      // Set logout timeout
      inactivityTimeoutRef.current = setTimeout(() => {
        logout();
      }, INACTIVITY_TIMEOUT);
    }
  };

  // Function to show inactivity warning
  const showInactivityWarning = () => {
    toast({
      title: "Session Timeout Warning",
      description: "You will be logged out in 2 minutes due to inactivity. Click 'Stay Logged In' to continue your session.",
      variant: "destructive",
      action: (
        <button
          onClick={() => {
            resetInactivityTimer();
            toast({
              title: "Session Extended",
              description: "Your session has been extended. You will remain logged in.",
            });
          }}
          className="bg-white text-red-600 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100"
        >
          Stay Logged In
        </button>
      ),
    });
  };

  // Function to handle user activity
  const handleUserActivity = () => {
    if (user) {
      resetInactivityTimer();
    }
  };

  // Set up activity listeners when user is authenticated
  useEffect(() => {
    if (user) {
      // Start the inactivity timer
      resetInactivityTimer();

      // Add event listeners for user activity
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
      
      events.forEach(event => {
        document.addEventListener(event, handleUserActivity, true);
      });

      // Handle visibility change (when user switches tabs)
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible' && user) {
          resetInactivityTimer();
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);

      // Cleanup function
      return () => {
        if (inactivityTimeoutRef.current) {
          clearTimeout(inactivityTimeoutRef.current);
        }
        if (warningTimeoutRef.current) {
          clearTimeout(warningTimeoutRef.current);
        }
        
        events.forEach(event => {
          document.removeEventListener(event, handleUserActivity, true);
        });
        
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    } else {
      // Clear timeouts if user is not authenticated
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
        inactivityTimeoutRef.current = null;
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
        warningTimeoutRef.current = null;
      }
    }
  }, [user]);

  useEffect(() => {
    const initializeAuth = async () => {
      // Check if this is a fresh session (no sessionStorage flag)
      const sessionKey = 'auth_session';
      const hasSession = sessionStorage.getItem(sessionKey);
      
      if (!hasSession) {
        // Clear any existing auth data on fresh session
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (token && storedUser) {
        try {
          // Set user from localStorage first for immediate UI response
          setUser(JSON.parse(storedUser));
          
          // Then try to validate with server
          const response = await authAPI.getProfile();
          setUser(response.data.user);
          localStorage.setItem('user', JSON.stringify(response.data.user));
        } catch (error) {
          // Only clear tokens if it's a 401 error (invalid token)
          if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
          }
          // For other errors (network, server down), keep the user logged in
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Add focus event listener to refresh token when user returns to tab
  useEffect(() => {
    const handleFocus = () => {
      if (user) {
        refreshTokenIfNeeded();
        resetInactivityTimer(); // Reset timer when user returns to tab
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user]);

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password });
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      sessionStorage.setItem('auth_session', 'true');
      setUser(user);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const register = async (userData: any) => {
    try {
      const response = await authAPI.register(userData);
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      sessionStorage.setItem('auth_session', 'true');
      setUser(user);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const googleLogin = async (token: string) => {
    try {
      const response = await authAPI.googleLogin(token);
      const { token: jwtToken, user } = response.data;

      localStorage.setItem('token', jwtToken);
      localStorage.setItem('user', JSON.stringify(user));
      sessionStorage.setItem('auth_session', 'true');
      setUser(user);
    } catch (error: any) {
      let errorMessage = 'Google login failed';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  };

  const googleRegister = async (token: string) => {
    try {
      const response = await authAPI.googleRegister(token);
      const { token: jwtToken, user } = response.data;

      localStorage.setItem('token', jwtToken);
      localStorage.setItem('user', JSON.stringify(user));
      sessionStorage.setItem('auth_session', 'true');
      setUser(user);
    } catch (error: any) {
      let errorMessage = 'Google registration failed';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      // Logout error
    } finally {
      // Clear inactivity timers
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
        inactivityTimeoutRef.current = null;
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
        warningTimeoutRef.current = null;
      }
      
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('auth_session');
      setUser(null);
    }
  };

  const updateProfile = async (data: any) => {
    try {
      const response = await authAPI.updateProfile(data);
      const updatedUser = response.data.user;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Profile update failed');
    }
  };

  const updateUser = (user: User) => {
    setUser(user);
    localStorage.setItem('user', JSON.stringify(user));
  };

  // Function to check if token is expired
  const isTokenExpired = (token: string) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  };

  // Function to refresh token if needed
  const refreshTokenIfNeeded = async () => {
    const token = localStorage.getItem('token');
    if (token && isTokenExpired(token)) {
      // Token is expired, try to get a new one or logout
      try {
        const response = await authAPI.getProfile();
        // If we can still get profile, token might be auto-refreshed by server
        setUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      } catch (error) {
        // If we can't get profile, logout
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      }
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    googleLogin,
    googleRegister,
    logout,
    updateProfile,
    updateUser,
    isAuthenticated: !!user,
    resetInactivityTimer,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 