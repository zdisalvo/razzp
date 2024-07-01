import { Box, Button, Flex, Input, InputGroup, InputRightElement, Text, useDisclosure } from "@chakra-ui/react";
import { useRef, useState } from "react";
import { CommentLogo, NotificationsLogo, UnlikeLogo } from "../../assets/constants";
import usePostComment from "../../hooks/usePostComment";
import useAuthStore from "../../store/authStore";
import useLikePost from "../../hooks/useLikePost";
import { timeAgo } from "../../utils/timeAgo";
import CommentsModal from "../Modals/CommentsModal";

const PostFooter = ({ post, isProfilePage, creatorProfile }) => {
    const { isCommenting, handlePostComment } = usePostComment();
    const [comment, setComment] = useState("");
    const authUser = useAuthStore((state) => state.user);
    const commentRef = useRef(null);
    const { handleLikePost, isLiked: initialIsLiked, likes: initialLikes } = useLikePost(post);
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [isLiked, setIsLiked] = useState(initialIsLiked); // Local state for isLiked
    const [likes, setLikes] = useState(initialLikes); // Local state for likes

    const handleLikeClick = () => {
        
		if (authUser) {
			const newIsLiked = !isLiked;
			const newLikes = newIsLiked ? likes + 1 : likes - 1;

			setIsLiked(newIsLiked);
			setLikes(newLikes);

			handleLikePost();
		} else {
			handleLikePost();
		}
        
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

                <Box cursor={"pointer"} fontSize={18} onClick={() => commentRef.current.focus()}>
                    <CommentLogo />
                </Box>
            </Flex>
            <Text fontWeight={600} fontSize={"sm"} mb={1}>
                {likes === 1 ? `${likes} like` : `${likes} likes`}
            </Text>

            {isProfilePage && (
                <Text fontSize="12" color={"gray"}>
                    Posted {timeAgo(post.createdAt)}
                </Text>
            )}

            {!isProfilePage && (
                <>
                    <Text fontSize="sm" fontWeight={700} mb={1}>
                        {creatorProfile?.username}{" "}
                        <Text as="span" fontWeight={400}>
                            {post.caption}
                        </Text>
                    </Text>
                    {post.comments.length > 0 && (
                        <Text fontSize="sm" color={"gray"} cursor={"pointer"} onClick={onOpen}>
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
                            placeholder={"Add a comment..."}
                            fontSize={16}
                            onChange={(e) => setComment(e.target.value)}
                            value={comment}
                            ref={commentRef}
                        />
                        <InputRightElement>
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
