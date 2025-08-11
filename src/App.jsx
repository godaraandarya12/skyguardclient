import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';

import Login from './components/Login';
import Signup from './pages/Signup';
import PrivateRoute from './components/PrivateRoute';

// Page Components
import Dashboard from './components/Dashboard';
import AddUserForm from './components/AddUserForm';
import WeeklyTimerControl from './components/WeeklyTimerControl';
import RecordingHistory from './components/RecordingHistory';
import Notification from './components/Notification';
import SystemSettings from './components/SystemSettings';
import ResetPassword from './components/ResetPassword';
import ForgotPasswordPage from './components/ForgotPassword';
import LiveStream from './components/LiveStream';
import DevicePage from './components/DevicePage';
import Sidebar from './components/SidePanel/Sidebar';
import { useEffect, useState } from 'react';
import UsersPage from './pages/UsersPage';

const ProtectedLayout = () => {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkScreen = () => setIsDesktop(window.innerWidth >= 768);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  return (
    <PrivateRoute>
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <Sidebar />

        {/* Main content */}
        <div
          className={`flex-1 h-screen overflow-auto transition-all duration-300 ${
            isDesktop ? "ml-80" : "ml-0"
          }`}
        >
          <Outlet />
        </div>
      </div>
    </PrivateRoute>
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Protected Routes */}
        <Route path="/" element={<ProtectedLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<AddUserForm />} />
          <Route path="users/all" element={<UsersPage />} />
          
          <Route path="scheduler" element={<WeeklyTimerControl />} />
          <Route path="recordings" element={<RecordingHistory />} />
          <Route path="notifications" element={<Notification />} />
          <Route path="stream" element={<LiveStream />} />
          <Route path="settings" element={<SystemSettings />} />
          <Route path="devices" element={<DevicePage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Provider>
  );
}
