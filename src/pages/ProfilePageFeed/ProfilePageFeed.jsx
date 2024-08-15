import React, { useEffect, useState } from "react";
import { Box, Container, Flex, Text, Link } from "@chakra-ui/react";
import { useParams, useLocation, Link as RouterLink, useNavigate } from "react-router-dom";
import UserFeed from "../../components/FeedPosts/UserFeed";
import SuggestedUsers from "../../components/SuggestedUsers/SuggestedUsers";
import useAuthStore from "../../store/authStore";
import useGetUserProfileByUsername from "../../hooks/useGetUserProfileByUsername";
import Meta from "../../components/SEO/Meta";


const ProfilePageFeed = () => {
  const { username } = useParams();
  const location = useLocation();
  const authUser = useAuthStore((state) => state.user);
  const { isLoading, userProfile } = useGetUserProfileByUsername(username);
  const [authChecked, setAuthChecked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if authUser exists when component mounts
    setAuthChecked(true);

    //console.log((userProfile?.private && !userProfile.followers.includes(authUser?.uid) && !(authUser.uid === userProfile.uid)) || !authUser );

    if ((userProfile?.private && !userProfile?.followers.includes(authUser?.uid) && !(authUser?.uid === userProfile?.uid)) || (userProfile?.private && !authUser) ) {
    navigate(`/${username}`);
  }
}, [authUser, userProfile, navigate, username]);

  const userNotFound = !isLoading && !userProfile;
  if (userNotFound) return <UserNotFound />;

  const searchParams = new URLSearchParams(location.search);
  const postId = searchParams.get("postId");

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
    <Container px={0} py={6} maxW={{ base: "100vw", md: "100vw" }} mx={0} pb={{base: "10vh", md: "60px"}}>
      <Box
        px={0}
        mx="auto"
        height={{ base: "100vh", md: "auto" }}
        width={{ base: "100vw", md: "65vw" }}
        bottom={{ base: "10vh", md: "60px" }}
        left={0}
        transform="none"
        display="flex"
        flexDirection="column"
        justifyContent={{ base: "none", md: "center" }}
        alignItems="center"
      >
        <Flex gap={20} px={0} mx={0} justifyContent="center">
          <Box flex={2} py={0} px={0} pb={{base: "6vh", md: "60px"}} ml={{ base: "none", md: "20" }}>
            <UserFeed username={username} postId={postId} />
          </Box>
          {/* {authUser && (
            <Box
              px={0}
              ml={0}
              flex={3}
              mr={{ base: "none", md: "20" }}
              display={{ base: "none", lg: "block" }}
              maxW={{ base: "20vw", lg: "20vw" }}
            >
              <SuggestedUsers />
            </Box>
          )} */}
        </Flex>
      </Box>
    </Container>
    </div>
  );
};

export default ProfilePageFeed;

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
