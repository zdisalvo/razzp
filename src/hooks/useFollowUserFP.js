import { useState, useEffect } from 'react';
import { doc, updateDoc, arrayRemove, arrayUnion, getDoc } from 'firebase/firestore';
import { firestore } from '../firebase/firebase';
import useAuthStore from '../store/authStore';

const useFollowUserFP = () => {
    const [isUpdating, setIsUpdating] = useState(false);

    const authUser = useAuthStore((state) => state.user);
    const setAuthUser = useAuthStore((state) => state.setUser);

    const handleFollowUser = async (userId, isFollowing) => {
        if (!authUser || !userId || isUpdating) return;

        setIsUpdating(true);
        const currentUserRef = doc(firestore, 'users', authUser.uid);
        const userToFollowRef = doc(firestore, 'users', userId);

        try {
            if (isFollowing) {
                // Unfollow
                await updateDoc(currentUserRef, {
                    following: arrayRemove(userId),
                });
                await updateDoc(userToFollowRef, {
                    followers: arrayRemove(authUser.uid),
                });
                // setAuthUser((prevUser) => ({
                //     ...prevUser,
                //     following: prevUser.following.filter((id) => id !== userId),
                // }));
            } else {
                // Follow
                await updateDoc(currentUserRef, {
                    following: arrayUnion(userId),
                });
                await updateDoc(userToFollowRef, {
                    followers: arrayUnion(authUser.uid),
                });
                // setAuthUser((prevUser) => ({
                //     ...prevUser,
                //     following: [...prevUser.following, userId],
                // }));
            }
        } catch (error) {
            console.error('Error updating follow status:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    return { handleFollowUser, isUpdating };
};

export default useFollowUserFP;
