import { Button, Flex, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Text, Box } from "@chakra-ui/react";
import Comment from "../Comment/Comment";
import usePostComment from "../../hooks/usePostComment";
import useLikeComment from "../../hooks/useLikeComment";
import { useRef, useState, useEffect } from "react";
import useAuthStore from "../../store/authStore";
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { firestore } from "../../firebase/firebase";
import { NotificationsLogo, UnlikeLogo } from "../../assets/constants";

const CommentsModal = ({ isOpen, onClose, post }) => {
    const { handlePostComment, isCommenting } = usePostComment();
    const { handleLikeComment } = useLikeComment();
    const [comments, setComments] = useState(post.comments);
    const commentRef = useRef(null);
    const commentsContainerRef = useRef(null);
    const authUser = useAuthStore((state) => state.user);
    const [userCommentLikes, setUserCommentLikes] = useState(new Set());
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    const handleSubmitComment = async (e) => {
        e.preventDefault();
        await handlePostComment(post.id, commentRef.current.value);
        commentRef.current.value = "";
        await updateComments();
    };

    const updateComments = async (userLikes = new Set()) => {
        const postRef = doc(firestore, "posts", post.id);
        const postDoc = await getDoc(postRef);
        if (postDoc.exists()) {
            const postData = postDoc.data();
            const updatedComments = postData.comments.map(comment => ({
                ...comment,
                likedByUser: userLikes.has(comment.id)
            }));
            setComments(updatedComments);
        }
    };

    const fetchUserCommentLikes = async () => {
        if (authUser) {
            const userRef = doc(firestore, "users", authUser.uid);
            const userDoc = await getDoc(userRef);

            if (userDoc.exists()) {
                const userData = userDoc.data();

                // Initialize commentLikes if it doesn't exist
                if (!userData.commentLikes) {
                    await setDoc(userRef, { commentLikes: [] }, { merge: true });
                    setUserCommentLikes(new Set());
                } else {
                    const commentLikesSet = new Set(userData.commentLikes || []);
                    setUserCommentLikes(commentLikesSet);
                    return commentLikesSet;
                }
            } else {
                console.error("User document does not exist");
            }
        }
        return new Set();
    };

    useEffect(() => {
        if (isOpen && isInitialLoad) {
            fetchUserCommentLikes().then(userLikes => {
                updateComments(userLikes);
            });
            const scrollToBottom = () => {
                if (commentsContainerRef.current) {
                    commentsContainerRef.current.scrollTop = commentsContainerRef.current.scrollHeight;
                }
            };
            setTimeout(scrollToBottom, 100);
            setIsInitialLoad(false);
        }
    }, [isOpen, isInitialLoad]);

    const handleCommentLike = async (commentId) => {
        if (authUser) {
            // Optimistic update
            setComments(prevComments =>
                prevComments.map(comment =>
                    comment.id === commentId
                        ? {
                            ...comment,
                            likes: comment.likedByUser ? comment.likes - 1 : comment.likes + 1,
                            likedByUser: !comment.likedByUser
                        }
                        : comment
                )
            );

            // Update in the backend without waiting
            handleLikeComment(post.id, commentId);

            // Create notification
            const comment = comments.find(comment => comment.id === commentId);
            if (comment) {
                const notification = {
                    userId: authUser.uid,
                    time: new Date(),
                    postId: post.id,
                    commentId,
                    type: "commentLike"
                };
                const commentUserRef = doc(firestore, "users", comment.createdBy);
                await updateDoc(commentUserRef, {
                    notifications: arrayUnion(notification)
                });
            }
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
                                <Flex alignItems={"left"} gap={0} mt={2}>
                                    <Comment comment={comment} />
                                    <Flex alignItems="center" ml={4}>
                                        <Box display="flex" alignItems="center" m={0}>
                                            <Button
                                                onClick={() => handleCommentLike(comment.id)}
                                                variant="unstyled"
                                                aria-label={comment.likedByUser ? "Unlike" : "Like"}
                                            >
                                                {comment.likedByUser ? <UnlikeLogo /> : <NotificationsLogo />}
                                            </Button>
                                            <Text fontSize="sm" ml={0}>
                                                {comment.likes || 0} Likes
                                            </Text>
                                        </Box>
                                    </Flex>
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
