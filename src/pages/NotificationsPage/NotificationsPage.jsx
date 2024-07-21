import React, { useState, useEffect } from "react";
import { Avatar, Box, List, ListItem, Text, Container, Image, Heading, Flex, IconButton } from "@chakra-ui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretLeft } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import useNotifications from "../../hooks/useNotifications";
import { getDoc, doc } from "firebase/firestore";
import { firestore } from "../../firebase/firebase";
import useAuthStore from "../../store/authStore";
import { formatDistanceToNow } from "date-fns";

// Convert Firestore Timestamp or numeric seconds to JavaScript Date object
const convertToDate = (timestamp) => {
    if (!timestamp) return new Date();

    if (timestamp.nanoseconds) {
        // Firestore Timestamp (nanoseconds)
        const milliseconds = timestamp.seconds * 1000 + timestamp.nanoseconds / 1_000_000;
        return new Date(milliseconds);
    } else if (timestamp.seconds) {
        // Firestore Timestamp (seconds)
        return new Date(timestamp.seconds * 1000);
    } else if (typeof timestamp === 'number') {
        // Numeric timestamp in seconds
        return new Date(timestamp * 1000);
    } else if (timestamp.toDate) {
        // Firestore Timestamp with toDate method
        return timestamp.toDate();
    }

    // Default case
    return new Date(timestamp);
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
    const notifications = useNotifications();
    const authUser = useAuthStore((state) => state.user);
    const navigate = useNavigate();

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

    return (
        <Container top={0} p={0} maxW={{ base: "100vw", md: "100vw" }} pb={{ base: "10vh", md: "60px" }} m={0}>
            <Box padding="4" maxW="3xl" mx="auto">
                <Flex align="center" mb={4}>
                    <IconButton
                        icon={<FontAwesomeIcon fontSize={32} icon={faCaretLeft} />}
                        aria-label="Go back"
                        variant="ghost"
                        onClick={handleGoBack}
                        mr={4} // Add margin-right to space out from the heading
                    />
                    <Heading as="h1" size="lg">Notifications</Heading>
                </Flex>
                <List spacing={3}>
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
                                    {" liked your comment."}
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
                                p={4}
                                borderWidth={1}
                                borderRadius="lg"
                            >
                                <Avatar 
                                    src={notification.profilePic} 
                                    alt={notification.username || 'User'} 
                                    boxSize="40px" // Set size of Avatar
                                    onClick={() => handleAvatarClick(notification.userId)}
                                    cursor="pointer"
                                />
                                <Box flex="1" mx={4}>
                                    {notificationText}
                                    <Text color="gray.500">{formatNotificationTime(notification.time)}</Text>
                                </Box>
                                {notification.postImageURL && (
                                    <Image
                                        src={notification.postImageURL}
                                        alt="Post Image"
                                        onClick={() => handlePostClick(notification.postId)}
                                        cursor="pointer"
                                        boxSize="40px" // Set size of Image same as Avatar
                                        borderRadius="5px" // Optional: match Avatar's round shape
                                    />
                                )}
                            </ListItem>
                        );
                    })}
                </List>
            </Box>
        </Container>
    );
};

export default NotificationsPage;
