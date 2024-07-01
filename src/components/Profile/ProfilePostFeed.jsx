import React, { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Divider,
  Flex,
  GridItem,
  Image,
  Text,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";
import { AiFillHeart } from "react-icons/ai";
import { FaComment } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import useUserProfileStore from "../../store/userProfileStore";
import useAuthStore from "../../store/authStore";
import useShowToast from "../../hooks/useShowToast";
import useGetUserPosts from "../../hooks/useGetUserPosts";
import { deleteObject, ref } from "firebase/storage";
import { firestore, storage } from "../../firebase/firebase";
import { arrayRemove, deleteDoc, doc, updateDoc } from "firebase/firestore";

const ProfilePostFeed = () => {
  const { isLoading, posts, selectedPost, selectPost } = useGetUserPosts();
  const userProfile = useUserProfileStore((state) => state.userProfile);
  const authUser = useAuthStore((state) => state.user);
  const showToast = useShowToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const deletePost = usePostStore((state) => state.deletePost);
  const decrementPostsCount = useUserProfileStore((state) => state.deletePost);

  const handleDeletePost = async (post) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    if (isDeleting) return;

    try {
      const imageRef = ref(storage, `posts/${post.id}`);
      await deleteObject(imageRef);
      const userRef = doc(firestore, "users", authUser.uid);
      await deleteDoc(doc(firestore, "posts", post.id));

      await updateDoc(userRef, {
        posts: arrayRemove(post.id),
      });

      deletePost(post.id);
      decrementPostsCount(post.id);
      showToast("Success", "Post deleted successfully", "success");
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  if (posts.length === 0) {
    return <Box>No posts found.</Box>;
  }

  return (
    <Box>
      <Flex direction="column-reverse">
        {posts.map((post) => (
          <Box key={post.id} p={4} mb={4} bg="white" borderRadius="md" boxShadow="sm">
            <GridItem
              cursor={"pointer"}
              borderRadius={4}
              overflow={"hidden"}
              border={"1px solid"}
              borderColor={"whiteAlpha.300"}
              position={"relative"}
              aspectRatio={1 / 1}
              onClick={() => selectPost(post.id)}
            >
              <Flex
                opacity={0}
                _hover={{ opacity: 1 }}
                position={"absolute"}
                top={0}
                left={0}
                right={0}
                bottom={0}
                bg={"blackAlpha.700"}
                transition={"all 0.3s ease"}
                zIndex={1}
                justifyContent={"center"}
              >
                <Flex alignItems={"center"} justifyContent={"center"} gap={50}>
                  <Flex>
                    <AiFillHeart size={20} />
                    <Text fontWeight={"bold"} ml={2}>
                      {post.likes.length}
                    </Text>
                  </Flex>

                  <Flex>
                    <FaComment size={20} />
                    <Text fontWeight={"bold"} ml={2}>
                      {post.comments.length}
                    </Text>
                  </Flex>
                </Flex>
              </Flex>

              <Image src={post.imageURL} alt='profile post' w={"100%"} h={"100%"} objectFit={"cover"} />
            </GridItem>
            <Flex flexDir={"column"} px={10}>
              <Flex alignItems={"center"} justifyContent={"space-between"}>
                <Flex alignItems={"center"} gap={4}>
                  <Avatar src={userProfile.profilePicURL} size={"sm"} name='As a Programmer' />
                  <Text fontWeight={"bold"} fontSize={12}>
                    {userProfile.username}
                  </Text>
                </Flex>

                {authUser?.uid === userProfile.uid && (
                  <Button
                    size={"sm"}
                    bg={"transparent"}
                    _hover={{ bg: "whiteAlpha.300", color: "red.600" }}
                    borderRadius={4}
                    p={1}
                    onClick={() => handleDeletePost(post)}
                    isLoading={isDeleting}
                  >
                    <MdDelete size={20} cursor='pointer' />
                  </Button>
                )}
              </Flex>
              <Divider my={4} bg={"gray.500"} />

              <VStack w='full' alignItems={"start"} maxH={"350px"} overflowY={"auto"}>
                {/* CAPTION */}
                {post.caption && <Caption post={post} />}
                {/* COMMENTS */}
                {post.comments.map((comment) => (
                  <Comment key={comment.id} comment={comment} />
                ))}
              </VStack>
              <Divider my={4} bg={"gray.8000"} />

              <PostFooter isProfilePage={true} post={post} />
            </Flex>
          </Box>
        ))}
      </Flex>
    </Box>
  );
};

export default ProfilePostFeed;
