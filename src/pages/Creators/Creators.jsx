import React, { useState, useEffect, useCallback } from 'react';
import { Avatar, Button, Flex, Text, VStack, Container, IconButton, Heading, Box } from '@chakra-ui/react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretLeft } from "@fortawesome/free-solid-svg-icons";
import { doc, getDocs, query, orderBy, collection } from 'firebase/firestore';
import { firestore } from '../../firebase/firebase';
import useAuthStore from '../../store/authStore';
import useFollowUserFP from '../../hooks/useFollowUserFP';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import LoadingPage from '../../components/Loading/LoadingPage';
import FollowButton from '../Following/FollowButtonSuggested';

const TopCreators = () => {
  const [creators, setCreators] = useState([]);
  const [followStates, setFollowStates] = useState({});
  const [loading, setLoading] = useState(true);

  const authUser = useAuthStore((state) => state.user);
  const { handleFollowUser } = useFollowUserFP();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCreators = async () => {
      try {
        const usersRef = collection(firestore, 'users');
        const usersQuery = query(usersRef, orderBy('creatorGross', 'desc'));
        const querySnapshot = await getDocs(usersQuery);

        const creatorsData = querySnapshot.docs
          .map((doc) => ({ uid: doc.id, ...doc.data() }))
          .filter((creator) => creator.creatorGross > 0);

        const followState = {};
        creatorsData.forEach((creator) => {
          followState[creator.uid] = authUser?.following.includes(creator.uid);
        });

        setCreators(creatorsData);
        setFollowStates(followState);
      } catch (error) {
        console.error('Error fetching top creators:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCreators();
  }, [authUser]);

  const handleFollowClick = async (userId) => {
    const isCurrentlyFollowing = followStates[userId];

    setFollowStates((prevStates) => ({
      ...prevStates,
      [userId]: !isCurrentlyFollowing,
    }));

    try {
      await handleFollowUser(userId, isCurrentlyFollowing);
    } catch (error) {
      console.error('Error updating follow status:', error);
      setFollowStates((prevStates) => ({
        ...prevStates,
        [userId]: isCurrentlyFollowing,
      }));
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
        <Flex flexDir='column' h='100vh' alignItems='center' justifyContent='center'>
			{/* <Spinner size='xl' /> */}
            <LoadingPage />
		    </Flex>
    );
  }

  return (
    <Container py={6} px={0} w={['100vw', null, '80vh']} pb={{base: "7vh", md: "30px"}}>
      {/* Go Back Button */}
      <Flex align="center" mb={4}>
        <IconButton
          icon={<FontAwesomeIcon fontSize={32} icon={faCaretLeft} />}
          aria-label="Go back"
          variant="ghost"
          onClick={handleGoBack}
          color="#eb7734"
          ml={5}
          mr={4}
        />
        <Heading as="h1" size="lg">
          Top Creators
        </Heading>
      </Flex>

      <VStack spacing={4} align="stretch" p={5} ml={5}>
        {creators.map((creator, index) => (
          <Flex
            key={creator.uid}
            p={1}
            borderRadius="md"
            bg="black"
            shadow="sm"
            align="center"
            justify="space-between"
          >
            {/* Ranking */}
            <Text fontSize="lg" fontWeight="bold" mr={4}>
              #{index + 1}
            </Text>

            {/* Avatar and username */}
            <Flex align="center" flex="1">
            <RouterLink to={`/${creator.username}`}>
              <Avatar
                src={creator.profilePicURL}
                name={creator.username}
                size="md"
                mr={4}
              />
              </RouterLink>
              <RouterLink to={`/${creator.username}`}>
                <Text fontWeight="bold" fontSize="md">
                  {creator.username}
                </Text>
              </RouterLink>
            </Flex>

            {/* Total earnings */}
            <Box textAlign="center" flex="1">
            <Text fontWeight="bold" color="green.500" fontSize="lg">
              ${creator.creatorGross?.toLocaleString() || '0'}
            </Text>
            </Box>

            {/* Follow Button */}
            <Box textAlign="left" flex="1">
            <FollowButton
                userProfile={creator}
                isFollowing={authUser.following.includes(creator.uid)}
                requested={authUser && creator.requested && creator.requested.includes(authUser.uid)}
            />
            </Box>
          </Flex>
        ))}
      </VStack>
    </Container>
  );
};

export default TopCreators;
