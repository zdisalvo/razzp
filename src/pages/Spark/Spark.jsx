import { Box, Container, Flex, Skeleton, SkeletonCircle, Text, VStack } from "@chakra-ui/react";
import useGetSparkProfiles from "../../hooks/useGetSparkProfiles";
import SparkProfile from "./SparkProfile";
import useSparkProfileStore from "../../store/sparkProfileStore";

const Spark = () => {
  const {sparkProfile} = useSparkProfileStore((state) => state.fetchSparkProfile);
  const { isLoading, sparkProfiles } = useGetSparkProfiles(sparkProfile);

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
      
      {!isLoading && sparkProfiles.length > 0 && sparkProfiles.map((profile) => <SparkProfile key={profile.uid} sparkProfile={profile}  />)}
      
      
    </Container>
  );
};

export default Spark;
