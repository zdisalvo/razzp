import { useEffect, useState, useCallback } from "react";
import useShowToast from "./useShowToast";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "../firebase/firebase";

const useGetUserProfileById = (userId) => {
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  const showToast = useShowToast();

  const getUserProfile = useCallback(async () => {
    if (!userId) return; // Skip if no valid userId
    setIsLoading(true);
    try {
      const userRef = await getDoc(doc(firestore, "users", userId));
      if (userRef.exists()) {
        const userData = userRef.data();
        // Prevent redundant state updates
        setUserProfile((prevProfile) => (prevProfile !== userData ? userData : prevProfile));
      } else {
        showToast("Error", `User profile not found for ID: ${userId}`, "error");
      }
    } catch (error) {
      showToast("Error", `Failed to fetch user profile: ${error.message}`, "error");
    } finally {
      setIsLoading(false);
    }
  }, [userId, showToast]);

  useEffect(() => {
    let isMounted = true; // Tracks if the component is mounted
    if (isMounted) getUserProfile();
    return () => {
      isMounted = false; // Prevent state updates after unmount
    };
  }, [getUserProfile]);

  return { isLoading, userProfile };
};

export default useGetUserProfileById;
