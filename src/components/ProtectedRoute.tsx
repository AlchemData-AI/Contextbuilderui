import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore, hasPermission, UserRole } from '../lib/authStore';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermission?: string;
}

export function ProtectedRoute({ children, requiredPermission }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // If a specific permission is required, check it
  if (requiredPermission) {
    const hasAccess = hasPermission(
      user.role as UserRole,
      requiredPermission as any
    );
    
    if (!hasAccess) {
      // Redirect to home if user doesn't have permission
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}
