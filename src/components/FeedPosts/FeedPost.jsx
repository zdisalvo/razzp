import React, { forwardRef, useEffect, useState, useRef } from "react";
import { Box, Container, Image, Button, IconButton, useDisclosure, Skeleton, Flex } from "@chakra-ui/react";
import PostFooter from "./PostFooter";
import PostHeader from "./PostHeader";
import useGetUserProfileById from "../../hooks/useGetUserProfileById";
import { FaVolumeUp, FaVolumeMute } from "react-icons/fa";
import BlackLoadingPage from "../Loading/BlackLoadingPage";

const FeedPost = forwardRef(({ post, isFollowing, requested, isPrivate, onFollowClick, isLoaded, loading, isScrolled }, ref) => {
  const { userProfile } = useGetUserProfileById(post.createdBy);
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);
  const { isOpen, onToggle } = useDisclosure(); // To handle video click
  //const proxyURL = "https://radiant-retreat-87579-dcc979ba57be.herokuapp.com?url=";
  //const imageSrc = !post.imageURL.startsWith("https://firebase") ? `${proxyURL}${encodeURIComponent(post.imageURL)}` : post.imageURL;

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const handleVideoClick = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
    onToggle(); // Toggle controls visibility
  };

  // useEffect(() => {
  //   // Programmatically load the video when the component mounts
  //   if (videoRef.current) {
  //     videoRef.current.load();
  //   }
  // }, []);

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
        { threshold: 0.1 } // Adjust the threshold to your preference
      );
  
      observer.observe(videoElement);
  
      return () => {
        observer.unobserve(videoElement);
      };
    }
  }, [isLoaded]); // Add isLoaded as a dependency
  

  return (
    <div ref={ref} >
      <Container
        //h={{ base: "auto", md: "70%" }}
        maxW={{ base: "100vw", md: "container.md" }}
        //maxW="container.md"
        marginBottom={{ base: "7vh", md: "30px" }}
        //
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
        <Box justifyContent="center" alignItems="center" m={0} p={0}
        //onClick={handleVideoClick}
        cursor="pointer"
        
        >
        <video src={post.imageURL} 
        ref={videoRef} 
        //controls 
        playsInline
        //autoPlay 
        muted={isMuted} 
        loop
        //preload={isLoaded ? "auto" : "none"}
        //preload="none"
        alt={"FEED POST VIDEO"} 
        onClick={toggleMute}
        //style={{ width: "100%", height: "auto" }}
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
