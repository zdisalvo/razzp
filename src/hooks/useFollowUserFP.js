import { useState, useEffect } from 'react';
import { doc, updateDoc, arrayRemove, arrayUnion, getDoc, setDoc } from 'firebase/firestore';
import { firestore } from '../firebase/firebase';
import useAuthStore from '../store/authStore';
import useUserProfileStore from "../store/userProfileStore";


const useFollowUserFP = () => {
    const [isUpdating, setIsUpdating] = useState(false);
    const [isFollowingUser, setIsFollowingUser] = useState(false);
    const authUser = useAuthStore((state) => state.user);
    const setAuthUser = useAuthStore((state) => state.setUser);
    //const { userProfile: userProfileRef, setUserProfile } = useUserProfileStore();
    const [userIdGlobal, setUserIdGlobal] = useState("");
    //const [notification, setNotification ] = useState(null);
    //const [userId, setUserId] = useState("");

    

    const handleFollowUser = async (userProfile, userId, isFollowing, requested) => {
        if (!authUser || !userProfile || isUpdating) return;

        //setUserId(userProfile.uid);

        setIsUpdating(true);
        const currentUserRef = doc(firestore, 'users', authUser.uid);
        const userToFollowRef = doc(firestore, 'users', userId);

        

        try {
            if ((!requested || isFollowing) && userProfile && authUser) {
                // Unfollow
                await updateDoc(currentUserRef, {
                    following: arrayRemove(userId),
                });
                await updateDoc(userToFollowRef, {
                    followers: arrayRemove(authUser.uid),
                    requested: arrayRemove(authUser.uid),
                });

                //console.log("unfollow");
                // setAuthUser((prevUser) => ({
                //     ...prevUser,
                //     following: prevUser.following.filter((id) => id !== userId),
                // }));

                // Remove notification
				const userNotificationsRef = doc(firestore, "users", userId);
				const userNotificationsSnap = await getDoc(userNotificationsRef);
				const notifications = userNotificationsSnap.exists()
					? userNotificationsSnap.data().notifications || []
					: [];
                //console.log(notifications.includes);
				const updatedNotifications = notifications.filter(
					(notification) => !(notification.userId === authUser.uid && (notification.type === "follow" || notification.type == "followPrivate"))
				);
				await setDoc(userNotificationsRef, { notifications: updatedNotifications }, { merge: true });

				setAuthUser({
					...authUser,
					following: authUser.following.filter((uid) => uid !== userId),
				});
				// if (userProfile) {
				// 	setUserProfile({
				// 		...userProfile,
				// 		followers: userProfile.followers.filter((uid) => uid !== authUser.uid),
				// 	});
				// }

				localStorage.setItem(
					"user-info",
					JSON.stringify({
						...authUser,
						following: authUser.following.filter((uid) => uid !== userId),
					})
				);

                //isFollowing = !isFollowing;
                setUserIdGlobal(userId);
				setIsFollowingUser(false);

            } else if (userProfile && authUser && (!userProfile.private || userProfile.uid === authUser.uid)) {

                //console.log(userProfile.private);
                // Follow
                if (authUser.uid === userId) {
                    await updateDoc(currentUserRef, {
                        following: arrayUnion(userId),
                        followers: arrayUnion(userId),
                    });
                } else {
                    await updateDoc(currentUserRef, {
                        following: arrayUnion(userId),
                    });
                }
                await updateDoc(userToFollowRef, {
                    followers: arrayUnion(authUser.uid),
                });
                // setAuthUser((prevUser) => ({
                //     ...prevUser,
                //     following: [...prevUser.following, userId],
                // }));

                // Add notification
				const userNotificationsRef = doc(firestore, "users", userId);
                
                    const notification = {
                        userId: authUser.uid,
                        username: authUser.username,
                        profilePic: authUser.profilePicURL,
                        time: new Date().getTime(),
                        type: "follow",
                    };
                    //setNotification(notificationObj);
                
				const userNotificationsSnap = await getDoc(userNotificationsRef);
				const notifications = userNotificationsSnap.exists()
					? userNotificationsSnap.data().notifications || []
					: [];
                
                const updatedNotifications = notifications.filter(
                    (notif) => !(notif.userId === authUser.uid && notif.type === "follow")
                    );
                
				updatedNotifications.push(notification);
				await setDoc(userNotificationsRef, { updatedNotifications }, { merge: true });

				setAuthUser({
					...authUser,
					following: [...authUser.following, userId],
				});
				// if (userProfile) {
				// 	setUserProfile({
				// 		...userProfile,
				// 		followers: [...userProfile.followers, authUser.uid],
				// 	});
				// }

				localStorage.setItem(
					"user-info",
					JSON.stringify({
						...authUser,
						following: [...authUser.following, userId],
					})
				);

                //isFollowing = !isFollowing;
                setUserIdGlobal(userId);
				setIsFollowingUser(true);

            } else if (userProfile && authUser && userProfile.private) {
                const userNotificationsRef = doc(firestore, "users", userId);
                //console.log(requested);
                //console.log(authUser);
                if (requested && authUser) {
                    await updateDoc(userToFollowRef, {
                        requested: arrayUnion(authUser.uid),
                    });
                } else if (!requested && authUser) {
                    await updateDoc(userToFollowRef, {
                        requested: arrayRemove(authUser.uid),
                    });
                }

                
                    const notification = {
                        userId: authUser.uid,
                        username: authUser.username,
                        profilePic: authUser.profilePicURL,
                        time: new Date().getTime(),
                        type: "followPrivate",
                    };
                    //setNotification(notificationObj);
                
				const userNotificationsSnap = await getDoc(userNotificationsRef);
				const notifications = userNotificationsSnap.exists()
					? userNotificationsSnap.data().notifications || []
					: [];
				notifications.push(notification);
				await setDoc(userNotificationsRef, { notifications }, { merge: true });

            }
        } catch (error) {
            console.error('Error updating follow status:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    useState(() => {
		if (authUser) {
			const isFollowingUser = authUser.following.includes(userIdGlobal);
            //console.log(userIdGlobal);
			setIsFollowingUser(isFollowingUser);
		}
	}, [authUser, userIdGlobal]);

    return { isFollowingUser, handleFollowUser, isUpdating };
};

export default useFollowUserFP;
