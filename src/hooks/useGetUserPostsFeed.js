import { useEffect, useState } from "react";
import { collection, getDocs, query, where, orderBy, startAfter, endBefore, limit } from "firebase/firestore";
import { firestore } from "../firebase/firebase";
import useAuthStore from "../store/authStore";
import useShowToast from "./useShowToast";
import usePostStore from "../store/postStore";
import useGetUserProfileByUsername from "./useGetUserProfileByUsername";

const useGetUserPostsFeed = (username, postId) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const { posts, setPosts } = usePostStore();
  const showToast = useShowToast();
  const authUser = useAuthStore((state) => state.user);
  const { isLoading: userProfileLoading, userProfile } = useGetUserProfileByUsername(username);
  const [lastPostDoc, setLastPostDoc] = useState(null);
  const [firstPostDoc, setFirstPostDoc] = useState(null);
  

  useEffect(() => {
    const getUserPosts = async () => {
      if (!userProfile) return;
      setIsLoading(true);
      try {
        const q = query(
          collection(firestore, "posts"),
          where("createdBy", "==", userProfile.uid),
          orderBy("createdAt", "desc"),
          limit(10) // Adjust the limit as needed
        );
        const querySnapshot = await getDocs(q);
        const userPosts = [];
        querySnapshot.forEach((doc) => {
          userPosts.push({ id: doc.id, ...doc.data() });
        });
        setPosts(userPosts);
        setLastPostDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
        setFirstPostDoc(querySnapshot.docs[0]);
        setIsLoading(false);
      } catch (error) {
        showToast("Error", error.message, "error");
        setIsLoading(false);
      }
    };

    if (username && userProfile) getUserPosts();
  }, [username, showToast, setPosts, userProfile]);

  useEffect(() => {
    const handleScroll = () => {
      const bottom = Math.ceil(window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight;
      const top = window.scrollY === 0;

      if (bottom && !isFetching && lastPostDoc) {
        setIsFetching(true);
        fetchMorePosts("older");
      } else if (top && !isFetching && firstPostDoc) {
        setIsFetching(true);
        fetchMorePosts("moreRecent");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isFetching, lastPostDoc, firstPostDoc]);

  const fetchMorePosts = async (type) => {
    try {
      const q = query(
        collection(firestore, "posts"),
        where("createdBy", "==", userProfile.uid),
        orderBy("createdAt", type === "older" ? "desc" : "asc"),
        type === "older" ? startAfter(lastPostDoc) : endBefore(firstPostDoc),
        limit(10) // Adjust the limit as needed
      );
      const querySnapshot = await getDocs(q);
      const newPosts = [];
      querySnapshot.forEach((doc) => {
        newPosts.push({ id: doc.id, ...doc.data() });
      });
      setPosts((prevPosts) => (type === "older" ? [...prevPosts, ...newPosts] : [...newPosts, ...prevPosts]));
      if (type === "older") {
        setLastPostDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
      } else {
        setFirstPostDoc(querySnapshot.docs[0]);
      }
      setIsFetching(false);
    } catch (error) {
      showToast("Error", error.message, "error");
      setIsFetching(false);
    }
  };

  return { isLoading, posts};
};

export default useGetUserPostsFeed;
