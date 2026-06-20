// src/pages/RegisterPage.jsx
import { useState } from 'react';
import { apiRegister } from '../api';
import { Eye, EyeOff, User, Lock, Mail, Phone, MapPin, Users } from 'lucide-react';

// ✅ Moved OUTSIDE — defined once, never recreated
function Field({ label, icon: Icon, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex items-center border border-gray-200 rounded-xl px-3 py-2.5 gap-2 focus-within:border-[#0ea5c9]">
        <Icon size={16} className="text-gray-400 shrink-0" />
        {children}
      </div>
    </div>
  );
}

export default function RegisterPage({ onGoLogin, onLogin }) {
  const [form, setForm] = useState({
    username: '', password: '', confirmPassword: '',
    email: '', phone: '', address: '', gender: ''
  });
  const [showPass, setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError]          = useState('');
  const [loading, setLoading]      = useState(false);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!form.username || !form.password || !form.email) {
      setError('Please fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      const result = await apiRegister({
        username: form.username,
        password: form.password,
        email:    form.email,
        phone:    form.phone,
        address:  form.address,
        gender:   form.gender,
        fullName: form.username,
      });
      if (result.success) {
        onLogin(result.user);
      } else {
        setError(result.message || 'Registration failed');
      }
    } catch {
      setError('Cannot connect to server. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#e8f4fb] to-[#d0eaf7] py-10">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm px-8 py-10">

        <div className="flex flex-col items-center mb-5">
          <div className="w-14 h-14 bg-[#0ea5c9] rounded-2xl flex items-center justify-center mb-3 shadow-md">
            <span className="text-white text-2xl">💧</span>
          </div>
          <h1 className="text-xl font-bold text-[#0f172a]">AguaDoc</h1>
          <p className="text-xs text-gray-400">Smart Water Refilling System</p>
        </div>

        <h2 className="text-lg font-bold text-[#0f172a] mb-5 text-center">Register a New Account</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Field label="Username" icon={User}>
            <input type="text" value={form.username} onChange={set('username')}
              placeholder="simbajon123" className="flex-1 text-sm outline-none bg-transparent" />
          </Field>

          <Field label="Password" icon={Lock}>
            <input type={showPass ? 'text' : 'password'} value={form.password} onChange={set('password')}
              placeholder="••••••••" className="flex-1 text-sm outline-none bg-transparent" />
            <button type="button" onClick={() => setShowPass(!showPass)} className="text-gray-400">
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </Field>

          <Field label="Confirm Password" icon={Lock}>
            <input type={showConfirm ? 'text' : 'password'} value={form.confirmPassword} onChange={set('confirmPassword')}
              placeholder="••••••••" className="flex-1 text-sm outline-none bg-transparent" />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="text-gray-400">
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </Field>

          <Field label="Gmail" icon={Mail}>
            <input type="email" value={form.email} onChange={set('email')}
              placeholder="simbajonchristopher8@gmail.com" className="flex-1 text-sm outline-none bg-transparent" />
          </Field>

          <Field label="Number" icon={Phone}>
            <input type="tel" value={form.phone} onChange={set('phone')}
              placeholder="+63 090 090 090" className="flex-1 text-sm outline-none bg-transparent" />
          </Field>

          <Field label="Address" icon={MapPin}>
            <textarea value={form.address} onChange={set('address')}
              placeholder="Mandaue, Cambaro, Cebu"
              rows={2} className="flex-1 text-sm outline-none bg-transparent resize-none" />
          </Field>

          <Field label="Gender" icon={Users}>
            <select value={form.gender} onChange={set('gender')}
              className="flex-1 text-sm outline-none bg-transparent">
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </Field>

          {error && <p className="text-red-500 text-xs text-center">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full bg-[#0ea5c9] hover:bg-[#0284a8] text-white font-semibold py-3 rounded-xl transition disabled:opacity-60 text-sm mt-1">
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-4">
          Already have an account?{' '}
          <button onClick={onGoLogin} className="text-[#0ea5c9] font-medium hover:underline">
            Sign in.
          </button>
        </p>
      </div>
    </div>
  );
}