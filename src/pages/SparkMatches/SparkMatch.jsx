import { Container, Box, Flex, Text, AvatarGroup, Avatar, IconButton, Menu, MenuButton, MenuList, MenuItem } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { firestore } from "../../firebase/firebase";
import useMatchStore from "../../store/matchStore";
import useGetSparkProfileById from "../../hooks/useGetSparkProfileById";
import SparkProfileModal from "./SparkProfileModal";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEllipsis } from '@fortawesome/free-solid-svg-icons'; 

const SparkMatch = ({ userId, matchedUserId }) => {
  
  const [matchedProfile, setMatchedProfile] = useState(null);
  const [lastMessage, setLastMessage] = useState("");
  const navigate = useNavigate();
  const setUserId = useMatchStore((state) => state.setUserId);
  const setMatchedUserId = useMatchStore((state) => state.setMatchedUserId);
  const { sparkProfile, isLoading: profileLoading } = useGetSparkProfileById(userId);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [matchItem, setMatchItem] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState("");
  const [matchExpired, setMatchExpired] = useState(false);

  

  

  //if (profileLoading) return <div>Loading...</div>;

  const handleClick = () => {
    //console.log(userId);
    //console.log(matchItem.messages[0].sendingUser);
    if ((matchExpired && matchItem.messages.length <= 1) || (matchItem.messages.length === 1 && matchItem.messages[0].sendingUser === userId))
      return;

      setUserId(userId);
      setMatchedUserId(matchedUserId);
      // Store IDs in localStorage
      localStorage.setItem("userId", userId);
      localStorage.setItem("matchedUserId", matchedUserId);
      navigate("/spark/matches/msg");
    
  };

  useEffect(() => {
    const fetchMatchDetails = async () => {
      try {
        const matchesDocRef = doc(firestore, "sparkMatches", userId);
        const matchesDoc = await getDoc(matchesDocRef);

        if (matchesDoc.exists()) {
          const matchesData = matchesDoc.data();
          const match = matchesData.matches.find(match => match.matchedUserId === matchedUserId);
          setMatchItem(match);

          //console.log(matchItem);

          if (match) {
            const profileDocRef = doc(firestore, "spark", matchedUserId);
            const profileDoc = await getDoc(profileDocRef);
            if (profileDoc.exists()) {
              setMatchedProfile(profileDoc.data());
            }

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


  useEffect(() => {
    const calculateTimeRemaining = () => {
      if (!matchItem)
        return;
      const createdAt = new Date(matchItem.createdAt);
      const expirationDate = new Date(createdAt);
      expirationDate.setDate(createdAt.getDate() + 3);

      const now = new Date();
      const timeDiff = expirationDate - now;

      if (timeDiff <= 0 && (!lastMessage || matchItem.messages.length <= 1)) {
        setMatchExpired(true);
        setTimeRemaining("This match has expired");
      } else {
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
        setTimeRemaining(`${days}d ${hours}h`);
      }
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000); // Update every second

    return () => clearInterval(interval);
  }, [matchItem]);



  if (!matchedProfile) {
    return null;
  }



  const handleBlockUser = async () => {
    try {
      // Get reference to the document
      const userDocRef = doc(firestore, "spark", userId);
      const userDoc = await getDoc(userDocRef);
  
      if (userDoc.exists()) {

        await updateDoc(userDocRef, {
          blocked: arrayUnion(matchedUserId)
        });


      console.log("User blocked successfully.");

      handleUnmatchUser();

      } else {
        console.log("No matches found for this user.");
      }
  } catch (error) {
    console.error("Error removing match: ", error);
  }
  };



  const handleUnmatchUser = async () => {
    try {
      // Get reference to the document
      const matchesDocRef = doc(firestore, "sparkMatches", userId);
      const matchesDoc = await getDoc(matchesDocRef);

      const matchedDocRef = doc(firestore, "sparkMatches", matchedUserId);
      const matchedDoc = await getDoc(matchedDocRef);
  
      if (matchesDoc.exists() && matchedDoc.exists()) {
        const matchesData = matchesDoc.data();
        const updatedMatches = matchesData.matches.filter(match => match.matchedUserId !== matchedUserId);

        const matchedData = matchedDoc.data();
        const updatedMatched = matchedData.matches.filter(match => match.userId !== userId);
  
        // Update the document with the new matches array
        await updateDoc(matchesDocRef, {
          matches: updatedMatches
        });

        await updateDoc(matchedDocRef, {
          matches: updatedMatched
        });
  
        console.log("Match removed successfully.");
      } else {
        console.log("No matches found for this user.");
      }
    } catch (error) {
      console.error("Error removing match: ", error);
    }
  };


  const handleAvatarClick = () => {
    if ((matchExpired && matchItem.messages.length <= 1) || (matchItem.messages.length === 1 && matchItem.messages[0].sendingUser === userId))
      return;
    // setSparkProfile(profileData);
    // setSparkUser(match); // Assuming match contains user data
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

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
          onClick={handleAvatarClick}
          cursor="pointer"
        >
          <AvatarGroup size={{ base: "md", md: "lg" }} justifySelf={"left"} p={0} alignSelf={"center"} >
            {matchedProfile.profilePics.length > 0 &&
              <Avatar src={matchedProfile.profilePics[0].imageURL} alt='This user has no pictures'  />
            }
            {matchedProfile.profilePics.length === 0 &&
              <Avatar alt='This user has no pictures' />
            }
          </AvatarGroup>  
          <SparkProfileModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        sparkProfile={matchedProfile}
        //onViewed={() => console.log(`Viewed profile: ${match.uid}`)}
        sparkUser={sparkProfile}
      />
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
          {(lastMessage || matchExpired) &&(
          <Text fontWeight="bold">{matchedProfile.name}</Text>
        )}
          <Text fontWeight={(!lastMessage || lastMessage.sendingUser !== userId) ? "bold" : "regular"}>{lastMessage ? `${lastMessage.substring(0, 37)}${lastMessage.length > 37 ? "..." : ""}` : (!matchExpired ? `Say hi to ${matchedProfile.name}` : "")}</Text>

        </Box>
        {matchItem.messages.length <= 1 && (
          <Box display="flex-end" mr={4}>
            <Text fontSize="sm" color="gray.400" >{!matchExpired ? "Expires in " : ""} {timeRemaining}</Text>
          </Box>
        )}
        <Box>
        <Menu>
        <MenuButton
            as={IconButton}
            icon={<FontAwesomeIcon icon={faEllipsis} />}
            aria-label="Other options"
            size="sm"
            variant="outline"
            mx={2} // Adds horizontal margin between the icons
            pt={-5}
            mt={-5}
            pb={0}
            mb={0}
          />
          
          <MenuList
            bg="black" // Sets the background color to black
            borderRadius="md" // Optional: for rounded corners
            //borderBottom="1px groove #1B2328" // Adds the border at the bottom
            color="white" // Sets the text color to white for better contrast
            fontSize="sm"
            width="auto"
            minWidth="75px"
            maxWdith="75px"
            py={1}
            my={0}
            position="absolute"
            right="100%" // Align to the left of the button
            top="-55px" // Align with the top of the button
            transform="translateX(-8px)"
            _focus={{ boxShadow: 'none' }} // Optional: Removes box shadow on focus
          >
            <MenuItem
              bg="black"
              _hover={{ bg: '#2e2e2e' }} // Changes background color to charcoal on hover
              px={4} // Adds padding inside MenuItem
                      //width="100%"
                whiteSpace="nowrap"
                color="white"
                onClick={handleUnmatchUser}
              >Unmatch User</MenuItem>
             <MenuItem
              bg="black"
              _hover={{ bg: '#2e2e2e' }} // Changes background color to charcoal on hover
              px={4} // Adds padding inside MenuItem
                      //width="100%"
                whiteSpace="nowrap"
                color="#c8102e"
                onClick={handleBlockUser}
              >Block User</MenuItem>
            </MenuList>
            </Menu>
        </Box>
      </Flex>
    </Container>
  );
};

export default SparkMatch;
