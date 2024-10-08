import React, { useEffect } from "react";
import { Box, Container, Flex, Skeleton, SkeletonCircle, Text, VStack, IconButton, Heading } from "@chakra-ui/react";
import useAuthStore from "../../store/authStore";
import useGetSparkProfileById from "../../hooks/useGetSparkProfileById";
import SparkMatch from "./SparkMatch";
import useGetSparkMatchesById from "../../hooks/useGetSparkMatchesById";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretLeft } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { doc, updateDoc } from "firebase/firestore";
import { firestore } from "../../firebase/firebase";


const SparkMatches = () => {
    const authUser = useAuthStore((state) => state.user);
    //const { isLoading: profileLoading, sparkProfile } = useGetSparkProfileById(authUser?.uid);
  //const sparkProfile = useSparkProfileStore((state) => state.setSparkProfile);
  const { isLoading, sparkMatches } = useGetSparkMatchesById(authUser?.uid);
  //const [viewedPosts, setViewedPosts] = useState([]);
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate("/spark"); // Navigate to the previous page
};

useEffect(() => {
  const updateCheckedMatches = async () => {
    //console.log(authUser);
      if (authUser && authUser.uid) {
          try {
              const userRef = doc(firestore, "spark", authUser.uid);
              await updateDoc(userRef, {
                  checkedMatches: new Date().getTime()
              });
          } catch (error) {
              console.error("Error updating checkedMatches:", error);
          }
      }
  };

  updateCheckedMatches();
}, [authUser]);

const sortedMatches = sparkMatches.slice().sort((a, b) => {
  const lastMessageA = a.messages[a.messages.length - 1];
  const lastMessageB = b.messages[b.messages.length - 1];
  
  // Convert timestamps to seconds if needed
  const createdAtA = a.createdAt / 1000;
  const createdAtB = b.createdAt / 1000;

  // Get the timestamp of the last message, if available, otherwise use the createdAt timestamp
  const lastMessageTimeA = lastMessageA?.timeStamp?.seconds ? lastMessageA.timeStamp.seconds : createdAtA;
  const lastMessageTimeB = lastMessageB?.timeStamp?.seconds ? lastMessageB.timeStamp.seconds : createdAtB;

  // Determine the latest timestamp to sort by newest first
  const latestA = Math.max(createdAtA, lastMessageTimeA);
  const latestB = Math.max(createdAtB, lastMessageTimeB);

  // Sort in descending order (newest first)
  return latestB - latestA;
});


  return (
    <Container pt={6}   px={0} w={['100vw', null, '80vh']} pb={{base: "10vh", md: "60px"}}>
      <Flex align="center" mb={4}>
                    <IconButton
                        icon={<FontAwesomeIcon fontSize={32} icon={faCaretLeft} />}
                        aria-label="Go back"
                        color="#eb7734"
                        variant="ghost"
                        onClick={handleGoBack}
                        ml={5}
                        mr={4}
                    />
                    <Heading as="h1" size="lg">Matches</Heading>
                </Flex>
      {isLoading &&
        [0, 1, 2, 3, 4].map((_, idx) => (
          <VStack key={idx} gap={4} alignItems={"flex-start"} mb={10}>
            <Flex gap='2'>
              <SkeletonCircle size='10' />
              <VStack gap={2} alignItems={"flex-start"}>
                <Skeleton height='10px' w={"200px"} />
                <Skeleton height='10px' w={"200px"} />
              </VStack>
            </Flex>
            <Skeleton w={"full"}>
              <Box h={"50px"}>contents wrapped</Box>
            </Skeleton>
          </VStack>
        ))}
      
      {!isLoading && sortedMatches.length > 0 && sortedMatches.map((match) => <SparkMatch key={match.matchedUserId} userId={authUser.uid} matchedUserId={match.matchedUserId} />)}
      
      
    </Container>
  );
};

export default SparkMatches;
