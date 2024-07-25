import { useState, useEffect } from "react";
import { firestore } from "../firebase/firebase"; // Import your Firestore instance
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import usePostStore from "../store/postStore"; // Assuming you have a post store

const calculateRankingScore = (post) => {

    const postTime = new Date(post.createdAt);
    const currentTime = new Date();
    const elapsedTimeInDays = (currentTime - postTime) / (1000 * 60 * 60 * 24);
    //console.log(post.score / (elapsedTimeInDays + 1));
    return post.score / (elapsedTimeInDays + 1);
};

const useGetTop5Posts = () => {
    const [isLoading, setIsLoading] = useState(true);
    const { posts, setPosts } = usePostStore();

    useEffect(() => {
        const fetchTop5Posts = async () => {
            try {
                const postsCollectionRef = collection(firestore, "posts");
            
                // Calculate the timestamp for 7 days ago
                const now = Date.now();
                const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
            
                // Create the Firestore query
                const postsQuery = query(
                  postsCollectionRef,
                  where("createdAt", ">=", sevenDaysAgo), // Filter by createdAt timestamp
                  orderBy("createdAt", "desc"), // Order by createdAt before ordering by score
                  orderBy("score", "desc") // Order by score in descending order
                );
            
                // Execute the query
                const querySnapshot = await getDocs(postsQuery);
            
                // Process the results
                const postsArray = [];
                querySnapshot.forEach((doc) => {
                  postsArray.push({ id: doc.id, ...doc.data() });
                });

                // Calculate the ranking score for each post
                const sortedPosts = postsArray
                    .map(post => ({
                        ...post,
                        rankingScore: calculateRankingScore(post),
                    }))
                    .sort((a, b) => b.rankingScore - a.rankingScore) // Sort by ranking score
                    .slice(0, 5); // Get only the top 5 posts

                setPosts(sortedPosts);
                setIsLoading(false);
            } catch (error) {
                console.error("Error getting top posts: ", error);
                setIsLoading(false); // Ensure loading state is turned off on error
            }
        };

        fetchTop5Posts();
    }, [setPosts]);

    return { posts, isLoading };
};

export default useGetTop5Posts;
