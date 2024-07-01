import {
	Avatar,
	Button,
	Divider,
	Flex,
	GridItem,
	Image,
	Text,
	VStack,
  } from "@chakra-ui/react";
  import { AiFillHeart } from "react-icons/ai";
  import { FaComment } from "react-icons/fa";
  import { MdDelete } from "react-icons/md";
  import Comment from "../Comment/Comment";
  import PostFooter from "../FeedPosts/PostFooter";
  import useUserProfileStore from "../../store/userProfileStore";
  import useAuthStore from "../../store/authStore";
  import useShowToast from "../../hooks/useShowToast";
  import { useState } from "react";
  import { deleteObject, ref } from "firebase/storage";
  import { firestore, storage } from "../../firebase/firebase";
  import { arrayRemove, deleteDoc, doc, updateDoc } from "firebase/firestore";
  import usePostStore from "../../store/postStore";
  import Caption from "../Comment/Caption";
  
  const ProfilePost = ({ post, onClick }) => {
	const userProfile = useUserProfileStore((state) => state.userProfile);
	const authUser = useAuthStore((state) => state.user);
	const showToast = useShowToast();
	const [isDeleting, setIsDeleting] = useState(false);
	const deletePost = usePostStore((state) => state.deletePost);
	const decrementPostsCount = useUserProfileStore((state) => state.deletePost);
  
	const handleDeletePost = async () => {
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
  
	return (
	  <GridItem
		cursor={"pointer"}
		borderRadius={4}
		overflow={"hidden"}
		border={"1px solid"}
		borderColor={"whiteAlpha.300"}
		position={"relative"}
		aspectRatio={1 / 1}
		onClick={() => onClick(post.id)}
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
  
		<Image src={post.imageURL} alt="profile post" w={"100%"} h={"100%"} objectFit={"cover"} />
	  </GridItem>
	);
  };
  
  export default ProfilePost;
  