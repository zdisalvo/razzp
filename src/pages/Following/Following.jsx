import React from 'react';
import { Avatar, Button, Flex, Text, VStack, Container, Box, IconButton, Heading } from '@chakra-ui/react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretLeft } from "@fortawesome/free-solid-svg-icons";
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../../firebase/firebase';
import useAuthStore from '../../store/authStore';
import useFollowUserFP from '../../hooks/useFollowUserFP';
import useFollowingUsers from '../../hooks/useFollowingUsers';
import { useNavigate, useParams } from 'react-router-dom'; // Import useNavigate for navigation

const FollowingPage = () => {
    const { username } = useParams();
    const { following, userProfiles } = useFollowingUsers(username);
    const [followStates, setFollowStates] = React.useState({});
    const authUser = useAuthStore((state) => state.user);
    const { handleFollowUser } = useFollowUserFP();
    const navigate = useNavigate(); // Initialize navigate

    const handleGoBack = () => {
        navigate(-1); // Navigate to the previous page
    };

    React.useEffect(() => {
        const followState = {};
        for (const userId of following) {
            followState[userId] = authUser.following.includes(userId);
        }
        setFollowStates(followState);
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
                                    boxSize="40px" // Set size of Avatar
                                    onClick={() => handleAvatarClick(userId)} // Handle click event
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

export default FollowingPage;
