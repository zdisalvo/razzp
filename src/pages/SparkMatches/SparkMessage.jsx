import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Box, Avatar, Input, Button, VStack, Text, HStack } from "@chakra-ui/react";
import useGetSparkProfileById from "../../hooks/useGetSparkProfileById";
import useGetMessagesByMatch from "../../hooks/useGetMessagesByMatch";
import useSendMessage from "../../hooks/useSendMessage";

const SparkMessage = () => {
  const { userId, matchedUserId } = useParams();
  const { sparkProfile } = useGetSparkProfileById(matchedUserId);
  const { messages, isLoading } = useGetMessagesByMatch(userId, matchedUserId);
  const [message, setMessage] = useState("");
  const sendMessage = useSendMessage();

  const handleSend = async () => {
    if (message.trim() !== "") {
      await sendMessage(userId, matchedUserId, message);
      setMessage("");
    }
  };

  return (
    <VStack spacing={4} p={4} h="100vh" overflow="hidden">
      {/* Display SparkProfile */}
      <Box mb={4} textAlign="center">
        <Avatar src={sparkProfile.profilePics[0]?.imageURL} size="xl" />
        <Text fontSize="lg" fontWeight="bold">
          {sparkProfile.name}
        </Text>
      </Box>

      {/* Messages Container */}
      <Box
        flex="1"
        overflowY="scroll"
        border="1px solid #e2e8f0"
        borderRadius="md"
        p={4}
        bg="gray.50"
      >
        {isLoading ? (
          <Text>Loading...</Text>
        ) : (
          messages.map((msg, idx) => (
            <HStack
              key={idx}
              p={2}
              mb={2}
              borderRadius="md"
              bg={msg.sender === userId ? "orange.100" : "white"}
              alignSelf={msg.sender === userId ? "flex-end" : "flex-start"}
            >
              <Text>{msg.text}</Text>
            </HStack>
          ))
        )}
      </Box>

      {/* Input and Send Button */}
      <HStack spacing={2} p={2} bg="white" borderTop="1px solid #e2e8f0">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          flex="1"
        />
        <Button onClick={handleSend} colorScheme="blue">
          Send
        </Button>
      </HStack>
    </VStack>
  );
};

export default SparkMessage;
