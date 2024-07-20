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
            const isLiked = comment.likedByUser || false;
            const newLikesCount = comment.likes + (isLiked ? -1 : 1);

            comments[commentIndex] = {
                ...comment,
                likes: newLikesCount,
                likedByUser: !isLiked // Update if user liked or unliked
            };

            await updateDoc(postRef, {
                comments
            });

            // Update the user's commentLikes field
            const userRef = doc(firestore, "users", authUser.uid);
            if (!isLiked) {
                await updateDoc(userRef, {
                    commentLikes: arrayUnion(commentId)
                });
            } else {
                const userDoc = await getDoc(userRef);
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    const updatedLikes = (userData.commentLikes || []).filter(id => id !== commentId);
                    await updateDoc(userRef, {
                        commentLikes: updatedLikes
                    });
                }
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
