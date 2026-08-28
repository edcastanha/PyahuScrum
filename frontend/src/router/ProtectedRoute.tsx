import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isHydrated, githubLogin } = useAuth();

  if (!isHydrated) {
    return null;
  }

  if (!isAuthenticated || !githubLogin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
