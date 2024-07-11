import { Box } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { NotificationsLogo, UnlikeLogo } from "../../assets/constants";
import useAuthStore from "../../store/authStore";
import useLikeSpark from "../../hooks/useLikeSpark";

const SparkLike = ({ sparkProfile }) => {
  const authUser = useAuthStore((state) => state.user);
  const { handleLikeSpark, isLiked: initialIsLiked, isLikedMe: initialIsLikedMe } = useLikeSpark(sparkProfile);

  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isLikedMe, setIsLikedMe] = useState(initialIsLikedMe);

  useEffect(() => {
    setIsLiked(initialIsLiked);
    setIsLikedMe(initialIsLikedMe);
  }, [initialIsLiked, initialIsLikedMe]);

  const handleLikeClick = async () => {
    if (!authUser) return;

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
    <Box onClick={handleLikeClick} cursor="pointer" fontSize={18} ml={5} mr={5} textAlign="left">
      {!isLiked ? <NotificationsLogo /> : <UnlikeLogo />}
    </Box>
  );
};

export default SparkLike;
