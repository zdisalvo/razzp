import { useState } from "react";
import { doc, updateDoc, getDoc, arrayRemove } from "firebase/firestore";
import { firestore } from "../firebase/firebase";
import useAuthStore from "../store/authStore";

const useRemoveFollower = () => {
  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState(null);
  const authUser = useAuthStore((state) => state.user);

  const removeFollower = async (userId) => {
    setIsRemoving(true);
    setError(null);

    if (!authUser || !authUser.uid) {
      setError("User is not authenticated");
      setIsRemoving(false);
      return;
    }

    try {
      const userDocRef = doc(firestore, "users", authUser.uid);
      const userDoc = await getDoc(userDocRef);
      const followerDocRef = doc(firestore, "users", userId);

      const notifications = userDoc.data().notifications || []; // Default to an empty array if not defined
    
          
          const updatedNotifications = notifications.filter(
            (notif) => !(notif.userId === userId && notif.type === "follow")
          );
          

      await updateDoc(userDocRef, {
        followers: arrayRemove(userId),
        notifications: updatedNotifications,
      });

      await updateDoc(followerDocRef, {
        following: arrayRemove(authUser.uid),
      });

    } catch (err) {
      console.error("Error removing follower:", err);
      setError(err.message);
    } finally {
      setIsRemoving(false);
    }
  };

  return { removeFollower, isRemoving, error };
};

export default useRemoveFollower;
