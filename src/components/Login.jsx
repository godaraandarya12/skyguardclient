import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Notiflix from 'notiflix';
import { useDispatch } from 'react-redux';
import { setDevice } from '../store/deviceSlice';
import Logo from '../assets/logo.png'; // Adjust the path as necessary
export default function NZLogin() {
   const dispatch = useDispatch();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [nzTime, setNzTime] = useState('');
  const [weather, setWeather] = useState({ temp: '14°', condition: 'Cloudy' });
  const [rememberMe, setRememberMe] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };
 async function fetchAndStoreDevice(deviceId) {
  try {
    const response = await fetch(`http://100.66.89.46:3000/api/DeviceRegister/${deviceId}`);
    const result = await response.json();

    if (result.status === "success" && result.data && result.data.device) {
      const device = result.data.device;

      // Store device info in both storages
      sessionStorage.setItem("DeviceIp", device.ip_address);
      localStorage.setItem("DeviceIp", device.ip_address);
      sessionStorage.setItem("rtsp_url1", device.rtsp_url1);
      localStorage.setItem("rtsp_url1", device.rtsp_url1);
      sessionStorage.setItem("rtsp_url2", device.rtsp_url2);
      localStorage.setItem("rtsp_url2", device.rtsp_url2);

      // Dispatch Redux action
      dispatch(setDevice({ id: deviceId, ip: device.ip_address }));

      console.log("Device info stored successfully.");
      return true; // indicate success
    } else {
      console.error("Invalid API response:", result);
      return false; // indicate failure
    }
  } catch (error) {
    console.error("Failed to fetch device info:", error);
    return false;
  }
}

  useEffect(() => {
    // ⏱ Update NZ time
    const timer = setInterval(() => {
      const options = {
        timeZone: 'Pacific/Auckland',
        timeZoneName: 'short',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      };
      setNzTime(new Date().toLocaleTimeString('en-NZ', options));
    }, 1000);

    // ☁️ Get weather
    axios.get('https://wttr.in/Auckland?format=j1')
      .then(response => {
        const current = response.data.current_condition[0];
        setWeather({
          temp: current.temp_C + '°',
          condition: current.weatherDesc[0].value
        });
      })
      .catch(() => {
        const fallbackTemps = ['10°', '11°', '12°', '13°', '14°', '15°'];
        const fallbackConditions = ['Cloudy', 'Overcast', 'Rainy', 'Partly Cloudy', 'Showers'];
        setWeather({
          temp: fallbackTemps[Math.floor(Math.random() * fallbackTemps.length)],
          condition: fallbackConditions[Math.floor(Math.random() * fallbackConditions.length)]
        });
      });

    // 🧠 Session Check
    const token = localStorage.getItem('nzAuthToken') || sessionStorage.getItem('nzAuthToken');
    if (token) {
      Notiflix.Loading.standard('Validating session...');
      validateToken(token);
    } else {
      setCheckingSession(false);
    }

    return () => clearInterval(timer);
  }, []);

  const validateToken = async (token) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      Notiflix.Loading.remove();
      navigate('/dashboard');
    } catch {
      localStorage.removeItem('nzAuthToken');
      sessionStorage.removeItem('nzAuthToken');
      Notiflix.Loading.remove();
      setCheckingSession(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    Notiflix.Loading.circle('Authenticating...');

    try {
      const response = await axios.post('http://100.66.89.46:3000/api/auth/login', {
        email,
        password
      });

      const { token, user } = response.data;
      delete user.password;

      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('nzAuthToken', token);
      storage.setItem('nzUser', JSON.stringify(user));
      storage.setItem('role', user.role);
      storage.setItem('email', user.email);
      storage.setItem('name', user.name);
      storage.setItem('device', user.devices[0]);

    
      debugger;
   const success = await fetchAndStoreDevice(user.devices);
if (success) {
  Notiflix.Notify.success('Welcome back, explorer 🌏');
  Notiflix.Loading.remove();
  console.log('Login successful:', user);
  navigate('/dashboard'); // only navigate if API succeeded
} else {
  Notiflix.Notify.failure('Device Not Registered.');
   Notiflix.Loading.remove();
   storage.clear();
}
      
      
    } catch (err) {
      Notiflix.Loading.remove();
      Notiflix.Notify.failure('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-500 text-sm font-medium animate-pulse">
          Validating session, please wait...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 p-4 relative overflow-hidden">
      <div className="absolute top-6 right-6 z-10 bg-white/80 backdrop-blur-sm p-3 rounded-xl shadow-sm border border-white">
        <div className="flex items-center">
          <svg className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium text-gray-700">NZ Time: {nzTime}</span>
        </div>
        <div className="flex items-center mt-1">
          <svg className="h-5 w-5 text-yellow-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <span className="text-sm text-gray-600">{weather.condition}, {weather.temp}</span>
        </div>
      </div>

      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-10 right-10 w-40 h-40 bg-green-400 rounded-full mix-blend-multiply filter blur-xl animate-float1"></div>
        <div className="absolute bottom-20 left-20 w-60 h-60 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-float2"></div>
        <div className="absolute top-1/3 left-1/4 w-32 h-32 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-float3"></div>
      </div>

    <div className="w-full max-w-md z-10">
  <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20 transition-transform transform hover:scale-105 duration-300">
    <div className="flex flex-col items-center mb-6">
      <div className="relative">
        {/* Logo Container with Gradient & Floating Animation */}
        <div className="w-20 h-20 bg-gradient-to-br rounded-2xl flex items-center justify-center shadow-xl animate-bounce-slow">
          <img 
            src={Logo} 
            alt="Logo" 
            className="h-full w-full"
          />
        </div>
        {/* Decorative Accent Dot */}
        <div className="absolute -bottom-2 -right-2 bg-yellow-400 rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
          <div className="w-2 h-2 bg-black rounded-full"></div>
        </div>
      </div>
      <h1 className="mt-4 text-3xl font-extrabold text-gray-900 text-center">
        Welcome Back
      </h1>
      <p className="text-sm text-gray-600 mt-2 text-center">
        Observe everything. Miss nothing.
      </p>
    </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center">
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white/70" />
            </div>

            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white/70" />
            </div>

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  className="mr-2"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember" className="text-sm text-gray-600">Remember me</label>
              </div>
              <button
                onClick={handleForgotPassword}
                className="text-sm text-blue-600 hover:text-blue-500 underline bg-transparent border-none p-0"
              >
                Forgot password?
              </button>
            </div>

            <button type="submit"
              className={`w-full py-3 px-4 border rounded-xl text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform hover:scale-[1.02] transition-all ${loading ? 'opacity-80' : ''}`}>
              {loading ? 'Signing in...' : 'Explore '}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200/50 text-xs text-center text-gray-500">
            By continuing, you agree to our <a href="/terms" className="text-blue-600 hover:text-blue-500">Terms</a> and <a href="/privacy" className="text-blue-600 hover:text-blue-500">Privacy Policy</a>.
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(10px) translateX(-15px); }
        }
        @keyframes float3 {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-15px) translateX(-5px); }
        }
        .animate-float1 { animation: float1 8s ease-in-out infinite; }
        .animate-float2 { animation: float2 10s ease-in-out infinite; }
        .animate-float3 { animation: float3 12s ease-in-out infinite; }
      `}</style>
    </div>
  );
}