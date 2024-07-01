import React, { useEffect } from "react";
import { Box, Container, Flex, Text, Link } from "@chakra-ui/react";
import { useParams, useLocation, Link as RouterLink } from "react-router-dom";
import UserFeed from "../../components/FeedPosts/UserFeed";
import SuggestedUsers from "../../components/SuggestedUsers/SuggestedUsers";
import useAuthStore from "../../store/authStore";
import useGetUserProfileByUsername from "../../hooks/useGetUserProfileByUsername";

const ProfilePageFeedOrig = () => {
  const { username } = useParams(); // Fetch username from route params
  const location = useLocation();
  const authUser = useAuthStore((state) => state.user);
  const { isLoading, userProfile } = useGetUserProfileByUsername(username);

  // Ensure userProfile is fetched when username changes
  useEffect(() => {
    // No need to call getUserProfile separately, handled internally by useGetUserProfileByUsername
  }, [username]); // Only dependency is username

  const userNotFound = !isLoading && !userProfile;
  if (userNotFound) return <UserNotFound />;

  const searchParams = new URLSearchParams(location.search);
  const postId = searchParams.get("postId");

  return (
    <Container px={0} maxW={{ base: "100vw", md: "100vw" }} mx={0} mb={{ base: "12vh", md: "20px" }}>
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
          <Box flex={2} py={0} px={0} ml={{ base: "none", md: "20" }}>
            <UserFeed username={username} postId={postId} />
          </Box>
          {authUser && (
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
          )}
        </Flex>
      </Box>
    </Container>
  );
};

export default ProfilePageFeedOrig;

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
