import React, { useEffect, useRef } from "react";
import { Box, Spinner } from "@chakra-ui/react";
import ProfilePost from "../Profile/ProfilePost";
import useGetUserPostsFeed from "../../hooks/useGetUserPostsFeed";
import LoadingPage from "../Loading/LoadingPage";

const UserFeedPosts = ({ username, postId }) => {
  const { isLoading, posts } = useGetUserPostsFeed(username, postId);
  const postRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const bottom = window.innerHeight + window.scrollY >= document.documentElement.offsetHeight;
      console.log("reached bottom:", bottom);
      if (bottom) {
        window.removeEventListener("scroll", handleScroll); // Remove event listener when reaching the bottom
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll); // Cleanup: remove event listener when unmounting
    };
  }, [postId, posts]);

  useEffect(() => {
    if (postId && postRef.current && posts.length > 0) {
      const scrollToPost = () => {
        const postIndex = posts.findIndex((post) => post.id === postId);
        if (postIndex !== -1) {
          const postElement = document.getElementById(postId);
          if (postElement) {
            postElement.scrollIntoView({ behavior: "smooth" });
          }
        }
      };
      // Call scrollToPost asynchronously to ensure that the DOM is updated before scrolling
      setTimeout(scrollToPost, 0);
    }
  }, [postId, posts]);

  return (
    <Box>
      {isLoading ? (
        // <Spinner size="xl" />
        <LoadingPage />
      ) : posts.length > 1 ? (
        posts.map((post) => (
			<ProfilePost 
			key={post.id} 
			post={post} 
			ref={post.id === postId ? postRef : null} id={post.id} />
        ))
      ) : null}
    </Box>
  );
};

export default UserFeedPosts;
