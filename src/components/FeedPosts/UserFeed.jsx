import React, { useEffect, useRef, useState } from "react";
import { Box, Container, Flex, Skeleton, SkeletonCircle, Text, VStack, Link } from "@chakra-ui/react";
import FeedPost from "./FeedPost";
import useGetUserFeed from "../../hooks/useGetUserFeed";
import { useLocation, useParams } from "react-router-dom";
import useGetUserProfileByUsername from "../../hooks/useGetUserProfileByUsername";
import useCheckBlockedUser from "../../hooks/useCheckBlockedUser";
import { Link as RouterLink } from "react-router-dom";

const UserFeed = () => {
  const { username } = useParams();
  const location = useLocation();
  const postId = location.state?.postId;
  const { isLoading, posts } = useGetUserFeed(username);
  const postRefs = useRef({});
  const [shouldScroll, setShouldScroll] = useState(false);

  const { isLoading: userProfileLoading, userProfile } = useGetUserProfileByUsername(username);

  const isBlocked = useCheckBlockedUser({userProfile});

  // useEffect(() => {
  //   if (!isLoading && postId && postRefs.current[postId]) {
  //     postRefs.current[postId].scrollIntoView({ behavior: "smooth" });
  //     setShouldScroll(false); // Reset to false after scrolling
  //   }
  // }, [posts, postId, isLoading]);

  const userNotFound = !isLoading && !userProfile;

  useEffect(() => {
    if (!isLoading && postId && postRefs.current[postId]) {
      // Using setTimeout to ensure DOM is fully updated
      setTimeout(() => {
        postRefs.current[postId].scrollIntoView();
      }, 500); // Adjust delay as necessary
      setShouldScroll(false); // Reset to false after scrolling
    }
  }, [isLoading, postId, posts]);

  if (userNotFound || isBlocked) return <UserNotFound />;

  return (
    <Container mx={0} px={0} py={6}>
      {isLoading &&
        [0, 1, 2].map((_, idx) => (
          <VStack key={idx} gap={0} alignItems={"flex-start"} mb={{base: "13vh", md: "60px"}}>
            <Flex gap="0">
              <SkeletonCircle size="10" />
              <VStack gap={0} alignItems={"flex-start"}>
                <Skeleton height="10px" w={{base: "100vw", md: "200px"}} />
                <Skeleton height="10px" w={{base: "100vw", md: "200px"}} />
              </VStack>
            </Flex>
            <Skeleton w={"full"}>
              <Box h={"400px"}>contents wrapped</Box>
            </Skeleton>
          </VStack>
        ))}

      {!isLoading && posts.length > 0 &&
        posts.map((post) => (
          <FeedPost
            key={post.id}
            post={post}
            ref={(el) => (postRefs.current[post.id] = el)}
          />
        ))
      }

      

      {/* Conditional rendering for scroll attempt when posts are loaded */}
      {shouldScroll && <div style={{ visibility: "hidden", height: 0 }} ref={(el) => el && el.scrollIntoView({ behavior: "smooth" })}></div>}
      
    </Container>
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

export default UserFeed;
