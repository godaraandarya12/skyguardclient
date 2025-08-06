import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Login from './components/Login';
import Signup from './pages/Signup';
import PrivateRoute from './components/PrivateRoute';
import SidePanel from './components/SidePanel';

// Page Components
import Dashboard from './components/Dashboard';
import AddUserForm from './components/AddUserForm';
import WeeklyTimerControl from './components/WeeklyTimerControl';
import RecordingHistory from './components/RecordingHistory';
import Notification from './components/Notification';
import SystemSettings from './components/SystemSettings';
import ResetPassword from './components/ResetPassword';
import ForgotPasswordPage from './components/ForgotPassword';
import LiveStream from './components/liveStream';
import DevicePage from './components/DevicePage';

// Protected layout with SidePanel
const ProtectedLayout = () => (
  <PrivateRoute>
    <div className="flex min-h-screen">
      <SidePanel />
      <div className="">
        {/* <Outlet /> */}
      </div>
    </div>
  </PrivateRoute>
);

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Protected Routes with SidePanel */}
      <Route path="/" element={<ProtectedLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<AddUserForm />} />
        <Route path="scheduler" element={<WeeklyTimerControl />} />
        <Route path="recordings" element={<RecordingHistory />} />
        <Route path="notifications" element={<Notification />} />
        <Route path="stream" element={<LiveStream />} />
        <Route path="settings" element={<SystemSettings />} />
        <Route path="devices" element={<DevicePage />} />
      </Route>

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
