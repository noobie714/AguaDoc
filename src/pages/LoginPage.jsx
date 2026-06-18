// src/pages/LoginPage.jsx
import { useState } from 'react';

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simple demo login
    setTimeout(() => {
      if (username && password) {
        onLogin();
      } else {
        alert("Please enter username and password");
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center text-4xl">💧</div>
        </div>
        
        <h1 className="text-3xl font-bold text-center text-navy mb-2">AguaDoc</h1>
        <p className="text-center text-gray-500 mb-8">Water Refilling Management System</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-1.5">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-accent outline-none"
              placeholder="admin"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-accent outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent hover:bg-accent2 text-white font-semibold py-3.5 rounded-xl transition disabled:opacity-70"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          Demo — any username + password works
        </p>
      </div>
    </div>
  );
}