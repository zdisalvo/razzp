import { Container, Box, Flex, Text, AvatarGroup, Avatar } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "../../firebase/firebase";
import useMsgStore from "../../store/msgStore";

const Convo = ({ userId, receivingUserId }) => {
  const [receivingProfile, setReceivingProfile] = useState(null);
  const [lastMessage, setLastMessage] = useState("");
  const navigate = useNavigate();
  const setUserId = useMsgStore((state) => state.setUserId);
  const setReceivingUserId = useMsgStore((state) => state.setReceivingUserId);

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
          boxSize={{ base: "40px", md: "60px" }}
          display="flex"
          mr="10px"
          onClick={() => handleAvatarClick(receivingUserId)}
          cursor="pointer"
        >
          <AvatarGroup size={{ base: "md", md: "lg" }} justifySelf={"left"} p={0} alignSelf={"center"} >
            {receivingProfile.profilePicURL &&
              <Avatar src={receivingProfile.profilePicURL} alt='This user has no pictures' />
            }
            {!receivingProfile.profilePicURL &&
              <Avatar alt='This user has no pictures' />
            }
          </AvatarGroup>
        </Box>
        <Box  
          ml={{base: "20px", md: "20px"}}
          flex="1"
          display="flex"
          flexDirection="column"
          justifyContent="left"
          alignItems="left"
          onClick={handleClick}
          cursor="pointer"
        >
          <Text fontWeight="bold">{receivingProfile.username}</Text>
          <Text>{lastMessage ? `${lastMessage.substring(0, 37)}${lastMessage.length > 37 ? "..." : ""}` : "Say hi"}</Text>
        </Box>
      </Flex>
    </Container>
  );
};

export default Convo;
