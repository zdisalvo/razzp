import { Box, Container, Flex, Skeleton, SkeletonCircle, Text, VStack } from "@chakra-ui/react";
import useAuthStore from "../../store/authStore";
import useGetSparkProfileById from "../../hooks/useGetSparkProfileById";
import Message from "./Message";
//import useGetSparkMatchesById from "../../hooks/useGetSparkMatchesById";
import useGetMessagesById from "../../hooks/useGetMessagesById";
import Convo from "./Convo";


const Messages = () => {
    const authUser = useAuthStore((state) => state.user);
    //const { isLoading: profileLoading, sparkProfile } = useGetSparkProfileById(authUser?.uid);
  //const sparkProfile = useSparkProfileStore((state) => state.setSparkProfile);
  const { isLoading, messages } = useGetMessagesById(authUser?.uid);
  //const [viewedPosts, setViewedPosts] = useState([]);


  return (
    <Container py={6}   px={0} w={['100vw', null, '80vh']} >
      {isLoading &&
        [0, 1, 2, 3, 4].map((_, idx) => (
          <VStack key={idx} gap={4} alignItems={"flex-start"} mb={10}>
            <Flex gap='2'>
              <SkeletonCircle size='10' />
              <VStack gap={2} alignItems={"flex-start"}>
                <Skeleton height='10px' w={"200px"} />
                <Skeleton height='10px' w={"200px"} />
              </VStack>
            </Flex>
            <Skeleton w={"full"}>
              <Box h={"50px"}>contents wrapped</Box>
            </Skeleton>
          </VStack>
        ))}
      
      {!isLoading && messages.length > 0 && messages.map((convo) => <Convo key={convo.receivingUserId} userId={authUser.uid} receivingUserId={convo.receivingUserId} />)}
      
      
    </Container>
  );
};

export default Messages;
