import { useState, useEffect } from "react";
import useShowToast from "./useShowToast";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "../firebase/firebase";

const useGetSparkProfileById = (userId) => {
  const [isLoading, setIsLoading] = useState(true);
  const [sparkProfile, setSparkProfile] = useState(null);
  const showToast = useShowToast();

  useEffect(() => {
    const getSparkProfile = async () => {
      if (!userId) {
        console.error("User ID is missing.");
        return;
      }

      setIsLoading(true);
      setSparkProfile(null);
      try {
        const userRef = doc(firestore, "spark", userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          setSparkProfile(userDoc.data());
          //console.log("Fetched spark profile:", userDoc.data());
        } else {
          console.warn(`No document found at path: ${userRef.path}`);
        }
      } catch (error) {
        showToast("Error", error.message, "error");
        console.error("Error fetching spark profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getSparkProfile();
  }, [userId, showToast]);

  return { isLoading, sparkProfile };
};

export default useGetSparkProfileById;
