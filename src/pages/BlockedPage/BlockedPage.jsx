import React from 'react';
import { Avatar, Button, Flex, Text, VStack, Container, Box, IconButton, Heading } from '@chakra-ui/react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretLeft } from "@fortawesome/free-solid-svg-icons";
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../../firebase/firebase';
import useAuthStore from '../../store/authStore';
import { useBlockUser, useUnblockUser } from '../../hooks/useBlockUser'; // Import your hooks
//import useBlockedUsers from '../../hooks/useBlockedUsers'; // Custom hook for fetching blocked users
import { useNavigate, useParams, Link } from 'react-router-dom';

const BlockedPage = () => {
    const { username } = useParams();
    //const { blocked, userProfiles } = useBlockedUsers(username);
    const [blockStates, setBlockStates] = React.useState({});
    const authUser = useAuthStore((state) => state.user);
    const { blockUser } = useBlockUser();
    const { unblockUser } = useUnblockUser();
    const navigate = useNavigate();

    const handleGoBack = () => {
        navigate(-1); // Navigate to the previous page
    };

    React.useEffect(() => {
        const blockState = {};
        for (const userId of blocked) {
            blockState[userId] = authUser.blocked.includes(userId);
        }
        setBlockStates(blockState);
    }, [blocked, authUser]);

    const handleBlockClick = async (userId) => {
        const isCurrentlyBlocked = blockStates[userId];

        // Optimistically update the state
        setBlockStates(prevStates => ({
            ...prevStates,
            [userId]: !isCurrentlyBlocked
        }));

        try {
            if (isCurrentlyBlocked) {
                await unblockUser(userId);
            } else {
                await blockUser(userId);
            }
        } catch (error) {
            console.error('Error updating block status:', error);
            // Rollback optimistic update in case of error
            setBlockStates(prevStates => ({
                ...prevStates,
                [userId]: isCurrentlyBlocked
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
                <Heading as="h1" size="lg">Blocked Users</Heading>
            </Flex>
            <VStack spacing={4} align="stretch" p={4}>
                {blocked.map((userId) => {
                    const profile = userProfiles[userId];
                    const isBlocked = blockStates[userId];
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
                                onClick={() => handleBlockClick(userId)}
                                bg={"#eb7734"}
                                color={"white"}
                                textShadow="2px 2px 4px rgba(0, 0, 0, 0.5)"
                                _hover={{ bg: "#c75e1f" }}
                                size={{ base: "sm", md: "sm" }}
                            >
                                {isBlocked ? 'Unblock' : 'Block'}
                            </Button>
                        </Flex>
                    );
                })}
            </VStack>
        </Container>
    );
};

export default BlockedPage;
