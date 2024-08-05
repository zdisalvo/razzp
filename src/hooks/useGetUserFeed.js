import { useEffect, useState } from "react";
import usePostStore from "../store/postStore";
import useAuthStore from "../store/authStore";
import useShowToast from "./useShowToast";
import useUserProfileStore from "../store/userProfileStore";
import { collection, getDocs, query, where } from "firebase/firestore";
import { firestore } from "../firebase/firebase";
import useGetUserProfileByUsername from "./useGetUserProfileByUsername";

const useGetUserFeed = (username) => {
	const [isLoading, setIsLoading] = useState(true);
	const { posts, setPosts } = usePostStore();
	const authUser = useAuthStore((state) => state.user);
	const showToast = useShowToast();
	const { setUserProfile } = useUserProfileStore();
    const { isLoading: userProfileLoading, userProfile } = useGetUserProfileByUsername(username);

	useEffect(() => {
		const getFeedPosts = async () => {
            //if (!userProfile) return;
			setIsLoading(true);
			// if (authUser.following.length === 0) {
			// 	setIsLoading(false);
			// 	setPosts([]);
			// 	return;
			// }
			const q = query(collection(firestore, "posts"), where("createdBy", "==", userProfile.uid));
			try {
				const querySnapshot = await getDocs(q);
				const feedPosts = [];

				querySnapshot.forEach((doc) => {
					feedPosts.push({ id: doc.id, ...doc.data() });
				});

				feedPosts.sort((a, b) => b.createdAt - a.createdAt);
				setPosts(feedPosts);
			} catch (error) {
				showToast("Error", error.message, "error");
			} finally {
				setIsLoading(false);
			}
		};

		getFeedPosts();
	}, [authUser, showToast, setPosts, setUserProfile, userProfileLoading]);

	return { isLoading, posts };
};

export default useGetUserFeed;
