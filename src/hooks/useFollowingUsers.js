import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../firebase/firebase';
import useAuthStore from '../store/authStore';

const useFollowingUsers = () => {
    const [following, setFollowing] = useState([]);
    const [userProfiles, setUserProfiles] = useState({});
    const authUser = useAuthStore((state) => state.user);

    useEffect(() => {
        const fetchFollowing = async () => {
            if (authUser) {
                const userRef = doc(firestore, 'users', authUser.uid);
                const userDoc = await getDoc(userRef);
                if (userDoc.exists()) {
                    const followingIds = userDoc.data().following || [];
                    setFollowing(followingIds.reverse()); // Reverse the order here
                }
            }
        };

        fetchFollowing();
    }, [authUser]);

    useEffect(() => {
        const fetchUserProfiles = async () => {
            const profiles = {};
            for (const followingId of following) {
                const followingRef = doc(firestore, 'users', followingId);
                const followingDoc = await getDoc(followingRef);
                if (followingDoc.exists()) {
                    profiles[followingId] = followingDoc.data();
                }
            }
            setUserProfiles(profiles);
        };

        fetchUserProfiles();
    }, [following]);

    return { following, userProfiles };
};

export default useFollowingUsers;
