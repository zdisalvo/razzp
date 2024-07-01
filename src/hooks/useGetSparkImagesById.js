import { useEffect, useState } from "react";
import useShowToast from "./useShowToast";
import { collection, query, where, getDocs } from "firebase/firestore";
import { firestore } from "../firebase/firebase";

const useGetSparkImagesById = (userId) => {
  const [isLoading, setIsLoading] = useState(true);
  const [sparkImages, setSparkImages] = useState([]);

  const showToast = useShowToast();

  useEffect(() => {
    const getSparkImages = async () => {
      setIsLoading(true);
      try {
        const picsCollection = collection(firestore, "pics");
        const q = query(picsCollection, where("createdBy", "==", userId));
        const querySnapshot = await getDocs(q);

        const pics = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setSparkImages(pics);
      } catch (error) {
        showToast("Error", error.message, "error");
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      getSparkImages();
    } else {
      setSparkImages([]);
      setIsLoading(false);
    }
  }, [userId, showToast]);

  return { isLoading, sparkImages };
};

export default useGetSparkImagesById;
