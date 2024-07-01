import { Avatar, Box, Button, Flex, Skeleton, SkeletonCircle } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { MdDelete } from "react-icons/md";
import { doc, deleteDoc, updateDoc, arrayRemove } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import useFollowUser from "../../hooks/useFollowUser";
import { timeAgo } from "../../utils/timeAgo";
import useGetUserProfileById from "../../hooks/useGetUserProfileById";
import useAuthStore from "../../store/authStore"; 
import usePostStore from "../../store/postStore"; 
import useUserProfileStore from "../../store/userProfileStore"; 
import useShowToast from "../../hooks/useShowToast"; 
import { firestore, storage } from "../../firebase/firebase"; 


const PostHeader = ({ post, creatorProfile }) => {
  
  const { userProfile } = useGetUserProfileById(post.createdBy);
  const { handleFollowUser, isFollowing, isUpdating } = useFollowUser(post.createdBy);
  const authUser = useAuthStore((state) => state.user);
  const showToast = useShowToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const deletePost = usePostStore((state) => state.deletePost);
  const decrementPostsCount = useUserProfileStore((state) => state.decrementPostsCount);

//   console.log(userProfile.uid);
//   console.log(authUser.uid);

  const handleDeletePost = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    if (isDeleting) return;

    setIsDeleting(true);
    try {
      const imageRef = ref(storage, `posts/${post.id}`);
      await deleteObject(imageRef);
      await deleteDoc(doc(firestore, "posts", post.id));

      await updateDoc(doc(firestore, "users", authUser.uid), {
        posts: arrayRemove(post.id),
      });

      deletePost(post.id);
      decrementPostsCount();
      showToast("Success", "Post deleted successfully", "success");
    } catch (error) {
      showToast("Error", error.message, "error");
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

        <Flex fontSize={12} fontWeight={"bold"} gap='2' >
          {creatorProfile ? (
            <Link to={`/${userProfile.username}`} >{userProfile.username}</Link>
          ) : (
            <Skeleton w={"100px"} h={"10px"} />
          )}
          <Box color={"gray.500"}>• {timeAgo(post.createdAt)}</Box>
        </Flex>
      </Flex>
      <Flex alignItems={"center"} gap={2} m={3}>
        <Box cursor={"pointer"}>
          <Button
            size={"xs"}
            bg={"transparent"}
            fontSize={12}
            color={"blue.500"}
            fontWeight={"bold"}
            _hover={{
              color: "white",
            }}
            //transition={"0.2s ease-in-out"}
            onClick={handleFollowUser}
            isLoading={isUpdating}
          >
            {isFollowing ? "Unfollow" : "Follow"}
          </Button>
        </Box>
        {authUser?.uid === userProfile?.uid && (
          <Box cursor={"pointer"}>
            <Button
              size={"xs"}
              bg={"transparent"}
              _hover={{ bg: "whiteAlpha.300", color: "red.600" }}
              borderRadius={4}
              p={1}
              onClick={handleDeletePost}
              isLoading={isDeleting}
            >
              <MdDelete size={20} cursor='pointer' />
            </Button>
          </Box>
        )}
      </Flex>
    </Flex>
  );
};

export default PostHeader;
