import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Box, Avatar, Input, Button, VStack, Text, Container, Flex, IconButton } from "@chakra-ui/react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretLeft } from '@fortawesome/free-solid-svg-icons';
import useSendRazzpMsg from "../../hooks/useSendRazzpMsg";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { firestore } from "../../firebase/firebase";

const Message = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [receivingProfile, setReceivingProfile] = useState(null);
  const [userScrolled, setUserScrolled] = useState(false); // Track if the user has scrolled up

  const containerRef = useRef(null);
  const navigate = useNavigate();

  const userId = localStorage.getItem("userId");
  const receivingUserId = localStorage.getItem("receivingUserId");

  const { sendMessage } = useSendRazzpMsg();

  const handleGoBack = () => {
    navigate(-1); // Navigate to the previous page
  };

  useEffect(() => {
    // Fetch matched profile
    const fetchReceivingProfile = async () => {
      try {
        const profileDocRef = doc(firestore, "users", receivingUserId);
        const profileDoc = await getDoc(profileDocRef);
        if (profileDoc.exists()) {
          setReceivingProfile(profileDoc.data());
        }
      } catch (error) {
        console.error("Error fetching receiving profile:", error);
      }
    };

    fetchReceivingProfile();
  }, [receivingUserId]);

  useEffect(() => {
    // Real-time listener for messages
    const unsubscribe = onSnapshot(doc(firestore, "razzpMessages", userId), (doc) => {
      const data = doc.data();
      const convo = data?.messages?.find(convo => convo.receivingUserId === receivingUserId);
      if (convo && convo.messages) {
        setMessages(convo.messages); // Update messages array directly from Firestore
      }
    });

    return () => unsubscribe();
  }, [userId, receivingUserId]);

  useEffect(() => {
    const element = containerRef.current;
    if (element && !userScrolled) {
      element.scrollTop = element.scrollHeight;
    }
  }, [messages, userScrolled]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const newMessageObject = {
      sendingUser: userId,
      timeStamp: new Date(),
      message: newMessage.trim(),
    };

    try {
      // Optimistically update local state
      setMessages((prevMessages) => [...prevMessages, newMessageObject]);

      // Send the message
      await sendMessage(userId, receivingUserId, newMessageObject);

      // Clear the input field
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      // Check if the user has scrolled up
      setUserScrolled(scrollTop + clientHeight < scrollHeight - 5);
    }
  };

  const formatTime = (timestamp) => {
    if (timestamp) {
      const date = new Date(timestamp.seconds * 1000);
      let hours = date.getHours();
      const minutes = date.getMinutes();
      
      const formattedHours = (hours % 12 || 12).toString();
      const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
      
      const period = hours >= 12 ? 'PM' : 'AM';
      
      return `${formattedHours}:${formattedMinutes} ${period}`;
    }
    return "Unknown time";
  };

  return (
    <Container maxW="container.md" mt={{ base: "3vh", md: "30px" }} mb={{ base: "10vh", md: "60px" }}>
      {receivingProfile && (
        <Flex mb={4} align="center">
          <IconButton
            icon={<FontAwesomeIcon fontSize={32} icon={faCaretLeft} />}
            aria-label="Go back"
            variant="ghost"
            onClick={handleGoBack}
          />
          <Avatar ml={2} size="lg" src={receivingProfile.profilePicURL || ""} alt="User Avatar" />
          <Box ml={4}>
            <Text fontSize="xl" fontWeight="bold">
              {receivingProfile.username}
            </Text>
          </Box>
        </Flex>
      )}
      <VStack
        spacing={4}
        p={4}
        border="1px solid #e2e8f0"
        borderRadius="md"
        minH={{ base: "50vh", md: "60vh" }}
        maxH={{ base: "50vh", md: "60vh" }}
        overflowY="scroll"
        ref={containerRef}
        bg="gray.100"
        onScroll={handleScroll}
      >
        {messages.length > 0 && messages.map((msg, index) => (
          <Box
            key={index}
            alignSelf={msg.sendingUser === userId ? "flex-end" : "flex-start"}
            bg={msg.sendingUser === userId ? "orange.100" : "white"}
            color="black"
            p={3}
            borderRadius="md"
            maxW="80%"
          >
            <Text>{msg.message}</Text>
            <Text fontSize="xs" color="gray.500">
              {formatTime(msg.timeStamp)}
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

export default Message;
