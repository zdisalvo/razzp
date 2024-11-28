
import {
	Avatar,
	Button,
	Divider,
	Flex,
	GridItem,
	Image,
	Text,
	VStack,
	Box,
  } from "@chakra-ui/react";
  import { AiFillHeart } from "react-icons/ai";
  import { FaComment } from "react-icons/fa";
  import { MdDelete } from "react-icons/md";
  import Comment from "../Comment/Comment";
  import PostFooter from "../FeedPosts/PostFooter";
  import useUserProfileStore from "../../store/userProfileStore";
  import useAuthStore from "../../store/authStore";
  import useShowToast from "../../hooks/useShowToast";
  import { useState, useEffect, useRef } from "react";
  import { deleteObject, ref } from "firebase/storage";
  import { firestore, storage } from "../../firebase/firebase";
  import { arrayRemove, deleteDoc, doc, updateDoc, onSnapshot } from "firebase/firestore";
  import usePostStore from "../../store/postStore";
  import Caption from "../Comment/Caption";
  import useGetUserProfileById from "../../hooks/useGetUserProfileById";
  
  const ProfilePost = ({ authUser, post, onClick, isSubscribedToCreator, ownProfile, activeSince }) => {
	//const userProfile = useUserProfileStore((state) => state.userProfile);
	const { userProfile } = useGetUserProfileById(post.createdBy);
	//const authUser = useAuthStore((state) => state.user);
	// const { authUser, fetchUserData } = useAuthStore((state) => ({
	// 	authUser: state.user,
	// 	fetchUserData: state.fetchUserData,
	//   }));
	const showToast = useShowToast();
	const [isDeleting, setIsDeleting] = useState(false);
	const deletePost = usePostStore((state) => state.deletePost);
	const decrementPostsCount = useUserProfileStore((state) => state.deletePost);
	//const proxyURL = "https://radiant-retreat-87579-dcc979ba57be.herokuapp.com?url=";
    //const imageSrc = post.imageURL && post.imageURL.startsWith("https://firebase") ? post.imageURL : `${proxyURL}${encodeURIComponent(post.imageURL)}` ;
	const videoRef = useRef(null);
	const [playCount, setPlayCount] = useState(0);
	const [isPurchased, setIsPurchased] = useState(post.purchased && authUser && post.purchased.includes(authUser?.uid));
	const [purchasedUsers, setPurchasedUsers] = useState(post.purchased || null); // Store purchased users
	//const [isSubscribedToCreator, setIsSubscribedToCreator] = useState(false);
	const [isInitialized, setIsInitialized] = useState(false);
	//const [ownProfile, setOwnProfile] = useState(false);
	
	// useEffect (() => {
	// 	if (!authUser || !userProfile)
	// 		return;

	// 	  handleFetchUserData(authUser.uid);

	// 	  //console.log(authUser);

	// 	  const isSubscribed = authUser.subscriptions && authUser.subscriptions.some((subscription) => {
	// 		const isValidSubscription = subscription.creatorId === userProfile.uid;
	// 		if (!isValidSubscription)
	// 			return false;
	// 		else
	// 			 return subscription.activeSince.seconds * 1000 < post.createdAt; // Check if expirationDate is in the future
	// 		//console.log(isExpirationValid);
			
	// 		//return isValidSubscription && isExpirationValid
	// 	  });
		  
	// 	  setIsSubscribedToCreator(isSubscribed);
	// 	  setOwnProfile(authUser.uid === userProfile.uid);

	// 	//setIsInitialized(true);
	// },[authUser && authUser.subscriptions && authUser.subscriptions.length])

	// useEffect (() => {
	// 	if (!authUser || !userProfile || isInitialized)
	// 		return;

	// 	//   handleFetchUserData(authUser.uid);

	// 	//   //console.log(authUser);

	// 	//   const isSubscribed = authUser.subscriptions && authUser.subscriptions.some((subscription) => {
	// 	// 	const isValidSubscription = subscription.creatorId === userProfile.uid;
	// 	// 	if (!isValidSubscription)
	// 	// 		return false;
	// 	// 	else
	// 	// 		 return subscription.activeSince.seconds * 1000 < post.createdAt; // Check if expirationDate is in the future
	// 	// 	//console.log(isExpirationValid);
			
	// 	// 	//return isValidSubscription && isExpirationValid
	// 	//   });
		  
	// 	//   setIsSubscribedToCreator(isSubscribed);
	// 	  setOwnProfile(authUser.uid === userProfile.uid);

	// 	setIsInitialized(true);
	// },)

	//console.log(post);
	// console.log(ownProfile);
	// console.log(isSubscribedToCreator);
	// console.log(authUser);
	// console.log(activeSince);
	//console.log(post.paid && !isPurchased && !isSubscribedToCreator && !ownProfile || (isSubscribedToCreator && activeSince > post.createdAt))

	const handleFetchUserData = async () => {
		await fetchUserData(authUser.uid); // This will update the authUser state
	  };

	// const handleFetchUserData = async (userId) => {
	// 	try {
	// 	  // Add a delay using setTimeout wrapped in a Promise
	// 	  await new Promise((resolve) => setTimeout(resolve, 3000));
	  
	// 	  // Now call fetchUserData
	// 	  await fetchUserData(userId);
	// 	} catch (error) {
	// 	  console.error("Error fetching user data:", error);
	// 	}
	//   };

	useEffect(() => {
		const postRef = doc(firestore, 'posts', post.id);
		const unsubscribe = onSnapshot(postRef, (snapshot) => {
			if (snapshot.exists()) {
				const updatedPost = snapshot.data();
				setPurchasedUsers(updatedPost.purchased);
				setIsPurchased(authUser && updatedPost.purchased && updatedPost.purchased.includes(authUser?.uid));
			}
		});

		return () => unsubscribe(); // Clean up the listener
	}, [post.id, authUser?.uid]);

	useEffect(() => {
		const videoElement = videoRef.current;
	
		if (videoElement) {
		  const observer = new IntersectionObserver(
			([entry]) => {
			  if (entry.isIntersecting) {
				videoElement.src = post.imageURL;
				videoElement.play();
			  } else {
				videoElement.pause();
				videoElement.src = "";
			  }
			},
			{ threshold: 0.8 } // Adjust this value to control how much of the video needs to be visible to trigger playback
		  );
	
		  observer.observe(videoElement);
	
		  return () => {
			observer.disconnect();
			if (videoElement) {
				videoElement.src = ""; // Unload video when component unmounts
			}
		  };
		}
	  }, []);

	//   useEffect(() => {
	// 	const videoElement = videoRef.current;
	
	// 	if (videoElement) {
	// 	  const handlePlay = () => {
	// 		setPlayCount((prevPlayCount) => {
	// 		  const newPlayCount = prevPlayCount + 1;
	// 		  if (newPlayCount >= 2) {
	// 			videoElement.pause();
	// 		  }
	// 		  return newPlayCount;
	// 		});
	// 	  };
	
	// 	  videoElement.addEventListener('play', handlePlay);
	
	// 	  return () => {
	// 		videoElement.removeEventListener('play', handlePlay);
	// 	  };
	// 	}
	//   }, []);

	const calculateRankingScore = (post) => {
        const postTime = new Date(post.createdAt);
        const currentTime = new Date();
        const elapsedTimeInDays = (currentTime - postTime) / (1000 * 60 * 60 * 24);
        //console.log(post.score / (elapsedTimeInDays + 1));
        return Math.round(post.score / (elapsedTimeInDays + 1));
    };

    const[totalScore, setTotalScore] = useState(Math.round(calculateRankingScore(post)));
  
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
		  <Flex alignItems={"center"} justifyContent={"center"} gap={4}>
			<Flex>
			  <AiFillHeart size={20} />
			  <Text fontWeight={"bold"} ml={2}>
				{calculateRankingScore(post)}
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
		
		{(!post.mediaType || post.mediaType.startsWith("image/")) && (!post.paid || post.paid && isPurchased || post.paid && isSubscribedToCreator && activeSince <= post.createdAt || post.paid && ownProfile) && (
		<Image src={post.imageURL} alt="profile post" w={"100%"} h={"100%"} objectFit={"cover"} />
		)}
		{(!post.mediaType || post.mediaType.startsWith("image/"))  && post.paid && !isPurchased && (!isSubscribedToCreator || (isSubscribedToCreator && activeSince > post.createdAt)) && !ownProfile  && (
		<Image src={post.imageURL} style={{ filter: 'blur(11px)' }} alt="profile post" w={"100%"} h={"100%"} objectFit={"cover"} />
		)}

		{(post.mediaType && post.mediaType.startsWith("video/")) && (!post.paid || post.paid && isPurchased || post.paid && isSubscribedToCreator && activeSince <= post.createdAt || post.paid && ownProfile) && (
        <Box 
		display="flex" 
		justifyContent="center" 
		alignItems="center" 
		height="100%" 
		width="100%"
		overflow="hidden"
	  >
        <video src={post.imageURL} 
		ref={videoRef}
        w={"100%"} h={"100%"} 
        //controls 
        //autoPlay 
		playsInline
        muted 
        loop
		preload="none"
        alt={"FEED POST VIDEO"} 
        style={{ 
			width: "100%", 
			height: "100%", 
			objectFit: "cover" 
		  }} 
		  
        />
        </Box>
      )}

	{(post.mediaType && post.mediaType.startsWith("video/")) && post.paid && !isPurchased && (!isSubscribedToCreator || (isSubscribedToCreator && activeSince > post.createdAt)) && !ownProfile && (
        <Box 
		display="flex" 
		justifyContent="center" 
		alignItems="center" 
		height="100%" 
		width="100%"
		overflow="hidden"
	  >
        <video src={post.imageURL} 
		ref={videoRef}
        w={"100%"} h={"100%"} 
        //controls 
        //autoPlay 
		playsInline
        muted 
        loop
		preload="none"
        alt={"FEED POST VIDEO"} 
        style={{ 
			width: "100%", 
			height: "100%", 
			objectFit: "cover",
			filter: 'blur(15px)'
		  }} 
		  
        />
        </Box>
      )}

	  </GridItem>
	);
  };
  
  export default ProfilePost;
  