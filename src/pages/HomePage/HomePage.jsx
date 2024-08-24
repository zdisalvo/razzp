import React, { useState, useEffect, useCallback } from "react";
import { Box, Button, Container, Flex, Image, IconButton, Badge } from "@chakra-ui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBolt, faCommentDots, faTrophy } from "@fortawesome/free-solid-svg-icons";
import FeedPostsOrig from "../../components/FeedPosts/FeedPostsOrig";
import SuggestedUsers from "../../components/SuggestedUsers/SuggestedUsers";
import { storeUserLocation } from "../../hooks/storeUserLocation";
import { queryNearbyUsers } from "../../hooks/queryNearbyUsers";
import authStore from "../../store/authStore";
import { useNavigate } from "react-router-dom";
import useIncomingReadCount from "../../hooks/useIncomingReadCount";
import useNewNotificationsCount from "../../hooks/useNewNotificationsCount";
import useGetSparkProfileById from "../../hooks/useGetSparkProfileById";
import SuggestedUsersBanner from "../../components/SuggestedUsers/SuggestedUsersBanner";
import Meta from "../../components/SEO/Meta";

const HomePage = () => {
  const userAuth = authStore((state) => state.user);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const navigate = useNavigate();
  const incomingReadCount = useIncomingReadCount(userAuth?.uid);
  const newNotificationsCount = useNewNotificationsCount();
  const { isLoading: profileLoading, sparkProfile } = useGetSparkProfileById(userAuth?.uid);


  const handleTop5Click = () => {
    navigate("/top5");
  };


    const handleMessagesClick = () => {
        navigate("/messages");
    };

    const handleNotificationsClick = useCallback(() => {
      navigate("/notifications");
    }, [navigate]);

  useEffect(() => {
    if (isFetchingLocation) {
      getCurrentLocation();
    }
  }, [isFetchingLocation]);

  // Function to update user location and find nearby users
  const updateUserLocationAndFindNearbyUsers = async (userId, latitude, longitude, radiusInMeters) => {
    try {
      // Store user location with geohash
      await storeUserLocation(userId, latitude, longitude);

      // Query nearby users
      const nearbyUsers = await queryNearbyUsers(latitude, longitude, radiusInMeters);
      //console.log('Nearby users:', nearbyUsers);
      // Handle nearbyUsers data as needed
    } catch (error) {
      console.error('Error updating location or querying nearby users:', error);
      // Handle error appropriately
    }
  };

  // Function to get current user's location using Geolocation API
  const getCurrentLocation = () => {
    if (navigator.geolocation && userAuth) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // Example: Update user location and find nearby users
          updateUserLocationAndFindNearbyUsers(userAuth.uid, latitude, longitude, 20000); // 5000 meters radius
          setIsFetchingLocation(false); // Stop fetching location after getting it
        },
        (error) => {
          console.error('Error getting current location:', error);
          setIsFetchingLocation(false); // Stop fetching location in case of error
          // Handle error appropriately
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
      setIsFetchingLocation(false); // Stop fetching location if geolocation is not supported
      // Handle geolocation not supported
    }
  };

  return (
    <div>
      <Meta title="Razzp - Social Networking Reinvented" 
      keywords="Social network, Social media platform, Content creation, Online community, Connect with local friends, Share updates, Search by location, Messaging, Social media, Profile creation, Social sharing, Friend network, Social interaction, Content sharing, User engagement, Social connections, Follow and unfollow, Online profiles, News feed, Social networking site" 
      description="The ultimate platform for creating and sharing content. Connect with local users, increase your popularity, and maximize your brand on Razzp. No download required." 
      ogTitle="Razzp - Social Networking Reinvented"
      ogDescription="The ultimate platform for creating and sharing content. Connect with local users, increase your popularity, and maximize your brand on Razzp. No download required."
      ogImage="https://razz-p.web.app/razzp-logo-matte.png"
    
      />
    <Container p={0} maxW={{ base: "100vw", md: "100vw" }}  pb={{base: "5vh", md: "30px"}} pt={{base: "0px", md: "20px"}} m={0}>
      <Box position="fixed" top="0" right={{base: "0", md: "15vw"}} p={4} zIndex="docked" width="100%">
                <Flex justifyContent="flex-end" alignItems="center">
                <IconButton
                  icon={<FontAwesomeIcon icon={faTrophy} />}
                  aria-label="Top 5"
                  onClick={handleTop5Click}
                  variant="outline"
                  mx={2} // Adds horizontal margin between the icons
                />
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
                  {/* <Box>
                <Image 
                  src="/blue-crown-small.png"
                  aria-label="Top 5"
                  width="50px" 
                  //minWidth="45px"
                  //maxheight="15px"
                  height="auto"
                  //variant="outline"
                  mx={2} 
                />
                </Box>
                <Box onClick={handleNotificationsClick} cursor="pointer" >
        
                <Image 
                  src="/notifications-small.png"
                  aria-label="Top 5"
                  width="40px" 
                  //variant="outline"
                  mx={2} 
                />
                </Box>
                <Box onClick={handleMessagesClick} cursor="pointer">
                <Image 
                  src="/messages-small.png"
                  aria-label="Top 5"
                  width="40px" 
                  //variant="outline"
                  mx={2} 
                />
                </Box> */}
                </Flex>
            </Box>
      <Box
        px={0}
        mx="auto"
        height={{ base: "100vh", md: "auto" }}
        width={{ base: "100vw", md: "65vw" }}
        bottom={{ base: "10vh", md: "60px" }}
        left={0}
        transform="none"
        display="flex"
        flexDirection="column"
        justifyContent={{ base: "none", md: "center" }}
        alignItems="center"
      >
        <SuggestedUsersBanner />
        {/* <Button 
          onClick={() => setIsFetchingLocation(true)} 
          isLoading={isFetchingLocation} 
          loadingText="Fetching location..."
          colorScheme="teal"
          mt={4}
        >
          Get Current Location to find matches near you
        </Button> */}

        <Flex gap={20} px={0} mx={0} justifyContent="center" mt={0}>
          <Box flex={2} py={0} pb={{base: "6vh", md: "60px"}} px={0} ml={{ base: "none", md: "none" }}>
            <FeedPostsOrig />
          </Box>
          {/* <Box 
            px={0} 
            ml={0} 
            flex={3} 
            mr={{ base: "none", md: "20" }} 
            display={{ base: "none", lg: "block" }} 
            maxW={{ base: "20vw", lg: "20vw" }}
          >
            <SuggestedUsers />
          </Box> */}
        </Flex>
      </Box>
    </Container>
    </div>
  );
};

export default HomePage;
