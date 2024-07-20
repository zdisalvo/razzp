import { useState } from "react";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { firestore } from "../firebase/firebase";
import useAuthStore from "../store/authStore";
import useShowToast from "./useShowToast";

const useLikeComment = () => {
    const [isLiking, setIsLiking] = useState(false);
    const authUser = useAuthStore((state) => state.user);
    const showToast = useShowToast();

    const handleLikeComment = async (postId, commentId) => {
        if (isLiking) return;
        if (!authUser) return showToast("Error", "You must be logged in to like a comment", "error");

        setIsLiking(true);

        try {
            const postRef = doc(firestore, "posts", postId);
            const postDoc = await getDoc(postRef);

            if (!postDoc.exists()) {
                throw new Error("Post does not exist");
            }

            const postData = postDoc.data();
            const comments = postData.comments || [];
            const commentIndex = comments.findIndex(comment => comment.id === commentId);

            if (commentIndex === -1) {
                throw new Error("Comment not found");
            }

            const comment = comments[commentIndex];
            // Only allow liking the comment, no unliking
            if (!comment.likedByUser) {
                const newLikesCount = comment.likes + 1;
                comments[commentIndex] = {
                    ...comment,
                    likes: newLikesCount,
                    likedByUser: true // Mark as liked by user
                };

                await updateDoc(postRef, { comments });

                // Update the user's commentLikes field
                const userRef = doc(firestore, "users", authUser.uid);
                await updateDoc(userRef, {
                    commentLikes: arrayUnion(commentId)
                });
            }
        } catch (error) {
            showToast("Error", error.message, "error");
        } finally {
            setIsLiking(false);
        }
    };

    return { handleLikeComment, isLiking };
};

export default useLikeComment;
