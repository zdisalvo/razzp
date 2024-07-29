import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../firebase/firebase'; // Adjust the import path as necessary

const useScrubBlockedUsersComments = (post) => {
  const [filteredComments, setFilteredComments] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!post || !post.createdBy) {
        console.warn('Post or post.createdBy is not available.');
        setFilteredComments([]);
        setIsLoading(false);
        return;
      }

      try {
        const userRef = doc(firestore, 'users', post.createdBy);
        const userDoc = await getDoc(userRef);

        console.log(userDoc);

        if (userDoc.exists()) {
          setUserProfile(userDoc.data());
        } else {
          console.warn('User profile does not exist.');
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [post]);

  useEffect(() => {
    if (isLoading) return; // Do nothing if loading

    if (!post) {
      console.warn('Post is not available.');
      setFilteredComments([]);
      return;
    }

    if (!userProfile) {
      console.warn('User profile is not available.');
      setFilteredComments(post.comments || []);
      return;
    }

    if (!userProfile.blocked) {
      setFilteredComments(post.comments);
      return;
    }

    const filtered = post.comments.filter(
      (comment) => !userProfile.blocked.includes(comment.createdBy)
    );

    setFilteredComments(filtered);
  }, [post, userProfile, isLoading]);

  return filteredComments;
};

export default useScrubBlockedUsersComments;
