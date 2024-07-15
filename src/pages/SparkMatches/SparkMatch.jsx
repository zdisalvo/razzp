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
    <Flex align="left" mb={2}>
      {/* <Image
        borderRadius="full"
        boxSize="50px"
        src={matchedProfile.avatarUrl}
        alt={matchedProfile.displayName}
        mr={4}
      /> */}
      
      <AvatarGroup size={{ base: "md", md: "lg" }} justifySelf={"center"} alignSelf={"flex-start"} mx={"auto"}>
      {matchedProfile.profilePics.length > 0 &&
				<Avatar src={matchedProfile.profilePics[0].imageURL} alt='This user has no pictures' />
      }
      {matchedProfile.profilePics.length === 0 &&
				<Avatar alt='This user has no pictures' />
      }
			</AvatarGroup>
      
      <Box>
        <Text fontWeight="bold">{matchedProfile.displayName}</Text>
        <Text>{lastMessage || "No messages yet"}</Text>
      </Box>
    </Flex>
    </Container>
  );
};

export default SparkMatch;
