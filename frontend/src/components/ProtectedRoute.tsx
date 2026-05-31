import React from 'react';
import { getAuthToken } from '../services/api';

interface ProtectedRouteProps {
  children: React.ReactNode;
  onUnauthorized: () => void;
}

export function ProtectedRoute({ children, onUnauthorized }: ProtectedRouteProps) {
  const token = getAuthToken();
  
  if (!token) {
    onUnauthorized();
    return null;
  }
  
  return <>{children}</>;
}