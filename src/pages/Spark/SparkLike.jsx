import { Box, Image } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { NotificationsLogo, UnlikeLogo } from "../../assets/constants";
import useAuthStore from "../../store/authStore";
import useLikeSpark from "../../hooks/useLikeSpark";
import useGetSparkProfileById from "../../hooks/useGetSparkProfileById";

const SparkLike = ({ sparkProfile, onMatchChange }) => {
  const authUser = useAuthStore((state) => state.user);
  const { handleLikeSpark, canLike, isLiked: initialIsLiked, isUpdating, setIsUpdating, match } = useLikeSpark(sparkProfile);
  //const { isLoading, sparkProfile: sparkUser } = useGetSparkProfileById(authUser?.uid);

  useEffect(() => {
    if (onMatchChange) {
      onMatchChange(match);
    }
  }, [match, onMatchChange]);

  //console.log(sparkUser);

  console.log

  const [isLiked, setIsLiked] = useState(initialIsLiked);
  //const [likeCount, setLikeCount] = useState(initialLikeCount);

  //const [likeCount, setLikeCount] = useState(0);


  useEffect(() => {
    setIsLiked(initialIsLiked);
    //setLikeCount(initialLikeCount);
  }, [initialIsLiked]);

 

  const handleLikeClick = async () => {

    const newIsLiked = !isLiked;


    if (!authUser || !authUser.spark || isUpdating) return;

    setIsLiked(newIsLiked);




     try {
      const isAllowedToLike = await canLike();
      
      if (!isAllowedToLike) {
        setIsLiked(!newIsLiked);
        //console.log("You have reached your likes limit. Please wait.");
        return;
      } 

      setIsUpdating(true);

      await handleLikeSpark();
      setIsLiked(!newIsLiked);
    } catch (error) {
      console.error("Error handling like click:", error);
      setIsLiked(!newIsLiked); // Rollback on error
      //setIsLikedMe(isLikedMe);
    } finally {
        setIsUpdating(false);
      }
  };

  return ( 
    
    <Box onClick={handleLikeClick} cursor="pointer" fontSize={18} width="5%" ml={3} mr={0} textAlign="left" >
      {!isLiked ? <NotificationsLogo  /> : <UnlikeLogo />}
    </Box>
  
  );
};

export default SparkLike;
