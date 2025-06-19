import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    if (id === 'admin' && password === '1234') {
      navigate('/dashboard');
    } else {
      alert('Invalid ID or Password');
    }
  };

  return (
    <div className="h-screen w-screen relative">

      {/* 🔲 Fullscreen Background Image */}
      <img
        src="https://images.unsplash.com/photo-1603366615917-1fa6dad5c4f6?auto=format&fit=crop&w=1400&q=80"
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* 🟦 Optional dark overlay */}
      <div className="absolute inset-0 bg-black/40 z-10" />

      {/* 🔻 Bottom-left login box */}
      <div className="absolute bottom-10 left-10 z-20">
        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-8 w-80 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-5">Spy Login</h2>

          <input
            type="text"
            placeholder="User ID"
            value={id}
            onChange={(e) => setId(e.target.value)}
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
