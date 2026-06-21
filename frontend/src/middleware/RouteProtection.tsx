import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

export const ProtectedRoutes = () => {
  const { user, mainLoading } = useAuth();

  if (mainLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export const PublicRoutes = () => {
  const { user, mainLoading } = useAuth();

  if (mainLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return !user ? <Outlet /> : <Navigate to="/" replace />;
};