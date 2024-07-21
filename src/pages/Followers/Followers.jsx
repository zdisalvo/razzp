import React, { useState, useEffect } from 'react';
import { Avatar, Button, Flex, Text, VStack, Container, Box } from '@chakra-ui/react';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../../firebase/firebase';
import useAuthStore from '../../store/authStore';
import useFollowUserFP from '../../hooks/useFollowUserFP';

const FollowersPage = () => {
    const [followers, setFollowers] = useState([]);
    const [userProfiles, setUserProfiles] = useState({});
    const authUser = useAuthStore((state) => state.user);

    useEffect(() => {
        const fetchFollowers = async () => {
            if (authUser) {
                const userRef = doc(firestore, 'users', authUser.uid);
                const userDoc = await getDoc(userRef);
                if (userDoc.exists()) {
                    setFollowers(userDoc.data().followers || []);
                }
            }
        };

        fetchFollowers();
    }, [authUser]);

    useEffect(() => {
        const fetchUserProfiles = async () => {
            const profiles = {};
            for (const followerId of followers) {
                const followerRef = doc(firestore, 'users', followerId);
                const followerDoc = await getDoc(followerRef);
                if (followerDoc.exists()) {
                    profiles[followerId] = followerDoc.data();
                }
            }
            setUserProfiles(profiles);
        };

        fetchUserProfiles();
    }, [followers]);

    return (
        <Container top={0} p={0} maxW={{ base: '100vw', md: '100vw' }} pb={{ base: '10vh', md: '60px' }} m={0}>
            <Box padding="4" maxW="3xl" mx="auto">
                <VStack spacing={4} align="stretch" p={4}>
                    {Object.keys(userProfiles).map((userId) => {
                        const profile = userProfiles[userId];
                        const { isFollowing, handleFollowUser } = useFollowUserFP(userId);

                        return (
                            <Flex key={userId} align="center" gap={4}>
                                <Avatar src={profile.profilePicURL} />
                                <VStack align="start">
                                    <Text fontWeight="bold">{profile.username}</Text>
                                    <Text fontSize="sm">{profile.fullName}</Text>
                                </VStack>
                                <Button
                                    ml="auto"
                                    onClick={handleFollowUser}
                                    colorScheme={isFollowing ? 'gray' : 'blue'}
                                    isLoading={isFollowing}
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
