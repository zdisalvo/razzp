import { Avatar, AvatarGroup, Button, Flex, Text, VStack, useDisclosure, Container, Box, Switch, IconButton, Menu, MenuButton, MenuList, MenuItem, Image} from "@chakra-ui/react";
import useUserProfileStore from "../../store/userProfileStore";
import useAuthStore from "../../store/authStore";
import EditProfile from "./EditProfile";
import useFollowUserFP from "../../hooks/useFollowUserFP";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import useUserLocation from '../../hooks/useUserLocation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLocationDot, faEllipsis} from '@fortawesome/free-solid-svg-icons'; 
import { storeUserLocation } from "../../hooks/storeUserLocation";
import { unstoreUserLocation } from "../../hooks/unstoreUserLocation";
import useMsgStore from "../../store/msgStore";
import useBlockUser from "../../hooks/useBlockUser";
import useGetUserProfileById from "../../hooks/useGetUserProfileById";
import useAuthStoreEffect from "../../store/authStoreEffect";
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../../firebase/firebase';
import useUnblockUser from "../../hooks/useUnblockUser";
import useGetUserProfileByUsername from "../../hooks/useGetUserProfileByUsername";
import useDeleteUser from "../../hooks/useDeleteUser";
import useSetPrivateProfile from "../../hooks/useSetPrivateProfile";
import useSetPublicProfile from "../../hooks/useSetPublicProfile";
import useUnrequestFollow from "../../hooks/useUnrequestFollow";
import useHasRequestedFollow from "../../hooks/useHasRequestedFollow";
import useFollowUser from "../../hooks/useFollowUser";
import useLogout from "../../hooks/useLogout";
import SupportModal from "../Modals/SupportModal";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase/firebase";
import ImportInstagramModal from "../Modals/InstagramImportModal";

