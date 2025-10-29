import { Navigate, Outlet } from "react-router-dom";

export const RequireAuth = ({ allowRole, children }) => {
    const currentUserString = localStorage.getItem("currentUser");
    
    if (!currentUserString) {
        return <Navigate to="/login" />;
    }
    
    const currentUser = JSON.parse(currentUserString);
    console.log("Current user:", currentUser);
    
    if (!currentUser || !currentUser.role) {
        return <Navigate to="/login" />;
    }
    
    const isAuthorized = allowRole.includes(currentUser.role);
    console.log("User role:", currentUser.role, "Is authorized:", isAuthorized);
    
    if (!isAuthorized) {
        return <Navigate to="/login" />;
    }

    // Support both nested routes (Outlet) and wrapped children
    return children || <Outlet />;
};