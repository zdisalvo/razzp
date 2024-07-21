import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../firebase/firebase';
import useAuthStore from '../store/authStore';
import useGetUserProfileByUsername from './useGetUserProfileByUsername';

const useFollowingUsers = (username) => {
    const [following, setFollowing] = useState([]);
    const [userProfiles, setUserProfiles] = useState({});
    const [loading, setLoading] = useState(true);
    const authUser = useAuthStore((state) => state.user);
    const { userProfile, isLoading: profileLoading } = useGetUserProfileByUsername(username);

    //console.log(userProfile);
    

    useEffect(() => {
        const fetchFollowing = async () => {
            if (authUser && userProfile) {
                try {
                    // Use userProfile.uid if you're getting the profile of the user whose username was passed
                    const userRef = doc(firestore, 'users', userProfile.uid);
                    const userDoc = await getDoc(userRef);
                    if (userDoc.exists()) {
                        const followingIds = userDoc.data().following || [];
                        setFollowing(followingIds.reverse()); // Reverse the order here
                    }
                } catch (error) {
                    console.error('Error fetching following list:', error);
                }
            }
        };

        if (userProfile) {
            fetchFollowing();
        }
    }, [authUser, userProfile]);

    useEffect(() => {
        const fetchUserProfiles = async () => {
            try {
                const profiles = {};
                for (const followingId of following) {
                    const followingRef = doc(firestore, 'users', followingId);
                    const followingDoc = await getDoc(followingRef);
                    if (followingDoc.exists()) {
                        profiles[followingId] = followingDoc.data();
                    }
                }
                setUserProfiles(profiles);
            } catch (error) {
                console.error('Error fetching user profiles:', error);
            } finally {
                setLoading(false);
            }
        };

        if (following.length > 0) {
            fetchUserProfiles();
        } else {
            setLoading(false); // No users to fetch
        }
    }, [following]);

    return { following, userProfiles, loading };
};

export default useFollowingUsers;