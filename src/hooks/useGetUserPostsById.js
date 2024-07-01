import { useEffect, useState } from "react";
import useShowToast from "./useShowToast";
import { collection, query, where, getDocs } from "firebase/firestore";
import { firestore } from "../firebase/firebase";

const useGetUserPostsById = (userId) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userPosts, setUserPosts] = useState([]);

  const showToast = useShowToast();

  useEffect(() => {
    const getUserPosts = async () => {
      setIsLoading(true);
      try {
        const postsCollection = collection(firestore, "posts");
        const q = query(postsCollection, where("createdBy", "==", userId));
        const querySnapshot = await getDocs(q);

        const posts = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setUserPosts(posts);
      } catch (error) {
        showToast("Error", error.message, "error");
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      getUserPosts();
    } else {
      setUserPosts([]);
      setIsLoading(false);
    }
  }, [userId, showToast]);

  return { isLoading, userPosts };
};

export default useGetUserPostsById;
