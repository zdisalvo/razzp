import { Button, Flex, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Text, Box } from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";
import Comment from "../Comment/Comment";
import usePostComment from "../../hooks/usePostComment";
import useLikeComment from "../../hooks/useLikeComment";
import { useRef, useState, useEffect } from "react";
import useAuthStore from "../../store/authStore";
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { firestore } from "../../firebase/firebase";
import { NotificationsLogo, UnlikeLogo } from "../../assets/constants";
import useGetUserProfileById from "../../hooks/useGetUserProfileById";
//import useScrubBlockedUsersComments from "../../hooks/useScrubBlockedUsersComments";

const CommentsModal = ({ isOpen, onClose, post }) => {
    const { handlePostComment, isCommenting } = usePostComment();
    
    const [comments, setComments] = useState(post.comments);
    const [userScrolled, setUserScrolled] = useState(false);
    const commentRef = useRef(null);
    const commentsContainerRef = useRef(null);
    const authUser = useAuthStore((state) => state.user);
    const { userProfile } = useGetUserProfileById(post.createdBy);
    //const [comments, setComments] = useScrubBlockedUsersComments(post);
    const [filtComments, setFiltComments] = useState(null);

    //console.log(userProfile);

    //console.log(post);

    useEffect(() => {
        if (isOpen) {
            setTimeout(scrollToBottom, 200); // Set a timeout before scrolling
        }
    }, [filtComments, isOpen]);


    const handleSubmitComment = async (e) => {
        e.preventDefault();
        await handlePostComment(post.id, commentRef.current.value);
        commentRef.current.value = "";
        setTimeout(scrollToBottom, 200);
        //await updateComments();
    };

    // const updateComments = async (userLikes = new Set()) => {
    //     const postRef = doc(firestore, "posts", post.id);
    //     const postDoc = await getDoc(postRef);
    //     if (postDoc.exists() && userProfile) {
    //         //console.log(userProfile);
    //         const postData = postDoc.data();
    //         //const filteredComments = useScrubBlockedUsersComments({ userProfile, comments: postData.comments });
    //         //setComments(filteredComments);
    //         const filteredComments = post.comments.filter(comment => 
    //             !userProfile.blocked.includes(comment.createdBy));
    //         setComments(filteredComments);
    //         //setComments(postData.comments);
    //     }
    // };

    const scrollToBottom = () => {
        if (commentsContainerRef.current && !userScrolled) {
            commentsContainerRef.current.scrollTop = commentsContainerRef.current.scrollHeight;
        }
    };

    // useEffect(() => {
    //     if (commentsContainerRef.current && !userScrolled) {
    //         commentsContainerRef.current.scrollTop = commentsContainerRef.current.scrollHeight;
    //     }
    // }, [comments, userScrolled]);
    
    useEffect (() => {
    const updateComments = async (userLikes = new Set()) => {
        const postRef = doc(firestore, "posts", post.id);
        const postDoc = await getDoc(postRef);
        if (postDoc.exists() && userProfile) {
            //console.log(userProfile);
            const postData = postDoc.data();
            //const filteredComments = useScrubBlockedUsersComments({ userProfile, comments: postData.comments });
            //setComments(filteredComments);
            const filteredComments = !userProfile.blocked ? postData.comments : postData.comments.filter(comment => 
                !userProfile.blocked.includes(comment.createdBy));
            setComments(filteredComments);
            setFiltComments(filteredComments);

            //console.log(filtComments.length);
            //setComments(postData.comments);
            
        }
        
    };
    updateComments();
    scrollToBottom();
}, [post, userProfile]);

    //setComments(useScrubBlockedUsersComments({userProfile, comments}));

    // const updateComments = async (userLikes = new Set()) => {
    //     const postRef = doc(firestore, "posts", post.id);
    //     const postDoc = await getDoc(postRef);
    //     if (postDoc.exists() && userProfile) {
    //         //console.log(userProfile);
    //         const postData = postDoc.data();
    //         //const filteredComments = useScrubBlockedUsersComments({ userProfile, comments: postData.comments });
    //         //setComments(filteredComments);
    //         const filteredComments = postData.comments.filter(comment => 
    //             !userProfile.blocked.includes(comment.createdBy));
    //         setComments(filteredComments);
    //         setFiltComments(filteredComments);
    //         //setComments(postData.comments);
    //         scrollToBottom();
    //     }
    // };
    

    useEffect(() => {
        scrollToBottom();
    }, [filtComments, userScrolled]);

    const handleScroll = () => {
        if (commentsContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = commentsContainerRef.current;
            setUserScrolled(scrollTop + clientHeight < scrollHeight - 5);
        }
    };

    //console.log(post);

    

    const handleDeleteComment = async (commentId) => {
        // Handle comment deletion logic
        try {
            const postRef = doc(firestore, "posts", post.id);
            await updateDoc(postRef, {
                comments: arrayRemove(comments.find(comment => comment.id === commentId))
            });
            setComments(prevComments => prevComments.filter(comment => comment.id !== commentId));
            setFiltComments(prevComments => prevComments.filter(comment => comment.id !== commentId));
        } catch (error) {
            console.error("Failed to delete comment:", error);
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
                        mt={0}
                        gap={0}
                        flexDir={"column"}
                        maxH={"250px"}
                        overflowY={"auto"}
                        ref={commentsContainerRef}
                        onScroll={handleScroll}
                    >
                        {userProfile && filtComments && filtComments.map((comment, idx) => (
                            
                            <Flex key={idx} direction="column" borderBottom="1px" borderStyle="groove" borderColor="gray.600" pb={0} mb={0} position="relative">

                                {(authUser.uid === comment.createdBy || authUser.uid === post.createdBy) &&
                                 <Box position="absolute" top={-2} right={0} m={0} p={0}>
                                    <Button
                                        onClick={() => handleDeleteComment(comment.id)}
                                        variant="unstyled"
                                        aria-label="Delete Comment"
                                    >
                                        <CloseIcon color="red.500" boxSize={2} />
                                    </Button>
                                </Box>
                                }
                                {/* {authUser.uid === post.createdBy && authUser.uid !== comment.createdBy &&
                                 <Box position="absolute" top={0} right={1} m={0} p={0}>
                                    <Button
                                        onClick={() => handleDeleteComment(comment.id)}
                                        variant="unstyled"
                                        aria-label="Delete Comment"
                                    >
                                        <CloseIcon color="red.500" boxSize={2} />
                                    </Button>
                                </Box>
                                } */}
                                <Flex alignItems={"left"} gap={0} mt={6} mb={6}>
                                    <Comment comment={comment} post={post} postUser={userProfile} />
                                    
                                </Flex>
                            </Flex>
                        ))}
                    </Flex>
                    <form onSubmit={handleSubmitComment} style={{ marginTop: "2rem" }}>
                        <Input 
                        placeholder='Comment' size={"sm"} fontSize={16} ref={commentRef} 
                        _placeholder={{ color: 'gray.500' }}
				        border="1px groove #888888"
				 
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

