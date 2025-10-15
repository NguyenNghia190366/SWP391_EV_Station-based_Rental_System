import React, { useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import ProfileView from "@/Components/View/ProfileView";

const ProfileContainer = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
        
        // lay user tu local storage
        useEffect(() => {
            const storedUser = localStorage.getItem("currentUser");
            const isLoggedIn = localStorage.getItem("isLoggedIn");

            if (!storedUser || isLoggedIn !== true) {
                navigate("/login");
                return;
            }

            //parse qua json
            setUser(JSON.parse(storedUser));
            setLoading(false);
        }, [navigate]);
        return <ProfileView user={user} loading={loading} />
}

export default ProfileContainer;
