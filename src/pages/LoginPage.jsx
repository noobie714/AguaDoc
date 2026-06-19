// src/pages/LoginPage.jsx
import { useState } from 'react';
import { apiLogin } from '../api';
import { Eye, EyeOff, User, Lock } from 'lucide-react';

export default function LoginPage({ onLogin, onGoRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass]  = useState(false);
  const [error, setError]        = useState('');
  const [loading, setLoading]    = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await apiLogin(username, password);
      if (result.success) {
        onLogin(result.user);
      } else {
        setError(result.message || 'Invalid credentials');
      }
    } catch {
      setError('Cannot connect to server. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#e8f4fb] to-[#d0eaf7]">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm px-8 py-10">

        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 bg-[#0ea5c9] rounded-2xl flex items-center justify-center mb-3 shadow-md">
            <span className="text-white text-2xl">💧</span>
          </div>
          <h1 className="text-xl font-bold text-[#0f172a]">AguaDoc</h1>
          <p className="text-xs text-gray-400">Smart Water Refilling System</p>
        </div>

        <h2 className="text-lg font-bold text-[#0f172a] mb-6 text-center">Sign In</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <div className="flex items-center border border-gray-200 rounded-xl px-3 py-2.5 gap-2 focus-within:border-[#0ea5c9]">
              <User size={16} className="text-gray-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="flex-1 text-sm outline-none bg-transparent"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="flex items-center border border-gray-200 rounded-xl px-3 py-2.5 gap-2 focus-within:border-[#0ea5c9]">
              <Lock size={16} className="text-gray-400" />
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="flex-1 text-sm outline-none bg-transparent"
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="text-gray-400">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && <p className="text-red-500 text-xs text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0ea5c9] hover:bg-[#0284a8] text-white font-semibold py-3 rounded-xl transition disabled:opacity-60 text-sm mt-2"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-5">
          Gets Started?{' '}
          <button onClick={onGoRegister} className="text-[#0ea5c9] font-medium hover:underline">
            Create Account .
          </button>
        </p>
      </div>
    </div>
  );
}