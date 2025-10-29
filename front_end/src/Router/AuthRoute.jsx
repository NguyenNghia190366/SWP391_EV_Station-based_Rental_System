import { Navigate, Outlet } from "react-router-dom";

const AuthRoute = () => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    console.log(currentUser);
    
    if (currentUser) {
        return <Navigate to="/home" />;
    }
    
    return <Outlet />;
}

export default AuthRoute;