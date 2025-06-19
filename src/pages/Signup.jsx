import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signup, fetchRtpsOptions } from '../api/auth';

export default function Signup() {
  const [form, setForm] = useState({ name: '', id: '', password: '', rtps: '' });
  const [rtpsOptions, setRtpsOptions] = useState([]);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const getRtpsOptions = async () => {
      try {
        const res = await fetchRtpsOptions();
        setRtpsOptions(res.data || []);
      } catch (err) {
        console.error('Failed to fetch RTPS options:', err);
      }
    };
    getRtpsOptions();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!form.name) newErrors.name = 'Name is required';
    if (!form.id) newErrors.id = 'User ID is required';
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
      await signup(form);
      alert('Signup successful! Please login.');
      navigate('/login');
    } catch (err) {
      alert('Signup failed: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md border border-gray-200 animate-fade-in">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Create Account</h2>

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          className={`w-full mb-3 p-3 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
        />
        {errors.name && <p className="text-red-500 text-sm mb-2">{errors.name}</p>}

        <input
          type="text"
          name="id"
          placeholder="User ID"
          value={form.id}
          onChange={handleChange}
          className={`w-full mb-3 p-3 border ${errors.id ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
        />
        {errors.id && <p className="text-red-500 text-sm mb-2">{errors.id}</p>}

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className={`w-full mb-3 p-3 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
        />
        {errors.password && <p className="text-red-500 text-sm mb-2">{errors.password}</p>}

        <select
          name="rtps"
          value={form.rtps}
          onChange={handleChange}
          className={`w-full mb-4 p-3 border ${errors.rtps ? 'border-red-500' : 'border-gray-300'} rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
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
