import React, { useState, useEffect, useCallback } from 'react';
import { Avatar, Button, Flex, Text, VStack, Container, IconButton, Heading, Spinner } from '@chakra-ui/react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretLeft } from "@fortawesome/free-solid-svg-icons";
import { doc, getDoc, updateDoc, arrayRemove } from 'firebase/firestore';
import { firestore } from '../../firebase/firebase';
import useAuthStore from '../../store/authStore';
import useFollowUserFP from '../../hooks/useFollowUserFP';
import { useNavigate, useParams, Link } from 'react-router-dom';
import useGetUserProfileByUsername from '../../hooks/useGetUserProfileByUsername';
import FollowButton from './FollowButton';
import LoadingPage from '../../components/Loading/LoadingPage';

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
        navigate(`/${username}`);
    };

    useEffect(() => {
        if ((userProfile?.private && !userProfile.followers.includes(authUser?.uid) && !(authUser?.uid === userProfile?.uid)) || !authUser) {
            navigate(`/${username}`);
        }
    }, [authUser, userProfile, navigate, username]);

    const validateFollowing = useCallback(async (followingIds) => {
        try {
            const validFollowing = [];
            const profiles = {};
            const followState = {};

            const promises = followingIds.map(async (followingId) => {
                const followingRef = doc(firestore, 'users', followingId);
                const followingDoc = await getDoc(followingRef);

                if (followingDoc.exists()) {
                    profiles[followingId] = followingDoc.data();
                    followState[followingId] = authUser.following.includes(followingId);
                    validFollowing.push(followingId);
                } else {
                    const userRef = doc(firestore, 'users', userProfile.uid);
                    await updateDoc(userRef, {
                        following: arrayRemove(followingId),
                    });
                }
            });

            await Promise.all(promises);

            setUserProfiles(profiles);
            setFollowStates(followState);
            return validFollowing;
        } catch (error) {
            console.error('Error validating following users:', error);
            setError('Failed to validate following users');
            return [];
        }
    }, [authUser, userProfile]);

    useEffect(() => {
        const fetchFollowing = async () => {
            if (authUser && userProfile) {
                try {
                    const userRef = doc(firestore, 'users', userProfile.uid);
                    const userDoc = await getDoc(userRef);

                    if (userDoc.exists()) {
                        const followingIds = userDoc.data().following || [];
                        const validFollowing = await validateFollowing(followingIds.reverse());
                        setFollowing(validFollowing);
                    }
                } catch (error) {
                    console.error('Error fetching following users:', error);
                    setError('Failed to fetch following users');
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };

        if (!profileLoading && userProfile) {
            fetchFollowing();
        }
    }, [authUser, userProfile, profileLoading, validateFollowing]);

    const handleFollowClick = async (userId) => {
        const isCurrentlyFollowing = followStates[userId];

        setFollowStates((prevStates) => ({
            ...prevStates,
            [userId]: !isCurrentlyFollowing,
        }));

        try {
            await handleFollowUser(userId, isCurrentlyFollowing);
        } catch (error) {
            console.error('Error updating follow status:', error);
            setFollowStates((prevStates) => ({
                ...prevStates,
                [userId]: isCurrentlyFollowing,
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
                            <FollowButton
                                userProfile={profile}
                                isFollowing={isFollowing}
                                requested={authUser && profile.requested && profile.requested.includes(authUser.uid)}
                            />
                        </Flex>
                    );
                })}
            </VStack>
        </Container>
    );
};

export default FollowingPage;
