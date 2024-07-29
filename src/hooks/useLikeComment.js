import { useState } from "react";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { firestore } from "../firebase/firebase";
import useAuthStore from "../store/authStore";
import useShowToast from "./useShowToast";

const useLikeComment = () => {
    const [isLiking, setIsLiking] = useState(false);
    const authUser = useAuthStore((state) => state.user);
    const showToast = useShowToast();

    const handleLikeComment = async (postId, commentId, postImageURL) => {
        if (isLiking) return;
        if (!authUser) return showToast("Error", "You must be logged in to like a comment", "error");

        setIsLiking(true);

        console.log(commentId);

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
            //if (!comment.likedByUser) {
            if (true) {
                const newLikesCount = comment.likes + 1;
                comments[commentIndex] = {
                    ...comment,
                    likes: newLikesCount,
                    likedByUser: true // Mark as liked by user
                };

                await updateDoc(postRef, { comments });

                console.log(comment.createdBy);

                //notify the commenter of the like
                // const commenterRef = doc(firestore, "users", comment.createdBy);
                // const commenterDoc = await getDoc(commenterRef);
                await updateDoc(doc(firestore, "users", comment.createdBy), {
                    notifications: arrayUnion({
                        userId: authUser.uid,
                        username: authUser.username,
                        profilePic: authUser.profilePicURL,
                        time: new Date().getTime(),
                        postId: postId,
                        postImageURL: postImageURL,
                        comment: comment.comment,
                        commentId,
                        type: "commentLike"
                    })
                });



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
