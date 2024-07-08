import { useEffect, useState } from "react";
import usePostStore from "../store/postStore";
import useShowToast from "./useShowToast";
import useUserProfileStore from "../store/userProfileStore";
import useSparkProfileStore from "../store/sparkProfileStore";
import { collection, getDocs, query, where } from "firebase/firestore";
import { firestore } from "../firebase/firebase";

const useGetSparkProfiles = () => {
	const [isLoading, setIsLoading] = useState(true);
	const { sparkProfiles, setSparkProfiles } = useSparkProfileStore();
	const showToast = useShowToast();
	const sparkProfile = useSparkProfileStore((state) => state.userProfile);

	useEffect(() => {
		const getSparkProfiles = async () => {
			if (!sparkProfile) return;
			setIsLoading(true);
			setSparkProfiles([]);

			try {
				const allDocsQuery = query(collection(firestore, "spark"));
                
				const allDocsSnapshot = await getDocs(allDocsQuery);

				const posts = [];
				querySnapshot.forEach((doc) => {
					posts.push({ ...doc.data(), id: doc.id });
				});

				posts.sort((a, b) => b.createdAt - a.createdAt);
				setPosts(posts);
			} catch (error) {
				showToast("Error", error.message, "error");
				setPosts([]);
			} finally {
				setIsLoading(false);
			}
		};

		getPosts();
	}, [setPosts, userProfile, showToast]);

	return { isLoading, posts };
};

export default useGetUserPosts;
