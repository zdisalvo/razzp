import { useState } from "react";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
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
                likedByUser: !isLiked
            };

            await updateDoc(postRef, { comments });

            const userRef = doc(firestore, "users", authUser.uid);
            const userDoc = await getDoc(userRef);

            if (userDoc.exists()) {
                const userData = userDoc.data();
                const userCommentLikes = userData.commentLikes || [];
                const newCommentLikes = !isLiked
                    ? arrayUnion(commentId)
                    : arrayRemove(commentId);

                await updateDoc(userRef, { commentLikes: newCommentLikes });
            } else {
                // Create a new user document if it does not exist
                await updateDoc(userRef, { commentLikes: [commentId] });
            }

            // Optionally: Notify the post owner
            const postOwnerRef = doc(firestore, "users", postData.createdBy);
            const notification = {
                userId: authUser.uid,
                time: new Date(),
                postId,
                commentId,
                type: "commentLike"
            };

            await updateDoc(postOwnerRef, { notifications: arrayUnion(notification) });

        } catch (error) {
            showToast("Error", error.message, "error");
        } finally {
            setIsLiking(false);
        }
    };

    return { handleLikeComment, isLiking };
};

export default useLikeComment;
