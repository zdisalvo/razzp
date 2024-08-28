import { useState } from 'react';
import { doc, deleteDoc, getDoc, updateDoc, arrayRemove } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { firestore, storage } from '../firebase/firebase';
import useAuthStore from '../store/authStore';
import useShowToast from './useShowToast'; // Assuming you have a custom hook for showing toasts
import useLogout from './useLogout';

const useDeleteUser = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const authUser = useAuthStore((state) => state.user);
  const showToast = useShowToast();
  const { handleLogout, isLoggingOut } = useLogout();

  const deleteUser = async () => {
    if (!authUser) {
      setError('User not authenticated');
      return;
    }

    if (!window.confirm("Are you sure you want to delete your account and all your posts?")) return;

    setIsDeleting(true);
    setError(null);

    try {
      // Get the user's posts
      const userDocRef = doc(firestore, 'users', authUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();
      const userPosts = userData.posts;

      // Delete all the user's posts
      const deletePostPromises = userPosts.map(async (postId) => {
        try {
          const postDocRef = doc(firestore, 'posts', postId);
          const postDoc = await getDoc(postDocRef);

          if (!postDoc.exists()) {
            throw new Error(`Post with ID ${postId} not found`);
          }

          const postData = postDoc.data();

          //moved this from below deleteObject so it happens first
          await deleteDoc(postDocRef);

          const imageRef = ref(storage, `posts/${postId}`);
          await deleteObject(imageRef);
          

          await updateDoc(userDocRef, {
            posts: arrayRemove(postId),
          });

          await updateDoc(postDocRef)

          // Optional: Handle additional cleanup related to the post
          // deletePost(postId);
          // deleteSelectedImage(postId);
          // decrementPostsCount();
        } catch (error) {
          console.error(`Error deleting post ${postId}:`, error);
          //throw error;
        }
      });

      await Promise.all(deletePostPromises);

      // Delete the user profile
      await deleteDoc(userDocRef);

      showToast('Success', 'User and all posts deleted successfully', 'success');
    } catch (error) {
      setError(error.message);
      showToast('Error', error.message, 'error');
    } finally {
      setIsDeleting(false);
      handleLogout();
    }
  };

  
  

  return {
    deleteUser,
    isDeleting,
    error,
  };
};

export default useDeleteUser;
