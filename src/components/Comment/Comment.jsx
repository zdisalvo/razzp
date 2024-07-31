import { Avatar, Flex, Skeleton, SkeletonCircle, Text, Container, Box, Button } from "@chakra-ui/react";
import useGetUserProfileById from "../../hooks/useGetUserProfileById";
import { Link } from "react-router-dom";
import { timeAgo } from "../../utils/timeAgo";
import useAuthStore from "../../store/authStore";
import { useEffect, useState } from "react";
import useLikeComment from "../../hooks/useLikeComment";
import { NotificationsLogo, UnlikeLogo } from "../../assets/constants";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { firestore } from "../../firebase/firebase";

const Comment = ({ comment, post, postUser }) => {
    const authUser = useAuthStore((state) => state.user);
    const { userProfile, isLoading } = useGetUserProfileById(comment.createdBy);
	//const { postUser, isLoading: isPostUserLoading } = useGetUserProfileById(postUserId);
    const [userCommentLikes, setUserCommentLikes] = useState(new Set());
    const [localComments, setLocalComments] = useState([comment]); // Initialize with the current comment
    const { handleLikeComment } = useLikeComment();
	const [blocked, setBlocked] = useState(false);

	console.log(postUser);
	//console.log(userProfile);

    useEffect(() => {
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

        fetchUserCommentLikes();
    }, [authUser]);



    const handleCommentLike = async (commentId) => {
        if (authUser) {

			

            const isLiked = userCommentLikes.has(commentId);

			if (isLiked)
				return;

            const newLikesCount = isLiked ? comment.likes - 1 : comment.likes + 1;

            // Optimistically update UI
            setLocalComments(prevComments =>
                prevComments.map(c =>
                    c.id === commentId
                        ? { ...c, likes: newLikesCount }
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

            try {
                if (isLiked) {
                    await handleLikeComment(post.id, commentId, 'unlike');
                    await updateDoc(doc(firestore, "users", authUser.uid), {
                        commentLikes: arrayRemove(commentId)
                    });
                } else {
                    await handleLikeComment(post.id, commentId, 'like');
                    await updateDoc(doc(firestore, "users", authUser.uid), {
                        commentLikes: arrayUnion(commentId)
                    });
                }
            } catch (error) {
                console.error("Failed to update like status:", error);
                // Rollback optimistic update in case of error
                setLocalComments(prevComments =>
                    prevComments.map(c =>
                        c.id === commentId
                            ? { ...c, likes: isLiked ? newLikesCount + 1 : newLikesCount - 1 }
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

	useEffect(() => {
        const fetchPostUser = async () => {
            if (postUser && userProfile) {
				console.log(postUser);
                // Check if the current comment creator is blocked by the post creator
                const isBlocked = postUser.blocked.includes(userProfile.uid);
                if (isBlocked) {
					console.log("blocked")
                    // // Hide this comment if the comment creator is blocked
                    // return null;
					setBlocked(true);
                }
            }
        };

        fetchPostUser();
    }, [postUser, userProfile]);

    if (isLoading) return <CommentSkeleton />;

	if (blocked) return null;

    return (
        <Container width="80%">
            <Flex gap={4} align="center">
                <Link to={`/${userProfile.username}`}>
                    <Avatar src={userProfile.profilePicURL} size="sm" />
                </Link>
                <Flex direction="column" gap={1}>
                    {/* Username and Timestamp Side by Side */}
                    <Flex direction="row" alignItems="center" gap={2}>
                        <Link to={`/${userProfile.username}`}>
                            <Text fontWeight="bold" fontSize={12}>
                                {userProfile.username}
                            </Text>
                        </Link>
                        <Text fontSize={12} color="gray">
                            {timeAgo(comment.createdAt)}
                        </Text>
                    </Flex>
                    {/* Comment Text */}
                    <Text fontSize={14} maxWidth="100%">
                        {comment.comment}
                    </Text>
                </Flex>
            </Flex>
            <Box flex="1" ml={2} display="flex" alignItems="center" justifyContent="flex-start" mr={5}>
                <Flex direction="row" alignItems="center" gap={1}>
                    <Button
                        onClick={() => handleCommentLike(comment.id)}
                        variant="unstyled"
                        aria-label={userCommentLikes.has(comment.id) ? "Unlike" : "Like"}
                    >
                        {userCommentLikes.has(comment.id) ? <UnlikeLogo /> : <NotificationsLogo />}
                    </Button>
                    <Text fontSize="sm" ml={0}>
                        {localComments.find(c => c.id === comment.id)?.likes || comment.likes || 0}
                    </Text>
                </Flex>
            </Box>
        </Container>
    );
};

export default Comment;

const CommentSkeleton = () => {
    return (
        <Flex gap={4} w="full" alignItems="center">
            <SkeletonCircle h={10} w='10' />
            <Flex gap={1} flexDir="column">
                <Skeleton height={2} width={100} />
                <Skeleton height={2} width={50} />
            </Flex>
        </Flex>
    );
};
