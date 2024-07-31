import { Box, Container, Flex, Skeleton, SkeletonCircle, Text, VStack, Heading, IconButton } from "@chakra-ui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretLeft } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import useGetMessagesById from "../../hooks/useGetMessagesById";
import Convo from "./Convo";

const Messages = () => {
  const authUser = useAuthStore((state) => state.user);
  const { isLoading, messages } = useGetMessagesById(authUser?.uid);
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate("/"); // Navigate to the previous page
  };

  // Sort conversations by the most recent last message
  const sortedMessages = messages.slice().sort((a, b) => {
    const lastMessageA = a.messages[a.messages.length - 1];
    const lastMessageB = b.messages[b.messages.length - 1];
    
    return (lastMessageB?.timeStamp?.seconds || 0) - (lastMessageA?.timeStamp?.seconds || 0);
  });

  return (
    <Container py={6} px={0} w={['100vw', null, '80vh']}>
      <Flex align="center" mb={4}>
        <IconButton
          icon={<FontAwesomeIcon fontSize={32} icon={faCaretLeft} />}
          aria-label="Go back"
          color="#eb7734"
          variant="ghost"
          onClick={handleGoBack}
          ml={5}
          mr={4} // Add margin-right to space out from the heading
        />
        <Heading as="h1" size="lg">Messages</Heading>
      </Flex>

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

      {!isLoading && sortedMessages.length > 0 && sortedMessages.map((convo) => (
        <Convo key={convo.receivingUserId} userId={authUser.uid} receivingUserId={convo.receivingUserId} />
      ))}
    </Container>
  );
};

export default Messages;
