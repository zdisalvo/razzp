import { Box, Image } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { NotificationsLogo, UnlikeLogo } from "../../assets/constants";
import useAuthStore from "../../store/authStore";
import useCrownSpark from "../../hooks/useCrownSpark";

const SparkCrown = ({ sparkProfile }) => {
  const authUser = useAuthStore((state) => state.user);
  const { handleLikeSpark, isLiked: initialIsLiked, isLikedMe: initialIsLikedMe } = useCrownSpark(sparkProfile);

  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isLikedMe, setIsLikedMe] = useState(initialIsLikedMe);

  useEffect(() => {
    setIsLiked(initialIsLiked);
    setIsLikedMe(initialIsLikedMe);
  }, [initialIsLiked, initialIsLikedMe]);

  const handleLikeClick = async () => {
    if (!authUser) return;
    if (isLiked) return;

    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setIsLikedMe(newIsLiked); // Assuming you want to update isLikedMe as well

    try {
      await handleLikeSpark();
    } catch (error) {
      console.error("Error handling like click:", error);
      setIsLiked(isLiked); // Rollback on error
      setIsLikedMe(isLikedMe);
    }
  };

  return (
    <Box onClick={handleLikeClick} cursor="pointer" fontSize={32} width="10%" ml={3} mr={3} textAlign="left">
      {!isLiked ? <Image src="/white-crown-small.png" ml={2} /> : <Image src="/blue-crown-small.png" ml={2} />}
    </Box>
  );
};

export default SparkCrown;
