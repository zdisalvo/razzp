import { useState } from "react";
import useShowToast from "./useShowToast";
import useAuthStore from "../store/authStore";
import { arrayUnion, doc, updateDoc, getDoc } from "firebase/firestore";
import { firestore } from "../firebase/firebase";
import usePostStore from "../store/postStore";
import { v4 as uuidv4 } from "uuid"; // Import uuid

const usePostComment = () => {
	const [isCommenting, setIsCommenting] = useState(false);
	const showToast = useShowToast();
	const authUser = useAuthStore((state) => state.user);
	const addComment = usePostStore((state) => state.addComment);

	const handlePostComment = async (postId, comment) => {
		if (isCommenting) return;
		if (!authUser) return showToast("Error", "You must be logged in to comment", "error");
		setIsCommenting(true);

		const newComment = {
			id: uuidv4(), // Generate a unique comment ID
			comment,
			createdAt: Date.now(),
			createdBy: authUser.uid,
			postId,
			likes: 0, // Initialize likes as a number
		};

		try {
			// Fetch the post document
			const postRef = doc(firestore, "posts", postId);
			const postDoc = await getDoc(postRef);

			if (!postDoc.exists()) {
				showToast("Error", "Post does not exist", "error");
				return;
			}

			const postData = postDoc.data();

			// Create notification object
			const notification = {
				postOwner: postData.createdBy,
				commentUser: authUser.uid,
				time: new Date(),
				postId,
				commentId: newComment.id,
				type: "comment",
			};

			// Update the post document with the new comment
			await updateDoc(postRef, {
				comments: arrayUnion(newComment),
			});

			// Notify the post owner
			const postOwnerRef = doc(firestore, "users", postData.createdBy);
			await updateDoc(postOwnerRef, {
				notifications: arrayUnion(notification),
			});

			// Notify the comment owner (if different from post owner)
			if (postData.createdBy !== authUser.uid) {
				const commentOwnerRef = doc(firestore, "users", authUser.uid);
				await updateDoc(commentOwnerRef, {
					notifications: arrayUnion(notification),
				});
			}

			// Update local state or context
			addComment(postId, newComment);
		} catch (error) {
			showToast("Error", error.message, "error");
		} finally {
			setIsCommenting(false);
		}
	};

	return { isCommenting, handlePostComment };
};

export default usePostComment;