const ProfileHeader = ({ username, page }) => {
	//const { userProfile } = useUserProfileStore();
	const { userProfile } = useGetUserProfileByUsername(username);
	const { authUser, fetchUserData } = useAuthStore((state) => ({
		authUser: state.user,
		fetchUserData: state.fetchUserData,
	  }));
	//const {authUserDoc} = useGetUserProfileById(authUser.uid)
	const { isOpen, onOpen, onClose } = useDisclosure();
	//const { isFollowing: initialIsFollowing } = useFollowUser(userProfile?.uid);
	const { handleFollowUser } = useFollowUserFP();
	const [isFollowing, setIsFollowing] = useState(false);
	const [isOptimisticUpdate, setIsOptimisticUpdate] = useState(false);

	const visitingOwnProfileAndAuth = authUser && authUser.username === userProfile.username;
	const visitingAnotherProfileAndAuth = authUser && authUser.username !== userProfile.username;
	//console.log(userProfile.location);
	//const locationData = userProfile.location && userProfile.location.length > 0 ? useUserLocation(userProfile.location[0], userProfile.location[1]) : { city: "", state: "", isLoading: false };
    //const { city, state, isLoading } = locationData;
	//console.log(locationData);
	const [isToggled, setIsToggled] = useState(userProfile.location && userProfile.location.length > 0);
    const [userLocation, setUserLocation] = useState({ latitude: null, longitude: null });
	
	const setUserId = useMsgStore((state) => state.setUserId);
	const setReceivingUserId = useMsgStore((state) => state.setReceivingUserId);
	const navigate = useNavigate();
	const { blockUser, isBlocking, error } = useBlockUser();
	//const {authUserDoc, setAuthUserDoc} = doc(firestore, "users", authUser.uid);
	const { unblockUser, isUnblocking, error: unblockError} = useUnblockUser();
	const { deleteUser, isDeleting } = useDeleteUser();
	const [city, setCity] = useState('');
	const [state, setState] = useState('');
	const [latitudeLoc, setLatitudeLoc] = useState('');
	const [longitudeLoc, setLongitudeLoc] = useState('');
	const locationData = useUserLocation(latitudeLoc, longitudeLoc);
	const { setPrivate, isLoading: settingPrivate} = useSetPrivateProfile();
	const { setPublic, isLoading: settingPublic } = useSetPublicProfile();
	const [requested, setRequested ] = useState(false);
	const unrequestFollow = useUnrequestFollow();
	//const hasRequested = useHasRequestedFollow(userProfile.uid);
	const { handleLogout, isLoggingOut } = useLogout();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [userAuth] = useAuthState(auth);
	const [isImportModalOpen, setIsImportModalOpen] = useState(false);
	//const [prevToggle, setPrevToggle] = useState(isToggled);

	//console.log(isFollowing);

	const handleImportInstagram = () => {
		
		setIsImportModalOpen(true); // If using a Chakra UI modal
		
	};

	const handleImportInstagramClose = () => {
		setIsImportModalOpen(false);
	  };

	const handleModalClose = () => {
		setIsModalOpen(false);
	  };
		
	  const handleSupportClick = () => {
		// setSparkProfile(profileData);
		// setSparkUser(match); // Assuming match contains user data
		setIsModalOpen(true);
	  };


	

	  //console.log(requested);

	useEffect(() => {
		if (city === '' && authUser && isToggled && authUser.username === username) {
		  fetchUserData(authUser.uid); // Ensure the user data is up-to-date
		  //setPrevToggle(!prevToggle);
		}
	  }, [authUser, fetchUserData, isToggled]);

	  const navigateToBlocked = () => {
		navigate('/blocked');
	  };


	  useEffect(() => {
		if (userProfile && authUser && userProfile.requested) {
		  setRequested(userProfile.requested.includes(authUser.uid)); // Ensure the user data is up-to-date
		}
	  }, [authUser, fetchUserData]);

	  useEffect(() => {
		if (userProfile && authUser) {
		  setIsFollowing(authUser.following.includes(userProfile.uid)); // Ensure the user data is up-to-date
		}
		//console.log(isFollowing);
	  }, [authUser, fetchUserData]);

	
	// useEffect(() => {
	// 	const fetchUserData = async () => {
	// 		//console.log(authUser);
	// 	  if (!authUser?.uid) return; // Avoid fetching if authUser or uid is not available
	
	// 	  try {
	// 		const userDocRef = doc(firestore, 'users', authUser?.uid);
	// 		const userDoc = await getDoc(userDocRef);

	// 		//console.log(userDoc);
	
	// 		if (userDoc.exists()) {
	// 		  setAuthUserDoc(userDoc.data()); // Update the authUser state with the new data
	// 		}
	// 	  } catch (error) {
	// 		console.log("test");
	// 		console.error('Error fetching user data:', error);
	// 		// Handle errors here, such as showing a toast notification
	// 	  }
	// 	};
	
	// 	fetchUserData();

	//   }, [authUser?.uid, setAuthUserDoc]);

	const goToMessages = () => {
        navigate("/messages");
    };

	const goToNotifications = () => {
        navigate("/notifications");
    };

	const goToSpark = () => {
        navigate("/spark");
    };

	const profileUrl = `https://razzp.com/${username}`;

	const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `What's new on Razzp?`,
                    text: `Crown me on Razzp. -${userProfile.fullName}`,
                    url: profileUrl,
                });
                console.log('Successfully shared');
            } catch (error) {
                console.error('Error sharing:', error);
            }
        } else {
            console.warn('Web Share API is not supported in your browser.');
            // Fallback for browsers that don't support the Web Share API
            // You could use a different sharing library or mechanism here
        }
    };


	const handleDeleteUser = () => {
		deleteUser();
	  };



	const handleBlockUser = async () => {
		//console.log("test");
	  try {
		await blockUser(userProfile.uid);

		// You can handle success feedback here, such as a toast notification
	  } catch (err) {
		console.error(err);
		// Handle errors here, such as showing a toast notification
	  }
	};

	const handleUnblockUser = async () => {
		//console.log("test");
	  try {
		await unblockUser(userProfile.uid);

		// You can handle success feedback here, such as a toast notification
	  } catch (err) {
		console.error(err);
		// Handle errors here, such as showing a toast notification
	  }
	};

	const handleMakePrivate = async () => {
		try {
			await setPrivate();
		} catch (error) {
			console.error(error);
		}
	}

	const handleMakePublic = async () => {
		try {
			await setPublic();
		} catch (error) {
			console.error(error);
		}
	}
	

	useEffect(() => {
		// Get current location if the proximity toggle is on
		if (isToggled && visitingOwnProfileAndAuth ) {
			//console.log(visitingOwnProfileAndAuth);
		  const getCurrentLocation = () => {
			if (navigator.geolocation) {
			  navigator.geolocation.getCurrentPosition(
				(position) => {
				  const { latitude, longitude } = position.coords;
				  setUserLocation({ latitude, longitude });
				  storeUserLocation(authUser.uid, latitude, longitude);
				  
				  setLatitudeLoc(latitude);
				  setLongitudeLoc(longitude);
				  //console.log(latitudeLoc);
				  
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
	    else if ( visitingOwnProfileAndAuth) {
	      unstoreUserLocation(authUser.uid);
		  setLatitudeLoc("");
		  setLongitudeLoc("");
		  setCity('');
		  setState('');
	    }
	  }, [isToggled]);


	  useEffect(() => {
		const fetchUserLocation = async () => {
		  
		  try {
			const userDocRef = doc(firestore, `users/${userProfile.uid}`);
			const userDoc = await getDoc(userDocRef);
	
			if (isToggled && userDoc.exists()) {
			  const userData = userDoc.data();
			  setCity(userData.city || '');
			  setState(userData.state || '');
			} else if (!isToggled) {
				setCity('');
			  	setState('');
			}
		  } catch (error) {
			console.error('Error fetching user location:', error);
		  }
		};
	
		if (isToggled && authUser && authUser.uid) {
		  fetchUserLocation();
		}
	  }, [authUser, isToggled]);



	const handleFollowClick = async () => {
		// Optimistically update the UI
		

		if (userProfile.private && !requested) {
			setRequested(true);
			//console.log(requested);
		} else if (userProfile.private && requested) {
			unrequestFollow(userProfile.uid);
			setRequested(false);
			
		} else {
			setIsFollowing(prev => !prev);
			setIsOptimisticUpdate(true);
		}
		
		//console.log(requested);

		try {
			//console.log(!requested);
			await handleFollowUser(userProfile, userProfile.uid, isFollowing, !requested); // Handle server request
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

	//console.log(authUser);

	return (
		<Flex gap={{ base: 4, sm: 10 }} py={1} direction={{ base: "column", sm: "row" }} mb={4}>
			
			<Container width={{base: "50%", md: "35%"}} p={0}>
			{visitingAnotherProfileAndAuth && userAuth && (
				<Box position="fixed" top="0" right={{base: "0", md: "15vw"}} p={4} zIndex="docked" width="100%">
                <Flex justifyContent="flex-end">
                <Menu>
			
          <MenuButton
            as={IconButton}
            icon={<FontAwesomeIcon icon={faEllipsis} />}
            aria-label="Other options"
            variant="outline"
            mx={2} // Adds horizontal margin between the icons
          />
          <MenuList
            bg="black" // Sets the background color to black
            borderRadius="md" // Optional: for rounded corners
            //borderBottom="1px groove #1B2328" // Adds the border at the bottom
            color="white" // Sets the text color to white for better contrast
			fontSize={{base: "md", md: "sm"}}
			width="auto"
			minWidth="75px"
			maxWdith="75px"
			py={1}
			position="absolute"
			right={-10}
            _focus={{ boxShadow: 'none' }} // Optional: Removes box shadow on focus
          >
			{/* <MenuItem
			bg="black"
			_hover={{ bg: '#2e2e2e' }} // Changes background color to charcoal on hover
			px={4} // Adds padding inside MenuItem
              //width="100%"
			  whiteSpace="nowrap"
			  color="white"
			  onClick={handleShare}
			>Share to Contacts</MenuItem> */}
          {((authUser && authUser.blocked && !authUser.blocked.includes(userProfile.uid)) 
		  	|| (authUser && !authUser.blocked)) && (
            <MenuItem
			bg="black"
			_hover={{ bg: '#2e2e2e' }} // Changes background color to charcoal on hover
			px={4} // Adds padding inside MenuItem
              //width="100%"
			  whiteSpace="nowrap"
			  color="#c8102e"
			  onClick={handleBlockUser}
			>Block User</MenuItem>
		  )}
		  {authUser && authUser.blocked && authUser.blocked.includes(userProfile.uid) && (
            <MenuItem
			bg="black"
			_hover={{ bg: '#2e2e2e' }} // Changes background color to charcoal on hover
			px={4} // Adds padding inside MenuItem
              //width="100%"
			  whiteSpace="nowrap"
			  color="#c8102e"
			  onClick={handleUnblockUser}
			>Unblock User</MenuItem>
		  )}
            
          </MenuList>
        </Menu>
				</Flex>
				</Box>
			)}
			{visitingOwnProfileAndAuth && userAuth && (
				<Box position="fixed" top="0" right={{base: "0", md: "15vw"}} p={4} zIndex="docked" width="100%">
                <Flex justifyContent="flex-end">
                <Menu>
			
          <MenuButton
            as={IconButton}
            icon={<FontAwesomeIcon icon={faEllipsis} />}
            aria-label="Other options"
            variant="outline"
            mx={2} // Adds horizontal margin between the icons
          />
          <MenuList
            bg="black" // Sets the background color to black
            borderRadius="md" // Optional: for rounded corners
            //borderBottom="1px groove #1B2328" // Adds the border at the bottom
            color="white" // Sets the text color to white for better contrast
			fontSize={{base: "md", md: "sm"}}
			width="auto"
			minWidth="75px"
			maxWdith="75px"
			py={1}
			position="absolute"
			right={-10}
            _focus={{ boxShadow: 'none' }} // Optional: Removes box shadow on focus
          >
			<MenuItem
			bg="black"
			_hover={{ bg: '#2e2e2e' }} // Changes background color to charcoal on hover
			px={4} // Adds padding inside MenuItem
              //width="100%"
			  whiteSpace="nowrap"
			  color="white"
			  onClick={goToMessages}
			>Messages</MenuItem>
			<MenuItem
			bg="black"
			_hover={{ bg: '#2e2e2e' }} // Changes background color to charcoal on hover
			px={4} // Adds padding inside MenuItem
              //width="100%"
			  whiteSpace="nowrap"
			  color="white"
			  onClick={goToNotifications}
			>Notifications</MenuItem>
			{authUser && !authUser.instagramImport && (
			<MenuItem
			bg="black"
			_hover={{ bg: '#2e2e2e' }} // Changes background color to charcoal on hover
			pl={4} pr={7}// Adds padding inside MenuItem
              //width="100%"
			  whiteSpace="nowrap"
			  color="white"
			  onClick={handleImportInstagram}
			>
				<Image 
                src="/instagram-black-back.png" // Replace with the path to your image
                alt="Instagram Icon"
                boxSize="20px" // Adjust size as needed
                mr={1} // Margin right to create space between image and text
            	/>
				Import IG Content</MenuItem>
			)}
			<MenuItem
			bg="black"
			_hover={{ bg: '#2e2e2e' }} // Changes background color to charcoal on hover
			px={4} // Adds padding inside MenuItem
              //width="100%"
			  whiteSpace="nowrap"
			  color="white"
			  onClick={goToSpark}
			>💥 Spark Dating</MenuItem>
			<MenuItem
			bg="black"
			_hover={{ bg: '#2e2e2e' }} // Changes background color to charcoal on hover
			px={4} // Adds padding inside MenuItem
              //width="100%"
			  whiteSpace="nowrap"
			  color="white"
			  onClick={handleShare}
			>Invite my Contacts</MenuItem>
			{authUser && !authUser.private && (
			<MenuItem
			bg="black"
			_hover={{ bg: '#2e2e2e' }} // Changes background color to charcoal on hover
			px={4} // Adds padding inside MenuItem
              //width="100%"
			  whiteSpace="nowrap"
			  color="white"
			  onClick={handleMakePrivate}
			>Make Private</MenuItem>
			)}
			{authUser && authUser.private && (
			<MenuItem
			bg="black"
			_hover={{ bg: '#2e2e2e' }} // Changes background color to charcoal on hover
			px={4} // Adds padding inside MenuItem
              //width="100%"
			  whiteSpace="nowrap"
			  color="white"
			  onClick={handleMakePublic}
			>Make Public</MenuItem>
			)}
          {authUser && authUser.blocked && (
            <MenuItem
			bg="black"
			_hover={{ bg: '#2e2e2e' }} // Changes background color to charcoal on hover
			px={4} // Adds padding inside MenuItem
              //width="100%"
			  whiteSpace="nowrap"
			  color="#c8102e"
			  onClick={navigateToBlocked}
			>Blocked Users</MenuItem>
		  )}
			
			<MenuItem
			bg="black"
			_hover={{ bg: '#2e2e2e' }} // Changes background color to charcoal on hover
			px={4} // Adds padding inside MenuItem
              //width="100%"
			  whiteSpace="nowrap"
			  color="white"
			  onClick={handleSupportClick}
			>Support</MenuItem>
			
			
		  
            <MenuItem
			bg="black"
			_hover={{ bg: '#2e2e2e' }} // Changes background color to charcoal on hover
			px={4} // Adds padding inside MenuItem
              //width="100%"
			  whiteSpace="nowrap"
			  color="#c8102e"
			  onClick={handleDeleteUser}
			>Delete My Account</MenuItem>

			<MenuItem
			bg="black"
			//_hover={{ bg: '#2e2e2e' }} // Changes background color to charcoal on hover
			px={4} // Adds padding inside MenuItem
              //width="100%"
			  whiteSpace="nowrap"
			  color="white"
			  
			></MenuItem>

		  	<MenuItem
			bg="black"
			_hover={{ bg: '#2e2e2e' }} // Changes background color to charcoal on hover
			px={4} // Adds padding inside MenuItem
              //width="100%"
			  whiteSpace="nowrap"
			  color="white"
			  onClick={handleLogout}
			  isLoading={isLoggingOut}
			>Logout</MenuItem>
            
          </MenuList>
        </Menu>
				</Flex>
				</Box>
			)}
			

			<Flex direction="column" alignItems={{base: "center", md: "flex-end"}}>
				<Flex direction="column" alignItems="center">
			<AvatarGroup size={{ base: "xl", md: "2xl" }}  mx={1} my={2}>
				<Avatar src={userProfile.profilePicURL} alt='Profile picture' />
			</AvatarGroup>
			{isToggled && city && state && authUser && userProfile && ((userProfile.private && userProfile.followers.includes(authUser.uid)) || (userProfile.uid === authUser.uid) || (!userProfile.private)) && (
            <Flex alignItems="baseline">
            {/* <IconButton
            icon={<FontAwesomeIcon icon={faLocationDot} />}
            mx={2} // Adds horizontal margin between the icons
          /> */}
          <Box mr={2} mt={0}>
          <FontAwesomeIcon icon={faLocationDot}  />
          </Box>
		  
            <Text fontSize="sm" >{userProfile.city}, {userProfile.state}</Text>
            </Flex>
            )}
			{visitingOwnProfileAndAuth && (
			<Flex alignItems="baseline" justifyContent="center">
              <Text fontSize="xs" mt={0} ml={1} mr={2} mb={0}>Location: {isToggled ? 'on' : 'off'}</Text>
			  <Box mt={0}>
              <Switch
                isChecked={isToggled}
                onChange={() => setIsToggled(!isToggled)}
                size={{base: "md", md: "sm"}}
                colorScheme="orange"
              />
			  </Box>
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
					{(authUser && userProfile) && 
					((userProfile.private && userProfile.followers.includes(authUser.uid)) || 
					(userProfile.uid === authUser.uid) || 
					(!userProfile.private)) ? (
					<Text color="#eb7734" fontSize={{ base: "md", md: "sm" }}>
					<Link to={`/${username}/followers`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <Text as='span' fontWeight={"bold"} mr={2}>
                            {userProfile.followers.length}
                        </Text>
                        Followers
                    </Link>
					</Text>
					) : (
					// {authUser && userProfile && ((userProfile.private && !userProfile.followers.includes(authUser.uid)) || (userProfile.private && !authUser)) && (userProfile.uid !== authUser.uid) && (
					<Text color="#eb7734" fontSize={{ base: "md", md: "sm" }}>
                        <Text as='span' fontWeight={"bold"} mr={2}>
                            {userProfile.followers.length}
                        </Text>
                        Followers
					</Text>
					)}
					
					{(authUser && userProfile) && 
					((userProfile.private && userProfile.followers.includes(authUser.uid)) || 
					(userProfile.uid === authUser.uid) || 
					(!userProfile.private)) ? (
						<Text color="#eb7734" fontSize={{ base: "md", md: "sm" }}>
						<Link to={`/${username}/following`} style={{ textDecoration: 'none', color: 'inherit' }}>
							<Text as='span' fontWeight={"bold"} mr={2}>
							{userProfile.following.length}
							</Text>
							Following
						</Link>
						</Text>
					) : (
						<Text color="#eb7734" fontSize={{ base: "md", md: "sm" }}>
						<Text as='span' fontWeight={"bold"} mr={2}>
							{userProfile.following.length}
						</Text>
						Following
						</Text>
					)}
				</Flex>
				{userProfile && userProfile.instagramUsername && (
				<Flex 
				justifyContent={{ base: "center", sm: "flex-start" }}
				alignItems={"center"} gap={{ base: 2, sm: 2 }} w={"full"}>
					<Image 
						src="/instagram-black-back.png" // Replace with the path to your image
						alt="Instagram Icon"
						boxSize="30px" // Adjust size as needed
						mr={1} // Margin right to create space between image and text
						/>
					<Text>
						{userProfile.instagramUsername}
					</Text>
				</Flex>
				)}
				{/* <Flex alignItems={"center"} gap={4}>
					<Text fontSize={"sm"} fontWeight={"bold"}>
						{userProfile.fullName}
					</Text>
				</Flex> */}
				<Text fontSize={"sm"} mb={3} whiteSpace="normal" overflowWrap="break-word" width="100%">{userProfile.bio}</Text>
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
								textShadow="2px 2px 4px rgba(0, 0, 0, 0.5)"
								size={{ base: "sm", md: "sm" }}
								onClick={handleFollowClick} // Use the optimized handler
								isDisabled={isOptimisticUpdate} // Disable button during optimistic update
								
							>
								{isFollowing ? "Unfollow" : (requested ? "Requested" : "Follow")}
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
			{isModalOpen && <SupportModal isOpen={isModalOpen} onClose={handleModalClose} />}
			{isImportModalOpen && <ImportInstagramModal isOpen={isImportModalOpen} onClose={handleImportInstagramClose} />}
		</Flex>
		
	);
};

export default ProfileHeader;
