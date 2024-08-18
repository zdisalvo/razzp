import React, { useState, useEffect, useCallback } from 'react';
import { Avatar, Button, Flex, Text, VStack, Container, Box, IconButton, Heading, Spinner } from '@chakra-ui/react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretLeft } from "@fortawesome/free-solid-svg-icons";
import { doc, getDoc, updateDoc, arrayRemove } from 'firebase/firestore';
import { firestore } from '../../firebase/firebase';
import useAuthStore from '../../store/authStore';
import useFollowUserFP from '../../hooks/useFollowUserFP';
import { useNavigate, useParams, Link } from 'react-router-dom'; 
import useGetUserProfileByUsername from '../../hooks/useGetUserProfileByUsername';
import FollowButton from '../Following/FollowButton';
import useRemoveFollower from '../../hooks/useRemoveFollower';
import LoadingPage from '../../components/Loading/LoadingPage';

const FollowersPage = () => {
    const [followers, setFollowers] = useState([]);
    const [userProfiles, setUserProfiles] = useState({});
    const [followStates, setFollowStates] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const authUser = useAuthStore((state) => state.user);
    const { handleFollowUser } = useFollowUserFP();
    const [authChecked, setAuthChecked] = useState(false);
    const navigate = useNavigate(); 
    const { username } = useParams(); 
    const { removeFollower, isRemoving } = useRemoveFollower();

    const { userProfile, isLoading: profileLoading, error: profileError } = useGetUserProfileByUsername(username);

    const handleGoBack = () => {
        navigate(`/${username}`);
    };

    useEffect(() => {
        setAuthChecked(true);
        //console.log(!authUser || !(authUser.uid === userProfile.uid));
    
        if ((userProfile?.private && !userProfile.followers.includes(authUser?.uid) && !(authUser.uid === userProfile.uid)) || !authUser ) {
            navigate(`/${username}`);
        }
    }, [authUser, userProfile, navigate, username]);

    const validateFollowers = async (followerIds) => {
        const validFollowers = [];
        const profiles = {};
        const followState = {};

        for (const followerId of followerIds) {
            try {
                const followerRef = doc(firestore, 'users', followerId);
                const followerDoc = await getDoc(followerRef);

                if (followerDoc.exists()) {
                    profiles[followerId] = followerDoc.data();
                    followState[followerId] = authUser.following.includes(followerId);
                    validFollowers.push(followerId);
                } else {
                    const userRef = doc(firestore, 'users', userProfile.uid);
                    await updateDoc(userRef, {
                        followers: arrayRemove(followerId)
                    });
                }
            } catch (error) {
                console.error('Error fetching follower data:', error);
                setError('Failed to validate followers');
            }
        }

        setUserProfiles(profiles);
        setFollowStates(followState);
        return validFollowers;
    };

    const fetchFollowers = useCallback(async () => {
        if (authUser && userProfile) {
            try {
                const userRef = doc(firestore, 'users', userProfile.uid);
                const userDoc = await getDoc(userRef);
                if (userDoc.exists()) {
                    const followerIds = userDoc.data().followers || [];
                    const validFollowers = await validateFollowers(followerIds.reverse());
                    setFollowers(validFollowers);
                }
            } catch (error) {
                console.error('Error fetching followers:', error);
                setError('Failed to fetch followers');
            } finally {
                setLoading(false);
            }
        }
    }, [authUser, userProfile]);

    useEffect(() => {
        if (!profileLoading && userProfile) {
            fetchFollowers();
        }
    }, [authUser, userProfile, profileLoading, fetchFollowers]);

    const handleFollowClick = async (userId) => {
        const isCurrentlyFollowing = followStates[userId];
        
        setFollowStates(prevStates => ({
            ...prevStates,
            [userId]: !isCurrentlyFollowing
        }));
        
        try {
            await handleFollowUser(userId, isCurrentlyFollowing);
        } catch (error) {
            console.error('Error updating follow status:', error);
            setFollowStates(prevStates => ({
                ...prevStates,
                [userId]: isCurrentlyFollowing
            }));
        }
    };

    const handleRemoveFollower = async (followerId) => {
        await removeFollower(followerId);
        setFollowers(followers.filter((follower) => follower !== followerId));
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
            <Flex flexDir='column' h='100vh' alignItems='center' justifyContent='center'>
			{/* <Spinner size='xl' /> */}
            <LoadingPage />
		    </Flex>
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
                                <Link onClick={() => handleAvatarClick(userId)}>
                                    <Text fontWeight="bold">{profile?.username}</Text>
                                    <Text fontSize="sm">{profile?.fullName}</Text>
                                </Link>
                            </VStack>
                            <Flex ml="auto" gap={2}>
                            <FollowButton
                                userProfile={profile}
                                isFollowing={isFollowing}
                                requested={authUser && profile.requested && profile.requested.includes(authUser.uid)}
                            />
                            {authUser && (authUser.uid === userProfile.uid) && (
                                <Button
                                    ml="auto"
                                    onClick={() => handleRemoveFollower(userId)}
                                    bg={"red.400"}
                                    color={"white"}
                                    textShadow="2px 2px 4px rgba(0, 0, 0, 0.5)"
                                    _hover={{ bg: "#c75e1f" }}
                                    size={{ base: "sm", md: "sm" }}
                                >
                                    Remove
                                </Button>
                            )}
                            
                            </Flex>
                        </Flex>
                    );
                })}
            </VStack>
        </Container>
    );
};

export default FollowersPage;
