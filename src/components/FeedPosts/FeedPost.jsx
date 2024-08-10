import React, { forwardRef, useEffect, useRef } from "react";
import { Box, Container, Image } from "@chakra-ui/react";
import PostFooter from "./PostFooter";
import PostHeader from "./PostHeader";
import useGetUserProfileById from "../../hooks/useGetUserProfileById";

const FeedPost = forwardRef(({ post, isFollowing, requested, isPrivate, onFollowClick }, ref) => {
  const { userProfile } = useGetUserProfileById(post.createdBy);
  const videoRef = useRef(null);

  useEffect(() => {
    const videoElement = videoRef.current;

    if (videoElement) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            videoElement.play();
          } else {
            videoElement.pause();
          }
        },
        { threshold: 0.1 } // Adjust this value to control how much of the video needs to be visible to trigger playback
      );

      observer.observe(videoElement);

      return () => {
        observer.unobserve(videoElement);
      };
    }
  }, []);

  return (
    <div ref={ref}>
      <Container
        //h={{ base: "auto", md: "70%" }}
        maxW={{ base: "100vw", md: "container.md" }}
        //maxW="container.md"
        marginBottom={{ base: "7vh", md: "30px" }}
        maxH={{ base: "auto", md: "80%" }}
        px={0}
        mx={0}
      >
      <PostHeader post={post} creatorProfile={userProfile} 
      initialIsFollowing={isFollowing}
      initialIsRequested={requested}
      isPrivate={isPrivate}
      onFollowClick={onFollowClick}
      />
      <Box my={2} borderRadius={4} overflow={"hidden"} px={0} maxHeight="450px" objectFit="cover" height="auto" width="100%" display="flex" 
  justifyContent="center" 
  alignItems="center">
      {(!post.mediaType || post.mediaType.startsWith("image/")) && (
        <Image src={post.imageURL} alt={"FEED POST IMG"} width="100%" objectFit="cover" maxHeight="450px" height="auto"/>
      )}
      {(post.mediaType && post.mediaType.startsWith("video/")) && (
        <Box justifyContent="center" alignItems="center" m={0} p={0}>
        <video src={post.imageURL} 
        ref={videoRef} 
        controls 
        //autoPlay 
        muted 
        loop
        alt={"FEED POST VIDEO"} 
        
        />
        </Box>
      )}
      </Box>
      <PostFooter post={post} creatorProfile={userProfile} />
      </Container>
    </div>
  );
});

export default FeedPost;
