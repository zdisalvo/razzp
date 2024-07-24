import { useState, useEffect } from "react";
import useAuthStore from "../store/authStore";
import useSparkCrownStore from "../store/sparkCrownStore";
import useShowToast from "./useShowToast";
import { arrayRemove, arrayUnion, doc, updateDoc, increment, getDoc, setDoc } from "firebase/firestore";
import { firestore } from "../firebase/firebase";
import useGetSparkProfileById from "./useGetSparkProfileById";

const MAX_CROWNS = 1;

const useCrownSpark = (sparkProfile) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const authUser = useAuthStore((state) => state.user);
  const { isLoading, sparkProfile: sparkUser } = useGetSparkProfileById(authUser?.uid);

  const [isLikedMe, setIsLikedMe] = useState(null || sparkProfile.crownedMe.includes(authUser?.uid) || sparkProfile.likedMe.includes(authUser?.uid));
  const [sparkLikesUser, setSparkLikesUser] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const crownCount = useSparkCrownStore((state) => state.crownCount);
  const setCrownCount = useSparkCrownStore((state) => state.setCrownCount);
  const incrementCrownCount = useSparkCrownStore((state) => state.incrementCrownCount);
  const decrementCrownCount = useSparkCrownStore((state) => state.decrementCrownCount);
  const [match, setMatch] = useState(false);

  const showToast = useShowToast();

  useEffect(() => {
    if (!isLoading && sparkUser && !crownCount) {
      setIsLiked(sparkUser.liked.includes(sparkProfile.uid) || sparkUser.crowned.includes(sparkProfile.uid));
      setSparkLikesUser(sparkUser.likedMe.includes(sparkProfile.uid) || sparkUser.crownedMe.includes(sparkProfile.uid));
      setCrownCount(sparkUser.dayCrowns);
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
    if (!authUser) return showToast("Error", "You must be logged in to use Spark", "error");

    const sparkUserRef = doc(firestore, "spark", authUser.uid);

    if (!isLiked && crownCount >= MAX_CROWNS) {
      const currentTime = new Date().toISOString();
        await updateDoc(sparkUserRef, {
          crownClock: currentTime,
          dayCrowns: 0,
          
        });
        setCrownCount(0);
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
      isLiked ? decrementCrownCount() : incrementCrownCount();

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
      const likeClock = userData.crownClock;

      if (likeClock) {
        const currentTime = new Date();
        const likeClockTime = new Date(likeClock);
        const timeDiff = (currentTime - likeClockTime) / 1000; // Time difference in seconds

        if (timeDiff < 60) { // 60 seconds = 1 minute
          showToast("Message", "Please wait for your crowns to refresh", "warning");
          return false; // Not allowed to like
        }
      }

      return true; // Allowed to like

    } catch (error) {
      console.error("Error checking like permission:", error);
      return false;
    }
  };


  return { isLikedMe, isLiked, crownCount, handleLikeSpark, canLike, isUpdating, setIsUpdating, match  };
};

export default useCrownSpark;
