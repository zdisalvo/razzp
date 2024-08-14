import React, { useState, useEffect } from "react";
import { Avatar, Box, List, ListItem, Text, Container, Image, Heading, Flex, IconButton, Button } from "@chakra-ui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretLeft } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import useNotifications from "../../hooks/useNotifications";
import { getDoc, doc, updateDoc, onSnapshot, arrayRemove } from "firebase/firestore";
import { firestore } from "../../firebase/firebase";
import useAuthStore from "../../store/authStore";
import { formatDistanceToNow } from "date-fns";
import useFollowPrivateUser from "../../hooks/useFollowPrivateUser";
import useShowToast from "../../hooks/useShowToast";

// Convert Firestore Timestamp or numeric seconds to JavaScript Date object
const convertToDate = (timestamp) => {
    if (!timestamp) return new Date();

    if (typeof timestamp === 'number') {
        // Numeric timestamp in milliseconds
        return new Date(timestamp);
    }

    // Default case
    return new Date();
};

// Function to format the timestamp
const formatNotificationTime = (timestamp) => {
    try {
        const date = convertToDate(timestamp);

        if (isNaN(date.getTime())) throw new Error("Invalid date");

        return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
        console.error("Error formatting date:", error);
        return "Unknown time";
    }
};




const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);
    const authUser = useAuthStore((state) => state.user);
    const navigate = useNavigate();
    const followPrivateUser = useFollowPrivateUser();
    const showToast = useShowToast();

    useEffect(() => {
        if (authUser && authUser.uid) {
          const userRef = doc(firestore, "users", authUser.uid);
    
          // Set up real-time listener for notifications
          const unsubscribe = onSnapshot(
            userRef,
            (doc) => {
              const data = doc.data();
              if (data && data.notifications) {
                const filteredNotifications = data.notifications.filter(
                  (notification) => notification !== null
                );
                setNotifications(filteredNotifications);
              }
            },
            (error) => {
              console.error("Error fetching notifications:", error);
            }
          );
    
          // Clean up listener on unmount
          return () => unsubscribe();
        }
      }, [authUser]);
    



    useEffect(() => {
        const updateCheckedNotifications = async () => {
            if (authUser && authUser.uid) {
                try {
                    const userRef = doc(firestore, "users", authUser.uid);
                    await updateDoc(userRef, {
                        checkedNotifications: new Date().getTime()
                    });
                } catch (error) {
                    console.error("Error updating checkedNotifications:", error);
                }
            }
        };

        updateCheckedNotifications();
    }, [authUser]);


    const handleGoBack = () => {
        navigate(-1); // Navigate to the previous page
    };

    const fetchUserData = async (userId) => {
        if (!userId) return null;
        const userRef = doc(firestore, "users", userId);
        const userDoc = await getDoc(userRef);
        return userDoc.exists() ? userDoc.data() : null;
    };

    const fetchPostData = async (postId) => {
        if (!postId) return null;
        const postRef = doc(firestore, "posts", postId);
        const postDoc = await getDoc(postRef);
        return postDoc.exists() ? postDoc.data() : null;
    };

    // Sort notifications in reverse chronological order
    const sortedNotifications = notifications
        .slice() // Create a copy to avoid mutating the original array
        .sort((a, b) => {
            const aDate = convertToDate(a.time);
            const bDate = convertToDate(b.time);
            return bDate - aDate;
        });

    const handlePostClick = async (postId) => {
        if (!postId) return;

        const post = await fetchPostData(postId);
        if (!post) return;

        const profile = await fetchUserData(post.createdBy);
        if (profile) {
            navigate(`/${profile.username}/feed`, { state: { postId } });
        }
    };

    const handleAvatarClick = async (userId) => {
        const profile = await fetchUserData(userId);
        if (profile) {
            navigate(`/${profile.username}`);
        }
    };

    const handleAcceptFollow = async (userId, username, profilePicURL) => {
        try {
            await followPrivateUser(userId, username, profilePicURL);
        } catch (error) {
            console.error(error);
        }
    }

    const handleRejectFollow = async (userId) => {
        try {
            const userDocRef = doc(firestore, "users", authUser.uid);
            const userDoc = await getDoc(userDocRef);
        
        
            if (userDoc.exists()) {
              const notifications = userDoc.data().notifications || []; // Default to an empty array if not defined
        
              // Filter out the followPrivate notification
              const updatedNotifications = notifications.filter(
                (notif) => !(notif.userId === userId && notif.type === "followPrivate")
              );
        
              // Use updateDoc to update only the necessary fields
              await updateDoc(userDocRef, {
                requested: arrayRemove(userId),
                notifications: updatedNotifications,
              });
    
            showToast("Success", "Removed follow request successfully", "success");
          } else {
            showToast("Error", "User document does not exist", "error");
          }
        } catch (error) {
          showToast("Error", error.message, "error");
        }
      };
    

    return (
        <Container pt={6} px={0} w={['100vw', null, '80vh']} pb={{base: "10vh", md: "60px"}}>
                <Flex align="center" mb={4}>
                    <IconButton
                        icon={<FontAwesomeIcon fontSize={32} icon={faCaretLeft} />}
                        aria-label="Go back"
                        color="#eb7734"
                        variant="ghost"
                        onClick={handleGoBack}
                        ml={5}
                        mr={4}
                    />
                    <Heading as="h1" size="lg">Notifications</Heading>
                </Flex>
                <List spacing={0}>
                    {sortedNotifications.map((notification) => {
                        let notificationText = '';

                        if (notification.type === "comment") {
                            notificationText = (
                                <Text>
                                    <Text as="span" fontWeight="bold">
                                        {notification.username || 'Unknown User'}
                                    </Text>
                                    {" commented on your post: "} 
                                    <Text as="span" fontStyle="italic">{notification.comment}</Text>
                                </Text>
                            );
                        } else if (notification.type === "commentLike") {
                            notificationText = (
                                <Text>
                                    <Text as="span" fontWeight="bold">
                                        {notification.username || 'Unknown User'}
                                    </Text>
                                    {" liked your comment: "}
                                    <Text as="span" fontStyle="italic">{notification.comment}</Text>
                                </Text>
                            );
                        } else if (notification.type === "follow") {
                            notificationText = (
                                <Text>
                                    <Text as="span" fontWeight="bold">
                                        {notification.username || 'Unknown User'}
                                    </Text>
                                    {" followed you."}
                                </Text>
                            );
                        } else if (notification.type === "followPrivate") {
                            notificationText = (
                                <Flex alignItems="baseline">
                                <Text>
                                    <Text as="span" fontWeight="bold">
                                        {notification.username || 'Unknown User'}
                                    </Text>
                                    {" requested to follow you."}
                                </Text>
                                <Button
                                    bg={"red.400"}
                                    color={"white"}
                                    //w='full'
                                    size='sm'
                                    ml={2}
                                    _hover={{ bg: "red.500" }}
                                    onClick={() => handleRejectFollow(notification.userId)}
                                >
                                    Reject
                                </Button>
                                <Button
                                    bg={"blue.400"}
                                    color={"white"}
                                    size='sm'
                                    ml={2}
                                    //w='full'
                                    _hover={{ bg: "blue.500" }}
                                    //userId={notification.userId}
                                    onClick={() => handleAcceptFollow(notification.userId, notification.username, notification.profilePic)}
                                    
                                >
                                    Accept
                                </Button>
                                </Flex>
                            );
                        } else if (notification.type === "crown") {
                            notificationText = (
                                <Text>
                                    <Text as="span" fontWeight="bold">
                                        {notification.username || 'Unknown User'}
                                    </Text>
                                    {" gave you a crown! "}
                                    <Box
                                        as="img"
                                        src="/blue-crown-small.png"
                                        alt="crown icon"
                                        display="inline-block"
                                        verticalAlign="center"
                                        //fontSize={32}
                                        ml={1} // Add margin if you want some space between the text and the image
                                        height="1em" // Adjust the height to match the text size
                                    />
                                </Text>
                            );
                        } else {
                            notificationText = (
                                <Text>
                                    <Text as="span" fontWeight="bold">
                                        {notification.username || 'Unknown User'}
                                    </Text>
                                    {" liked your post."}
                                </Text>
                            );
                        }

                        return (
                            <ListItem
                                key={notification.id} // Ensure that 'notification.id' is unique for each item
                                display="flex"
                                alignItems="center"
                                justifyContent="space-between"
                                mt={1}
                                mb={1}
                                p={1}
                                
                                //position="relative"
                                borderBottom="1px groove #1B2328"
                            >
                                <Avatar 
                                    src={notification.profilePic} 
                                    alt={notification.username || 'User'} 
                                    boxSize="40px" // Set size of Avatar
                                    onClick={() => handleAvatarClick(notification.userId)}
                                    cursor="pointer"
                                    ml={3}
                                />
                                <Box flex="1" mx={4} >
                                    {notificationText}
                                    <Text fontSize="sm" color="gray.500">{formatNotificationTime(notification.time)}</Text>
                                </Box>
                                {notification.postImageURL && (
                                    <>
                                    {(!notification.postMediaType || notification.postMediaType.startsWith("image/")) && (
                                    <Image
                                        src={notification.postImageURL}
                                        alt="Post Image"
                                        onClick={() => handlePostClick(notification.postId)}
                                        cursor="pointer"
                                        objectFit="cover" // Maintain aspect ratio
                                        width="100%"
                                        height="100%"
                                        boxSize="40px" // Set size of Image same as Avatar
                                        borderRadius="5px" // Optional: match Avatar's round shape
                                        mr={3}
                                    />
                                    )}
                                    {(notification.postMediaType && notification.postMediaType.startsWith("video/")) && (
                                        <Box 
                                        display="flex" 
                                        alt="Post Video"
                                        onClick={() => handlePostClick(notification.postId)}
                                        cursor="pointer"
                                        justifyContent="center" 
                                        alignItems="center" 
                                        height="40px"
                                        width="40px"
                                        overflow="hidden"
                                        size="40px"
                                        borderRadius="5px"
                                        mr={3}
                                      >
                                        <video src={notification.postImageURL} 
                                        w={"100%"} h={"100%"} 
                                        //controls 
                                        autoPlay 
                                        muted 
                                        loop
                                        playsInline
                                        alt={"FEED POST VIDEO"} 
                                        style={{ 
                                            width: "100%", 
                                            height: "100%", 
                                            objectFit: "cover" 
                                          }} 
                                        />
                                        </Box>
                                      )}
                                      </>
                                )}
                            </ListItem>
                        );
                    })}
                </List>
            
        </Container>
    );
};

export default NotificationsPage;
