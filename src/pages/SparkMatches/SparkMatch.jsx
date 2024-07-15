import { Container, Box, Flex, Image, Text, AvatarGroup, Avatar } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "../../firebase/firebase";

const SparkMatch = ({ userId, matchedUserId }) => {
  const [matchedProfile, setMatchedProfile] = useState(null);
  const [lastMessage, setLastMessage] = useState("");

  useEffect(() => {
    const fetchMatchDetails = async () => {
      try {
        // Fetch the user's matches document
        const matchesDocRef = doc(firestore, "sparkMatches", userId);
        const matchesDoc = await getDoc(matchesDocRef);

        console.log("test");

        if (matchesDoc.exists()) {
          const matchesData = matchesDoc.data();
          const match = matchesData.matches.find(match => match.matchedUserId === matchedUserId);

          if (match) {
            // Fetch the matched user's profile
            const profileDocRef = doc(firestore, "spark", matchedUserId);
            const profileDoc = await getDoc(profileDocRef);
            if (profileDoc.exists()) {
              setMatchedProfile(profileDoc.data());
            }

            // Get the last message from the match object
            if (match.messages && match.messages.length > 0) {
              const lastMsg = match.messages[match.messages.length - 1];
              setLastMessage(lastMsg.message);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching match details:", error);
      }
    };

    fetchMatchDetails();
  }, [userId, matchedUserId]);

  if (!matchedProfile) {
    return null;
  }

  return (
    <Container width={{ base: "100vw", md: "auto" }} height={{ base: "auto", md: "5%" }} px={0} mx={0}>
    <Flex 
      align="center"
      mb={4}
      p={2}
      position="relative"
      //border="1px inset #e2e8f0"
      borderBottom="1px groove #1B2328"
      //borderRadius="md"
    >
      <Box
        //position="absolute"
        position="relative"
        left={1}
        alignItems="left"
        justifyContent="left"
        //transform="translateY(-50%)"
        //borderRadius="full"
        boxSize={{ base: "40px", md: "60px" }}
        display="flex"
        mr="10px"
      >

      
      
      <AvatarGroup size={{ base: "md", md: "lg" }} justifySelf={"left"} p={0} alignSelf={"center"} >
      {matchedProfile.profilePics.length > 0 &&
				<Avatar src={matchedProfile.profilePics[0].imageURL} alt='This user has no pictures' />
      }
      {matchedProfile.profilePics.length === 0 &&
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
        onClick={handleClick(userId, matchedUserId)}
        cursor={pointer}
          >
        <Text fontWeight="bold">{matchedProfile.name}</Text>
        <Text>{lastMessage || "Say hi"}</Text>
      </Box>
    </Flex>
    </Container>
  );
};

export default SparkMatch;
