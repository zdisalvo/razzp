import React, { useState, useEffect } from 'react';
import { Avatar, Button, Flex, Text, VStack, Container, Box } from '@chakra-ui/react';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../../firebase/firebase';
import useAuthStore from '../../store/authStore';
import useFollowUserFP from '../../hooks/useFollowUserFP';

const FollowersPage = () => {
    const [followers, setFollowers] = useState([]);
    const [userProfiles, setUserProfiles] = useState({});
    const [followStates, setFollowStates] = useState({});

    const authUser = useAuthStore((state) => state.user);
    const { handleFollowUser } = useFollowUserFP();

    useEffect(() => {
        const fetchFollowers = async () => {
            if (authUser) {
                const userRef = doc(firestore, 'users', authUser.uid);
                const userDoc = await getDoc(userRef);
                if (userDoc.exists()) {
                    const followerIds = userDoc.data().followers || [];
                    setFollowers(followerIds.reverse()); // Reverse the order here
                }
            }
        };

        fetchFollowers();
    }, [authUser]);

    useEffect(() => {
        const fetchUserProfiles = async () => {
            const profiles = {};
            const followState = {};
            for (const followerId of followers) {
                const followerRef = doc(firestore, 'users', followerId);
                const followerDoc = await getDoc(followerRef);
                if (followerDoc.exists()) {
                    profiles[followerId] = followerDoc.data();
                    followState[followerId] = authUser.following.includes(followerId);
                }
            }
            setUserProfiles(profiles);
            setFollowStates(followState);
        };

        fetchUserProfiles();
    }, [followers, authUser]);

    const handleFollowClick = async (userId) => {
        const isCurrentlyFollowing = followStates[userId];
        
        // Optimistically update the state
        setFollowStates(prevStates => ({
            ...prevStates,
            [userId]: !isCurrentlyFollowing
        }));
        
        try {
            await handleFollowUser(userId, isCurrentlyFollowing);
        } catch (error) {
            console.error('Error updating follow status:', error);
            // Rollback optimistic update in case of error
            setFollowStates(prevStates => ({
                ...prevStates,
                [userId]: isCurrentlyFollowing
            }));
        }
    };

    return (
        <Container top={0} p={0} maxW={{ base: '100vw', md: '100vw' }} pb={{ base: '10vh', md: '60px' }} m={0}>
            <Box padding="4" maxW="3xl" mx="auto">
                <VStack spacing={4} align="stretch" p={4}>
                    {followers.map((userId) => {
                        const profile = userProfiles[userId];
                        const isFollowing = followStates[userId];
                        return (
                            <Flex key={userId} align="center" gap={4}>
                                <Avatar src={profile?.profilePicURL} />
                                <VStack align="start">
                                    <Text fontWeight="bold">{profile?.username}</Text>
                                    <Text fontSize="sm">{profile?.fullName}</Text>
                                </VStack>
                                <Button
                                    ml="auto"
                                    onClick={() => handleFollowClick(userId)}
                                    colorScheme={isFollowing ? 'gray' : 'blue'}
                                >
                                    {isFollowing ? 'Unfollow' : 'Follow'}
                                </Button>
                            </Flex>
                        );
                    })}
                </VStack>
            </Box>
        </Container>
    );
};

export default FollowersPage;
