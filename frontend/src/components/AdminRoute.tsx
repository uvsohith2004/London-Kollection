import { Navigate } from "react-router-dom";
import useAuthStore from "@/store/authStore";

export default function AdminRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (user?.role !== "admin") {
    return <Navigate to="/" />;
  }

  return children;
}