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
import Meta from "../../components/SEO/Meta";

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

  useEffect(() => {
    // Scroll to the top of the page on component mount
    window.scrollTo(0, 0);
  }, []);

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
    <div>
      {userProfile && (
      <Meta
      title={`${userProfile.fullName}${userProfile.city && !userProfile.private ? ` in ${userProfile.city}, ${userProfile.state}` : ""} on Razzp - Social Networking Reinvented`}
      keywords={`${userProfile.fullName}${userProfile.city && !userProfile.private ? ` in ${userProfile.city}, ${userProfile.state}` : ""} on Razzp, Social network, Social media platform, Content creation, Online community, Connect with local friends, Share updates, Search by location, Messaging, Social media, Profile creation, Social sharing, Friend network, Social interaction, Content sharing, User engagement, Social connections, Follow and unfollow, Online profiles, News feed, Social networking site`}
      description={userProfile.bio ? userProfile.bio : "The ultimate platform for creating and sharing content. Connect with local users, increase your popularity, and maximize your brand on Razzp. No download required."} 
      ogTitle={`${userProfile.username} on Razzp - Social Networking Reinvented`}
      ogDescription="The ultimate platform for creating and sharing content. No download required."
      ogImage={userProfile.profilePicURL}
      />
      )}
    <Container top={0} p={0} maxW={{base: "100vw", md: "100vw"}} pb={{base: "23vh", md: "60px"}} mb={{base: "23vh", md: "60px"}}  m={0}>
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
          {userProfile && <ProfileHeader username={username} page="profile" />}
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
          {authUser && userProfile && ((!userProfile.private) || (authUser.uid === userProfile.uid)|| (userProfile.private && userProfile.followers.includes(authUser.uid))) ? (
          <ProfilePosts username={username} />
          ) : 
          ((userProfile && !userProfile.private) &&
          <ProfilePosts username={username} />)
          }
        </Flex>
      </Box>
    </Container>
    </div>
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
