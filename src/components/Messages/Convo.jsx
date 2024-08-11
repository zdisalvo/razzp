import { Container, Box, Flex, Text, AvatarGroup, Avatar } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "../../firebase/firebase";
import useMsgStore from "../../store/msgStore";
import useIncomingReadStatus from "../../hooks/useIncomingReadStatus";

const Convo = ({ userId, receivingUserId }) => {
  const [receivingProfile, setReceivingProfile] = useState(null);
  const [lastMessage, setLastMessage] = useState("");
  const navigate = useNavigate();
  const setUserId = useMsgStore((state) => state.setUserId);
  const setReceivingUserId = useMsgStore((state) => state.setReceivingUserId);
  const [convoItem, setConvoItem] = useState(null);

  const incomingRead = useIncomingReadStatus(userId, receivingUserId);

  const handleClick = () => {

    setUserId(userId);
    setReceivingUserId(receivingUserId);
    // Store IDs in localStorage
    localStorage.setItem("userId", userId);
    localStorage.setItem("receivingUserId", receivingUserId);
    
    if (receivingProfile && receivingProfile.username) {
      navigate(`/${receivingProfile.username}/messages`);
    }
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
    const fetchMessageDetails = async () => {
      try {
        const messagesDocRef = doc(firestore, "razzpMessages", userId);
        const messagesDoc = await getDoc(messagesDocRef);

        if (messagesDoc.exists()) {
          const messagesData = messagesDoc.data();
          const convo = messagesData.messages.find(convo => convo.receivingUserId === receivingUserId);
          setConvoItem(convo);

          if (convo) {
            const profileDocRef = doc(firestore, "users", receivingUserId);
            const profileDoc = await getDoc(profileDocRef);
            if (profileDoc.exists()) {
              setReceivingProfile(profileDoc.data());
            }

            if (convo.messages && convo.messages.length > 0) {
              const lastMsg = convo.messages[convo.messages.length - 1];
              setLastMessage(lastMsg.message);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching messages details:", error);
      }
    };

    fetchMessageDetails();
  }, [userId, receivingUserId]);

  if (!receivingProfile) {
    return null;
  }

  return (
    <Container width={{ base: "100vw", md: "auto" }} height={{ base: "auto", md: "5%" }} px={0} mx={0}>
      <Flex 
        align="center"
        mb={0}
        p={2}
        position="relative"
        borderBottom="1px groove #1B2328"
      >
        <Box
          position="relative"
          left={1}
          alignItems="left"
          justifyContent="left"
          boxSize="40px"
          display="flex"
          mr={3}
          onClick={() => handleAvatarClick(receivingUserId)}
          cursor="pointer"
        >
          <AvatarGroup size="md" justifySelf={"left"} p={0} alignSelf={"center"} >
            {receivingProfile.profilePicURL &&
              <Avatar src={receivingProfile.profilePicURL} alt='This user has no pictures' />
            }
            {!receivingProfile.profilePicURL &&
              <Avatar alt='This user has no pictures' />
            }
          </AvatarGroup>
        </Box>
        <Box  
          mx={4}
          flex="1"
          display="flex"
          flexDirection="column"
          justifyContent="left"
          alignItems="left"
          onClick={handleClick}
          cursor="pointer"
        >
          <Text fontSize="lg" fontWeight="bold" color="gray.400">{receivingProfile.username}</Text>
          <Text fontSize="sm" fontWeight={incomingRead === false || incomingRead === null ? 'bold' : 'normal'}>
            {lastMessage ? `${lastMessage.substring(0, 37)}${lastMessage.length > 37 ? "..." : ""}` : "Say hi"}
          </Text>
        </Box>
      </Flex>
    </Container>
  );
};

export default Convo;
