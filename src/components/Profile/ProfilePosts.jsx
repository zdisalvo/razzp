import { Box, Flex, Grid, Skeleton, Text, VStack } from "@chakra-ui/react";
import ProfilePost from "./ProfilePost";
import useGetUserPosts from "../../hooks/useGetUserPosts";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const ProfilePosts = ({ username }) => {
  const { isLoading, posts: fetchedPosts } = useGetUserPosts(username);
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();
  //const { userPosts, setUserPosts } = useState({});

  useEffect(() => {
    if (!isLoading && fetchedPosts.length > 0) {
      setPosts(fetchedPosts); // Store fetched posts in local state
    }
  }, [isLoading, fetchedPosts]);

  const handlePostClick = (postId) => {
    navigate(`/${username}/feed`, { state: { postId } });
  };

  const noPostsFound = !isLoading && posts.length === 0;
  if (noPostsFound) return <NoPostsFound />;

  return (
    <Grid
      templateColumns={{
        base: "repeat(3, 1fr)",
        md: "repeat(3, 1fr)",
      }}
      gap={1}
      columnGap={1}
      pb={{ base: "15vh", md: "60px" }}
    >
      {/* {isLoading &&
        [0, 1, 2].map((_, idx) => (
          <VStack key={idx} alignItems={"flex-start"} gap={4}>
            <Skeleton w={"full"}>
              <Box h='300px'>contents wrapped</Box>
            </Skeleton>
          </VStack>
        ))} */}

      {
        posts.map((post) => (
          <ProfilePost
            post={post}
            key={post.id}
            onClick={() => handlePostClick(post.id)}
          />
        ))}
    </Grid>
  );
};

export default ProfilePosts;

const NoPostsFound = () => {
  return (
    <Flex flexDir='column' textAlign={"center"} mx={"auto"} mt={10}>
      {/* <Text fontSize={"2xl"}>No Posts Found🤔</Text> */}
    </Flex>
  );
};
