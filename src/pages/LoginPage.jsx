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
    <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">{isLogin ? 'Login' : 'Register'}</h2>
      
      {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input 
            type="email" 
            required
            className="w-full p-2 border rounded"
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input 
            type="password" 
            required
            className="w-full p-2 border rounded"
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          {isLogin ? 'Log In' : 'Sign Up'}
        </button>
      </form>
      
      <button 
        onClick={() => setIsLogin(!isLogin)} 
        className="mt-4 text-sm text-blue-600 hover:underline w-full text-center"
      >
        {isLogin ? "Don't have an account? Register" : "Already have an account? Log in"}
      </button>
    </div>
  );
}