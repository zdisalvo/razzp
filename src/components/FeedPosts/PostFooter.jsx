import { Box, Button, Flex, Input, InputGroup, InputRightElement, Text, useDisclosure, Image } from "@chakra-ui/react";
import { useRef, useState, useEffect } from "react";
import { CommentLogo, NotificationsLogo, UnlikeLogo } from "../../assets/constants";
import usePostComment from "../../hooks/usePostComment";
import useAuthStore from "../../store/authStore";
import useLikePost from "../../hooks/useLikePost";
import { timeAgo } from "../../utils/timeAgo";
import CommentsModal from "../Modals/CommentsModal";
import useCrownPost from "../../hooks/useCrownPost";

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

    const[totalScore, setTotalScore] = useState(post.score);

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
                <Box cursor={"pointer"} fontSize={18} onClick={() => commentRef.current.focus()}>
                    <CommentLogo />
                </Box>
            </Flex>
            <Text fontWeight={600} fontSize={"sm"} ml={{base: 2, md: 3}} mb={1}>
                {/* {totalScore === 1 ? `${totalScore} point` : `${totalScore} points`} */}
                {totalScore}°
            </Text>

            {isProfilePage && (
                <Text fontSize="12" color={"gray"}>
                    Posted {timeAgo(post.createdAt)}
                </Text>
            )}

            {!isProfilePage && (
                <>
                    <Text fontSize="sm" fontWeight={700} ml={{base: 2, md: 3}} mb={1}>
                        {creatorProfile?.username}{" "}
                        <Text as="span" fontWeight={400}>
                            {post.caption}
                        </Text>
                    </Text>
                    {post.comments.length > 0 && (
                        <Text fontSize="sm" ml={{base: 2, md: 3}} color={"gray"} cursor={"pointer"} onClick={onOpen}>
                            View all {post.comments.length} comments
                        </Text>
                    )}
                    {/* COMMENTS MODAL ONLY IN THE HOME PAGE */}
                    {isOpen ? <CommentsModal isOpen={isOpen} onClose={onClose} post={post} /> : null}
                </>
            )}

            {authUser && (
                <Flex alignItems={"center"} gap={2} justifyContent={"space-between"} px={0} w={"full"}>
                    <InputGroup>
                        <Input
                            variant={"flushed"}
                            focusBorderColor="#eb7734"
                            placeholder={"Add a comment..."}
                            fontSize={16}
                            ml={{base: 2, md: 3}}
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
                </Flex>
            )}
        </Box>
    );
};

export default PostFooter;
