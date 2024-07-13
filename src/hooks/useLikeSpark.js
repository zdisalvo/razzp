import { useState, useEffect } from "react";
import useAuthStore from "../store/authStore";
import useLikeStore from "../store/likeStore";
import useShowToast from "./useShowToast";
import { arrayRemove, arrayUnion, doc, updateDoc, increment } from "firebase/firestore";
import { firestore } from "../firebase/firebase";
import useGetSparkProfileById from "./useGetSparkProfileById";

const MAX_LIKES = 2;

const useLikeSpark = (sparkProfile) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const authUser = useAuthStore((state) => state.user);
  const { isLoading, sparkProfile: sparkUser } = useGetSparkProfileById(authUser?.uid);

  const [isLikedMe, setIsLikedMe] = useState(sparkProfile.likedMe.includes(authUser?.uid));
  const [isLiked, setIsLiked] = useState(false);
  const likeCount = useLikeStore((state) => state.likeCount);
  const setLikeCount = useLikeStore((state) => state.setLikeCount);
  const incrementLikeCount = useLikeStore((state) => state.incrementLikeCount);
  const decrementLikeCount = useLikeStore((state) => state.decrementLikeCount);

  const showToast = useShowToast();

  useEffect(() => {
    if (!isLoading && sparkUser) {
      setIsLiked(sparkUser.liked.includes(sparkProfile.uid));
      setLikeCount(sparkUser.dayLikes);
    }
  }, [isLoading, sparkUser, sparkProfile.uid]);

//   useEffect(() => {
//     if (!isLoading && sparkUser) {
//       setLikeCount(sparkUser.dayLikes); // Update like count
//     }
//   }, [isLoading, sparkUser]);

  //console.log(sparkUser);

  const handleLikeSpark = async () => {
    if (isUpdating || !sparkUser) return;
    if (!authUser) return showToast("Error", "You must be logged in to like a post", "error");

    

    if (!isLiked && likeCount >= MAX_LIKES) {
        return showToast("Message", "You have reached your likes limit for the day", "warning");
      }

    setIsUpdating(true);
    try {
      const likeMeRef = doc(firestore, "spark", sparkProfile.uid);
      const likesRef = doc(firestore, "spark", authUser.uid);

      //const newTotalScore = isLikedMe ? (likeMeRef.totalScore || 0) - 1 : (likeMeRef.totalScore || 0) + 1;

      await updateDoc(likeMeRef, {
        likedMe: isLikedMe ? arrayRemove(authUser.uid) : arrayUnion(authUser.uid),
        totalScore: isLiked ? increment(-1) : increment(1) ,
      });

      //const likeCount = isLiked ? likesRef.dayLikes  - 1 : likesRef.dayLikes  + 1;

      await updateDoc(likesRef, {
        liked: isLiked ? arrayRemove(sparkProfile.uid) : arrayUnion(sparkProfile.uid),
        dayLikes: isLiked ? increment(-1) : increment(1) ,
      });

      setIsLikedMe(!isLikedMe);
      setIsLiked(!isLiked);
      isLiked ? decrementLikeCount() : incrementLikeCount();

      console.log(likeCount);
        console.log(isLiked);

    } catch (error) {
      showToast("Error", error.message, "error");
      console.error("Error updating likes:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return { isLikedMe, isLiked, likeCount, handleLikeSpark, isUpdating };
};

export default useLikeSpark;
