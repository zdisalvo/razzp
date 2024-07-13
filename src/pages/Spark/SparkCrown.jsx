import { Box, Image } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { NotificationsLogo, UnlikeLogo } from "../../assets/constants";
import useAuthStore from "../../store/authStore";
import useCrownSpark from "../../hooks/useCrownSpark";

const SparkCrown = ({ sparkProfile }) => {
  const authUser = useAuthStore((state) => state.user);
  const { handleLikeSpark, isLiked: initialIsLiked, isUpdating } = useCrownSpark(sparkProfile);

  const [isLiked, setIsLiked] = useState(initialIsLiked);


  useEffect(() => {
    setIsLiked(initialIsLiked);
    
  }, [initialIsLiked]);

  const handleLikeClick = async () => {

    const newIsLiked = !isLiked;

    if (!authUser || !authUser.spark || isUpdating) return;
    if (isLiked) return;

    setIsLiked(newIsLiked);
 
    try {
      await handleLikeSpark();
    } catch (error) {
      console.error("Error handling like click:", error);
      setIsLiked(!newIsLiked); // Rollback on error
      
    }
  };

  return (
    <Box onClick={handleLikeClick} cursor="pointer" fontSize={32} width="10%" ml={3} mr={3} textAlign="left">
      {!isLiked ? <Image src="/white-crown-small.png" ml={2} /> : <Image src="/blue-crown-small.png" ml={2} />}
    </Box>
  );
};

export default SparkCrown;
