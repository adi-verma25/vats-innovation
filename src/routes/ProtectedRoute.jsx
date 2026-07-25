import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({
  children,
  user,
  allowedRoles = [],
}) {
  const location = useLocation();

  if (!user) {
    return (
      <Navigate
        to="/"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  const userRole = user.role || user.userRole;

  if (
    allowedRoles.length > 0 &&
    userRole &&
    !allowedRoles.includes(userRole)
  ) {
    return <Navigate to="/" replace />;
  }

  return children;
}