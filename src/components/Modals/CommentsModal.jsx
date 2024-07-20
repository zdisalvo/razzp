import { Button, Flex, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Text } from "@chakra-ui/react";
import Comment from "../Comment/Comment";
import usePostComment from "../../hooks/usePostComment";
import useLikeComment from "../../hooks/useLikeComment";
import { useRef, useState, useEffect } from "react";
import useAuthStore from "../../store/authStore";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "../../firebase/firebase";

const CommentsModal = ({ isOpen, onClose, post }) => {
    const { handlePostComment, isCommenting } = usePostComment();
    const { handleLikeComment, isLiking } = useLikeComment();
    const [comments, setComments] = useState(post.comments);
    const commentRef = useRef(null);
    const commentsContainerRef = useRef(null);
    const authUser = useAuthStore((state) => state.user);
    const [userCommentLikes, setUserCommentLikes] = useState(new Set());

    const handleSubmitComment = async (e) => {
        e.preventDefault();
        await handlePostComment(post.id, commentRef.current.value);
        commentRef.current.value = "";
    };

    const updateComments = async () => {
        const postRef = doc(firestore, "posts", post.id);
        const postDoc = await getDoc(postRef);
        if (postDoc.exists()) {
            setComments(postDoc.data().comments || []);
        }
    };

    const fetchUserCommentLikes = async () => {
        if (authUser) {
            const userRef = doc(firestore, "users", authUser.uid);
            const userDoc = await getDoc(userRef);
            if (userDoc.exists()) {
                const userData = userDoc.data();
                setUserCommentLikes(new Set(userData.commentLikes || []));
            }
        }
    };

    useEffect(() => {
        if (isOpen) {
            updateComments();
            fetchUserCommentLikes();
            const scrollToBottom = () => {
                if (commentsContainerRef.current) {
                    commentsContainerRef.current.scrollTop = commentsContainerRef.current.scrollHeight;
                }
            };
            setTimeout(scrollToBottom, 100);
        }
    }, [isOpen]);

    const handleCommentLike = async (commentId) => {
        if (authUser) {
            await handleLikeComment(post.id, commentId);
            // Refresh comment likes after liking/unliking
            fetchUserCommentLikes();
            updateComments();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} motionPreset='slideInLeft'>
            <ModalOverlay />
            <ModalContent bg={"black"} border={"1px solid gray"} maxW={{ base: "90vw", md: "400px" }} px={0}>
                <ModalHeader>Comments</ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={6}>
                    <Flex
                        mb={4}
                        gap={4}
                        flexDir={"column"}
                        maxH={"250px"}
                        overflowY={"auto"}
                        ref={commentsContainerRef}
                    >
                        {comments.map((comment, idx) => (
                            <Flex key={idx} direction="column" borderBottom="1px" borderColor="gray.600" pb={2} mb={2}>
                                <Comment comment={comment} />
                                <Flex align="center" mt={2}>
                                    <Button
                                        onClick={() => handleCommentLike(comment.id)}
                                        isLoading={isLiking}
                                        colorScheme={userCommentLikes.has(comment.id) ? "red" : "blue"}
                                        size="sm"
                                        mr={2}
                                    >
                                        {userCommentLikes.has(comment.id) ? "Unlike" : "Like"}
                                    </Button>
                                    <Text fontSize="sm">{comment.likes || 0} Likes</Text>
                                </Flex>
                            </Flex>
                        ))}
                    </Flex>
                    <form onSubmit={handleSubmitComment} style={{ marginTop: "2rem" }}>
                        <Input placeholder='Comment' size={"sm"} ref={commentRef} />
                        <Flex w={"full"} justifyContent={"flex-end"}>
                            <Button type='submit' ml={"auto"} size={"sm"} my={4} isLoading={isCommenting}>
                                Post
                            </Button>
                        </Flex>
                    </form>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default CommentsModal;
