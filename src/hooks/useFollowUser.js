import { useEffect, useState } from "react";
import useAuthStore from "../store/authStore";
import useUserProfileStore from "../store/userProfileStore";
import useShowToast from "./useShowToast";
import { firestore } from "../firebase/firebase";
import { arrayRemove, arrayUnion, doc, updateDoc, setDoc, getDoc } from "firebase/firestore";

const useFollowUser = (userId) => {
	const [isUpdating, setIsUpdating] = useState(false);
	const [isFollowing, setIsFollowing] = useState(false);
	const authUser = useAuthStore((state) => state.user);
	const setAuthUser = useAuthStore((state) => state.setUser);
	const { userProfile, setUserProfile } = useUserProfileStore();
	const showToast = useShowToast();

	const handleFollowUser = async () => {
		if (isUpdating) return;
		setIsUpdating(true);

		console.log("handleFollowUser is being used");

		try {
			const currentUserRef = doc(firestore, "users", authUser.uid);
			const userToFollowOrUnfollowRef = doc(firestore, "users", userId);

			if (isFollowing) {
				// Unfollow
				await updateDoc(currentUserRef, {
					following: arrayRemove(userId),
				});
				await updateDoc(userToFollowOrUnfollowRef, {
					followers: arrayRemove(authUser.uid),
				});

				// Remove notification
				const userNotificationsRef = doc(firestore, "users", userId);
				const userNotificationsSnap = await getDoc(userNotificationsRef);
				const notifications = userNotificationsSnap.exists()
					? userNotificationsSnap.data().notifications || []
					: [];
				const updatedNotifications = notifications.filter(
					(notification) => !(notification.userId === authUser.uid && notification.type === "follow")
				);
				await setDoc(userNotificationsRef, { notifications: updatedNotifications }, { merge: true });

				setAuthUser({
					...authUser,
					following: authUser.following.filter((uid) => uid !== userId),
				});
				if (userProfile) {
					setUserProfile({
						...userProfile,
						followers: userProfile.followers.filter((uid) => uid !== authUser.uid),
					});
				}

				localStorage.setItem(
					"user-info",
					JSON.stringify({
						...authUser,
						following: authUser.following.filter((uid) => uid !== userId),
					})
				);
				setIsFollowing(false);
				
			} else {
				// Follow
				await updateDoc(currentUserRef, {
					following: arrayUnion(userId),
				});
				await updateDoc(userToFollowOrUnfollowRef, {
					followers: arrayUnion(authUser.uid),
				});

				// Add notification
				const userNotificationsRef = doc(firestore, "users", userId);
				const notification = {
					userId: authUser.uid,
					username: authUser.username,
					profilePic: authUser.profilePicURL,
					time: new Date().getTime(),
					type: "follow",
				};
				const userNotificationsSnap = await getDoc(userNotificationsRef);
				const notifications = userNotificationsSnap.exists()
					? userNotificationsSnap.data().notifications || []
					: [];
				notifications.push(notification);
				await setDoc(userNotificationsRef, { notifications }, { merge: true });

				setAuthUser({
					...authUser,
					following: [...authUser.following, userId],
				});
				if (userProfile) {
					setUserProfile({
						...userProfile,
						followers: [...userProfile.followers, authUser.uid],
					});
				}

				localStorage.setItem(
					"user-info",
					JSON.stringify({
						...authUser,
						following: [...authUser.following, userId],
					})
				);
				setIsFollowing(true);
			}
		} catch (error) {
			showToast("Error", error.message, "error");
		} finally {
			setIsUpdating(false);
		}
	};

	useState(() => {
		if (authUser) {
			
			const isCurrentlyFollowing = authUser.following.includes(userId);
			//console.log(isCurrentlyFollowing);
			setIsFollowing(isCurrentlyFollowing);
		}
	}, [authUser, userId]);

	return { isUpdating, isFollowing, handleFollowUser };
};

export default useFollowUser;
