import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getStoredAuth } from "@/lib/auth";

interface RequireAuthProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

const RequireAuth = ({ children, requireAdmin = false }: RequireAuthProps) => {
  const location = useLocation();
  const auth = getStoredAuth();

  if (!auth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && auth.role !== "admin") {
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
};

export default RequireAuth;
