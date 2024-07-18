import { useState, useEffect } from "react";
import { firestore } from "../firebase/firebase"; // Import your Firestore instance
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import usePostStore from "../store/postStore"; // Assuming you have a post store

const useGetTop5Posts = () => {
    const [isLoading, setIsLoading] = useState(true);
    const { posts, setPosts } = usePostStore();

    useEffect(() => {
        const fetchTop5Posts = async () => {
            try {
                const postsCollectionRef = collection(firestore, "posts");
                const postsQuery = query(
                    postsCollectionRef,
                    orderBy("score", "desc"),
                    limit(5)
                );
                const querySnapshot = await getDocs(postsQuery);

                const postsArray = [];
                querySnapshot.forEach((doc) => {
                    postsArray.push({ id: doc.id, ...doc.data() });
                });

                setPosts(postsArray);
                setIsLoading(false);
            } catch (error) {
                console.error("Error getting top posts: ", error);
                throw new Error("Failed to get top posts");
            }
        };

        fetchTop5Posts();
    }, [setPosts]);

    return { posts, isLoading };
};

export default useGetTop5Posts;
