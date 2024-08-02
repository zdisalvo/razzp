import { useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { firestore } from "../firebase/firebase"; // Adjust the import path as necessary
import useAuthStore from "../store/authStore";
import useShowToast from "./useShowToast"; // Assuming you have a custom hook for showing toast notifications

const useSetPrivateProfile = () => {
  const { authUser } = useAuthStore((state) => ({
    authUser: state.user,
  }));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const showToast = useShowToast();

  const setPrivate = async () => {
    if (!authUser) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const userDocRef = doc(firestore, "users", authUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        await updateDoc(userDocRef, { private: true });
        showToast("Success", "Profile set to private", "success");
      } else {
        throw new Error("User profile does not exist");
      }
    } catch (error) {
      console.error("Error setting profile to private: ", error);
      setError(error);
      showToast("Error", error.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return { setPrivate, isLoading, error };
};

export default useSetPrivateProfile;
