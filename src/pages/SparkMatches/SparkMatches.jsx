import { Box, Container, Flex, Skeleton, SkeletonCircle, Text, VStack } from "@chakra-ui/react";
import useGetSparkProfiles from "../../hooks/useGetSparkProfiles";
import SparkProfile from "./SparkProfile";
import useSparkProfileStore from "../../store/sparkProfileStore";
import useAuthStore from "../../store/authStore";
import useGetSparkProfileById from "../../hooks/useGetSparkProfileById";
import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";
//import useSparkProfileView from "../../hooks/useSparkProfileView";
import {firestore} from "../../firebase/firebase";


const SparkMatches = () => {
    const authUser = useAuthStore((state) => state.user);
    const { isLoading: profileLoading, sparkProfile } = useGetSparkProfileById(authUser?.uid);
  //const sparkProfile = useSparkProfileStore((state) => state.setSparkProfile);
  const { isLoading, sparkMatches } = useGetSparkMatches(sparkProfile);
  //const [viewedPosts, setViewedPosts] = useState([]);


  return (
    <Container py={6}   px={0} w={['100vw', null, '60vh']} >
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
      
      {!isLoading && sparkProfiles.length > 0 && sparkProfiles.map((profile) => <SparkMatch key={profile.uid} id={profile.uid} sparkProfile={profile} onViewed={handleViewed} />)}
      
      
    </Container>
  );
};

export default SparkMatches;
