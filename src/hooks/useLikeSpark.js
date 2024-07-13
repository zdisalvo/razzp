import { useState, useEffect } from "react";
import useAuthStore from "../store/authStore";
import useLikeStore from "../store/likeStore";
import useShowToast from "./useShowToast";
import { arrayRemove, arrayUnion, doc, updateDoc, increment, getDoc } from "firebase/firestore";
import { firestore } from "../firebase/firebase";
import useGetSparkProfileById from "./useGetSparkProfileById";

const MAX_LIKES = 1;

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

    const sparkUserRef = doc(firestore, "spark", authUser.uid);

    if (!isLiked && likeCount >= MAX_LIKES && sparkUserRef.likeClock === "") {
        const currentTime = new Date().toISOString();
        await updateDoc(sparkUserRef, {
          likeClock: currentTime,
          dayLikes: 0,
        });
        return showToast("Message", "You have reached your likes limit for the day", "warning");
      } else if (!canLike()) {
        return showToast("Message", "You still need to wait for your likes to refresh", "warning");
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

    //   console.log(likeCount);
    //     console.log(isLiked);

    } catch (error) {
      showToast("Error", error.message, "error");
      console.error("Error updating likes:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const canLike = async () => {
    const sparkUserRef = doc(firestore, "spark", authUser.uid);

    try {
      const userDoc = await getDoc(sparkUserRef);

      if (!userDoc.exists()) {
        throw new Error("User not found");
      }

      const userData = userDoc.data();
      const likeClock = userData.likeClock;

      if (likeClock) {
        const currentTime = new Date();
        const likeClockTime = new Date(likeClock);
        const timeDiff = (currentTime - likeClockTime) / 1000; // Time difference in seconds

        if (timeDiff < 60) { // 60 seconds = 1 minute
          return false; // Not allowed to like
        }
      }

      await updateDoc(sparkUserRef, {
        likeClock: "",
      });

      return true; // Allowed to like

    } catch (error) {
      console.error("Error checking like permission:", error);
      return false;
    }
  };

  return { isLikedMe, isLiked, likeCount, handleLikeSpark, canLike, isUpdating, setIsUpdating };
};

export default useLikeSpark;
