import { useState, useEffect } from "react";
import useAuthStore from "../store/authStore";
import useShowToast from "./useShowToast";
import { arrayRemove, arrayUnion, doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { firestore } from "../firebase/firebase";
import useCrownStore from "../store/crownStore";

const useCrownPost = (post) => {

    const MAX_CROWNS = 1;

	const [isUpdating, setIsUpdating] = useState(false);
	const authUser = useAuthStore((state) => state.user);
	const [crowns, setCrowns] = useState(post.crowns.length);
	const [isCrowned, setIsCrowned] = useState(post.crowns.includes(authUser?.uid));
	const showToast = useShowToast();
    const crownCount = useCrownStore((state) => state.crownCount);
    const setCrownCount = useCrownStore((state) => state.setCrownCount);
    const incrementCrownCount = useCrownStore((state) => state.incrementCrownCount);
    const decrementCrownCount = useCrownStore((state) => state.decrementCrownCount);

    const calculateOffset = (post) => {
      const postTime = new Date(post.createdAt);
      const currentTime = new Date();
      const elapsedTimeInDays = (currentTime - postTime) / (1000 * 60 * 60 * 24);
      //console.log(post.score / (elapsedTimeInDays + 1));
      return elapsedTimeInDays + 1;
  };

  const offset = useState(calculateOffset(post));
  

    useEffect(() => {
        if (authUser && !crownCount) {
            setCrownCount(authUser.dayCrowns);
        }
    }, [authUser]);

    //console.log(crownCount);

	const handleCrownPost = async () => {
		if (isUpdating) return;
		if (!authUser) return showToast("Error", "You must be logged in to crown a post", "error");
		

        const userRef = doc(firestore, "users", authUser.uid);

        if (!isCrowned && crownCount >= MAX_CROWNS) {
            const currentTime = new Date().toISOString();
            await updateDoc(userRef, {
              crownClock: currentTime,
              dayCrowns: 0,
              
            });
            setCrownCount(0);
            return showToast("Message", "You have reached your crown limit for the day", "warning");
          }

        setIsUpdating(true);

		try {
			const postRef = doc(firestore, "posts", post.id);
      const sparkRef = doc(firestore, "spark", post.createdBy);
            
			await updateDoc(postRef, {
				crowns: isCrowned ? arrayRemove(authUser.uid) : arrayUnion(authUser.uid),
        score: isCrowned ? increment(-Math.max(authUser.followers.length, 5) * offset[0]): increment(Math.max(authUser.followers.length, 5) * offset[0]),
			});

      await updateDoc(sparkRef, {
				likedMe: arrayUnion(authUser.uid),
			});

      //add likeMe only if user is not already there

      // await updateDoc(sparkRef, {
			// 	likedMe: !isCrowned && !sparkRef.likedMe.includes(authUser.uid) ? arrayUnion(authUser.uid) : arrayRemove(authUser.uid),
			// });

            await updateDoc(userRef, {
                dayCrowns: !isCrowned ? increment(1) : increment(-1),
            });

            

			setIsCrowned(!isCrowned);
            isCrowned ? decrementCrownCount() : incrementCrownCount();
			//isCrowned ? setCrowns(crowns - 1) : setCrowns(crowns + 1);
		} catch (error) {
			showToast("Error", error.message, "error");
		} finally {
			setIsUpdating(false);
		}
	};

    const canCrown = async () => {
        const userRef = doc(firestore, "users", authUser.uid);
    
        try {
          const userDoc = await getDoc(userRef);
    
          if (!userDoc.exists()) {
            throw new Error("User not found");
          }
    
          const userData = userDoc.data();
          
          const crownClock = userData.crownClock ? userData.crownClock : null;
    
          if (crownClock) {
            const currentTime = new Date();
            const crownClockTime = new Date(crownClock);
            const timeDiff = (currentTime - crownClockTime) / 1000; // Time difference in seconds

            //60 * 60 * 24
            
            let timeRemaining = 24 - timeDiff / 3600;
            timeRemaining = Math.round(timeRemaining);

    
            if (timeDiff < 60) { // 60 seconds = 1 minute // 86400 seconds = 1 day
              showToast("Message", "Please wait " + timeRemaining + " hours for your crowns to refresh", "warning");
              return false; // Not allowed to like
            }
          }
    
          return true; // Allowed to like
    
        } catch (error) {
          console.error("Error checking like permission:", error);
          return false;
        }
      };

	return { isCrowned, crowns, handleCrownPost, canCrown, isUpdating, setIsUpdating };
};

export default useCrownPost;
