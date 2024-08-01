import {
    Box,
    FormControl,
    Input,
    VStack,
    Spinner,
    Text,
    Container,
    Flex,
    IconButton,
    Heading,
    Switch
  } from "@chakra-ui/react";
  import { useState, useEffect } from "react";
  import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
  import { faCaretLeft } from "@fortawesome/free-solid-svg-icons";
  import useSearchNearbyUsers from "../../hooks/useSearchNearbyUsers";
  import useSearchUser from "../../hooks/useSearchUser";
  import SuggestedUser from "../../components/SuggestedUsers/SuggestedUser";
  import { debounce } from "lodash";
  import { useNavigate } from "react-router-dom";
  import useAuthStore from "../../store/authStore";
  import { storeUserLocation } from "../../hooks/storeUserLocation";
  import { unstoreUserLocation } from "../../hooks/unstoreUserLocation";
  
  const SearchPage = () => {
    const authUser = useAuthStore((state) => state.user);
    const { users: nearbyUsers, isLoading: isLoadingNearby, getUserProfiles: getNearbyUserProfiles } = useSearchNearbyUsers();
    const { users: searchedUsers, isLoading: isLoadingSearch, getUserProfiles: getUserProfilesSearch } = useSearchUser();
    const [searchQuery, setSearchQuery] = useState("");
    const [isToggled, setIsToggled] = useState(false);
    const [userLocation, setUserLocation] = useState({ latitude: null, longitude: null });
    const navigate = useNavigate(); 
  
    const handleGoBack = () => {
      navigate(-1); // Navigate to the previous page
    };
  
    const handleSearchChange = (e) => {
      const query = e.target.value;
      setSearchQuery(query);
      debounceSearch(query);
    };
  
    const debounceSearch = debounce((query) => {
      if (query.trim() !== "") {
        if (isToggled && userLocation.latitude && userLocation.longitude) {
          getNearbyUserProfiles(query, userLocation.latitude, userLocation.longitude, 48000); // 20km radius
        } else {
          getUserProfilesSearch(query);
        }
      } else {
        // Clear users if query is empty
      }
    }, 500);
  
    useEffect(() => {
      // Get current location if the proximity toggle is on
      if (isToggled) {
        const getCurrentLocation = () => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const { latitude, longitude } = position.coords;
                setUserLocation({ latitude, longitude });
                storeUserLocation(authUser.uid, latitude, longitude);
                debounceSearch(searchQuery);
              },
              (error) => {
                console.error('Error getting current location:', error);
                // Handle error appropriately
              }
            );
          } else {
            console.error('Geolocation is not supported by this browser.');
          }
        };
        getCurrentLocation();
      } 
    //   else {
    //     unstoreUserLocation(authUser.uid);
    //   }
    }, [isToggled]);
  
    useEffect(() => {
      return () => {
        debounceSearch.cancel();
      };
    }, []);
  
    return (
        <Container py={6} px={0} w={['100vw', null, '80vh']}>
          <Flex align="center" mb={4} justify="space-between">
            <Flex align="center">
              <IconButton
                icon={<FontAwesomeIcon fontSize={32} icon={faCaretLeft} />}
                aria-label="Go back"
                color="#eb7734"
                variant="ghost"
                onClick={handleGoBack}
                mx={4}
              />
              <Heading as="h1" size="lg">Search</Heading>
            </Flex>
            <Flex ml="auto" mr={5} alignItems="baseline" justifyContent="center">
              <Text mr={4}>Proximity</Text>
              <Box>
              <Switch
                isChecked={isToggled}
                onChange={() => setIsToggled(!isToggled)}
                size="md"
                colorScheme="orange"
              />
              </Box>
            </Flex>
          </Flex>
          <FormControl px={6}>
            <Input
              placeholder="Search for users..."
              value={searchQuery}
              onChange={handleSearchChange}
              _focus={{ 
                borderColor: 'transparent', // Make the border transparent
                boxShadow: '0 0 0 2px rgba(244, 164, 96, 0.5)' // Simulate a thinner border with box-shadow
              }} 
            />
          </FormControl>
          {(isLoadingNearby || isLoadingSearch) && <Spinner mt={4} />}
          {!isLoadingNearby && !isLoadingSearch && (
            <VStack mt={4} spacing={4}>
              {(isToggled && userLocation.latitude && userLocation.longitude ? nearbyUsers : searchedUsers).length > 0 ? (
                (isToggled && userLocation.latitude && userLocation.longitude ? nearbyUsers : searchedUsers).map((user) => (
                  <SuggestedUser key={user.userId} user={user} />
                ))
              ) : (
                <Text>No users found</Text>
              )}
            </VStack>
          )}
        
      </Container>
    );
  };
  
  export default SearchPage;
  