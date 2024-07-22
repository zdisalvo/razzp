import React, { forwardRef } from "react";
import { Box, Container, Image } from "@chakra-ui/react";
import PostFooter from "./PostFooter";
import PostHeader from "./PostHeader";
import useGetUserProfileById from "../../hooks/useGetUserProfileById";

const FeedPost = forwardRef(({ post, rank }, ref) => {
  const { userProfile } = useGetUserProfileById(post.createdBy);

  return (
    <div ref={ref}>
      <Container
        maxW={{ base: "100vw", md: "container.md" }}
        marginBottom={{ base: "7vh", md: "30px" }}
        maxH={{ base: "auto", md: "80%" }}
        px={0}
        mx={0}
        position="relative" // Ensures the ranking badge is positioned correctly
      >
        <PostHeader post={post} creatorProfile={userProfile} />
        
        <Box position="relative" borderRadius={4} overflow="hidden">
          {/* Ranking Badge */}
          {rank && (
            <Box
              position="absolute"
              bottom={3} // Adjust this value to move the badge up or down
              right={3}
              color="#eb7734" // Firetruck red color
              fontWeight="bold"
              fontSize="3xl"
              fontStyle="italic" // Italicize the text
              textAlign="center"
              px={2} // Optional: Add some padding for better visibility
            >
              #{rank}
            </Box>
          )}
          
          <Image src={post.imageURL} alt={"FEED POST IMG"} width="100%" height="auto" />
        </Box>

        <PostFooter post={post} creatorProfile={userProfile} />
      </Container>
    </div>
  );
});

export default FeedPost;
