import { useState, useEffect } from "react";
import { firestore } from "../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import useAuthStore from "../store/authStore";

const useHasRequestedFollow = (userId) => {
  const authUser = useAuthStore((state) => state.user);
  const [hasRequested, setHasRequested] = useState(false);

  useEffect(() => {
    const fetchRequestedState = async () => {
      if (!authUser || !userId) return;

      try {
        const userDoc = doc(firestore, "users", userId);
        const userSnap = await getDoc(userDoc);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          setHasRequested(userData.requested?.includes(authUser.uid));
        } else {
          console.error(`User document not found for userId: ${userId}`);
        }
      } catch (error) {
        console.error(`Error fetching requested state for user ${userId}:`, error);
      }
    };

    fetchRequestedState();
  }, [authUser, userId]);

  return hasRequested;
};

export default useHasRequestedFollow;
