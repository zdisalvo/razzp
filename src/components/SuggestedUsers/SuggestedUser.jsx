import React, { useState, useEffect } from 'react';
import { Avatar, Box, Button, Flex, VStack } from "@chakra-ui/react";
import useFollowUser from "../../hooks/useFollowUser";
import useAuthStore from "../../store/authStore";
import { Link } from "react-router-dom";
import useFollowUserFP from "../../hooks/useFollowUserFP";
import FollowButtonSuggested from "../../pages/Following/FollowButtonSuggested";

const SuggestedUser = ({ user, setUser }) => {
	//const { isFollowing, isUpdating } = useFollowUser(user.uid);
	const { handleFollowUser } = useFollowUserFP();
	const { authUser, fetchUserData } = useAuthStore((state) => ({
		authUser: state.user,
		fetchUserData: state.fetchUserData,
	  }));
	const [isFollowing, setIsFollowing] = useState(false);
	const [requested, setRequested ] = useState(false);
	const [isOptimisticUpdate, setIsOptimisticUpdate] = useState(false);

	useState(() => {
		if (user && authUser && user.requested) {
		  setRequested(user.requested.includes(authUser.uid)); // Ensure the user data is up-to-date
		}
	  }, [authUser, fetchUserData]);

	  useState(() => {
		if (user && authUser) {
		  setIsFollowing(authUser.following.includes(user.uid)); // Ensure the user data is up-to-date
		}
	  }, [authUser, fetchUserData]);

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
        setIsOptimisticUpdate(true);
        try {
            await handleFollowUser(userId, isCurrentlyFollowing);
        } catch (error) {
            console.error('Error updating follow status:', error);
            // Rollback optimistic update in case of error
            setIsFollowingInit(isCurrentlyFollowing);
        } finally {
			setIsOptimisticUpdate(false);
		}
    };

	return (
		<Flex justifyContent={"space-between"} alignItems={"center"} w={"full"} >
			<Flex alignItems={"center"} gap={2} ml={4} >
				<Link to={`/${user.username}`}>
					<Avatar src={user.profilePicURL} size={"md"} />
				</Link>
				<VStack spacing={2} alignItems={"flex-start"}>
				<Link to={`/${user.username}`}>
					<Flex justifyContent="center" alignItems="baseline">
						<Box fontSize={15} fontWeight={"bold"}>
							{user.username}
						</Box>
						
						<Box fontSize={13} color={"gray.500"} ml={2}>
							{user.fullName}
						</Box>
					
					</Flex>
						<Box fontSize={13} color={"gray.500"}>
						{user.followers.length} {user.followers.length == 1 ? 'follower' : 'followers' }
						</Box>
					</Link>
					
					{/* <Box fontSize={11} color={"gray.500"}>
						{user.followers.length} followers
					</Box> */}
				</VStack>
			</Flex>
			{authUser.uid !== user.uid && (
			// 	<Button
			// 	ml="auto"
			// 	onClick={() => handleFollowClick(user.uid)}
			// 	isDisabled={isOptimisticUpdate}
			// 	bg={"#eb7734"}
			// 	color={"white"}
			// 	textShadow="2px 2px 4px rgba(0, 0, 0, 0.5)"
			// 	_hover={{ bg: "#c75e1f" }}
			// 	size={{ base: "sm", md: "sm" }}
			// >
			// 	{isFollowingInit ? 'Unfollow' : 'Follow'}
			// </Button>
			<FollowButtonSuggested
                                userProfile={user}
                                isFollowing={isFollowing}
                                requested={authUser && user.requested && user.requested.includes(authUser.uid)}
                            />
			)}
		</Flex>
	);
};

export default SuggestedUser;
