import React, { useEffect, useRef, useState } from "react";
import { Box, Container, Flex, Skeleton, SkeletonCircle, Text, VStack, Link } from "@chakra-ui/react";
import FeedPost from "./FeedPost";
import useGetUserFeed from "../../hooks/useGetUserFeed";
import { useLocation, useParams } from "react-router-dom";
import useGetUserProfileByUsername from "../../hooks/useGetUserProfileByUsername";
import useCheckBlockedUser from "../../hooks/useCheckBlockedUser";
import { Link as RouterLink } from "react-router-dom";
import useFollowUserFP from "../../hooks/useFollowUserFP";
import useAuthStore from "../../store/authStore";
import { firestore, storage } from "../../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";

const UserFeed = () => {
  const authUser = useAuthStore((state) => state.user)
  const { username } = useParams();
  const location = useLocation();
  const postId = location.state?.postId;
  const { isLoading, posts } = useGetUserFeed(username);
  const postRefs = useRef({});
  const [shouldScroll, setShouldScroll] = useState(true);
  const [followStates, setFollowStates] = useState({});
  const { isLoading: userProfileLoading, userProfile } = useGetUserProfileByUsername(username);
  const { isUpdating, handleFollowUser } = useFollowUserFP();
  const isBlocked = useCheckBlockedUser({ userProfile });

  const userNotFound = !isLoading && !userProfile;

  useEffect(() => {
    if (!isLoading && postId && postRefs.current[postId] && shouldScroll) {
      setTimeout(() => {
        postRefs.current[postId].scrollIntoView();
      }, 500);
      setShouldScroll(false);
    }
  }, [isLoading, postId, posts]);

  useEffect(() => {
    const fetchFollowStates = async () => {
      const states = {};
      for (const post of posts) {
        try {
          const userDoc = doc(firestore, 'users', post.createdBy);
          const userSnap = await getDoc(userDoc);
          const userData = userSnap.data();
          states[post.createdBy] = userData.followers.includes(authUser.uid);
        } catch (error) {
          console.error(`Error fetching follow state for user ${post.createdBy}:`, error);
        }
      }
      setFollowStates(states);
    };

    if (authUser && posts.length > 0) {
      fetchFollowStates();
    }
  }, [posts, authUser]);


  const handleFollowClick = async (userId) => {
    const currentlyFollowing = followStates[userId];
    await handleFollowUser(userId, currentlyFollowing);
    setFollowStates(prevStates => ({
      ...prevStates,
      [userId]: !currentlyFollowing,
    }));
  };

  if (userNotFound || isBlocked) return <UserNotFound />;

  return (
    <Container mx={0} px={0} py={6}>
      {isLoading &&
        [0, 1, 2].map((_, idx) => (
          <VStack key={idx} gap={0} alignItems={"flex-start"} mb={{ base: "13vh", md: "60px" }}>
            <Flex gap="0">
              <SkeletonCircle size="10" />
              <VStack gap={0} alignItems={"flex-start"}>
                <Skeleton height="10px" w={{ base: "100vw", md: "200px" }} />
                <Skeleton height="10px" w={{ base: "100vw", md: "200px" }} />
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
            isFollowing={followStates[post.createdBy] || false}
            onFollowClick={() => handleFollowClick(post.createdBy)}
          />
        ))
      }

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
