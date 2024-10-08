import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import React, { Fragment } from 'react';
import { Box, Avatar, Input, Button, VStack, Text, Container, Flex, IconButton } from "@chakra-ui/react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretLeft } from '@fortawesome/free-solid-svg-icons';
import useSendRazzpMsg from "../../hooks/useSendRazzpMsg";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { firestore } from "../../firebase/firebase";
import useUpdateOutgoingReadStatus from "../../hooks/useUpdateOutgoingReadStatus";
import useUpdateIncomingReadStatus from "../../hooks/useUpdateIncomingReadStatus";
import useShowToast from "../../hooks/useShowToast";

const Message = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [receivingProfile, setReceivingProfile] = useState(null);
  const [userScrolled, setUserScrolled] = useState(false); // Track if the user has scrolled up

  const containerRef = useRef(null);
  const navigate = useNavigate();

  const userId = localStorage.getItem("userId");
  const receivingUserId = localStorage.getItem("receivingUserId");

  const [outgoingRead, setOutgoingRead] = useState(null);

  const { previousReadData, updateReadStatus } = useUpdateOutgoingReadStatus(userId, receivingUserId);
  const { previousViewedData, updateViewedStatus } = useUpdateIncomingReadStatus(userId, receivingUserId);
  const showToast = useShowToast();


  const { sendMessage } = useSendRazzpMsg();



  const handleGoBack = () => {
    navigate(-1); // Navigate to the previous page
  };

  const fetchUserData = async (userId) => {
    if (!userId) return null;
    const userRef = doc(firestore, "users", userId);
    const userDoc = await getDoc(userRef);
    return userDoc.exists() ? userDoc.data() : null;
  };

  const handleAvatarClick = async (userId) => {
    const profile = await fetchUserData(userId);
    if (profile) {
      navigate(`/${profile.username}`);
    }
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
    const readRef = doc(firestore, 'razzpRead', userId);

    const unsubscribe = onSnapshot(readRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const outgoingReadValue = data[receivingUserId]?.outgoingRead;
        setOutgoingRead(outgoingReadValue);
      } else {
        console.log('Document does not exist');
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [userId, receivingUserId]);

  useEffect(() => {
    let isMounted = true;

    if (isMounted) {
      updateReadStatus();
      updateViewedStatus();
    }

    return () => {
      isMounted = false;
    };
  }, [messages, userScrolled, previousReadData, updateReadStatus, updateViewedStatus]);


  useEffect(() => {
    const element = containerRef.current;

    

    if (element && !userScrolled) {
      element.scrollTop = element.scrollHeight;
      // updateReadStatus();
      // updateViewedStatus();
    }
  }, [messages, userScrolled]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    if ((receivingProfile && messages && messages.length === 1 && messages[0].sendingUser === userId)) {
      showToast("Warning", `${receivingProfile.username} must reply first.`, "warning");
      return;
    }

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

  // const formatTime = (timestamp) => {
  //   if (timestamp) {
  //     const date = new Date(timestamp.seconds * 1000);
  //     let hours = date.getHours();
  //     const minutes = date.getMinutes();
      
  //     const formattedHours = (hours % 12 || 12).toString();
  //     const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
      
  //     const period = hours >= 12 ? 'PM' : 'AM';
      
  //     return `${formattedHours}:${formattedMinutes} ${period}`;
  //   }
  //   return "Unknown time";
  // };




  const formatTime = (timestamp) => {
    const date = new Date(timestamp.seconds * 1000);
    const now = new Date();
    
    const isSameDay = date.toDateString() === now.toDateString();
    const isWithinLastWeek = date > new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const formattedHours = (hours % 12 || 12).toString();
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const period = hours >= 12 ? 'PM' : 'AM';
  
    if (isSameDay) {
      return `${formattedHours}:${formattedMinutes} ${period}`;
    }
  
    if (isWithinLastWeek) {
      const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      return `${daysOfWeek[date.getDay()]} ${formattedHours}:${formattedMinutes} ${period}`;
    }
  
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[date.getMonth()]} ${date.getDate()} ${formattedHours}:${formattedMinutes} ${period}`;
  };


  const showTime = (prevTimestamp, currTimestamp) => {
    //console.log(currTimestamp);
    //console.log(prevTimestamp);
    return Math.abs(currTimestamp.seconds - prevTimestamp.seconds) >= 3600; // 3600000 ms = 1 hour
};
  

  return (
    <Container  w={['100vw', null, '80vh']} mt={{ base: "3vh", md: "30px" }} mb={{ base: "10vh", md: "60px" }}>
      {receivingProfile && (
        <Flex mb={4} align="center">
          <IconButton
            icon={<FontAwesomeIcon fontSize={32} icon={faCaretLeft} />}
            aria-label="Go back"
            variant="ghost"
            onClick={handleGoBack}
            color="#eb7734"
            ml={5}
            mr={4}
          />
          <Avatar
            ml={2}
            size="lg"
            src={receivingProfile.profilePicURL || ""}
            alt="User Avatar"
            onClick={() => handleAvatarClick(receivingUserId)}
            cursor="pointer"
          />
          <Box ml={4}>
            <Text fontSize="xl" fontWeight="bold">
              {receivingProfile.username}
            </Text>
          </Box>
        </Flex>
      )}
      <VStack
        spacing={1}
        p={4}
        border="1px solid #e2e8f0"
        borderRadius="md"
        minH={{ base: "50vh", md: "60vh" }}
        maxH={{ base: "50vh", md: "60vh" }}
        overflowY="scroll"
        ref={containerRef}
        bg="#d3e3f5"
        onScroll={handleScroll}
      >
         {messages.map((msg, index) => {
                const prevMsg = index > 0 ? messages[index - 1] : null;
                const showTimestamp = prevMsg && showTime(prevMsg.timeStamp, msg.timeStamp);
                
                return (
          <React.Fragment key={index}>
          <Box
            key={index}
            alignSelf={msg.sendingUser === userId ? "flex-end" : "flex-start"}
            bg={msg.sendingUser === userId ? "#0099ff" : "white"}
            color={msg.sendingUser === userId ? "white" : "black"}
            p={4}
            borderRadius="full"
            maxW="80%"
            position="relative"
            boxShadow={msg.sendingUser === userId ? "0px 4px 10px rgba(0, 0, 0, 0.3)" : "0px 4px 6px rgba(0, 0, 0, 0.1)"}
            _before={{
              content: '""',
              position: "absolute",
              bottom: "-12px",
              left: msg.sendingUser === userId ? "auto" : "10px",
              right: msg.sendingUser === userId ? "10px" : "auto",
              borderWidth: "12px",
              borderStyle: "solid",
              borderColor: msg.sendingUser === userId ? "#0099ff transparent transparent transparent" : "white transparent transparent transparent",
              transform: "rotate(45deg)"
            }}
          >
            <Text fontSize={{base: "lg", md: "md"}}
              textShadow={msg.sendingUser === userId ? "1px 1px 2px rgba(0, 0, 0, 0.2)" : "none"}
            >{msg.message}</Text>
            <Text fontSize="xs" 
            color={msg.sendingUser === userId ? "gray.100" : "gray.500"}
            textAlign={msg.sendingUser === userId ? "right" : "left"}
            
            >
              {(formatTime(msg.timeStamp) !== "12:NaN AM" && (showTimestamp || index === 0)) ? formatTime(msg.timeStamp) : ""}
            </Text>
          </Box>
          {(index === messages.length - 1) && (msg.sendingUser === userId) && outgoingRead && (
            <Text fontSize="xs" mr={4} color="gray.500" alignSelf="flex-end">
              Read
            </Text>
          )}
          </React.Fragment>
        );
      })}
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
