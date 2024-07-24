import { Box, Image } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { NotificationsLogo, UnlikeLogo } from "../../assets/constants";
import useAuthStore from "../../store/authStore";
import useCrownSpark from "../../hooks/useCrownSpark";

const SparkCrown = ({ sparkProfile, onMatchChange }) => {
  const authUser = useAuthStore((state) => state.user);
  const { handleLikeSpark, canLike, isLiked: initialIsLiked, isUpdating, setIsUpdating, match } = useCrownSpark(sparkProfile);

  useEffect(() => {
    if (onMatchChange) {
      onMatchChange(match);
    }
  }, [match, onMatchChange]);


  const [isLiked, setIsLiked] = useState(initialIsLiked);


  useEffect(() => {
    setIsLiked(initialIsLiked);
    
  }, [initialIsLiked]);

  const handleLikeClick = async () => {

    const newIsLiked = !isLiked;

    if (!authUser || !authUser.spark || isUpdating) return;

    //CAN'T UNCROWN
    //if (isLiked) return;

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
    <Box onClick={handleLikeClick} cursor="pointer" fontSize={32} width="10%" ml={3} mr={3} textAlign="left">
      {!isLiked ? <Image src="/white-crown-small.png" ml={2} /> : <Image src="/blue-crown-small.png" ml={2} />}
    </Box>
  );
};

export default SparkCrown;
