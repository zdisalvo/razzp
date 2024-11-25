import { Box, Button, Flex, Input, InputGroup, InputRightElement, Text, useDisclosure, Image } from "@chakra-ui/react";
import { useRef, useState, useEffect } from "react";
import { CommentLogo, NotificationsLogo, UnlikeLogo } from "../../assets/constants";
import usePostComment from "../../hooks/usePostComment";
import useAuthStore from "../../store/authStore";
import useLikePost from "../../hooks/useLikePost";
import { timeAgo } from "../../utils/timeAgo";
import CommentsModal from "../Modals/CommentsModal";
import useCrownPost from "../../hooks/useCrownPost";
//import ShareButtonOverlay from "./ShareButtonOverlay";
import ShareButton from "./ShareButton";
import ShareButtonDL from "./ShareButtonDL";
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { firestore } from '../../firebase/firebase';
import usePurchasePost from "../../hooks/usePurchasePost";
import CheckoutButton from "../Stripe/CheckoutButton";
import AgePaymentModal from "../Stripe/AgePaymentModal";

const PostFooter = ({ post, isProfilePage, creatorProfile }) => {
    const { isCommenting, handlePostComment } = usePostComment();
    const [comment, setComment] = useState("");
    const authUser = useAuthStore((state) => state.user);
    const commentRef = useRef(null);
    const { handleLikePost, isLiked: initialIsLiked, likes: initialLikes } = useLikePost(post);
    const { handleCrownPost, canCrown, isCrowned: initialIsCrowned, crowns: initialCrowns, isUpdating, setIsUpdating } = useCrownPost(post);
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [isLiked, setIsLiked] = useState(initialIsLiked); // Local state for isLiked
    const [likes, setLikes] = useState(initialLikes); // Local state for likes

    const [isCrowned, setIsCrowned] = useState(initialIsCrowned); // Local state for isLiked
    const [crowns, setCrowns] = useState(initialCrowns);

    const [postComments, setPostComments] = useState(post?.comments.length || 0);
    const { handlePurchase } = usePurchasePost();
    const [isPurchased, setIsPurchased] = useState(post.purchased && authUser && post.purchased.includes(authUser?.uid));
    const [purchasedUsers, setPurchasedUsers] = useState(post.purchased || null); // Store purchased users
    const [isModalOpen, setIsModalOpen] = useState(false);
    const previewLimit = 125; 
    const [isExpanded, setIsExpanded] = useState(false);
    const [isSubscribedToCreator, setIsSubscribedToCreator] = useState(false);
	const [isInitialized, setIsInitialized] = useState(false);
	
	useEffect (() => {
		if (!authUser || !creatorProfile || isInitialized)
			return;

		  const isSubscribed = authUser.subscriptions && authUser.subscriptions.some((subscription) => {
			const isValidSubscription = subscription.creatorId === creatorProfile.uid;
			if (!isValidSubscription)
				return false;
			else
				 return subscription.activeSince.seconds * 1000 < post.createdAt; // Check if expirationDate is in the future
			//console.log(isExpirationValid);
			
			//return isValidSubscription && isExpirationValid
		  });
		  
		  setIsSubscribedToCreator(isSubscribed);

		setIsInitialized(true);
	})

    // Decide whether to show full or truncated caption
    const captionToShow = isExpanded
        ? post.caption
        : post.caption.length > previewLimit
        ? `${post.caption.substring(0, previewLimit)}...`
        : post.caption;

    const handlePurchaseClick = () => {
		// setSparkProfile(profileData);
		// setSparkUser(match); // Assuming match contains user data
		setIsModalOpen(true);
	  };

    const handleModalClose = () => {
		setIsModalOpen(false);
	  };

    useEffect(() => {
        const postRef = doc(firestore, 'posts', post.id);
        const unsubscribe = onSnapshot(postRef, (snapshot) => {
            if (snapshot.exists()) {
                const updatedPost = snapshot.data();
                setPurchasedUsers(updatedPost.purchased);
                setIsPurchased(authUser && updatedPost.purchased && updatedPost.purchased.includes(authUser?.uid));
            }
        });

        return () => unsubscribe(); // Clean up the listener
    }, [post.id, authUser?.uid]);

    // const handlePurchaseClick = () => {
    //     handlePurchase(post, post.price);  // Pass the post and price to the purchase handler
    // };

    const calculateRankingScore = (post) => {
        const postTime = new Date(post.createdAt);
        const currentTime = new Date();
        const elapsedTimeInDays = (currentTime - postTime) / (1000 * 60 * 60 * 24);
        //console.log(post.score / (elapsedTimeInDays + 1));
        return post.score / (elapsedTimeInDays + 1);
    };

    const[totalScore, setTotalScore] = useState(Math.abs(Math.round(calculateRankingScore(post))));
    //const age = useState(post.createdAt);

    //const value = 2232333434;
    const formattedScore = totalScore.toLocaleString();
    const numFlames = formattedScore.replace(/,/g, '').length;

    const flames = Array.from({ length: Math.max(numFlames /2 , 1) }, (_, index) => (
        <Text key={index} fontSize="4xl" display="inline-block" mb={0} ml={0} mr={{base: -3, md: -7}}>
          🔥
        </Text>
      ));

      const getUpdatedComments = async () => {
        if (post.id) {
            try {
                const postRef = doc(firestore, 'posts', post.id);
                const postSnap = await getDoc(postRef);
                if (postSnap.exists()) {
                    const fetchedPost = postSnap.data();
                    setPostComments(fetchedPost.comments.length);
                } else {
                    console.log("No such document!");
                }
            } catch (error) {
                console.error("Error fetching post:", error);
            }
        }
    };
    

    useEffect(() => {
        setIsCrowned(initialIsCrowned);
        //setLikeCount(initialLikeCount);
      }, [initialIsCrowned]);

    const handleLikeClick = () => {
        
		if (authUser) {
			const newIsLiked = !isLiked;
			const newLikes = newIsLiked ? likes + 1 : likes - 1;
            const newScore = newIsLiked ? totalScore + 1 : totalScore - 1;

			setIsLiked(newIsLiked);
			setLikes(newLikes);
            setTotalScore(newScore);

			handleLikePost();
		} else {
			handleLikePost();
		}
        
        // if (newIsLiked !== initialIsLiked || newLikes !== initialLikes) {
        
        
    };

    const handleCrownClick = async () => {

        //don't allow uncrown
        if (isCrowned)
            return;

        const newIsCrowned = !isCrowned;

        // if (isCrowned)
        //     return;
        if (!authUser || isUpdating)
            return;

        setIsCrowned(newIsCrowned);

        const newCrowns = newIsCrowned ? crowns + Math.max(5, authUser.followers.length) : crowns - Math.max(5, authUser.followers.length);
        const newScore = newIsCrowned ? totalScore + Math.max(5, authUser.followers.length) : totalScore - Math.max(5, authUser.followers.length);
        setTotalScore(newScore);
		
            try{

            const isAllowedToCrown = await canCrown();

            if (!isAllowedToCrown) {
                setIsCrowned(!newIsCrowned);
                setTotalScore(newScore - Math.max(5, authUser.followers.length));
                return;
            }
            
            setIsUpdating(true);
			
			

			

			await handleCrownPost();
            setIsCrowned(!newIsCrowned);
			//setCrowns(newCrowns);
            //console.log("end: " + newIsCrowned);
            } catch (error) {
                console.error("Error handling like click:", error);
                setTotalScore(newScore - Math.max(5, authUser.followers.length));
                setIsCrowned(!newIsCrowned); // Rollback on error
                //setIsLikedMe(isLikedMe);
              } finally {
                  setIsUpdating(false);
                }
		
        // else {
		// 	handleCrownPost();
		// }
        
        // if (newIsLiked !== initialIsLiked || newLikes !== initialLikes) {
        
        
    };

    const handleSubmitComment = async () => {
        await handlePostComment(post.id, comment);
        setComment("");
        getUpdatedComments();
    };

    return (
        <Box mb={3} marginTop={"auto"} px={0} mx={3}>
            <Flex alignItems={"center"} gap={4} px={0} pt={0} mb={1} mt={4}>
                <Box onClick={handleLikeClick} cursor={"pointer"} fontSize={18}>
                    {!isLiked ? <NotificationsLogo /> : <UnlikeLogo />}
                </Box>
                <Box onClick={handleCrownClick} cursor={"pointer"} width="10%" fontSize={32}>
                    {!isCrowned ? <Image src="/white-crown-small.png" /> : <Image src="/blue-crown-small.png" />}
                </Box>
                {authUser && (
                <Box cursor={"pointer"} fontSize={18} onClick={() => commentRef.current.focus()}>
                    <CommentLogo />
                </Box >
                )}
                {creatorProfile && post && !post.paid && post.mediaType.startsWith("image/") && (
                <Box cursor={"pointer"} fontSize={18}>
                    {/* <ShareButtonOverlay imageUrl={post.imageURL} overlayText={`@${creatorProfile.username}`} /> */}
                    <ShareButtonDL imageUrl={post.imageURL} overlayText={`${creatorProfile.username}`} />
                    {/* <ShareButton imageUrl={post.imageURL} /> */}
                    
                </Box>
                )}
                {/* !post.purchased.includes(authUser.uid) */}
                {post && post.paid && (authUser && !isPurchased && !isSubscribedToCreator) &&  (
                <Box cursor={"pointer"} fontSize={18}>
                    {/* <CheckoutButton post={post} /> */}
                    <Button onClick={handlePurchaseClick}>Access for ${post.price}</Button>

                    
                    
                </Box>
                )}
            </Flex>
            {/* <Text color="#eb7734" fontSize="xl" fontWeight="bold" 
            sx={{ 
                textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
                fontStyle: "italic"
              }}  
            mb={1} ml={2}>
                
                {totalScore}°
            </Text> */}

            <Box position="relative" display="inline-block" m={0} p={0}>
                {flames}
                <Text
                    position="absolute"
                    top="50%"
                    left="50%"
                    transform="translate(-50%, -50%)"
                    fontSize="xl"
                    ml={{base: 2, md: 4}}
                    pt={2}
                    fontWeight="bold"
                    color="white"
                    sx={{ 
                    textShadow: "3px 3px 6px rgba(0, 0, 0, 1)",
                    fontStyle: "italic"
                    }}
                >
                    {formattedScore}°
                </Text>
                </Box>

            {isProfilePage && (
                <Text fontSize="12" color={"gray"}>
                    Posted {timeAgo(post.createdAt)}
                </Text>
            )}

            {!isProfilePage && (
                <>
                    <Text fontSize="sm" fontWeight={700} mb={1}>
                    {creatorProfile?.username}{" "}
                    <Text as="span" fontWeight={400} ml={2}>
                        {captionToShow}
                        {/* Show "Read more" only if the caption is truncated */}
                        {!isExpanded && post.caption.length > previewLimit && (
                        <Text
                            as="span"
                            color="gray.500"
                            cursor="pointer"
                            onClick={() => setIsExpanded(true)}
                        >
                            {" "}
                            more
                        </Text>
                        )}
                        {/* Allow user to collapse when expanded */}
                        {isExpanded && (
                        <Text
                            as="span"
                            color="gray.500"
                            cursor="pointer"
                            onClick={() => setIsExpanded(false)}
                        >
                            {" "}
                            collapse
                        </Text>
                        )}
                    </Text>
                    </Text>
                    {postComments > 0 && (
                        <Text fontSize="sm"  color={"gray"} cursor={"pointer"} onClick={onOpen}>
                            View all {postComments} comments
                        </Text>
                    )}
                    {/* COMMENTS MODAL ONLY IN THE HOME PAGE */}
                    {authUser && isOpen ? <CommentsModal isOpen={isOpen} onClose={onClose} post={post}  /> : null}
                    {/* userProfile={creatorProfile}  */}
                </>
            )}

            {authUser && (
                <Flex alignItems={"center"} gap={2} justifyContent={"space-between"} px={0} w={"full"}>
                    <InputGroup>
                        <Input
                            variant={"flushed"}
                            focusBorderColor="#eb7734"
                            placeholder={"Add a comment..."}
                            _placeholder={{ color: 'gray.500' }}
                            fontSize={16}
                            
                            onChange={(e) => setComment(e.target.value)}
                            value={comment}
                            ref={commentRef}
                        />
                        <InputRightElement mr={{base: 2, md: 3}}>
                            <Button
                                fontSize={14}
                                color={"blue.500"}
                                fontWeight={600}
                                cursor={"pointer"}
                                _hover={{ color: "white" }}
                                bg={"transparent"}
                                onClick={handleSubmitComment}
                                isLoading={isCommenting}
                            >
                                Post
                            </Button>
                        </InputRightElement>
                    </InputGroup>
                    {isModalOpen && <AgePaymentModal isOpen={isModalOpen} onClose={handleModalClose} post={post} creatorProfile={creatorProfile} />}
                </Flex>
            )}
        </Box>
    );
};

export default PostFooter;
