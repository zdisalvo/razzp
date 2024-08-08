import React from "react";
import { Box, Image, Text, VStack, HStack, Container, Avatar } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import FollowButton from "../../pages/Following/FollowButton";
import useGetSuggestedUsers2 from "../../hooks/useGetSuggestedUsers2";
import useAuthStore from "../../store/authStore";

const SuggestedUsersBanner = () => {
    const authUser = useAuthStore((state => state.user));
    const { suggestedUsers, isLoading } = useGetSuggestedUsers2();

  return (
    
    <Container maxW={{base: "100vw", md: "670px"}} py={4}>
      <HStack spacing={2} overflowX="scroll" py={3}>
        {!isLoading && suggestedUsers.map((user) => (
          <VStack
            key={user.uid}
            spacing={2}
            //align="center"
            bg="black"
            borderRadius="20px"
            boxShadow="none"
            p={4}
            minW="100px"
            maxW="150px"
            display="flex"
            flexDirection="column"
            alignItems="center"
            textAlign="center"
            border="none"
          >
            <Link to={`/${user.username}`}>
            <Avatar
              boxSize="100px"
              //borderRadius="full"
              src={user.profilePicURL}
              alt={user.username}
            />
            <Text fontWeight="bold" mt={2}>{user.username}</Text>
            </Link>
            <Box alignItems="center">
            <FollowButton
              userProfile={user}
              isFollowing={authUser.following.includes(user.uid)}
              requested={authUser && user.requested && user.requested.includes(authUser.uid)}
            />
            </Box>
          </VStack>
        ))}
      </HStack>
    </Container>

  );
};

export default SuggestedUsersBanner;
