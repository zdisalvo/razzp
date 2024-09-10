import React, { useEffect, useRef, useState } from "react";
import { Box, Container, Flex, Skeleton, SkeletonCircle, Text, VStack, Link } from "@chakra-ui/react";
import FeedPostUser from "./FeedPostUser";
import useGetUserFeed from "../../hooks/useGetUserFeed";
import { useLocation, useParams } from "react-router-dom";
import useGetUserProfileByUsername from "../../hooks/useGetUserProfileByUsername";
import useCheckBlockedUser from "../../hooks/useCheckBlockedUser";
import { Link as RouterLink } from "react-router-dom";
import useFollowUserFP from "../../hooks/useFollowUserFP";
import useAuthStore from "../../store/authStore";
import { firestore, storage } from "../../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import useUnrequestFollow from "../../hooks/useUnrequestFollow";
import useIntersectionObserver from "../../hooks/useIntersectionObserver";
import LoadingPage from "../Loading/LoadingPage";

const UserFeed = () => {
  const authUser = useAuthStore((state) => state.user)
  const { username } = useParams();
  const location = useLocation();
  const postId = location.state?.postId;
  const { isLoading, posts } = useGetUserFeed(username);
  const postRefs = useRef({});
  const [shouldScroll, setShouldScroll] = useState(true);
  const [followStates, setFollowStates] = useState({});
  const [requestedStates, setRequestedStates] = useState({});
  const [privateStates, setPrivateStates] = useState({});
  const { isLoading: userProfileLoading, userProfile } = useGetUserProfileByUsername(username);
  const { isUpdating, handleFollowUser } = useFollowUserFP();
  const isBlocked = useCheckBlockedUser({ userProfile });
  const unrequestFollow = useUnrequestFollow();
  const [loadedPosts, setLoadedPosts] = useState({});
  const [isInitialized, setIsInitialized] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const userNotFound = !isLoading && !userProfile;

  //console.log(isLoading);

  useEffect(() => {
    //console.log("Updated loadedPosts:", loadedPosts);
    // console.log("isLoading: " + isLoading);
    //   console.log("should scroll: " + shouldScroll);
    //   console.log("is initialized: " + isInitialized);
    //   console.log("is scrolled: " + isScrolled);
  }, [loadedPosts]);

  const addElementsToObserve = useIntersectionObserver(
    (postElement) => {
      const postId = postElement.getAttribute("data-post-id");
      const index = posts.findIndex((post) => post.id === postId);
      //console.log(index);
      if (index !== -1 ) {
              const start = Math.max(0, index - 2);
              const end = Math.min(posts.length, index + 2); // 5 before and 5 after, including the current post
      
              const surroundingPosts = posts.slice(start, end);
              setLoadedPosts((prev) => {
                const updatedPosts = { ...prev };
                surroundingPosts.forEach((post) => {
                  updatedPosts[post.id] = true;
                });
                return updatedPosts;
              });
            }
      //setLoadedPosts((prev) => ({ ...prev, [postId]: true }));
    },
    //{ threshold: 0.99 }
    { threshold: !isScrolled ? 0.99 : .4 }
  );


  useEffect(() => {
    if (!isLoading && postId && postRefs.current[postId] && shouldScroll) {
      
      setIsInitialized(true);
      setTimeout(() => {
        postRefs.current[postId].scrollIntoView({ block: 'center' });
      }, 400);
      // setTimeout(() => {
      //   postRefs.current[postId].scrollIntoView({ block: 'start' });
      // }, 150);
      
      
      setIsScrolled(true);
      setTimeout(() => {
        postRefs.current[postId].scrollIntoView({ block: 'center' });
      }, 100); //200
      //setShouldScroll(false);

      setTimeout(() => {
        setShouldScroll(false);
      }, 100);

      

      //postRefs.current[postId].scrollIntoView({ block: 'start' });

      // setTimeout(() => {
      //   setIsScrolled(true);
      // }, 100);
      
      
    }
  }, [isLoading, postId, posts]);

  // useEffect(() => {
  //   if (!isLoading && postId && postRefs.current[postId] && shouldScroll) {
  //     setIsInitialized(true);
  //     setTimeout(() => {
  //       postRefs.current[postId].scrollIntoView();
  //     }, 500);
  //     setIsScrolled(true);
  //     setShouldScroll(false);
      
  //   }
  // }, [isLoading, postId, posts]);


  useEffect(() => {
    if (posts.length > 0) {
      const elementsToObserve = posts.map((post) => postRefs.current[post.id]);
      addElementsToObserve(elementsToObserve);
    }
  }, [posts]); // 'addElementsToObserve' is now stable and won't cause unnecessary re-renders




  // useEffect(() => {
  //   if (posts.length > 0) {
  //     const index = posts.findIndex((post) => post.id === postId);
  //     if (index !== -1) {
  //       const start = Math.max(0, index - 5);
  //       const end = Math.min(posts.length, index + 6); // 5 before and 5 after, including the current post

  //       const surroundingPosts = posts.slice(start, end);
  //       setLoadedPosts(surroundingPosts);
  //     }
  //   }
  // }, [posts, postId]);

  // useEffect(() => {
  //   if (posts.length > 0) {
  //     const index = posts.findIndex((post) => post.id === postId);
  //     if (index !== -1) {
  //       const start = Math.max(0, index - 5);
  //       const end = Math.min(posts.length, index + 6); // 5 before and 5 after, including the current post

  //       const surroundingPosts = posts.slice(start, end);
  //       setLoadedPosts((prev) => ({
  //         ...prev,
  //         ...surroundingPosts.reduce((acc, post) => ({ ...acc, [post.id]: false }), {}),
  //       }));
  //     }
  //   }
  // }, [posts, postId]);


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



  //   useEffect(() => {
  //     const fetchRequestedStates = async () => {
  //       const states = {};
  //       for (const post of posts) {
  //         try {
  //           const userDoc = doc(firestore, 'users', post.createdBy);
  //           const userSnap = await getDoc(userDoc);
  //           const userData = userSnap.data();
  //           states[post.createdBy] = userData.requested.includes(authUser.uid);
  //         } catch (error) {
  //           console.error(`Error fetching requested state for user ${post.createdBy}:`, error);
  //         }
  //       }
  //       setRequestedStates(states);
  //     };

  //   if (authUser && posts.length > 0) {
  //     fetchRequestedStates();
  //   }
  // }, [posts, authUser]);


  // useEffect(() => {
  //   const fetchPrivateStates = async () => {
  //     const states = {};
  //     for (const post of posts) {
  //       try {
  //         const userDoc = doc(firestore, 'users', post.createdBy);
  //         const userSnap = await getDoc(userDoc);
  //         const userData = userSnap.data();
  //         states[post.createdBy] = userData.private || false;
  //       } catch (error) {
  //         console.error(`Error fetching follow state for user ${post.createdBy}:`, error);
  //       }
  //     }
  //     setPrivateStates(states);
  //   };

  //   if (authUser && posts.length > 0) {
  //     fetchPrivateStates();
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
          fStates[post.createdBy] = userData.followers.includes(authUser.uid) || false;
          rStates[post.createdBy] = userData.requested.includes(authUser.uid) || false;
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


  const handleFollowClick = async (userId) => {
    
    const currentlyFollowed = followStates[userId];
    const currentlyRequested = requestedStates[userId];
    const isPrivate = privateStates[userId];



    try {
      // const userDocRef = doc(firestore, "users", userId);
      // const userDocSnap = await getDoc(userDocRef);

      // if (userDocSnap.exists()) {
      //   const profileData = userDocSnap.data();
      //   setUserProfile(profileData);
      // } else {
      //   console.error("User profile not found");
      // }

      if (isPrivate) {
        if (currentlyRequested)
          unrequestFollow(userId);
        setRequestedStates((prevStates) => ({
          ...prevStates,
          [userId]: !currentlyRequested,
        }));
      } else {
        setFollowStates((prevStates) => ({
          ...prevStates,
          [userId]: !currentlyFollowed,
        }));
      }

      //await handleFollowUser(userProfile, userId, currentlyFollowed, !currentlyRequested);
    } catch (error) {
      console.error("Error updating follow status:", error);
    }
  };

  if (userNotFound || isBlocked) return <UserNotFound />;

  return (
    <Container py={0}   px={0} w={['100vw', null, '60vh']} >
      {/* {isLoading &&
        [0, 1, 2].map((_, idx) => (
          <VStack key={idx} gap={0} alignItems={"flex-start"} mb={{ base: "13vh", md: "60px" }}>
            <Flex gap="0">
              <SkeletonCircle size="10" />
              <VStack gap={0} alignItems={"flex-start"}>
                <Skeleton height="10px" w={{ base: "100vw", md: "200px" }} />
                <Skeleton height="10px" w={{ base: "100vw", md: "200px" }} />
              </VStack>
            </Flex>
            <Skeleton w={"full"}>
              <Box h={"400px"}>contents wrapped</Box>
            </Skeleton>
          </VStack>
        ))} */}
        {isLoading && (
            <Flex flexDir='column' h='100vh' alignItems='center' justifyContent='center'>
			{/* <Spinner size='xl' /> */}
            <LoadingPage />
		    </Flex>
        )}

      {posts.length > 0 &&
        posts.map((post) => (
          <FeedPostUser
            key={post.id}
            post={post}
            ref={(el) => (postRefs.current[post.id] = el)}
            isFollowing={followStates[post.createdBy] || false}
            requested={requestedStates[post.createdBy] || false}
            isPrivate={privateStates[post.createdBy] || false}
            onFollowClick={() => handleFollowClick(post.createdBy)}
            isLoaded={!!loadedPosts[post.id] && isInitialized && isScrolled} // Pass loaded state to FeedPost
            loading={isLoading}
            isScrolled={isScrolled}
            shouldScroll={shouldScroll}
          />
        ))
      }

      {isLoading && shouldScroll && <div style={{ visibility: "hidden", height: "450px" }} ref={(el) => el && el.scrollIntoView({block: 'start'})}></div>}
    </Container>
  );
};

const UserNotFound = () => {
  return (
    <Flex flexDir="column" textAlign="center" mx="auto">
      <Text fontSize="2xl">User Not Found</Text>
      <Link as={RouterLink} to="/" color="blue.500" w="max-content" mx="auto">
        Go home
      </Link>
    </Flex>
  );
};

export default UserFeed;
