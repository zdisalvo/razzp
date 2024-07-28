import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "../firebase/firebase";
import useAuthStore from "../store/authStore";

const useNewNotificationsCount = () => {
    const [newNotificationsCount, setNewNotificationsCount] = useState(0);
    const authUser = useAuthStore((state) => state.user);

    useEffect(() => {
        const fetchNotifications = async () => {
            if (!authUser || !authUser.uid) return;

            try {
                const userRef = doc(firestore, "users", authUser.uid);
                const userDoc = await getDoc(userRef);

                if (!userDoc.exists()) return;

                const userData = userDoc.data();
                const checkedNotifications = userData.checkedNotifications || 0;
                const notifications = userData.notifications || [];

                const newCount = notifications.filter(notification => {
                    const notificationTime = notification.time;
                    return notificationTime > checkedNotifications;
                }).length;

                setNewNotificationsCount(newCount);
            } catch (error) {
                console.error("Error fetching notifications:", error);
            }
        };

        fetchNotifications();
    }, [authUser]);

    //console.log(newNotificationsCount);

    return newNotificationsCount;
};

export default useNewNotificationsCount;
