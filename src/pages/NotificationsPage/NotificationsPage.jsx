import React, { useState, useEffect } from "react";
import { Avatar, Box, List, ListItem, Text } from "@chakra-ui/react";
import useNotifications from "../../hooks/useNotifications";
import { getDoc, doc } from "firebase/firestore";
import { firestore } from "../../firebase/firebase";
import useAuthStore from "../../store/authStore";
import { formatDistanceToNow } from "date-fns";

const NotificationsPage = () => {
    const notifications = useNotifications();
    const [userData, setUserData] = useState({});
    const [postData, setPostData] = useState({});
    const authUser = useAuthStore((state) => state.user);

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

    useEffect(() => {
        const fetchData = async () => {
            const users = {};
            const posts = {};
            for (const notification of notifications) {
                if (notification.userId && !users[notification.userId]) {
                    users[notification.userId] = await fetchUserData(notification.userId);
                }
                if (notification.postId && !posts[notification.postId]) {
                    posts[notification.postId] = await fetchPostData(notification.postId);
                }
            }
            setUserData(users);
            setPostData(posts);
        };
        fetchData();
    }, [notifications]);

    const formatNotificationTime = (timestamp) => {
        try {
            if (!timestamp) return "Unknown time";
            
            // Convert Firestore timestamp to JavaScript Date object
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
            
            if (isNaN(date.getTime())) throw new Error("Invalid date");
            
            // Format the date
            return formatDistanceToNow(date, { addSuffix: true });
        } catch (error) {
            console.error("Error formatting date:", error);
            return "Unknown time";
        }
    };

    return (
        <Box padding="4" maxW="3xl" mx="auto">
            <List spacing={3}>
                {notifications.map((notification) => {
                    const user = userData[notification.userId];
                    const post = postData[notification.postId];
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
                            <Avatar src={user?.profilePicURL} alt={user?.username || 'User'} />
                            <Box flex="1" mx={4}>
                                <Text>
                                    <Text as="span" fontWeight="bold">
                                        {user?.username || 'Unknown User'}
                                    </Text>
                                    {" liked your post."}
                                </Text>
                                <Text color="gray.500">{formatNotificationTime(notification.time)}</Text>
                            </Box>
                            <Avatar src={post?.imageURL} alt="Post Image" />
                        </ListItem>
                    );
                })}
            </List>
        </Box>
    );
};

export default NotificationsPage;
