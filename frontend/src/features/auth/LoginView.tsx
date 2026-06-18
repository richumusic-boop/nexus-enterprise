import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Input } from '../../components/UI';
import { apiClient } from '../../api/client';
import { useAuthStore } from '../../store/authStore';

export const LoginView = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // OAuth2 format: username/password sent as form data
      const params = new URLSearchParams();
      params.append('username', email);
      params.append('password', password);

      const response = await apiClient.post('/auth/login/access-token', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const { access_token } = response.data;
      
      // Get user profile (usually another endpoint, but for now we'll mock or assume response has it)
      // For this demo, let's assume we decode the token or have a /me endpoint
      // Mocking user profile fetch for now:
      setAuth({ id: '1', email, full_name: 'Genesis User', role: 'member' }, access_token);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to sign in. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="premium-card w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-slate-400">Enter your credentials to access Nexus</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <Input 
            label="Email Address" 
            type="email" 
            placeholder="name@company.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input 
            label="Password" 
            type="password" 
            placeholder="••••••••" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer text-slate-400">
              <input type="checkbox" className="rounded border-slate-700 bg-slate-900" />
              Remember me
            </label>
            <a href="#" className="text-indigo-400 hover:text-indigo-300">Forgot password?</a>
          </div>

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Sign In
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-400">
          Don't have an account?{' '}
          <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 font-medium">Create an account</Link>
        </p>
      </div>
    </div>
  );
};
