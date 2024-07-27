import React from 'react';
import { Avatar, Button, Flex, Text, VStack, Container, Box, IconButton, Heading } from '@chakra-ui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretLeft } from '@fortawesome/free-solid-svg-icons';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../../firebase/firebase';
import useAuthStore from '../../store/authStore';
import useFollowUserFP from '../../hooks/useFollowUserFP';
import useFollowingUsers from '../../hooks/useFollowingUsers';
import { useNavigate, useParams, Link } from 'react-router-dom';

const FollowingPage = () => {
    const { username } = useParams();
    const { following } = useFollowingUsers(username);
    const [userProfiles, setUserProfiles] = React.useState({});
    const [followStates, setFollowStates] = React.useState({});
    const authUser = useAuthStore((state) => state.user);
    const { handleFollowUser } = useFollowUserFP();
    const navigate = useNavigate();

    const handleGoBack = () => {
        navigate(-1);
    };

    console.log(following);

    React.useEffect(() => {
        const fetchProfiles = async () => {
            const profiles = {};
            const followState = {};

            for (const userId of following) {
                try {
                    const userRef = doc(firestore, 'users', userId);
                    const userDoc = await getDoc(userRef);
                    
                    if (userDoc.exists()) {
                        const profile = userDoc.data();
                        profiles[userId] = profile;
                        followState[userId] = authUser.following.includes(userId);
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            }

            setUserProfiles(profiles);
            setFollowStates(followState);
        };

        fetchProfiles();
    }, [following, authUser]);

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
                {Object.keys(userProfiles).length === 0 ? (
                    <Text>No users to display</Text>
                ) : (
                    Object.keys(userProfiles).map(userId => {
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
                    })
                )}
            </VStack>
        </Container>
    );
};

export default FollowingPage;
