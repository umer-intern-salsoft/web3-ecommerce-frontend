import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { fetchApi } from '../api';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const setUser = useStore((state) => state.setUser);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isLogin) {
        const user = await fetchApi('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        setUser(user);

        // Redirect based on role
        if (user.isAdmin) {
            navigate('/admin');
        } else {
            navigate('/');
        }
      } else {
        await fetchApi('/auth/register', {
          method: 'POST',
          body: JSON.stringify({ email, password })
        });
        setIsLogin(true);
        alert('Registration successful! Please log in.');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:py-24">
      <div className="surface-card p-6 sm:p-8">
      <span className="eyebrow">Welcome</span>
      <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900">{isLogin ? 'Log in to your account' : 'Create your account'}</h2>
      <p className="mb-7 mt-2 text-sm text-slate-500">Access the store and manage your crypto checkout.</p>
      
      {error && <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-bold text-slate-700">Email</label>
          <input 
            type="email" 
            required
            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-bold text-slate-700">Password</label>
          <input 
            type="password" 
            required
            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />
        </div>
        <button type="submit" className="primary-button w-full">
          {isLogin ? 'Log In' : 'Sign Up'}
        </button>
      </form>
      
      <button 
        onClick={() => setIsLogin(!isLogin)} 
        className="mt-5 w-full text-center text-sm font-bold text-violet-600 hover:text-violet-800"
      >
        {isLogin ? "Don't have an account? Register" : "Already have an account? Log in"}
      </button>
      </div>
    </div>
  );
}