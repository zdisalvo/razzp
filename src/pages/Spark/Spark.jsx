import { Box, Container, Flex, Skeleton, SkeletonCircle, Text, VStack, IconButton, useDisclosure } from "@chakra-ui/react";
import useGetSparkProfiles from "../../hooks/useGetSparkProfiles";
import SparkProfile from "./SparkProfile";
import useSparkProfileStore from "../../store/sparkProfileStore";
import useAuthStore from "../../store/authStore";
import useGetSparkProfileById from "../../hooks/useGetSparkProfileById";
import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";
//import useSparkProfileView from "../../hooks/useSparkProfileView";
import {firestore} from "../../firebase/firebase";
import { FaSlidersH } from "react-icons/fa";
import FilterUserModal from "./FilterUserModal";


const Spark = () => {
    const authUser = useAuthStore((state) => state.user);
    const { isLoading: profileLoading, sparkProfile } = useGetSparkProfileById(authUser?.uid);
  //const sparkProfile = useSparkProfileStore((state) => state.setSparkProfile);
  const { isLoading, sparkProfiles } = useGetSparkProfiles(sparkProfile);
  //const [viewedPosts, setViewedPosts] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();

  //const { updateProfileView } = useSparkProfileView();

  // const handleViewed = (profileId) => {
  //   // Check if the profileId is already being handled
  //   if (profileId) {
  //     updateProfileView(profileId);
  //   }
  // };

  const handleViewed = async (profileId) => {

    //console.log(profileId);


    //

    // useEffect(() => {
    //   if (!profileLoading && sparkProfile) {
    //     setIsLiked(sparkProfile.liked.includes(profileId));
    //     setLikeCount(sparkUser.dayLikes);
    //   }
    // }, [isLoading, sparkUser, sparkProfile.uid]);

    //

    //updateProfileView(profileId);
    
    const sparkUserRef = doc(firestore, "spark", authUser.uid);


    if (!sparkProfile.viewed1x.includes(profileId) && !sparkProfile.viewed2x.includes(profileId)
       && !sparkProfile.viewed3x.includes(profileId)) {

      await updateDoc(sparkUserRef, {
        viewed1x: arrayUnion(profileId),
      });
    } else if (sparkProfile.viewed1x.includes(profileId)) {
      await updateDoc(sparkUserRef, {
        viewed1x: arrayRemove(profileId),
        viewed2x: arrayUnion(profileId),
      });
    } else if (sparkProfile.viewed2x.includes(profileId)) {
      await updateDoc(sparkUserRef, {
        viewed2x: arrayRemove(profileId),
        viewed3x: arrayUnion(profileId),
      });
    } else if (sparkProfile.viewed3x.includes(profileId)) {
      await updateDoc(sparkUserRef, {
        viewed3x: arrayRemove(profileId),
      });
    } 

      //viewed1x: isLikedMe ? arrayRemove(authUser.uid) : arrayUnion(authUser.uid),

  };
  //console.log(sparkProfile);

  return (
    <Container py={6}   px={0} w={['100vw', null, '60vh']} >

      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Text fontSize="2xl" fontWeight="bold">Spark Profiles</Text>
        <IconButton
          icon={<FaSlidersH />}
          aria-label="Filter users"
          onClick={onOpen}
        />
      </Flex>

      {isLoading &&
        [0, 1, 2].map((_, idx) => (
          <VStack key={idx} gap={4} alignItems={"flex-start"} mb={10}>
            <Flex gap='2'>
              <SkeletonCircle size='10' />
              <VStack gap={2} alignItems={"flex-start"}>
                <Skeleton height='10px' w={"200px"} />
                <Skeleton height='10px' w={"200px"} />
              </VStack>
            </Flex>
            <Skeleton w={"full"}>
              <Box h={"400px"}>contents wrapped</Box>
            </Skeleton>
          </VStack>
        ))}
      
      {!isLoading && sparkProfiles.length > 0 && sparkProfiles.map((profile) => <SparkProfile key={profile.uid} id={profile.uid} sparkProfile={profile} onViewed={handleViewed} />)}
      
      <FilterUserModal isOpen={isOpen} onClose={onClose} />
    </Container>
  );
};

export default Spark;
