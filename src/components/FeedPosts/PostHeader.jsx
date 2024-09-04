import { Avatar, Box, Button, Flex, Skeleton, SkeletonCircle, IconButton, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { MdDelete } from "react-icons/md";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { doc, deleteDoc, updateDoc, arrayRemove } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import useFollowUserFP from "../../hooks/useFollowUserFP";
import { timeAgo } from "../../utils/timeAgo";
import useGetUserProfileById from "../../hooks/useGetUserProfileById";
import useAuthStore from "../../store/authStore"; 
import usePostStore from "../../store/postStore"; 
import useUserProfileStore from "../../store/userProfileStore"; 
import useShowToast from "../../hooks/useShowToast"; 
import { firestore, storage } from "../../firebase/firebase"; 
import useSparkProfileStore from "../../store/sparkProfileStore";
//import useDeleteSelectedImage from "../../hooks/useDeleteSelectedImage";
import useUnrequestFollow from "../../hooks/useUnrequestFollow";
import PostDate from "./PostDate";




const PostHeader = ({ post, initialIsFollowing, initialIsRequested, onFollowClick, creatorProfile, isPrivate }) => {
  
  const { userProfile } = useGetUserProfileById(post.createdBy);
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [requested, setRequested] = useState(initialIsRequested);
	//const { isFollowing: initialIsFollowing, handleFollowUser } = useFollowUserFP();
	//const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isOptimisticUpdate, setIsOptimisticUpdate] = useState(false);
  const { isUpdating, handleFollowUser } = useFollowUserFP();

  const authUser = useAuthStore((state) => state.user);
  const showToast = useShowToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const deletePost = usePostStore((state) => state.deletePost);
  const decrementPostsCount = useUserProfileStore((state) => state.deletePost);
  //const deleteSelectedImage = useSparkProfileStore((state) => state.deleteSelectedImage);

  const { deleteSelectedImage } = useSparkProfileStore((state) => ({
    deleteSelectedImage: state.deleteSelectedImage
  }));
  const unrequestFollow = useUnrequestFollow;
  


//   console.log(userProfile.uid);
//   console.log(authUser.uid);

// const handleFollowClick = async () => {
//   // Optimistically update the UI
//   setIsFollowing(prev => !prev);
//   setIsOptimisticUpdate(true);

//   try {
//     await handleFollowUser(userProfile.uid, isFollowing); // Handle server request
//   } catch (error) {
//     // Revert optimistic update if needed
//     setIsFollowing(prev => !prev);
//     console.error('Error updating follow status:', error);
//   } finally {
//     setIsOptimisticUpdate(false);
//   }
// };

// Update the isFollowing state whenever initialIsFollowing changes
useEffect(() => {
  setIsFollowing(initialIsFollowing);
}, [initialIsFollowing]);

useEffect(() => {
  setRequested(initialIsRequested);
}, [initialIsRequested]);




const handleFollowClick = async () => {
  // console.log(isPrivate);
  // console.log(post.createdBy);

  if (!isPrivate) {
    setIsFollowing(prev => !prev);
  } else {
    setRequested(prev => !prev);
  }
  setIsOptimisticUpdate(true);
  try {
    await onFollowClick(); // Use the passed handler
    await handleFollowUser(creatorProfile, post.createdBy, initialIsFollowing, !initialIsRequested);
    // if (!initialIsRequested)
    //   unrequestFollow();
    //setIsFollowing(!isFollowing);
    //setRequested(!requested);

    //console.log("header");
  } catch (error) {
    // Optionally revert optimistic update if necessary
    if (!isPrivate) {
      setIsFollowing(prev => !prev);
    } else {
      setRequested(prev => !prev);
    }
    console.error('Error updating follow status:', error);
  } finally {
    setIsOptimisticUpdate(false);
  }
};


  const handleDeletePost = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    if (isDeleting) return;

    setIsDeleting(true);
    try {
      const imageRef = ref(storage, `posts/${post.id}`);
      
      await deleteDoc(doc(firestore, "posts", post.id));

      await updateDoc(doc(firestore, "users", authUser.uid), {
        posts: arrayRemove(post.id),
      });

      await deleteObject(imageRef);

      deletePost(post.id);
      deleteSelectedImage(post.id);
      decrementPostsCount();
      showToast("Success", "Post deleted successfully", "success");
    } catch (error) {
      //showToast("Error", error.message, "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Flex justifyContent={"space-between"} alignItems={"center"} px={0} mx={0} maxWidth={"100vw"} my={2}>
      <Flex alignItems={"center"} gap={2} m='3'>
        {userProfile ? (
          <Link to={`/${userProfile.username}`}>
            <Avatar src={userProfile.profilePicURL} alt='user profile pic' size={"sm"} />
          </Link>
        ) : (
          <SkeletonCircle size='10' />
        )}

        <Flex  gap='3' alignItems="baseline">
          <Box fontSize={14} fontWeight={"bold"}>
          {/* {creatorProfile && userProfile ? (
            <Link to={`/${userProfile.username || ""}`} >{userProfile.username || "Deleted User"}</Link>
          ) : (
            <Text>Deleted User</Text>
          )} */}
          {creatorProfile && userProfile ? (
            <Link to={`/${userProfile.username}`} >{userProfile.username}</Link>
          ) : (
            <Skeleton w={"100px"} h={"10px"} />
          )}
          </Box>
          {/* <Box fontSize={12} fontWeight={"regular"} color={"gray.300"}>{post.createdAt < Date.now() + timeAgo(post.createdAt)}</Box> */}
          <Box fontSize={12} fontWeight={"regular"} color={"gray.300"}>
          <PostDate createdAt={post.createdAt} />
          </Box>
        </Flex>
      </Flex>
      <Flex alignItems={"center"} gap={4} mr={1}>
      {authUser && (
        <Box cursor={"pointer"}>
        <Button
								bg={"#eb7734"}
                //background={isFollowing ? "url('/button-bg.png')" : "#eb7734"}
								color={"white"}
								_hover={{ bg: "#c75e1f" }}
								textShadow="2px 2px 4px rgba(0, 0, 0, 0.5)"
								size={{ base: "sm", md: "sm" }}
								onClick={handleFollowClick} // Use the optimized handler
								isDisabled={isOptimisticUpdate} // Disable button during optimistic update
								
							>
								{isFollowing ? "Unfollow" : (requested ? "Requested" : "Follow")}
							</Button>
        </Box>
      )}
        {authUser?.uid === userProfile?.uid && (
          <Box cursor={"pointer"}>
            {/* <Button
              size={"xs"}
              bg={"transparent"}
              _hover={{ bg: "whiteAlpha.300", color: "red.600" }}
              borderRadius={4}
              p={1}
              onClick={handleDeletePost}
              isLoading={isDeleting}
            > */}
              {/* <MdDelete size={20} cursor='pointer' /> */}
              <IconButton
                  icon={<FontAwesomeIcon icon={faTrash} />}
                  aria-label="Delete Post"
      onClick={handleDeletePost}
      variant="ghost" // Transparent background with no border
      _hover={{ bg: "transparent", color: "red.600" }} // Transparent on hover
      _active={{ bg: "transparent" }} // Transparent when active
      isLoading={isDeleting}
      size="xs" // Adjust the size if needed
                />
            
          </Box>
        )}
      </Flex>
    </Flex>
  );
};

export default PostHeader;
