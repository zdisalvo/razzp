import { Box, Image } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { NotificationsLogo, UnlikeLogo } from "../../assets/constants";
import useAuthStore from "../../store/authStore";
import useLikeSpark from "../../hooks/useLikeSpark";
import useGetSparkProfileById from "../../hooks/useGetSparkProfileById";
import SparkSubscribeModal from "./SparkSubscribeModal";

const SparkLike = ({ sparkProfile, onMatchChange, userSubscribed, expDate, subscriptionStatus }) => {
  const { authUser, fetchUserData } = useAuthStore((state) => ({
		authUser: state.user,
		fetchUserData: state.fetchUserData,
	  }));
  const { handleLikeSpark, canLike, isLiked: initialIsLiked, isUpdating, setIsUpdating, match } = useLikeSpark(sparkProfile);
  //const { isLoading, sparkProfile: sparkUser } = useGetSparkProfileById(authUser?.uid);
  const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false);

  if (!authUser)
    return;
  


  const handleOpenSubscribeModal = () => {
    //console.log(userSubscribed);
		if (!userSubscribed)
			setIsSubscribeModalOpen(true);
		else if (userSubscribed && subscriptionStatus === "canceled") {
			//console.log(expDate);
			showToast("Your subscription is canceled but active until " + expDate);
		} else if (userSubscribed)
			setIsCancelModalOpen(true);
	}

	const handleSubscribeModalClose = async () => {

		handleFetchUserData(authUser.uid);
		
		setIsSubscribeModalOpen(false);
	}

  const handleFetchUserData = async (userId) => {
		try {
		  // Add a delay using setTimeout wrapped in a Promise
		  await new Promise((resolve) => setTimeout(resolve, 1500));
	  
		  // Now call fetchUserData
		  await fetchUserData(userId);
		} catch (error) {
		  console.error("Error fetching user data:", error);
		} 
  };
  


  

  useEffect(() => {
    if (onMatchChange) {
      onMatchChange(match);
    }
  }, [match, onMatchChange]);

  //console.log(sparkUser);


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
      const isAllowedToLike = await canLike(userSubscribed);
      
      if (!isAllowedToLike) {
        setIsLiked(!newIsLiked);
        //console.log("You have reached your likes limit. Please wait.");
        handleOpenSubscribeModal();
        return;
      } 

      setIsUpdating(true);

      const maxReached = await handleLikeSpark(userSubscribed) || false;
      //console.log(maxReached);
      if (maxReached)
        handleOpenSubscribeModal();
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
    <>
    <Box onClick={handleLikeClick} cursor="pointer" fontSize={18} width="5%" ml={3} mr={0} textAlign="left" >
      {!isLiked ? <NotificationsLogo  /> : <UnlikeLogo />}
    </Box>
    {isSubscribeModalOpen && <SparkSubscribeModal isOpen={isSubscribeModalOpen} onClose={handleSubscribeModalClose} authUser={authUser} isSubscribed={userSubscribed} />}
    </>
  );
};

export default SparkLike;
