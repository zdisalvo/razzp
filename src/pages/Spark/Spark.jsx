import { Box, Container, Flex, Skeleton, SkeletonCircle, Text, VStack, IconButton, useDisclosure } from "@chakra-ui/react";
import useGetSparkProfiles from "../../hooks/useGetSparkProfiles";
import SparkProfile from "./SparkProfile";
import useAuthStore from "../../store/authStore";
import useGetSparkProfileById from "../../hooks/useGetSparkProfileById";
import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";
import { firestore } from "../../firebase/firebase";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faSliders } from '@fortawesome/free-solid-svg-icons';
import FilterUserModal from "./FilterUserModal";
import { useState, useEffect, useCallback } from "react";
import { storeSparkUserLocation } from "../../hooks/storeSparkUserLocation";

const Spark = () => {
    const authUser = useAuthStore((state) => state.user);
    const { isLoading: profileLoading, sparkProfile } = useGetSparkProfileById(authUser?.uid);
    const [refreshKey, setRefreshKey] = useState(0); // State variable to trigger refresh
    const { isLoading, sparkProfiles } = useGetSparkProfiles(sparkProfile, refreshKey);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [isFetchingLocation, setIsFetchingLocation] = useState(false);

    

    const getCurrentLocation = () => {
      if (navigator.geolocation && authUser) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            // Example: Update user location and find nearby users

            storeSparkUserLocation(authUser.uid, latitude, longitude); 

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

    useEffect(() => {
      if (isFetchingLocation) {
        getCurrentLocation();
      }
    }, [isFetchingLocation]);


    const handleViewed = async (profileId) => {
        const sparkUserRef = doc(firestore, "spark", authUser.uid);

        if (!sparkProfile.viewed1x.includes(profileId) && !sparkProfile.viewed2x.includes(profileId) && !sparkProfile.viewed3x.includes(profileId)) {
            await updateDoc(sparkUserRef, { viewed1x: arrayUnion(profileId) });
        } else if (sparkProfile.viewed1x.includes(profileId)) {
            await updateDoc(sparkUserRef, { viewed1x: arrayRemove(profileId), viewed2x: arrayUnion(profileId) });
        } else if (sparkProfile.viewed2x.includes(profileId)) {
            await updateDoc(sparkUserRef, { viewed2x: arrayRemove(profileId), viewed3x: arrayUnion(profileId) });
        } else if (sparkProfile.viewed3x.includes(profileId)) {
            await updateDoc(sparkUserRef, { viewed3x: arrayRemove(profileId) });
        }
    };

    // Callback to trigger refresh
    const handleFiltersApplied = useCallback(() => {
        setRefreshKey(prevKey => prevKey + 1); // Update key to trigger re-fetch
        window.location.reload();
        //onClose();
    }, [onClose]);

    return (
        <Container py={6} px={0} w={['100vw', null, '60vh']} >
            <Box position="fixed" top="0" right={{base: "0", md: "15vw"}} p={4} zIndex="docked" width="100%">
                <Flex justifyContent="flex-end">
                <IconButton
                  icon={<FontAwesomeIcon icon={faLocationDot} />}
                  aria-label="Get My Location"
                  onClick={() => setIsFetchingLocation(true)} 
                  isLoading={isFetchingLocation} 
                  loadingText="Getting location..."
                  variant="outline"
                  mx={2} // Adds horizontal margin between the icons
                />
                <IconButton
                  icon={<FontAwesomeIcon icon={faSliders} />}
                  aria-label="Filter users"
                  onClick={onOpen}
                  variant="outline"
                />
                </Flex>
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

            {!isLoading&& !profileLoading && sparkProfiles.length > 0 && sparkProfiles.map((profile) => (
                <SparkProfile key={profile.uid} id={profile.uid} sparkProfile={profile} onViewed={handleViewed} />
            ))}

            <FilterUserModal isOpen={isOpen} onClose={onClose} onFiltersApplied={handleFiltersApplied} />
        </Container>
    );
};

export default Spark;
