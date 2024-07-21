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
  

    useEffect(() => {
        if (authUser) {
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
            
			await updateDoc(postRef, {
				crowns: isCrowned ? arrayRemove(authUser.uid) : arrayUnion(authUser.uid),
                score: isCrowned ? increment(-Math.max(authUser.followers.length, 5)): increment((Math.max(authUser.followers.length, 5))),
			});

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

	return { isCrowned, crowns, handleCrownPost, canCrown, isUpdating, setIsUpdating };
};

export default useCrownPost;
