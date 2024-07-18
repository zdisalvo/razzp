import { useState } from "react";
import useAuthStore from "../store/authStore";
import useShowToast from "./useShowToast";
import { arrayRemove, arrayUnion, doc, updateDoc, increment } from "firebase/firestore";
import { firestore } from "../firebase/firebase";

const useCrownPost = (post) => {
	const [isUpdating, setIsUpdating] = useState(false);
	const authUser = useAuthStore((state) => state.user);
	const [crowns, setCrowns] = useState(post.crowns.length);
	const [isCrowned, setIsCrowned] = useState(post.crowns.includes(authUser?.uid));
	const showToast = useShowToast();

	const handleCrownPost = async () => {
		if (isUpdating) return;
		if (!authUser) return showToast("Error", "You must be logged in to crown a post", "error");
		setIsUpdating(true);

		try {
			const postRef = doc(firestore, "posts", post.id);
            
			await updateDoc(postRef, {
				crowns: isCrowned ? arrayRemove(authUser.uid) : arrayUnion(authUser.uid),
                score: isCrowned ? increment(Math.max(authUser.followers.length, 1) * -5): increment((Math.max(authUser.followers.length, 1)) * 5),
			});


			setIsCrowned(!isCrowned);
			isCrowned ? setCrowns(crowns - 1) : setCrowns(crowns + 1);
		} catch (error) {
			showToast("Error", error.message, "error");
		} finally {
			setIsUpdating(false);
		}
	};

	return { isCrowned, crowns, handleCrownPost, isUpdating };
};

export default useCrownPost;
