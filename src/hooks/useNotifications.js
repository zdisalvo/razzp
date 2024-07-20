import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "../firebase/firebase";
import useAuthStore from "../store/authStore";

const useNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const authUser = useAuthStore((state) => state.user);

    useEffect(() => {
        const fetchNotifications = async () => {
            if (!authUser) return; // No user, no notifications

            const userRef = doc(firestore, "users", authUser.uid);
            const userDoc = await getDoc(userRef);

            if (userDoc.exists()) {
                const userData = userDoc.data();
                setNotifications(userData.notifications || []);
            } else {
                setNotifications([]);
            }
        };

        fetchNotifications();
    }, [authUser]);

    return notifications;
};

export default useNotifications;
