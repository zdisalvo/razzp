import React, { forwardRef, useEffect, useState, useRef } from "react";
import { Box, Container, Image, Button, IconButton, useDisclosure, Skeleton, Flex } from "@chakra-ui/react";
import PostFooter from "./PostFooter";
import PostHeader from "./PostHeader";
import useGetUserProfileById from "../../hooks/useGetUserProfileById";
import { FaVolumeUp, FaVolumeMute } from "react-icons/fa";
import BlackLoadingPage from "../Loading/BlackLoadingPage";
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { firestore } from '../../firebase/firebase';
import useAuthStore from "../../store/authStore";


const FeedPost = forwardRef(({ post, isFollowing, requested, isPrivate, onFollowClick, isLoaded, loading, isScrolled }, ref) => {
  const authUser = useAuthStore((state) => state.user);
  const { userProfile } = useGetUserProfileById(post.createdBy);
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);
  const { isOpen, onToggle } = useDisclosure(); // To handle video click
  //const proxyURL = "https://radiant-retreat-87579-dcc979ba57be.herokuapp.com?url=";
  //const imageSrc = !post.imageURL.startsWith("https://firebase") ? `${proxyURL}${encodeURIComponent(post.imageURL)}` : post.imageURL;
  const [isPurchased, setIsPurchased] = useState(post.purchased && authUser && post.purchased.includes(authUser?.uid));
  const [purchasedUsers, setPurchasedUsers] = useState(post.purchased || null); // Store purchased users
  const [isSubscribedToCreator, setIsSubscribedToCreator] = useState(false);
	const [isInitialized, setIsInitialized] = useState(false);
  const [ownProfile, setOwnProfile] = useState(false);
	
	useEffect (() => {
		if (!authUser || !userProfile || isInitialized)
			return;

		  const isSubscribed = authUser.subscriptions && authUser.subscriptions.some((subscription) => {
			const isValidSubscription = subscription.creatorId === userProfile.uid;
			if (!isValidSubscription)
				return false;
			else
				 return subscription.activeSince.seconds * 1000 < post.createdAt; // Check if expirationDate is in the future
			//console.log(isExpirationValid);
			
			//return isValidSubscription && isExpirationValid
		  });
		  
		  setIsSubscribedToCreator(isSubscribed);
      setOwnProfile(authUser.uid === userProfile.uid);

		setIsInitialized(true);
	})

  useEffect(() => {
    const postRef = doc(firestore, 'posts', post.id);
    const unsubscribe = onSnapshot(postRef, (snapshot) => {
        if (snapshot.exists()) {
            const updatedPost = snapshot.data();
            setPurchasedUsers(updatedPost.purchased);
            setIsPurchased(authUser && updatedPost.purchased && updatedPost.purchased.includes(authUser?.uid));
        }
    });

      return () => unsubscribe(); // Clean up the listener
  }, [post.id, authUser?.uid]);

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
      {((!post.mediaType) || (post.mediaType.startsWith("image/")) && (!post.paid || post.paid && isPurchased || post.paid && isSubscribedToCreator || post.paid && ownProfile)) && (
        
        <Image src={post.imageURL} alt={"FEED POST IMG"} width="100%" objectFit="cover" maxHeight="450px" height="auto"
        style={{ pointerEvents: 'none', userSelect: 'none' }}
          onTouchStart={(e) => e.preventDefault()} 
          onContextMenu={(e) => e.preventDefault()} 
          onTouchMove={(e) => e.preventDefault()} 
        />
        
      )}
      {(!post.mediaType || post.mediaType.startsWith("image/")) && (post.paid && !isPurchased && !isSubscribedToCreator && !ownProfile) && (
        
        <Image src={post.imageURL} style={{ filter: 'blur(11px)', pointerEvents: 'none', userSelect: 'none' }} alt={"FEED POST IMG"} width="100%" objectFit="cover" maxHeight="450px" height="auto"
          onTouchStart={(e) => e.preventDefault()} 
          onContextMenu={(e) => e.preventDefault()} 
          onTouchMove={(e) => e.preventDefault()} 
        />
        
      )}
      {(post.mediaType && post.mediaType.startsWith("video/")) && (!post.paid || post.paid && isPurchased || post.paid && isSubscribedToCreator || post.paid && ownProfile) && (
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
        preload="metadata"
        alt={"FEED POST VIDEO"} 
        onClick={toggleMute}
        onTouchStart={(e) => e.preventDefault()} 
        onContextMenu={(e) => e.preventDefault()} 
        //style={{ width: "100%", height: "450px", objectFit: "cover" }}
        />
        
        </Box>
      )}
      {(post.mediaType && post.mediaType.startsWith("video/")) && post.paid && !isPurchased && !isSubscribedToCreator && !ownProfile && (
        <Box justifyContent="center" alignItems="center" m={0} p={0}
        //onClick={handleVideoClick}
        cursor="pointer"
        >
        <video src={post.imageURL} 
        style={{ filter: 'blur(15px)' }}
        ref={videoRef} 
        //controls 
        playsInline
        //autoPlay 
        muted={isMuted} 
        loop
        //preload={isLoaded ? "auto" : "none"}
        preload="metadata"
        alt={"FEED POST VIDEO"} 
        onClick={toggleMute}
        onTouchStart={(e) => e.preventDefault()} 
        onContextMenu={(e) => e.preventDefault()} 
        //style={{ width: "100%", height: "450px", objectFit: "cover" }}
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
