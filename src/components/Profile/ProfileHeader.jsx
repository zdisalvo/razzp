import { Avatar, AvatarGroup, Button, Flex, Text, VStack, useDisclosure, Container, Box} from "@chakra-ui/react";
import useUserProfileStore from "../../store/userProfileStore";
import useAuthStore from "../../store/authStore";
import EditProfile from "./EditProfile";
import useFollowUserFP from "../../hooks/useFollowUserFP";
import { Link } from "react-router-dom";
import { useState } from "react";
import useUserLocation from '../../hooks/useUserLocation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLocationDot } from '@fortawesome/free-solid-svg-icons'; 

const ProfileHeader = ({ username, page }) => {
	const { userProfile } = useUserProfileStore();
	const authUser = useAuthStore((state) => state.user);
	const { isOpen, onOpen, onClose } = useDisclosure();
	const { isFollowing: initialIsFollowing, handleFollowUser } = useFollowUserFP();
	const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
	const [isOptimisticUpdate, setIsOptimisticUpdate] = useState(false);

	const visitingOwnProfileAndAuth = authUser && authUser.username === userProfile.username;
	const visitingAnotherProfileAndAuth = authUser && authUser.username !== userProfile.username;
	//console.log(userProfile.location);
	const locationData = userProfile.location && userProfile.location.length > 0 ? useUserLocation(userProfile.location[0], userProfile.location[1]) : { city: "", state: "", isLoading: false };
    const { city, state, isLoading } = locationData;
	//console.log(locationData);

	const handleFollowClick = async () => {
		// Optimistically update the UI
		setIsFollowing(prev => !prev);
		setIsOptimisticUpdate(true);

		try {
			await handleFollowUser(userProfile.uid, isFollowing); // Handle server request
		} catch (error) {
			// Revert optimistic update if needed
			setIsFollowing(prev => !prev);
			console.error('Error updating follow status:', error);
		} finally {
			setIsOptimisticUpdate(false);
		}
	};

	//console.log(locationData.location.city);

	return (
		<Flex gap={{ base: 4, sm: 10 }} py={1} direction={{ base: "column", sm: "row" }}>
			<Container width="30%" p={0}>
			<Flex direction="column" alignItems="flex-end">
				<Flex direction="column" alignItems="center">
			<AvatarGroup size={{ base: "xl", md: "2xl" }}  mx={1}>
				<Avatar src={userProfile.profilePicURL} alt='Profile picture' />
			</AvatarGroup>
			{!isLoading && userProfile.location && userProfile.location.length > 0 &&
            <Flex alignItems="baseline">
            {/* <IconButton
            icon={<FontAwesomeIcon icon={faLocationDot} />}
            mx={2} // Adds horizontal margin between the icons
          /> */}
          <Box mx={2} mt={2}>
          <FontAwesomeIcon icon={faLocationDot}  />
          </Box>
            <Text fontSize="sm" >{locationData.location.city}, {locationData.location.state}</Text>
            </Flex>
            }
			</Flex>
			</Flex>
			</Container>
			
			<VStack alignItems={"start"} gap={2} mx={0} flex={1}>
				<Flex
					gap={4}
					direction={{ base: "row", sm: "row" }}
					justifyContent={{ base: "flex-start", sm: "flex-start" }}
					alignItems={"center"}
					w={"full"}
				>
					<Text fontWeight="bold" fontSize={{ base: "lg", md: "lg" }}>{userProfile.username}</Text>
					
				</Flex>

				<Flex alignItems={"center"} gap={{ base: 2, sm: 4 }}>
					<Text fontSize={{ base: "sm", md: "sm" }}>
						<Text as='span' fontWeight={"bold"} mr={1}>
							{userProfile.posts.length}
						</Text>
						Posts
					</Text>
					<Text fontSize={{ base: "sm", md: "sm" }}>
					<Link to={`/${username}/followers`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <Text as='span' fontWeight={"bold"} mr={1}>
                            {userProfile.followers.length}
                        </Text>
                        Followers
                    </Link>
					</Text>
					<Text fontSize={{ base: "sm", md: "sm" }}>
					<Link to={`/${username}/following`} style={{ textDecoration: 'none', color: 'inherit' }}>
						<Text as='span' fontWeight={"bold"} mr={1}>
							{userProfile.following.length}
						</Text>
						Following
					</Link>
					</Text>
				</Flex>
				<Flex alignItems={"center"} gap={4}>
					<Text fontSize={"sm"} fontWeight={"bold"}>
						{userProfile.fullName}
					</Text>
				</Flex>
				<Text fontSize={"sm"} whiteSpace="normal" overflowWrap="break-word" width="60%">{userProfile.bio}</Text>
				{visitingOwnProfileAndAuth && (
						<Flex gap={4} alignItems={"center"} justifyContent={"center"}>
							<Button
								bg={"white"}
								color={"black"}
								_hover={{ bg: "whiteAlpha.800" }}
								size={{ base: "sm", md: "sm" }}
								onClick={onOpen}
							>
								Edit Profile
							</Button>
						</Flex>
					)}
					{visitingAnotherProfileAndAuth && (
						<Flex gap={4} alignItems={"center"} justifyContent={"center"}>
							<Button
								bg={"#eb7734"}
								color={"white"}
								_hover={{ bg: "#c75e1f" }}
								size={{ base: "xs", md: "sm" }}
								onClick={handleFollowClick} // Use the optimized handler
								isDisabled={isOptimisticUpdate} // Disable button during optimistic update
								textShadow="2px 2px 4px rgba(0, 0, 0, 0.5)"
							>
								{isFollowing ? "Unfollow" : "Follow"}
							</Button>
						</Flex>
					)}
			</VStack>
			
			{isOpen && <EditProfile isOpen={isOpen} onClose={onClose} />}
		</Flex>
	);
};

export default ProfileHeader;
