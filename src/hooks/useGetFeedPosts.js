import { useEffect, useState } from "react";
import usePostStore from "../store/postStore";
import useAuthStore from "../store/authStore";
import useShowToast from "./useShowToast";
import useUserProfileStore from "../store/userProfileStore";
import { collection, getDocs, query, where } from "firebase/firestore";
import { firestore } from "../firebase/firebase";
import useGetTop5Posts from "./useGetTop5Posts";

const useGetFeedPosts = () => {
	const [isLoading, setIsLoading] = useState(true);
	const { posts, setPosts } = usePostStore();
	const authUser = useAuthStore((state) => state.user);
	const showToast = useShowToast();
	const { setUserProfile } = useUserProfileStore();
	const { posts: top5Posts } = useGetTop5Posts();
	const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
	const threeDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

	const chunkArray = (array, size) => {
		const chunkedArr = [];
		for (let i = 0; i < array.length; i += size) {
		  chunkedArr.push(array.slice(i, i + size));
		}
		return chunkedArr;
	  };
	

	const shuffleArray = (array) => {
		let shuffledArray = [...array];
		for (let i = shuffledArray.length - 1; i > 0; i--) {
		  const j = Math.floor(Math.random() * (i + 1));
		  [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
		}
		return shuffledArray;
	  };

	useEffect(() => {
		const getFeedPosts = async () => {
			setIsLoading(true);
			// if (authUser.following.length === 0) {
			// 	setIsLoading(false);
			// 	setPosts([]);
			// 	return;
			// }
			//console.log(authUser.following.length);
			const q = authUser.following.length > 0 ? query(collection(firestore, "posts"), where("createdBy", "in", authUser.following), where("createdAt", ">=", threeDaysAgo)) : [];
			const r = query(collection(firestore, "posts"), where("createdAt", ">=", oneDayAgo));

			try {
				//User's followers
				
				const feedPosts = [];

				let querySnapshot;

				if (authUser.following.length > 0) {

					querySnapshot = await getDocs(q);

					//console.log(querySnapshot);

				}
				

					querySnapshot.forEach((doc) => {
						feedPosts.push({ id: doc.id, ...doc.data() });
						
						//console.log(feedPosts.length);
					});
				
				

				//Today's posts
				const queryTodaySnapshot = await getDocs(r);

				queryTodaySnapshot.forEach((doc) => {
					feedPosts.push({ id: doc.id, ...doc.data() });
					
				});

				

				//

				
					let combinedPosts = feedPosts;
					let uniquePosts = feedPosts;
				  
					if (top5Posts && top5Posts.length > 0) {
						console.log(top5Posts.length);
					  // Combine feedPosts and top5Posts
					  combinedPosts = [...feedPosts, ...top5Posts];
				
					  // Remove duplicates based on post id
					  uniquePosts = [];
					  const postIds = new Set();
					  combinedPosts.forEach(post => {
						if (!postIds.has(post.id)) {
						  postIds.add(post.id);
						  uniquePosts.push(post);
						}
					  });

					  
				
					  // Shuffle the unique posts
					  

					  //console.log(shuffledPosts.length)
				
					  // Update the feedPosts state
					  
					  
					}

					const shuffledPosts = shuffleArray(uniquePosts);
				  
					setPosts(shuffledPosts);


				//feedPosts.sort((a, b) => b.createdAt - a.createdAt);
				//setPosts(feedPosts);
			} catch (error) {
				//showToast("Error", error.message, "error");
			} finally {
				setIsLoading(false);
			}
		};

		if (authUser) getFeedPosts();
	}, [authUser, showToast, setPosts, setUserProfile]);

	return { isLoading, posts, setPosts };
};

export default useGetFeedPosts;
