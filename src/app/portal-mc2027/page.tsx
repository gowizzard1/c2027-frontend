'use client';

import { useState, useEffect } from 'react';
import AdminDashboard from '@/components/admin/AdminDashboard';

const TOKEN_KEY = 'campaign_admin_token';

export default function AdminPage() {
  const [token, setToken] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Restore token from sessionStorage on mount (survives page reload)
  useEffect(() => {
    const saved = sessionStorage.getItem(TOKEN_KEY);
    if (saved) {
      // Verify the token is still valid
      fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${saved}` },
      }).then(res => {
        if (res.ok) {
          setToken(saved);
        } else {
          sessionStorage.removeItem(TOKEN_KEY);
        }
      }).catch(() => {
        sessionStorage.removeItem(TOKEN_KEY);
      }).finally(() => {
        setIsHydrated(true);
      });
    } else {
      setIsHydrated(true);
    }
  }, []);

  // Persist token to sessionStorage whenever it changes
  const saveToken = (newToken: string) => {
    setToken(newToken);
    if (newToken) {
      sessionStorage.setItem(TOKEN_KEY, newToken);
    } else {
      sessionStorage.removeItem(TOKEN_KEY);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        saveToken(data.token);
      } else {
        setError(data.message || data.error || 'Login failed');
      }
    } catch {
      setError('Connection failed. Is the backend running?');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    saveToken('');
    setUsername('');
    setPassword('');
  };

  // Don't render until we've checked sessionStorage (prevents flash of login form)
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    );
  }

  if (token) {
    return <AdminDashboard token={token} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
          <p className="text-gray-500 text-sm mt-1">Campaign Portal Administration</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="admin-username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              id="admin-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-brand-yellow focus:border-brand-yellow outline-none"
            />
          </div>
          <div>
            <label htmlFor="admin-password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-brand-yellow focus:border-brand-yellow outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="bg-brand-black hover:bg-gray-900 text-brand-yellow font-bold w-full py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
