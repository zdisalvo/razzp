import React, { useEffect, useState, useCallback } from "react";
import { Box, Container, Flex, Skeleton, SkeletonCircle, Text, VStack, Heading, IconButton } from "@chakra-ui/react";
import FeedPostRank from "../../components/FeedPosts/FeedPostRank";
import useGetTop5Posts from "../../hooks/useGetTop5Posts";
import useFollowUserFP from "../../hooks/useFollowUserFP";
import { firestore } from "../../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import useAuthStore from "../../store/authStore";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBolt, faCommentDots } from "@fortawesome/free-solid-svg-icons";
import useIncomingReadCount from "../../hooks/useIncomingReadCount";
import useNewNotificationsCount from "../../hooks/useNewNotificationsCount";
import useGetUserProfileById from "../../hooks/useGetUserProfileById";
import useUnrequestFollow from "../../hooks/useUnrequestFollow";



const TopFivePosts = () => {
  const authUser = useAuthStore((state) => state.user);
  const { isLoading, posts } = useGetTop5Posts();
  const { isUpdating, handleFollowUser } = useFollowUserFP();
  const [followStates, setFollowStates] = useState({});
  const incomingReadCount = useIncomingReadCount(authUser.uid);
  const newNotificationsCount = useNewNotificationsCount();
  const navigate = useNavigate();
  const [requestedStates, setRequestedStates] = useState({});
  const [privateStates, setPrivateStates] = useState({});
  //const [userIsPrivate, setUserIsPrivate] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  //const [requested, setRequested ] = useState(false);
  const unrequestFollow = useUnrequestFollow();
  //const [pageLoaded, setPageLoaded] = useState(false);

  const handleMessagesClick = () => {
    navigate("/messages");
};

  const handleNotificationsClick = useCallback(() => {
    navigate("/notifications");
  }, [navigate]);


  // useEffect(() => {
  //   const fetchRequestedStates = async () => {
  //     const states = {};
  //     for (const post of posts) {
  //       try {
  //         const userDoc = doc(firestore, 'users', post.createdBy);
  //         const userSnap = await getDoc(userDoc);
  //         const userData = userSnap.data();
  //         states[post.createdBy] = userData.requested.includes(authUser.uid);
  //       } catch (error) {
  //         console.error(`Error fetching requested state for user ${post.createdBy}:`, error);
  //       }
  //     }
  //     setRequestedStates(states);
  //   };
  //   if (authUser && posts.length > 0) {
  //     fetchRequestedStates();
  //   }
  // }, [posts, authUser]);


  // useEffect(() => {
  //   const fetchFollowStates = async () => {
  //     const states = {};
  //     for (const post of posts) {
  //       try {
  //         const userDoc = doc(firestore, 'users', post.createdBy);
  //         const userSnap = await getDoc(userDoc);
  //         const userData = userSnap.data();
  //         states[post.createdBy] = userData.followers.includes(authUser.uid);
  //       } catch (error) {
  //         console.error(`Error fetching follow state for user ${post.createdBy}:`, error);
  //       }
  //     }
  //     setFollowStates(states);
  //   };

  //   if (authUser && posts.length > 0) {
  //     fetchFollowStates();
  //   }
  // }, [posts, authUser]);


  useEffect(() => {
    const fetchStates = async () => {
      const pStates = {};
      const fStates = {};
      const rStates = {};
      for (const post of posts) {
        try {
          const userDoc = doc(firestore, 'users', post.createdBy);
          const userSnap = await getDoc(userDoc);
          const userData = userSnap.data();
          pStates[post.createdBy] = userData.private || false;
          fStates[post.createdBy] = userData.followers.includes(authUser.uid);
          rStates[post.createdBy] = userData.requested.includes(authUser.uid);
        } catch (error) {
          console.error(`Error fetching follow state for user ${post.createdBy}:`, error);
        }
      }
      setPrivateStates(pStates);
      setFollowStates(fStates);
      setRequestedStates(rStates);
      //setPageLoaded(true);
    };

    if (authUser && posts.length > 0) {
      fetchStates();
    }
  }, [posts, authUser]);


  // const handleFollowClick = async (userId) => {
  //   const currentlyFollowing = followStates[userId];
  //   await handleFollowUser(userId, currentlyFollowing);
  //   setFollowStates(prevStates => ({
  //     ...prevStates,
  //     [userId]: !currentlyFollowing,
  //   }));
  // };

  const handleFollowClick = async (userId) => {

    // if (!pageLoaded)
    //   return;
    
    const currentlyFollowed = followStates[userId];
    const currentlyRequested = requestedStates[userId];
    const isPrivate = privateStates[userId];

    //console.log("t5posts");
    //console.log(isPrivate);

    try {
    //   const userDocRef = doc(firestore, "users", userId);
    //   const userDocSnap = await getDoc(userDocRef);

    //   if (userDocSnap.exists()) {
    //     const profileData = userDocSnap.data();
    //     setUserProfile(profileData);
    //   } else {
    //     console.error("User profile not found");
    //   }
    //   if (!userProfile)
    //     return;

      if (isPrivate) {
        //console.log("test1");
        if (currentlyRequested)
          unrequestFollow(userId);
        setRequestedStates((prevStates) => ({
          ...prevStates,
          [userId]: !currentlyRequested,
        }));
      } else {
        //console.log("test2");
        setFollowStates((prevStates) => ({
          ...prevStates,
          [userId]: !currentlyFollowed,
        }));
      }
      // console.log(userProfile);
      // console.log(userId);
      // console.log(currentlyFollowed);
      // console.log(!currentlyRequested);
      //await handleFollowUser(userProfile, userId, currentlyFollowed, !currentlyRequested);
      //console.log("test3");
    } catch (error) {
      console.error("Error updating follow status:", error);
    }
  };


  return (
    <Container py={6} px={0} w={['100vw', null, '60vh']} pb={{base: "10vh", md: "60px"}} pt={{base: "2vh", md: "5px"}} mt={{base: "10vh", md: "60px"}}>
      <Box position="sticky" top="0" bg="black" zIndex="1" py={4}>
      <Box position="fixed" top="0" right={{base: "0", md: "15vw"}} p={4} zIndex="docked" width="100%">
                <Flex justifyContent="flex-end" alignItems="center">
                
                <Box position="relative">
                <IconButton
                icon={<FontAwesomeIcon icon={faBolt} />}
                aria-label="Notifications"
                onClick={handleNotificationsClick}
                variant="outline"
                mr={2} // Adds horizontal margin between the icons
                position="relative"
                />
                {newNotificationsCount > 0 && (
                    <Box
                    position="absolute"
                    bottom={0}
                    right={0}
                    bg="red.500"
                    color="white"
                    borderRadius="full"
                    width="20px"
                    height="20px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontSize="12px"
                    fontWeight="bold"
                  >
                        {newNotificationsCount}
                    </Box>
                )}
                </Box>
            
                <Box position="relative">
                  <IconButton
                    icon={<FontAwesomeIcon icon={faCommentDots} />}
                    aria-label="Messages"
                    onClick={handleMessagesClick}
                    variant="outline"
                  />
                  {incomingReadCount > 0 && (
                    <Box
                      position="absolute"
                      bottom={0}
                      right={0}
                      bg="red.500"
                      color="white"
                      borderRadius="full"
                      width="20px"
                      height="20px"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      fontSize="12px"
                      fontWeight="bold"
                    >
                      {incomingReadCount}
                    </Box>
                  )}
                  </Box>
                
                </Flex>
            </Box>
        <Heading as="h1" size="lg" color="white" textAlign="center">
          Top 5 of the Week
        </Heading>
      </Box>
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
        <FeedPostRank key={post.id} post={post} rank={index + 1} 
          isFollowing={followStates[post.createdBy]}
          requested={requestedStates[post.createdBy]}
          isPrivate={privateStates[post.createdBy]}
            onFollowClick={() => handleFollowClick(post.createdBy)}
        />
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
