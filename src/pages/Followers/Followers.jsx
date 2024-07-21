import React, { useState, useEffect } from 'react';
import { Avatar, Button, Flex, Text, VStack, Container, Box, IconButton, Heading, Spinner } from '@chakra-ui/react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretLeft } from "@fortawesome/free-solid-svg-icons";
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../../firebase/firebase';
import useAuthStore from '../../store/authStore';
import useFollowUserFP from '../../hooks/useFollowUserFP';
import { useNavigate, useParams } from 'react-router-dom'; 
import useGetUserProfileByUsername from '../../hooks/useGetUserProfileByUsername';

const FollowersPage = () => {
    const [followers, setFollowers] = useState([]);
    const [userProfiles, setUserProfiles] = useState({});
    const [followStates, setFollowStates] = useState({});
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState(null); // Add error state

    const authUser = useAuthStore((state) => state.user);
    const { handleFollowUser } = useFollowUserFP();
    const navigate = useNavigate(); 
    const { username } = useParams(); 

    const { userProfile, isLoading: profileLoading, error: profileError } = useGetUserProfileByUsername(username);

    const handleGoBack = () => {
        navigate(-1); // Navigate to the previous page
    };

    useEffect(() => {
        const fetchFollowers = async () => {
            if (authUser && userProfile) {
                try {
                    const userRef = doc(firestore, 'users', userProfile.uid);
                    const userDoc = await getDoc(userRef);
                    if (userDoc.exists()) {
                        const followerIds = userDoc.data().followers || [];
                        setFollowers(followerIds.reverse());
                    }
                } catch (error) {
                    console.error('Error fetching followers:', error);
                    setError('Failed to fetch followers');
                }
            }
        };

        if (!profileLoading && userProfile) {
            fetchFollowers();
        }
    }, [authUser, userProfile, profileLoading]);

    useEffect(() => {
        const fetchUserProfiles = async () => {
            if (followers.length > 0) {
                try {
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
                } catch (error) {
                    console.error('Error fetching user profiles:', error);
                    setError('Failed to fetch user profiles');
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
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

    const handleAvatarClick = async (userId) => {
        try {
            const userRef = doc(firestore, 'users', userId);
            const userDoc = await getDoc(userRef);
            if (userDoc.exists()) {
                const profile = userDoc.data();
                navigate(`/${profile.username}`); 
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    if (profileLoading || loading) {
        return (
            <Container top={0} p={0} maxW={{ base: '100vw', md: '100vw' }} pb={{ base: '10vh', md: '60px' }} m={0}>
                <Box padding="4" maxW="3xl" mx="auto" textAlign="center">
                    <Spinner size="xl" />
                    <Text>Loading...</Text>
                </Box>
            </Container>
        );
    }

    if (error || profileError) {
        return (
            <Container top={0} p={0} maxW={{ base: '100vw', md: '100vw' }} pb={{ base: '10vh', md: '60px' }} m={0}>
                <Box padding="4" maxW="3xl" mx="auto" textAlign="center">
                    <Text color="red.500">Error loading data</Text>
                </Box>
            </Container>
        );
    }

    return (
        <Container top={0} p={0} maxW={{ base: '100vw', md: '100vw' }} pb={{ base: '10vh', md: '60px' }} m={0}>
            <Box padding="4" maxW="3xl" mx="auto">
                <Flex align="center" mb={4}>
                    <IconButton
                        icon={<FontAwesomeIcon fontSize={32} icon={faCaretLeft} />}
                        aria-label="Go back"
                        variant="ghost"
                        onClick={handleGoBack}
                        mr={4}
                    />
                    <Heading as="h1" size="lg">Followers</Heading>
                </Flex>
                <VStack spacing={4} align="stretch" p={4}>
                    {followers.map((userId) => {
                        const profile = userProfiles[userId];
                        const isFollowing = followStates[userId];
                        return (
                            <Flex key={userId} align="center" gap={4}>
                                <Avatar 
                                    src={profile?.profilePicURL} 
                                    alt={profile?.username || 'User'} 
                                    boxSize="40px"
                                    onClick={() => handleAvatarClick(userId)}
                                    cursor="pointer"
                                />
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
