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
    const [userScrolled, setUserScrolled] = useState(false);

    const handleSubmitComment = async (e) => {
        e.preventDefault();
        await handlePostComment(post.id, commentRef.current.value);
        commentRef.current.value = "";
        await updateComments();
    };

    const scrollToBottom = () => {
        if (commentsContainerRef.current && !userScrolled) {
            commentsContainerRef.current.scrollTop = commentsContainerRef.current.scrollHeight;
        }
    };

    const updateComments = async (userLikes = new Set()) => {
        const postRef = doc(firestore, "posts", post.id);
        const postDoc = await getDoc(postRef);
        if (postDoc.exists()) {
            const postData = postDoc.data();
            setComments(postData.comments);
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
        if (isOpen) {
            fetchUserCommentLikes().then(userLikes => {
                updateComments(userLikes);
                setTimeout(scrollToBottom, 100);
            });
        }
    }, [isOpen]);

    useEffect(() => {
        scrollToBottom();
    }, [comments, userScrolled]);

    const handleScroll = () => {
        if (commentsContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = commentsContainerRef.current;
            setUserScrolled(scrollTop + clientHeight < scrollHeight - 5);
        }
    };

    const handleCommentLike = async (commentId) => {
		if (authUser) {
			// Check if the comment is already liked by the user
			const isLiked = userCommentLikes.has(commentId);

            if (isLiked)
                return;
	
			// Optimistic update: toggle like status immediately
			setComments(prevComments =>
				prevComments.map(c =>
					c.id === commentId
						? {
							...c,
							likes: isLiked ? c.likes - 1 : c.likes + 1
						}
						: c
				)
			);
	
			// Optimistically update local user likes
			setUserCommentLikes(prevLikes => {
				const updatedLikes = new Set(prevLikes);
				if (isLiked) {
					updatedLikes.delete(commentId);
				} else {
					updatedLikes.add(commentId);
				}
				return updatedLikes;
			});
	
			// Perform backend update
			try {
				if (isLiked) {
					// Handle unliking the comment
					await handleLikeComment(post.id, commentId, false); // Assuming handleLikeComment supports a third parameter for unlike
					await updateDoc(doc(firestore, "users", authUser.uid), {
						commentLikes: arrayRemove(commentId)
					});
				} else {
					// Handle liking the comment
					await handleLikeComment(post.id, commentId, true); // Assuming handleLikeComment supports a third parameter for like
					await updateDoc(doc(firestore, "users", authUser.uid), {
						commentLikes: arrayUnion(commentId),
						notifications: arrayUnion({
							userId: authUser.uid,
							username: authUser.username,
							profilePic: authUser.profilePicURL,
							time: new Date(),
							postId: post.id,
							postImageURL: post.imageURL,
							commentId,
							type: "commentLike"
						})
					});
				}
			} catch (error) {
				console.error("Failed to update like status:", error);
				// Rollback optimistic update in case of error
				setComments(prevComments =>
					prevComments.map(c =>
						c.id === commentId
							? {
								...c,
								likes: isLiked ? c.likes + 1 : c.likes - 1
							}
							: c
					)
				);
				setUserCommentLikes(prevLikes => {
					const updatedLikes = new Set(prevLikes);
					if (isLiked) {
						updatedLikes.add(commentId);
					} else {
						updatedLikes.delete(commentId);
					}
					return updatedLikes;
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
                        onScroll={handleScroll}
                    >
                        {comments.map((comment, idx) => (
                            <Flex key={idx} direction="column" borderBottom="1px" borderStyle="groove" borderColor="gray.600" pb={2} mb={2}>
                                <Flex alignItems={"left"} gap={0} mt={0} mb={2}>
                                    <Comment comment={comment} />
                                    <Box flex="1" ml={2} display="flex" alignItems="center" justifyContent="flex-start">
                                        <Flex direction="row" alignItems="center" gap={1}> {/* Arrange items in a row with space between them */}
                                            <Button
                                                onClick={() => handleCommentLike(comment.id)}
                                                variant="unstyled"
                                                aria-label={userCommentLikes.has(comment.id) ? "Unlike" : "Like"}
                                            >
                                                {userCommentLikes.has(comment.id) ? <UnlikeLogo /> : <NotificationsLogo />}
                                            </Button>
                                            <Text fontSize="sm" ml={0}>
                                                {comment.likes || 0}
                                            </Text>
                                        </Flex>
                                    </Box>
                                </Flex>
                            </Flex>
                        ))}
                    </Flex>
                    <form onSubmit={handleSubmitComment} style={{ marginTop: "2rem" }}>
                        <Input 
                        placeholder='Comment' size={"sm"} fontSize={16} ref={commentRef} 
                        _focus={{ 
                            borderColor: 'transparent', // Make the border transparent
                            boxShadow: '0 0 0 1px rgba(244, 164, 96, 0.5)' // Simulate a thinner border with box-shadow
                          }} 
                        />
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

