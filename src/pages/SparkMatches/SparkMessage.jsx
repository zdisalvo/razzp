import { useState, useEffect, useRef } from "react";
import { Box, Avatar, Input, Button, VStack, Text, Container, Flex, Link, IconButton} from "@chakra-ui/react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretLeft } from '@fortawesome/free-solid-svg-icons';
import useSendMessage from "../../hooks/useSendMessage";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { firestore } from "../../firebase/firebase";
import { Link as RouterLink } from 'react-router-dom';

const SparkMessage = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [matchedProfile, setMatchedProfile] = useState(null);
  const [userScrolled, setUserScrolled] = useState(false); // Track if the user has scrolled up

  const containerRef = useRef(null);

  const userId = localStorage.getItem("userId");
  const matchedUserId = localStorage.getItem("matchedUserId");

  const { sendMessage } = useSendMessage();

  useEffect(() => {
    // Fetch matched profile
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
    const unsubscribe = onSnapshot(doc(firestore, "sparkMatches", userId), (doc) => {
      const data = doc.data();
      const match = data.matches.find(match => match.matchedUserId === matchedUserId);
      if (match && match.messages) {
        setMessages(match.messages); // Update messages array directly from Firestore
      }
    });

    return () => unsubscribe();
  }, [userId, matchedUserId]);

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
      await sendMessage(userId, matchedUserId, newMessageObject);

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

  // Format date to show only hours and minutes, removing leading zero for single-digit hours
  const formatTime = (timestamp) => {
    if (timestamp) {
      const date = new Date(timestamp.seconds * 1000);
      let hours = date.getHours();
      const minutes = date.getMinutes();
      
      // Format hours to remove leading zero for single-digit hours
      const formattedHours = (hours % 12 || 12).toString(); // Convert 24-hour format to 12-hour format, ensuring 12-hour format shows 12 instead of 0
      const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes; // Ensure minutes are always two digits
      
      const period = hours >= 12 ? 'PM' : 'AM'; // Determine AM/PM period
      
      return `${formattedHours}:${formattedMinutes} ${period}`;
    }
    return "Unknown time";
  };

  return (
    <Container  w={['100vw', null, '80vh']} mt={{ base: "3vh", md: "30px" }} mb={{ base: "10vh", md: "60px" }}>
      {matchedProfile && (
        <Flex mb={4} align="center">
          <Link as={RouterLink} to="/spark/matches">
            <IconButton
            icon={<FontAwesomeIcon fontSize={32} icon={faCaretLeft} />}
            aria-label="Go back"
            variant="ghost"
            color="#eb7734"
            />
          </Link>
          <Avatar ml={2} size="lg" src={matchedProfile.profilePics[0]?.imageURL || ""} alt="Matched User Avatar" />
          <Box ml={4}>
            <Text fontSize="xl" fontWeight="bold">
              {matchedProfile.name}
            </Text>
          </Box>
        </Flex>
      )}
      <VStack
        spacing={3}
        p={4}
        border="1px solid #e2e8f0"
        borderRadius="md"
        minH={{base: "50vh", md: "60vh"}}
        maxH={{base: "50vh", md: "60vh"}}
        overflowY="scroll"
        ref={containerRef}
        bg="#d3e3f5"
        onScroll={handleScroll} // Attach scroll event listener
      >
        {messages.length > 0 && messages.map((msg, index) => (
          <Box
            key={index}
            alignSelf={msg.sendingUser === userId ? "flex-end" : "flex-start"}
            bg={msg.sendingUser === userId ? "#e5b85c" : "white"} // Darker creamy orange background
            color="black"
            p={4}
            borderRadius="full" // Fully rounded corners for a bubble effect
            maxW="80%"
            position="relative"
            boxShadow="0px 4px 6px rgba(0, 0, 0, 0.1)" // Add shadow for a more 3D effect
            _before={{
              content: '""',
              position: "absolute",
              bottom: "-12px", // Adjust this value to position the triangle
              left: msg.sendingUser === userId ? "auto" : "10px",
              right: msg.sendingUser === userId ? "10px" : "auto",
              borderWidth: "12px", // Make the tail larger
              borderStyle: "solid",
              borderColor: msg.sendingUser === userId ? "#e5b85c transparent transparent transparent" : "white transparent transparent transparent", // Darker creamy orange for the tail
              transform: "rotate(45deg)"
            }}
          >
            <Text>{msg.message}</Text>
            <Text fontSize="xs" 
            color={msg.sendingUser === userId ? "white" : "gray.500"}
            textAlign={msg.sendingUser === userId ? "right" : "left"}
            >
              {(formatTime(msg.timeStamp) !== "12:NaN AM") ? formatTime(msg.timeStamp) : ""} {/* Display formatted time */}
            </Text>
          </Box>
        ))}
      </VStack>
      <Flex mt={4}>
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          _focus={{ 
            borderColor: 'transparent', // Make the border transparent
            boxShadow: '0 0 0 2px rgba(244, 164, 96, 0.5)' // Simulate a thinner border with box-shadow
          }} 
        />
        <Button ml={2} onClick={handleSendMessage}>
          Send
        </Button>
      </Flex>
    </Container>
  );
};

export default SparkMessage;
