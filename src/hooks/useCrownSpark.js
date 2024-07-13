import { useState, useEffect } from "react";
import useAuthStore from "../store/authStore";
import useLikeStore from "../store/likeStore";
import useShowToast from "./useShowToast";
import { arrayRemove, arrayUnion, doc, updateDoc, increment } from "firebase/firestore";
import { firestore } from "../firebase/firebase";
import useGetSparkProfileById from "./useGetSparkProfileById";

const MAX_CROWNS = 2;

const useCrownSpark = (sparkProfile) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const authUser = useAuthStore((state) => state.user);
  const { isLoading, sparkProfile: sparkUser } = useGetSparkProfileById(authUser?.uid);

  const [isLikedMe, setIsLikedMe] = useState(null || sparkProfile.crownedMe.includes(authUser?.uid));
  const [isLiked, setIsLiked] = useState(false);
  const likeCount = useLikeStore((state) => state.likeCount);
  const setLikeCount = useLikeStore((state) => state.setLikeCount);
  const incrementLikeCount = useLikeStore((state) => state.incrementLikeCount);
  const decrementLikeCount = useLikeStore((state) => state.decrementLikeCount);

  const showToast = useShowToast();

  useEffect(() => {
    if (!isLoading && sparkUser) {
      setIsLiked(sparkUser.crowned.includes(sparkProfile.uid));
      setLikeCount(sparkUser.dayCrowns);
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
    if (!authUser) return showToast("Error", "You must be logged in to use Spark", "error");

    

    if (!isLiked && likeCount >= MAX_CROWNS) {
        return showToast("Message", "You have reached your crowns limit for the day", "warning");
      }

    setIsUpdating(true);
    try {
      const likeMeRef = doc(firestore, "spark", sparkProfile.uid);
      const likesRef = doc(firestore, "spark", authUser.uid);

      //const newTotalScore = isLikedMe ? (likeMeRef.totalScore || 0) - 1 : (likeMeRef.totalScore || 0) + 1;

      await updateDoc(likeMeRef, {
        crownedMe: isLikedMe ? arrayRemove(authUser.uid) : arrayUnion(authUser.uid),
        totalScore: isLiked ? increment(-5) : increment(5) ,
      });

      //const likeCount = isLiked ? likesRef.dayLikes  - 1 : likesRef.dayLikes  + 1;

      await updateDoc(likesRef, {
        crowned: isLiked ? arrayRemove(sparkProfile.uid) : arrayUnion(sparkProfile.uid),
        dayCrowns: isLiked ? increment(-1) : increment(1) ,
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

export default useCrownSpark;
