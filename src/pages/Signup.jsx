import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signup, fetchRtpsOptions } from '../api/auth';

export default function Signup() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    rtps: '',
  });

  const [authGate, setAuthGate] = useState({
    id: '',
    pass: '',
    unlocked: localStorage.getItem('signupUnlocked') === 'true',
  });

  const [gateError, setGateError] = useState('');
  const [rtpsOptions, setRtpsOptions] = useState([]);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const ACCESS_ID = 'admin';
  const ACCESS_PASS = 'secure123'; // ❗ Replace with env var in production

  useEffect(() => {
    if (authGate.unlocked) {
      const getRtpsOptions = async () => {
        try {
          const res = await fetchRtpsOptions();
          setRtpsOptions(res.data || []);
        } catch (err) {
          console.error('Failed to fetch RTPS options:', err);
        }
      };
      getRtpsOptions();
    }
  }, [authGate.unlocked]);

  const handleGateSubmit = () => {
    if (authGate.id === ACCESS_ID && authGate.pass === ACCESS_PASS) {
      localStorage.setItem('signupUnlocked', 'true');
      setAuthGate(prev => ({ ...prev, unlocked: true }));
    } else {
      setGateError('Invalid credentials for access.');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.name) newErrors.name = 'Name is required';
    if (!form.email) newErrors.email = 'Email is required';
    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!form.rtps) newErrors.rtps = 'Please select an RTPS';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    try {
      await signup({
        name: form.name,
        email: form.email,
        password: form.password,
        rtpsNames: [form.rtps],
      });

      alert('Signup successful! Please login.');
      navigate('/login');
    } catch (err) {
      console.error('Signup failed:', err);
      alert('Signup failed: ' + (err.response?.data?.error || err.message));
    }
  };

  // === Access Gate UI ===
  if (!authGate.unlocked) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-sm border border-gray-200">
          <h2 className="text-2xl font-bold mb-4 text-center text-gray-700">Restricted Access</h2>
          <input
            type="text"
            placeholder="Enter ID"
            value={authGate.id}
            onChange={(e) => setAuthGate({ ...authGate, id: e.target.value })}
            className="w-full mb-3 p-3 border border-gray-300 rounded-lg focus:outline-none"
          />
          <input
            type="password"
            placeholder="Enter Password"
            value={authGate.pass}
            onChange={(e) => setAuthGate({ ...authGate, pass: e.target.value })}
            className="w-full mb-3 p-3 border border-gray-300 rounded-lg focus:outline-none"
          />
          {gateError && <p className="text-red-500 text-sm mb-2">{gateError}</p>}
          <button
            onClick={handleGateSubmit}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300 font-semibold"
          >
            Unlock Signup
          </button>
        </div>
      </div>
    );
  }

  // === Main Signup UI ===
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md border border-gray-200">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Create Account</h2>

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          className={`w-full mb-3 p-3 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none`}
        />
        {errors.name && <p className="text-red-500 text-sm mb-2">{errors.name}</p>}

        <input
          type="text"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className={`w-full mb-3 p-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none`}
        />
        {errors.email && <p className="text-red-500 text-sm mb-2">{errors.email}</p>}

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className={`w-full mb-3 p-3 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none`}
        />
        {errors.password && <p className="text-red-500 text-sm mb-2">{errors.password}</p>}

        <select
          name="rtps"
          value={form.rtps}
          onChange={handleChange}
          className={`w-full mb-4 p-3 border ${errors.rtps ? 'border-red-500' : 'border-gray-300'} rounded-lg bg-white focus:outline-none`}
        >
          <option value="">Select RTPS</option>
          {rtpsOptions.map((opt) => (
            <option key={opt.id} value={opt.name}>{opt.name}</option>
          ))}
        </select>
        {errors.rtps && <p className="text-red-500 text-sm mb-2">{errors.rtps}</p>}

        <button
          onClick={handleSignup}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300 font-semibold"
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}
