import { useState, useEffect } from "react";
import useAuthStore from "../store/authStore";
import useLikeStore from "../store/likeStore";
import useShowToast from "./useShowToast";
import { arrayRemove, arrayUnion, doc, updateDoc, increment, getDoc, setDoc } from "firebase/firestore";
import { firestore } from "../firebase/firebase";
import useGetSparkProfileById from "./useGetSparkProfileById";

const MAX_LIKES = 2;

const useLikeSpark = (sparkProfile) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const authUser = useAuthStore((state) => state.user);
  const { isLoading, sparkProfile: sparkUser } = useGetSparkProfileById(authUser?.uid);

  const [isLikedMe, setIsLikedMe] = useState(sparkProfile.likedMe.includes(authUser?.uid));
  const [sparkLikesUser, setSparkLikesUser] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const likeCount = useLikeStore((state) => state.likeCount);
  const setLikeCount = useLikeStore((state) => state.setLikeCount);
  const incrementLikeCount = useLikeStore((state) => state.incrementLikeCount);
  const decrementLikeCount = useLikeStore((state) => state.decrementLikeCount);
  const [match, setMatch] = useState(false);

  const showToast = useShowToast();

  useEffect(() => {
    if (!isLoading && sparkUser) {
      setIsLiked(sparkUser.liked.includes(sparkProfile.uid));
      setSparkLikesUser(sparkUser.likedMe.includes(sparkProfile.uid));
      setLikeCount(sparkUser.dayLikes);
    }
  }, [isLoading, sparkUser, sparkProfile.uid]);

//   useEffect(() => {
//     if (!isLoading && sparkUser) {
//       setLikeCount(sparkUser.dayLikes); // Update like count
//     }
//   }, [isLoading, sparkUser]);

  //console.log(sparkUser);

  const handleMatchUpdate = async (user, matchedWith, match) => {
    const matchDocRef = doc(firestore, "sparkMatches", user.uid); // Use userId as the document ID
  
    const matchDoc = await getDoc(matchDocRef);
  
    const matchObject = {
      matchedUserId: matchedWith.uid,
      messages: []
    };

    // console.log(matchObject);
    // console.log(matchDoc.exists());
  
    if (matchDoc.exists()) {
      // Get the current list of matches
      const data = matchDoc.data();
      const currentMatches = data.matches || [];
  
      // Check if the matchObject is already in the list of matches
      const isAlreadyMatched = currentMatches.some(match => match.matchedUserId === matchedWith.uid);
  
      if (match) {
        if (!isAlreadyMatched) {
          // Add the new match to the list if it's not already there
          await updateDoc(matchDocRef, {
            matches: arrayUnion(matchObject)
          });
        }
      } 
      // else {
      //   if (isAlreadyMatched) {
      //     // Remove the match from the list if it's already there
      //     await updateDoc(matchDocRef, {
      //       matches: arrayRemove(matchObject)
      //     });
      //   }
      // }
    } else {
      if (match) {
        // If document does not exist and we want to add a match
        await setDoc(matchDocRef, {
          matches: [matchObject]
        });
      }
    }
  };



  const handleLikeSpark = async () => {
    if (isUpdating || !sparkUser) return;
    if (!authUser) return showToast("Error", "You must be logged in to like a post", "error");

    const sparkUserRef = doc(firestore, "spark", authUser.uid);

    if (!isLiked && likeCount >= MAX_LIKES) {
        const currentTime = new Date().toISOString();
        await updateDoc(sparkUserRef, {
          likeClock: currentTime,
          dayLikes: 0,
          
        });
        setLikeCount(0);
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

      //MATCH
      //console.log(authUser);

      if (sparkLikesUser && !isLiked) {
        setMatch(true);

        await updateDoc(likeMeRef, {
            matched: arrayUnion(authUser.uid),
          });

        handleMatchUpdate(authUser, sparkProfile, true);
        
        await updateDoc(likesRef, {
            matched: arrayUnion(sparkProfile.uid),
        });

        handleMatchUpdate(sparkProfile, authUser, true);


      } else {
        setMatch(false);

        await updateDoc(likeMeRef, {
            matched: arrayRemove(authUser.uid),
          });

        handleMatchUpdate(authUser, sparkProfile, false);

        await updateDoc(likesRef, {
            matched: arrayRemove(sparkProfile.uid),
        });

        handleMatchUpdate(sparkProfile, authUser, false);
      }
      

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
          showToast("Message", "Please wait for your likes to refresh", "warning");
          return false; // Not allowed to like
        }
      }

      return true; // Allowed to like

    } catch (error) {
      console.error("Error checking like permission:", error);
      return false;
    }
  };

  return { isLikedMe, isLiked, likeCount, handleLikeSpark, canLike, isUpdating, setIsUpdating, match };
};

export default useLikeSpark;
