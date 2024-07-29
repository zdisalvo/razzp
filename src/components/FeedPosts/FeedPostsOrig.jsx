import React, { useEffect, useState } from "react";
import { Box, Container, Flex, Skeleton, SkeletonCircle, Text, VStack } from "@chakra-ui/react";
import FeedPost from "./FeedPost";
import useGetFeedPosts from "../../hooks/useGetFeedPosts";
import useFollowUserFP from "../../hooks/useFollowUserFP";
import { firestore } from "../../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import useAuthStore from "../../store/authStore";


const FeedPostsOrig = () => {
  const authUser = useAuthStore((state) => state.user);
  const { isLoading, posts } = useGetFeedPosts();
  const { isUpdating, handleFollowUser } = useFollowUserFP();
  const [followStates, setFollowStates] = useState({});


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



  return (
    <Container py={6}   px={0} w={['100vw', null, '60vh']} >
      {isLoading &&
        [0, 1, 2].map((_, idx) => (
          <VStack key={idx} gap={4} alignItems={"flex-start"} mb={10}>
            <Flex gap='2'>
              <SkeletonCircle size='10' />
              <VStack gap={2} alignItems={"flex-start"}>
                <Skeleton height='10px' w={"200px"} />
                <Skeleton height='10px' w={"200px"} />
              </VStack>
            </Flex>
            <Skeleton w={"full"}>
              <Box h={"400px"}>contents wrapped</Box>
            </Skeleton>
          </VStack>
        ))}
      
      {!isLoading && posts.length > 0 && posts.map((post) => 
      <FeedPost key={post.id} post={post}  
      isFollowing={followStates[post.createdBy] || false}
      onFollowClick={() => handleFollowClick(post.createdBy)}
      
      />)}
      
      {!isLoading && posts.length === 0 && (
        <>
          <Text fontSize={"md"} color={"#eb7734"}>
            Start following people to see them in your feed.
          </Text>
        </>
      )}
    </Container>
  );
};

export default FeedPostsOrig;
