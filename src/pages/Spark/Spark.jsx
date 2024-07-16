import { Box, Container, Flex, Skeleton, SkeletonCircle, Text, VStack, IconButton, useDisclosure } from "@chakra-ui/react";
import useGetSparkProfiles from "../../hooks/useGetSparkProfiles";
import SparkProfile from "./SparkProfile";
import useAuthStore from "../../store/authStore";
import useGetSparkProfileById from "../../hooks/useGetSparkProfileById";
import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";
import { firestore } from "../../firebase/firebase";
import { FaSlidersH } from "react-icons/fa";
import FilterUserModal from "./FilterUserModal";
import { useState, useCallback } from "react";

const Spark = () => {
    const authUser = useAuthStore((state) => state.user);
    const { isLoading: profileLoading, sparkProfile } = useGetSparkProfileById(authUser?.uid);
    const [refreshKey, setRefreshKey] = useState(0); // State variable to trigger refresh
    const { isLoading, sparkProfiles } = useGetSparkProfiles(sparkProfile, refreshKey);
    const { isOpen, onOpen, onClose } = useDisclosure();

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
            <Box position="fixed" top="0" right="0" p={4} zIndex="docked" boxShadow="md" width="100%">
                <Flex justifyContent="flex-end">
                    <IconButton
                        icon={<FaSlidersH />}
                        aria-label="Filter users"
                        onClick={onOpen}
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

            {!isLoading && sparkProfiles.length > 0 && sparkProfiles.map((profile) => (
                <SparkProfile key={profile.uid} id={profile.uid} sparkProfile={profile} onViewed={handleViewed} />
            ))}

            <FilterUserModal isOpen={isOpen} onClose={onClose} onFiltersApplied={handleFiltersApplied} />
        </Container>
    );
};

export default Spark;
