import { useState, useEffect } from "react";
import { Container, Flex, Link, Skeleton, SkeletonCircle, Text, VStack, Box, IconButton } from "@chakra-ui/react";
import ProfileHeader from "../../components/Profile/ProfileHeader";
import ProfileTabs from "../../components/Profile/ProfileTabs";
import ProfilePosts from "../../components/Profile/ProfilePosts";
import useGetUserProfileByUsername from "../../hooks/useGetUserProfileByUsername";
import { useParams, useNavigate } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComments } from '@fortawesome/free-solid-svg-icons';
import useMsgStore from "../../store/msgStore";
import useAuthStore from "../../store/authStore";
import useCheckBlockedUser from "../../hooks/useCheckBlockedUser";

const ProfilePage = () => {
  const { authUser, fetchUserData } = useAuthStore((state) => ({
		authUser: state.user,
		fetchUserData: state.fetchUserData,
	  }));
  const { username } = useParams();
  //const { isLoading: authUserLoading } = useAuthStore((state) => state);

  const { isLoading, userProfile } = useGetUserProfileByUsername(username);

  const isBlocked = useCheckBlockedUser({userProfile});

  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const userNotFound = !isLoading && !userProfile;
  const setUserId = useMsgStore((state) => state.setUserId);
  const setReceivingUserId = useMsgStore((state) => state.setReceivingUserId);

  // useEffect(() => {
	// 	if (authUser) {
	// 	  fetchUserData(authUser.uid); // Ensure the user data is up-to-date
	// 	}
	//   }, [authUser, fetchUserData]);

  // console.log(userProfile.uid);
  // console.log(authUser);

  useEffect(() => {
    if (!isLoading) {
      setLoading(false);
    }
  }, [isLoading]);

  // useEffect(() => {
  //   if (authUser && userProfile) {
  //     console.log(authUser.uid);
  //     console.log(userProfile.uid);
  //   }
  // }, [authUser, userProfile]);

  const handleMessageClick = () => {
    setUserId(authUser.uid);
    setReceivingUserId(userProfile.uid);
    // Store IDs in localStorage
    localStorage.setItem("userId", authUser.uid);
    localStorage.setItem("receivingUserId", userProfile.uid);
    navigate(`/${username}/messages`);
  };


  if (userNotFound || isBlocked) return <UserNotFound />;

  return (
    <Container top={0} p={0} maxW={{base: "100vw", md: "100vw"}} pb={{base: "10vh", md: "60px"}}  m={0}>
      {/* <Box position="fixed" top="0" right={{base: "0", md: "15vw"}} p={4} zIndex="docked" width="100%">
                <Flex justifyContent="flex-end">
                <IconButton
                  icon={<FontAwesomeIcon icon={faComments} />}
                  aria-label="Messages"
                  onClick={handleMessageClick} 
                  variant="outline"
                  mx={2} // Adds horizontal margin between the icons
                />
                </Flex>
            </Box> */}
			<Box
			px={0}
			mx="auto"
			height={{ base: "100vh", md: "auto" }}
			width={{ base: "100vw", md: "65vw" }}
			bottom={{ base: "10vh", md: "60px" }}
			top={0}
			transform="none"
			display="flex"
			flexDirection="column"
			justifyContent={{base: "none", md: "center"}}
			alignItems="center"
      >
        <Flex py={1} px={0} w="full" flexDirection="column" alignItems="center">
          {!isLoading && userProfile && <ProfileHeader username={username} page="profile" />}
          {isLoading && <ProfileHeaderSkeleton />}
        </Flex>
        <Flex
          px={{ base: 0, sm: 0 }}
          maxW="full"
          w={{ base: "100%", md: "65vw" }}
          borderTop="1px solid"
          borderColor="whiteAlpha.300"
          direction="column"
          justifyContent="center"
          alignItems="center"
        >
          {/* <ProfileTabs /> */}
          <ProfilePosts username={username} />
        </Flex>
      </Box>
    </Container>
  );
};

export default ProfilePage;

// skeleton for profile header
const ProfileHeaderSkeleton = () => {
  return (
    <Flex
      gap={{ base: 2, sm: 2 }}
      py={1}
      direction={{ base: "column", sm: "row" }}
      justifyContent="center"
      alignItems="center"
    >
      <SkeletonCircle size="24" />

      <VStack alignItems={{ base: "center", sm: "flex-start" }} gap={2} mx="auto" flex={1}>
        <Skeleton height="12px" width="150px" />
        <Skeleton height="12px" width="100px" />
      </VStack>
    </Flex>
  );
};



const UserNotFound = () => {
  return (
    <Flex flexDir="column" textAlign="center" mx="auto">
      <Text fontSize="2xl">User Not Found</Text>
      <Link as={RouterLink} to="/" color="blue.500" w="max-content" mx="auto">
        Go home
      </Link>
    </Flex>
  );
};
