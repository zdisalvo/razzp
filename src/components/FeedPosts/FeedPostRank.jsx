import React, { forwardRef, useEffect, useState, useRef } from "react";
import { Box, Container, Image, Text } from "@chakra-ui/react";
import PostFooter from "./PostFooter";
import PostHeader from "./PostHeader";
import useGetUserProfileById from "../../hooks/useGetUserProfileById";
import useAuthStore from "../../store/authStore";
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { firestore } from '../../firebase/firebase';

const FeedPost = forwardRef(({ post, rank, isFollowing, requested, isPrivate, onFollowClick }, ref) => {
  const authUser = useAuthStore((state) => state.user);
  const { userProfile } = useGetUserProfileById(post.createdBy);
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);
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

  useEffect(() => {
    const videoElement = videoRef.current;

    if (videoElement) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            // Play the video when it is in view
            videoElement.play();
          } else {
            if (entry.intersectionRatio > 0 && entry.intersectionRatio < 0.2) {
              // Pause the video if it is partially visible but less than 20%
              videoElement.pause();
            } else if (entry.intersectionRatio === 0) {
              // Restart the video when it is completely out of view
              videoElement.pause();
              videoElement.currentTime = 0;
            }
          }
        },
        { threshold: [0.2] } // Monitor transitions between 0 (out of view) and 0.1 (barely visible)
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
             right={1} zIndex={2}>
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
          
      <Box my={2} borderRadius={4} overflow={"hidden"} px={0} maxHeight="500px" objectFit="cover" height="auto" width="100%" display="flex" 
      justifyContent="center" 
      alignItems="center">
      {((!post.mediaType) || (post.mediaType.startsWith("image/")) && (!post.paid || post.paid && isPurchased || post.paid && isSubscribedToCreator || post.paid && ownProfile)) && (
        
        <Image src={post.imageURL} alt={"FEED POST IMG"} width="100%" objectFit="cover" maxHeight="500px" height="auto"
        style={{ pointerEvents: 'none', userSelect: 'none' }}
          onTouchStart={(e) => e.preventDefault()} 
          onContextMenu={(e) => e.preventDefault()} 
          onTouchMove={(e) => e.preventDefault()} 
        />
        
      )}
      {(!post.mediaType || post.mediaType.startsWith("image/")) && post.paid && !isPurchased && !isSubscribedToCreator && !ownProfile && (
        
        <Image src={post.imageURL} style={{ filter: 'blur(22px)', pointerEvents: 'none', userSelect: 'none' }} alt={"FEED POST IMG"} width="100%" objectFit="cover" maxHeight="500px" height="auto"
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
        style={{ filter: 'blur(30px)' }}
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
        </Box>

        <PostFooter post={post} creatorProfile={userProfile} />
      </Container>
    </div>
  );
});

export default FeedPost;
