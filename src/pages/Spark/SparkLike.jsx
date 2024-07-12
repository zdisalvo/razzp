import { Box, Image } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { NotificationsLogo, UnlikeLogo } from "../../assets/constants";
import useAuthStore from "../../store/authStore";
import useLikeSpark from "../../hooks/useLikeSpark";
import useGetSparkProfileById from "../../hooks/useGetSparkProfileById";

const SparkLike = ({ sparkProfile }) => {
  const authUser = useAuthStore((state) => state.user);
  const { handleLikeSpark, isLiked: initialIsLiked, isLikedMe: initialIsLikedMe } = useLikeSpark(sparkProfile);
  //const { isLoading, sparkProfile: sparkUser } = useGetSparkProfileById(authUser?.uid);

  //console.log(sparkUser);

  const [isLiked, setIsLiked] = useState(initialIsLiked);
  //const [isLikedMe, setIsLikedMe] = useState(initialIsLikedMe);

  //const [likeCount, setLikeCount] = useState(0);


  useEffect(() => {
    setIsLiked(initialIsLiked);
    //  setIsLikedMe(initialIsLikedMe);
  }, [initialIsLiked, initialIsLikedMe]);

//   useEffect(() => {
//     if (!isLoading && sparkUser) {
//       setLikeCount(sparkUser.dayLikes); // Update like count
//     }
//   }, [isLoading, sparkUser]);

  //console.log(likeCount);

  const handleLikeClick = async () => {
    if (!authUser || !authUser.spark) return;

    const newIsLiked = !isLiked;

    //setLikeCount(prevCount => newIsLiked ? prevCount + 1 : prevCount - 1);

    //setLikeCount(sparkUser.dayLikes);

    //if (likeCount >= 2) return;

    setIsLiked(newIsLiked);
    //setIsLikedMe(newIsLiked); // Assuming you want to update isLikedMe as well

    try {
      await handleLikeSpark();
    } catch (error) {
      console.error("Error handling like click:", error);
      //setIsLiked(isLiked); // Rollback on error
      //setIsLikedMe(isLikedMe);
    }
  };

  return (
    <Box onClick={handleLikeClick} cursor="pointer" fontSize={18} width="5%" ml={3} mr={0} textAlign="left" >
      {!isLiked ? <NotificationsLogo  /> : <UnlikeLogo />}
    </Box>
  );
};

export default SparkLike;
