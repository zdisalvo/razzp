import React from 'react';
import { Avatar, Button, Flex, Text, VStack, Container, Box, IconButton, Heading } from '@chakra-ui/react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretLeft } from "@fortawesome/free-solid-svg-icons";
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../../firebase/firebase';
import useAuthStore from '../../store/authStore';
import useUnblockUser from '../../hooks/useUnblockUser';
import { useNavigate, useParams, Link } from 'react-router-dom';

const BlockPage = () => {
    const { username } = useParams();
    const authUser = useAuthStore((state) => state.user);
    const [blockedUsers, setBlockedUsers] = React.useState([]);
    const [userProfiles, setUserProfiles] = React.useState({});
    const { unblockUser } = useUnblockUser();
    const navigate = useNavigate();

    const handleGoBack = () => {
        navigate(-1);
    };

    React.useEffect(() => {
        const fetchBlockedUsers = async () => {
            if (!authUser) return;
            const userRef = doc(firestore, 'users', authUser.uid);
            const userDoc = await getDoc(userRef);
            if (userDoc.exists()) {
                const data = userDoc.data();
                setBlockedUsers(data.blocked || []);
            }
        };

        const fetchUserProfiles = async () => {
            const profiles = {};
            for (const userId of blockedUsers) {
                const userRef = doc(firestore, 'users', userId);
                const userDoc = await getDoc(userRef);
                if (userDoc.exists()) {
                    profiles[userId] = userDoc.data();
                }
            }
            setUserProfiles(profiles);
        };

        fetchBlockedUsers();
        fetchUserProfiles();
    }, [authUser, blockedUsers]);

    const handleUnblockClick = async (userId) => {
        // Optimistically update the state
        setBlockedUsers((prev) => prev.filter((id) => id !== userId));
        
        try {
            await unblockUser(userId);
        } catch (error) {
            console.error('Error unblocking user:', error);
            // Rollback optimistic update in case of error
            setBlockedUsers((prev) => [...prev, userId]);
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
                <Heading as="h1" size="lg">Blocked Users</Heading>
            </Flex>
            <VStack spacing={4} align="stretch" p={4}>
                {blockedUsers.map((userId) => {
                    const profile = userProfiles[userId];
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
                                onClick={() => handleUnblockClick(userId)}
                                bg={"#eb7734"}
                                color={"white"}
                                textShadow="2px 2px 4px rgba(0, 0, 0, 0.5)"
                                _hover={{ bg: "#c75e1f" }}
                                size={{ base: "sm", md: "sm" }}
                            >
                                Unblock
                            </Button>
                        </Flex>
                    );
                })}
            </VStack>
        </Container>
    );
};

export default BlockPage;
