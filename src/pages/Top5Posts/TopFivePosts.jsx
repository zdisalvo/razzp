import { Box, Container, Flex, Skeleton, SkeletonCircle, Text, VStack } from "@chakra-ui/react";
import FeedPostRank from "../../components/FeedPosts/FeedPostRank";
import useGetTop5Posts from "../../hooks/useGetTop5Posts";

const TopFivePosts = () => {
  const { isLoading, posts } = useGetTop5Posts();

  return (
    <Container py={6} px={0} w={['100vw', null, '60vh']}>
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

      {!isLoading && posts.length > 0 && posts.map((post, index) => (
        <FeedPostRank key={post.id} post={post} rank={index + 1} />
      ))}

      {!isLoading && posts.length === 0 && (
        <Text fontSize={"md"} color={"red.400"}>
          No ranked posts available.
        </Text>
      )}
    </Container>
  );
};

export default TopFivePosts;
