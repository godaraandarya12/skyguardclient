import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PrivateRoute({ children }) {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(null);

  useEffect(() => {
  const token =
    localStorage.getItem('nzAuthToken') || sessionStorage.getItem('nzAuthToken');

  if (token) {
    console.log('PrivateRoute mount. Token found:', token);
    setIsAuthorized(true);
  } else {
    console.warn('PrivateRoute: No token found. Redirecting...');
    setIsAuthorized(false);
    navigate('/login', { replace: true });
  }
}, [navigate]);


  if (isAuthorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600 text-sm animate-pulse">Authorizing access...</p>
      </div>
    );
  }

  return isAuthorized ? children : null;
}
