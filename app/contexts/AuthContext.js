// contexts/AuthContext.jsx
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me', { 
        credentials: 'include' 
      });
      if (res.ok) {
        const { user } = await res.json();
        setUser(user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Load user on mount
  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (username, password, rememberMe = false) => {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, rememberMe }),
  });

  if (res.ok) {
    await fetchUser();

    // Get redirect from URL (e.g., /login?redirect=/orders)
    const urlParams = new URLSearchParams(window.location.search);
    const redirectTo = urlParams.get('redirect') || '/';

    // Full reload to wipe state and go to correct page
    window.location.href = redirectTo;
    return { success: true };
  }

  const data = await res.json();
  return { success: false, error: data.error || 'Login failed' };
};

  const logout = async () => {
    try {
      // Call server to clear httpOnly cookie
      await fetch('/api/auth/logout', { 
        method: 'POST', 
        credentials: 'include' 
      });
    } catch (err) {
      console.warn('Logout API failed, clearing locally');
    }

    // Clear React state
    setUser(null);

    // Full page reload to wipe navbar, sidebar, and all state
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      loading, 
      refresh: fetchUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};