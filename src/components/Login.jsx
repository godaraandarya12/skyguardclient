import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Please enter both email and password');
      return;
    }

    try {
      const res = await axios.post('http://localhost:3000/api/auth/login', {
        email,
        password,
      });

      // Save token in localStorage or context
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      alert('Login successful!');
      navigate('/dashboard'); // ✅ redirect on success
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="h-screen w-screen relative">
      <img
        src="https://images.unsplash.com/photo-1603366615917-1fa6dad5c4f6?auto=format&fit=crop&w=1400&q=80"
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />
      <div className="absolute inset-0 bg-black/40 z-10" />

      <div className="absolute bottom-10 left-10 z-20">
        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-8 w-80 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-5">Spy Login</h2>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mb-4 p-3 rounded-md bg-white/10 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mb-6 p-3 rounded-md bg-white/10 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-md transition duration-200"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}
