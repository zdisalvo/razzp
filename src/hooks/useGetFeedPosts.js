import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { firestore } from "../firebase/firebase";
import useAuthStore from "../store/authStore";
import useShowToast from "./useShowToast";
import useGetTop5Posts from "./useGetTop5Posts";

const useGetFeedPosts = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [feedPosts, setFeedPosts] = useState([]);
  const authUser = useAuthStore((state) => state.user);
  const showToast = useShowToast();
  const { posts: top5Posts } = useGetTop5Posts();

  // Time ranges for filtering
  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  const threeDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

  // Utility to shuffle array
  const shuffleArray = (array) => {
    return array.sort(() => Math.random() - 0.5);
  };

  useEffect(() => {
    const getFeedPosts = async () => {
      setIsLoading(true);
      try {
        let fetchedPosts = [];

        // Query: Posts from followed users (last 3 days)
        if (authUser?.following?.length > 0) {
          const followingQuery = query(
            collection(firestore, "posts"),
            where("createdBy", "in", authUser.following),
            where("createdAt", ">=", threeDaysAgo)
          );
          const followingSnapshot = await getDocs(followingQuery);
          followingSnapshot.forEach((doc) => {
            fetchedPosts.push({ id: doc.id, ...doc.data() });
          });
        }

        // Query: Posts from all users (last 24 hours)
        const todayQuery = query(
          collection(firestore, "posts"),
          where("createdAt", ">=", oneDayAgo)
        );
        const todaySnapshot = await getDocs(todayQuery);
        todaySnapshot.forEach((doc) => {
          fetchedPosts.push({ id: doc.id, ...doc.data() });
        });

        // Merge and deduplicate posts
        const postMap = new Map();
        fetchedPosts.forEach((post) => postMap.set(post.id, post));
        if (top5Posts?.length > 0) {
          top5Posts.forEach((post) => postMap.set(post.id, post));
        }

        // Shuffle and update state
        const uniquePosts = Array.from(postMap.values());
        setFeedPosts(shuffleArray(uniquePosts));
      } catch (error) {
        showToast("Error", error.message, "error");
      } finally {
        setIsLoading(false);
      }
    };

    if (authUser) getFeedPosts();
  }, [authUser, top5Posts, showToast]);

  return { isLoading, feedPosts, setFeedPosts };
};

export default useGetFeedPosts;
