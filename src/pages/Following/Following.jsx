import React, { useState, useEffect } from 'react';
import { Avatar, Button, Flex, Text, VStack, Container, IconButton, Heading, Spinner } from '@chakra-ui/react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretLeft } from "@fortawesome/free-solid-svg-icons";
import { doc, getDoc, updateDoc, arrayRemove } from 'firebase/firestore';
import { firestore } from '../../firebase/firebase';
import useAuthStore from '../../store/authStore';
import useFollowUserFP from '../../hooks/useFollowUserFP';
import { useNavigate, useParams, Link } from 'react-router-dom';
import useGetUserProfileByUsername from '../../hooks/useGetUserProfileByUsername';

const FollowingPage = () => {
    const [following, setFollowing] = useState([]);
    const [userProfiles, setUserProfiles] = useState({});
    const [followStates, setFollowStates] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const authUser = useAuthStore((state) => state.user);
    const { handleFollowUser } = useFollowUserFP();
    const navigate = useNavigate();
    const { username } = useParams();

    const { userProfile, isLoading: profileLoading, error: profileError } = useGetUserProfileByUsername(username);

    const handleGoBack = () => {
        navigate(-1);
    };

    // Function to validate and filter out invalid following users
    const validateFollowing = async (followingIds) => {
        const validFollowing = [];
        const profiles = {};
        const followState = {};

        for (const followingId of followingIds) {
            try {
                const followingRef = doc(firestore, 'users', followingId);
                const followingDoc = await getDoc(followingRef);

                if (followingDoc.exists()) {
                    profiles[followingId] = followingDoc.data();
                    followState[followingId] = authUser.following.includes(followingId);
                    validFollowing.push(followingId);
                } else {
                    console.log("test");
                    // Remove non-existent user from authUser's following list
                    const userRef = doc(firestore, 'users', userProfile.uid);
                    await updateDoc(userRef, {
                        following: arrayRemove(followingId)
                    });
                }
            } catch (error) {
                console.error('Error fetching following user data:', error);
                setError('Failed to validate following users');
            }
        }

        setUserProfiles(profiles);
        setFollowStates(followState);
        return validFollowing;
    };

    useEffect(() => {
        const fetchFollowing = async () => {
            if (authUser && userProfile) {
                try {
                    const userRef = doc(firestore, 'users', authUser.uid);
                    const userDoc = await getDoc(userRef);
                    if (userDoc.exists()) {
                        const followingIds = userDoc.data().following || [];
                        const validFollowing = await validateFollowing(followingIds.reverse());
                        setFollowing(validFollowing);
                    }
                } catch (error) {
                    console.error('Error fetching following users:', error);
                    setError('Failed to fetch following users');
                }
            }
        };

        if (!profileLoading && userProfile) {
            fetchFollowing();
        }
    }, [authUser, userProfile, profileLoading]);

    useEffect(() => {
        const fetchUserProfiles = async () => {
            if (following.length > 0) {
                try {
                    const profiles = {};
                    const followState = {};
                    
                    for (const followingId of following) {
                        const followingRef = doc(firestore, 'users', followingId);
                        const followingDoc = await getDoc(followingRef);
                        if (followingDoc.exists()) {
                            profiles[followingId] = followingDoc.data();
                            followState[followingId] = authUser.following.includes(followingId);
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
    }, [following, authUser]);

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
            <Container py={6} px={0} w={['100vw', null, '80vh']}>
                <Spinner size="xl" />
                <Text>Loading...</Text>
            </Container>
        );
    }

    if (error || profileError) {
        return (
            <Container py={6} px={0} w={['100vw', null, '80vh']}>
                <Text color="red.500">Error loading data</Text>
            </Container>
        );
    }

    return (
        <Container py={6} px={0} w={['100vw', null, '80vh']}>
            <Flex align="center" mb={4}>
                <IconButton
                    icon={<FontAwesomeIcon fontSize={32} icon={faCaretLeft} />}
                    aria-label="Go back"
                    variant="ghost"
                    onClick={handleGoBack}
                    color="#eb7734"
                    ml={5}
                    mr={4}
                />
                <Heading as="h1" size="lg">Following</Heading>
            </Flex>
            <VStack spacing={4} align="stretch" p={4}>
                {following.map((userId) => {
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
                                <Link onClick={() => handleAvatarClick(userId)}>
                                    <Text fontWeight="bold">{profile?.username}</Text>
                                    <Text fontSize="sm">{profile?.fullName}</Text>
                                </Link>
                            </VStack>
                            <Button
                                ml="auto"
                                onClick={() => handleFollowClick(userId)}
                                bg={"#eb7734"}
                                color={"white"}
                                textShadow="2px 2px 4px rgba(0, 0, 0, 0.5)"
                                _hover={{ bg: "#c75e1f" }}
                                size={{ base: "sm", md: "sm" }}
                            >
                                {isFollowing ? 'Unfollow' : 'Follow'}
                            </Button>
                        </Flex>
                    );
                })}
            </VStack>
        </Container>
    );
};

export default FollowingPage;
