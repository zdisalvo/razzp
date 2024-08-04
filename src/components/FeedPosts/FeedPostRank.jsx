import React, { forwardRef } from "react";
import { Box, Container, Image, Text } from "@chakra-ui/react";
import PostFooter from "./PostFooter";
import PostHeader from "./PostHeader";
import useGetUserProfileById from "../../hooks/useGetUserProfileById";

const FeedPost = forwardRef(({ post, rank, isFollowing, requested, isPrivate, onFollowClick }, ref) => {
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
        <PostHeader post={post} creatorProfile={userProfile} 
        initialIsFollowing={isFollowing}
        initialIsRequested={requested}
        isPrivate={isPrivate}
        onFollowClick={onFollowClick}
        />
        
        <Box position="relative" borderRadius={4} overflow="hidden">
          {/* Ranking Badge */}
          {rank && (
             <Box position="absolute" display="inline-block" bottom={1} // Adjust this value to move the text up or down
             right={1}>
             <Image
                 src="/trophy-gold.png" // Your icon
                 alt="Trophy Icon"
                 width="90px" // Adjust the size as needed
                 height="auto" // Maintain aspect ratio
             />
             <Box
                 position="absolute"
                 bottom="73px" // Adjust this value to move the text up or down
                 right="31px" // Adjust this value to move the text left or right
                 color="d4af37" // Firetruck red color
                 //color="red"
                 fontWeight="bold"
                 fontSize="xl"
                 //fontStyle="italic" // Italicize the text
                 textAlign="center"
                 px={2} // Add some padding for better visibility
                 //bg="rgba(0, 0, 0, 0.5)" // Optional: Add a semi-transparent background
                 //borderRadius="md" // Optional: Rounded corners for background
                 whiteSpace="nowrap" // Prevent text wrapping
                 sx={{
                  // Custom CSS for text shadow
                  textShadow: "2px 2px 4px rgba(212, 175, 55, 0.6)" // Gold color shadow
              }}
             >
                 <Text display="inline" verticalAlign="middle">
                     {rank}
                 </Text>
             </Box>
         </Box>
          )}
          
          <Image src={post.imageURL} alt={"FEED POST IMG"} width="100%" objectFit="cover" maxHeight="450px" height="auto" />
        </Box>

        <PostFooter post={post} creatorProfile={userProfile} />
      </Container>
    </div>
  );
});

export default FeedPost;
