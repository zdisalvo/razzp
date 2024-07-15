import { useEffect, useState } from "react";
import useShowToast from "./useShowToast";
import useAuthStore from "../store/authStore";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "../firebase/firebase";
import useGetSparkProfileById from "./useGetSparkProfileById";

const useGetSparkMatchesById = () => {
  const authUser = useAuthStore((state) => state.user);
  const [isLoading, setIsLoading] = useState(true);
  const [sparkMatches, setSparkMatches] = useState([]);
  const showToast = useShowToast();
  const { sparkProfile } = useGetSparkProfileById(authUser.uid);

  useEffect(() => {
    const fetchSparkMatches = async () => {
      if (!authUser || !authUser.uid) {
        setIsLoading(false);
        return;
      }

      try {
        const matchDocRef = doc(firestore, "sparkMatches", authUser.uid);
        const matchDoc = await getDoc(matchDocRef);

        if (matchDoc.exists()) {
          setSparkMatches(matchDoc.data().matches);
        } else {
          setSparkMatches([]);
        }
      } catch (error) {
        console.error("Error fetching spark matches:", error);
        showToast({
          title: "Error fetching matches",
          description: error.message,
          status: "error",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSparkMatches();
  }, [authUser, showToast]);

  return { sparkMatches, isLoading, sparkProfile };
};

export default useGetSparkMatchesById;
