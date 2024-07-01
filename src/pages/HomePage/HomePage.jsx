import React, { useState, useEffect } from "react";
import { Box, Button, Container, Flex } from "@chakra-ui/react";
import FeedPostsOrig from "../../components/FeedPosts/FeedPostsOrig";
import SuggestedUsers from "../../components/SuggestedUsers/SuggestedUsers";
import { storeUserLocation } from "../../hooks/storeUserLocation";
import { queryNearbyUsers } from "../../hooks/queryNearbyUsers";
import authStore from "../../store/authStore";

const HomePage = () => {
  const userAuth = authStore((state) => state.user);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

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
      console.log('Nearby users:', nearbyUsers);
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
    <Container p={0} maxW={{ base: "100vw", md: "100vw" }} m={0}>
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
        <Button 
          onClick={() => setIsFetchingLocation(true)} 
          isLoading={isFetchingLocation} 
          loadingText="Fetching location..."
          colorScheme="teal"
          mt={4}
        >
          Get Current Location
        </Button>

        <Flex gap={20} px={0} mx={0} justifyContent="center" mt={4}>
          <Box flex={2} py={0} px={0} ml={{ base: "none", md: "20" }}>
            <FeedPostsOrig />
          </Box>
          <Box 
            px={0} 
            ml={0} 
            flex={3} 
            mr={{ base: "none", md: "20" }} 
            display={{ base: "none", lg: "block" }} 
            maxW={{ base: "20vw", lg: "20vw" }}
          >
            <SuggestedUsers />
          </Box>
        </Flex>
      </Box>
    </Container>
  );
};

export default HomePage;
