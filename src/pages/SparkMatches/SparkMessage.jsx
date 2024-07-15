import { useState, useEffect } from "react";
import { Box, Avatar, Input, Button, VStack, Text, Container, Flex } from "@chakra-ui/react";
import useSendMessage from "../../hooks/useSendMessage";
import useGetSparkMessages from "../../hooks/useGetSparkMessages";
import { doc, getDoc, updateDoc, arrayUnion, onSnapshot } from "firebase/firestore";
import { firestore } from "../../firebase/firebase";

const SparkMessage = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [matchedProfile, setMatchedProfile] = useState(null);

  const userId = localStorage.getItem("userId");
  const matchedUserId = localStorage.getItem("matchedUserId");

  const { sendMessage } = useSendMessage();

  useEffect(() => {
    // Fetch and set matched profile
    const fetchMatchedProfile = async () => {
      try {
        const profileDoc = await getDoc(doc(firestore, "spark", matchedUserId));
        if (profileDoc.exists()) {
          setMatchedProfile(profileDoc.data());
        }
      } catch (error) {
        console.error("Error fetching matched profile:", error);
      }
    };

    fetchMatchedProfile();
  }, [matchedUserId]);

  useEffect(() => {
    // Real-time listener for messages
    const messagesRef = doc(firestore, "sparkMatches", userId);
    const unsubscribe = onSnapshot(messagesRef, (doc) => {
      const data = doc.data();
      const match = data.matches.find(match => match.matchedUserId === matchedUserId);
      if (match && match.messages) {
        setMessages(match.messages);
      }
    });

    return () => unsubscribe();
  }, [userId, matchedUserId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const newMessageObject = {
      sendingUser: userId,
      timeStamp: new Date(),
      message: newMessage.trim(),
    };

    try {
      // Update messages in Firestore
      await sendMessage(userId, matchedUserId, newMessageObject);
      setNewMessage("");
      // Optimistically update the local state
      setMessages((prevMessages) => [...prevMessages, newMessageObject]);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <Container maxW="container.md" py={4}>
      {matchedProfile && (
        <Flex mb={4} align="center">
          <Avatar size="lg" src={matchedProfile.profilePics[0]?.imageURL || ""} alt="Matched User Avatar" />
          <Box ml={4}>
            <Text fontSize="xl" fontWeight="bold">
              {matchedProfile.name}
            </Text>
          </Box>
        </Flex>
      )}
      <VStack
        spacing={4}
        p={4}
        border="1px solid #e2e8f0"
        borderRadius="md"
        maxH="60vh"
        overflowY="scroll"
      >
        {messages.length > 0 && messages.map((msg, index) => (
          <Box
            key={index}
            alignSelf={msg.sendingUser === userId ? "flex-end" : "flex-start"}
            bg={msg.sendingUser === userId ? "orange.100" : "white"}
            color={msg.sendingUser === userId ? "black" : "black"}
            p={3}
            borderRadius="md"
            maxW="80%"
          >
            <Text>{msg.message}</Text>
            <Text fontSize="xs" color="gray.500">
              {new Date(msg.timeStamp.seconds * 1000).toLocaleTimeString()}
            </Text>
          </Box>
        ))}
      </VStack>
      <Flex mt={4}>
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
        />
        <Button ml={2} onClick={handleSendMessage}>
          Send
        </Button>
      </Flex>
    </Container>
  );
};

export default SparkMessage;
