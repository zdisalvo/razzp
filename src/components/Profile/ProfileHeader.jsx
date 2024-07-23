import { Avatar, AvatarGroup, Button, Flex, Text, VStack, useDisclosure, Container, Box, Switch} from "@chakra-ui/react";
import useUserProfileStore from "../../store/userProfileStore";
import useAuthStore from "../../store/authStore";
import EditProfile from "./EditProfile";
import useFollowUserFP from "../../hooks/useFollowUserFP";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import useUserLocation from '../../hooks/useUserLocation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLocationDot } from '@fortawesome/free-solid-svg-icons'; 
import { storeUserLocation } from "../../hooks/storeUserLocation";
import { unstoreUserLocation } from "../../hooks/unstoreUserLocation";
import useMsgStore from "../../store/msgStore";

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
	const [isToggled, setIsToggled] = useState(userProfile.location && userProfile.location.length > 0);
    const [userLocation, setUserLocation] = useState({ latitude: null, longitude: null });
	const navigate = useNavigate();
	const setUserId = useMsgStore((state) => state.setUserId);
	const setReceivingUserId = useMsgStore((state) => state.setReceivingUserId);

	useEffect(() => {
		// Get current location if the proximity toggle is on
		if (isToggled) {
		  const getCurrentLocation = () => {
			if (navigator.geolocation) {
			  navigator.geolocation.getCurrentPosition(
				(position) => {
				  const { latitude, longitude } = position.coords;
				  setUserLocation({ latitude, longitude });
				  storeUserLocation(authUser.uid, latitude, longitude);
				  
				},
				(error) => {
				  console.error('Error getting current location:', error);
				  // Handle error appropriately
				}
			  );
			} else {
			  console.error('Geolocation is not supported by this browser.');
			}
		  };
		  getCurrentLocation();
		} 
	    else {
	      unstoreUserLocation(authUser.uid);
	    }
	  }, [isToggled]);

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

	const handleMessageClick = () => {
		setUserId(authUser.uid);
		setReceivingUserId(userProfile.uid);
		// Store IDs in localStorage
		localStorage.setItem("userId", authUser.uid);
		localStorage.setItem("receivingUserId", userProfile.uid);
		navigate(`/${userProfile.username}/messages`);
	  };

	//console.log(locationData.location.city);

	return (
		<Flex gap={{ base: 4, sm: 10 }} py={1} direction={{ base: "column", sm: "row" }} mb={4}>
			
			<Container width={{base: "50%", md: "35%"}} p={0}>
			<Flex direction="column" alignItems={{base: "center", md: "flex-end"}}>
				<Flex direction="column" alignItems="center">
			<AvatarGroup size={{ base: "xl", md: "2xl" }}  mx={1} mt={2}>
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
			{visitingOwnProfileAndAuth && (
			<Flex alignItems="baseline">
              <Text fontSize="xs" mt={1} mr={2} mb={0}>Location: {isToggled ? 'on' : 'off'}</Text>
              <Switch
                isChecked={isToggled}
                onChange={() => setIsToggled(!isToggled)}
                size="md"
                colorScheme="orange"
              />
            </Flex>
			)}
			</Flex>
			</Flex>
			</Container>
			<Container width="85%">
			<VStack alignItems={"start"} gap={2} mx={0} flex={1} mt={{base: "0px", md: "20px"}}>
				<Flex
					gap={3}
					direction={{ base: "row", sm: "row" }}
					justifyContent={{ base: "center", sm: "flex-start" }}
					alignItems="baseline"
					w={"full"}
				>
					<Text fontWeight="bold" fontSize={{ base: "xl", md: "lg" }}>{userProfile.username}</Text>
					<Text>•</Text>
					<Text fontSize={"sm"} >
						{userProfile.fullName}
					</Text>
				</Flex>

				<Flex 
				justifyContent={{ base: "center", sm: "flex-start" }}
				alignItems={"center"} gap={{ base: 5, sm: 4 }} w={"full"}>
					<Text color="#eb7734" fontSize={{ base: "md", md: "sm" }}>
						<Text as='span' fontWeight={"bold"} mr={2}>
							{userProfile.posts.length}
						</Text>
						Posts
					</Text>
					<Text color="#eb7734" fontSize={{ base: "md", md: "sm" }}>
					<Link to={`/${username}/followers`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <Text as='span' fontWeight={"bold"} mr={2}>
                            {userProfile.followers.length}
                        </Text>
                        Followers
                    </Link>
					</Text>
					<Text color="#eb7734" fontSize={{ base: "md", md: "sm" }}>
					<Link to={`/${username}/following`} style={{ textDecoration: 'none', color: 'inherit' }}>
						<Text as='span' fontWeight={"bold"} mr={2}>
							{userProfile.following.length}
						</Text>
						Following
					</Link>
					</Text>
				</Flex>
				{/* <Flex alignItems={"center"} gap={4}>
					<Text fontSize={"sm"} fontWeight={"bold"}>
						{userProfile.fullName}
					</Text>
				</Flex> */}
				<Text fontSize={"sm"} whiteSpace="normal" overflowWrap="break-word" width="100%">{userProfile.bio}</Text>
				{visitingOwnProfileAndAuth && (
						<Flex	
						gap={3}
					direction={{ base: "row", sm: "row" }}
					justifyContent={{ base: "center", sm: "flex-start" }}
					alignItems="baseline"
					w={"full"}	
					>
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
					<Flex	
						gap={3}
					direction={{ base: "row", sm: "row" }}
					justifyContent={{ base: "center", sm: "flex-start" }}
					alignItems="baseline"
					w={"full"}	
					>
							<Button
								bg={"#eb7734"}
								color={"white"}
								_hover={{ bg: "#c75e1f" }}
								size={{ base: "sm", md: "sm" }}
								onClick={handleFollowClick} // Use the optimized handler
								isDisabled={isOptimisticUpdate} // Disable button during optimistic update
								textShadow="2px 2px 4px rgba(0, 0, 0, 0.5)"
							>
								{isFollowing ? "Unfollow" : "Follow"}
							</Button>
							<Button
								bg={"#eb7734"}
								color={"white"}
								_hover={{ bg: "#c75e1f" }}
								size={{ base: "sm", md: "sm" }}
								aria-label="Messages"
								textShadow="2px 2px 4px rgba(0, 0, 0, 0.5)"
								onClick={handleMessageClick} 
								mx={2} 
								>Message</Button>
							
						</Flex>
						
					)}
			</VStack>
			</Container>
			{isOpen && <EditProfile isOpen={isOpen} onClose={onClose} />}
			
		</Flex>
	);
};

export default ProfileHeader;
