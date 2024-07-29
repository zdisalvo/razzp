import React, { useState, useEffect } from 'react';
import { Avatar, Box, Button, Flex, VStack } from "@chakra-ui/react";
import useFollowUser from "../../hooks/useFollowUser";
import useAuthStore from "../../store/authStore";
import { Link } from "react-router-dom";
import useFollowUserFP from "../../hooks/useFollowUserFP";

const SuggestedUser = ({ user, setUser }) => {
	const { isFollowing, isUpdating } = useFollowUser(user.uid);
	const { handleFollowUser } = useFollowUserFP();
	const authUser = useAuthStore((state) => state.user);
	const [isFollowingInit, setIsFollowingInit] = useState(isFollowing);

	useEffect(() => {
        setIsFollowingInit(isFollowing);
    }, [isFollowing]);

	// const onFollowUser = async () => {
	// 	await handleFollowUser();
	// 	setUser({
	// 		...user,
	// 		followers: isFollowing
	// 			? user.followers.filter((follower) => follower.uid !== authUser.uid)
	// 			: [...user.followers, authUser],
	// 	});
	// };

	const handleFollowClick = async (userId) => {
        const isCurrentlyFollowing = isFollowingInit;
        
        // Optimistically update the state
        setIsFollowingInit(!isCurrentlyFollowing);
        
        try {
            await handleFollowUser(userId, isCurrentlyFollowing);
        } catch (error) {
            console.error('Error updating follow status:', error);
            // Rollback optimistic update in case of error
            setIsFollowingInit(isCurrentlyFollowing);
        }
    };

	return (
		<Flex justifyContent={"space-between"} alignItems={"center"} w={"full"}>
			<Flex alignItems={"center"} gap={2} ml={4}>
				<Link to={`/${user.username}`}>
					<Avatar src={user.profilePicURL} size={"md"} />
				</Link>
				<VStack spacing={2} alignItems={"flex-start"}>
				<Link to={`/${user.username}`}>
					<Flex justifyContent="center" alignItems="baseline">
						<Box fontSize={12} fontWeight={"bold"}>
							{user.username}
						</Box>
						
						{/* <Box fontSize={11} color={"gray.500"} ml={2}>
							{user.fullName}
						</Box> */}
					
					</Flex>
						<Box fontSize={11} color={"gray.500"}>
						{user.followers.length} {user.followers.length == 1 ? 'follower' : 'followers' }
						</Box>
					</Link>
					
					{/* <Box fontSize={11} color={"gray.500"}>
						{user.followers.length} followers
					</Box> */}
				</VStack>
			</Flex>
			{authUser.uid !== user.uid && (
				<Button
				ml={5}
				onClick={() => handleFollowClick(user.uid)}
				bg={"#eb7734"}
				color={"white"}
				textShadow="2px 2px 4px rgba(0, 0, 0, 0.5)"
				_hover={{ bg: "#c75e1f" }}
				size={{ base: "sm", md: "sm" }}
			>
				{isFollowingInit ? 'Unfollow' : 'Follow'}
			</Button>
			)}
		</Flex>
	);
};

export default SuggestedUser;
