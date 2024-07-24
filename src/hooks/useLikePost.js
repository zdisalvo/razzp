import { useState } from "react";
import useAuthStore from "../store/authStore";
import useShowToast from "./useShowToast";
import { arrayRemove, arrayUnion, doc, updateDoc, increment, setDoc, getDoc } from "firebase/firestore";
import { firestore } from "../firebase/firebase";

const useLikePost = (post) => {
    const [isUpdating, setIsUpdating] = useState(false);
    const authUser = useAuthStore((state) => state.user);
    const [likes, setLikes] = useState(post.likes.length);
    const [isLiked, setIsLiked] = useState(post.likes.includes(authUser?.uid));
    const showToast = useShowToast();

    const calculateOffset = (post) => {
        const postTime = new Date(post.createdAt);
        const currentTime = new Date();
        const elapsedTimeInDays = (currentTime - postTime) / (1000 * 60 * 60 * 24);
        //console.log(post.score / (elapsedTimeInDays + 1));
        return elapsedTimeInDays + 1;
    };

    const offset = useState(calculateOffset(post));

    //console.log(offset[0]);

    const handleLikePost = async () => {
        if (isUpdating) return;
        if (!authUser) return showToast("Error", "You must be logged in to like a post", "error");
        setIsUpdating(true);

        try {
            const postRef = doc(firestore, "posts", post.id);
            await updateDoc(postRef, {
                likes: isLiked ? arrayRemove(authUser.uid) : arrayUnion(authUser.uid),
                score: isLiked ? increment(-offset[0]) : increment(offset[0 ]),
            });

            const postOwnerId = post.createdBy; // The user who owns the post
            const userNotificationsRef = doc(firestore, "users", postOwnerId);
            const notification = {
                userId: authUser.uid, // The user who liked the post
				username: authUser.username,
				profilePic: authUser.profilePicURL,
                time: new Date(),
                postId: post.id,
				postImageURL: post.imageURL,
                type: "like"
            };

            try {
                const userNotificationsSnap = await getDoc(userNotificationsRef);

                if (!isLiked) {
                    // Add notification
                    if (userNotificationsSnap.exists()) {
                        // Document exists, update it
                        await setDoc(userNotificationsRef, {
                            notifications: arrayUnion(notification)
                        }, { merge: true });
                    } else {
                        // Document does not exist, create it with the notification
                        await setDoc(userNotificationsRef, {
                            notifications: [notification]
                        });
                    }
                } else {
                    // Remove notification
                    if (userNotificationsSnap.exists()) {
                        const userNotificationsData = userNotificationsSnap.data().notifications || [];
                        const updatedNotifications = userNotificationsData.filter(
                            (notif) => !(notif.userId === authUser.uid && notif.postId === post.id && notif.type === "like")
                        );
                        await setDoc(userNotificationsRef, {
                            notifications: updatedNotifications
                        }, { merge: true });
                    }
                }
            } catch (error) {
                showToast("Error", "Unable to check or update notifications", "error");
            }

            setIsLiked(!isLiked);
            setLikes(prevLikes => isLiked ? prevLikes - 1 : prevLikes + 1);
        } catch (error) {
            showToast("Error", error.message, "error");
        } finally {
            setIsUpdating(false);
        }
    };

    return { isLiked, likes, handleLikePost, isUpdating };
};

export default useLikePost;
