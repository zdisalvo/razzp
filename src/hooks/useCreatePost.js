import { useState } from 'react';
import { addDoc, collection, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import usePostStore from '../store/postStore';
import useUserProfileStore from '../store/userProfileStore';
import useShowToast from './useShowToast';
import { firestore, storage } from '../firebase/firebase'; // Adjust import paths as needed

const useCreatePost = () => {
    const showToast = useShowToast();
    const [isLoading, setIsLoading] = useState(false);
    const authUser = useAuthStore((state) => state.user);
    const createPost = usePostStore((state) => state.createPost);
    const setUserProfile = useUserProfileStore((state) => state.setUserProfile);
    const addPost = useUserProfileStore((state) => state.addPost);
    const { pathname } = useLocation();

    const handleCreatePost = async (postSrc, caption, score, createdAt, mediaType) => {
        if (isLoading || !authUser) return;
        
        setIsLoading(true);

        const newPost = {
            caption: caption,
            likes: [],
            crowns: [],
            score: score,
            comments: [],
            createdAt: createdAt,
            createdBy: authUser.uid,
        };

        try {
            const postDocRef = await addDoc(collection(firestore, "posts"), newPost);
            const userDocRef = doc(firestore, "users", authUser.uid);
            const mediaRef = ref(storage, `posts/${postDocRef.id}`);

            if (authUser) setUserProfile(authUser);

            // Upload video if mediaType is 'video/mp4'
            if (mediaType === 'video/mp4') {
                const response = await fetch(postSrc);
                const blob = await response.blob();
                await uploadBytes(mediaRef, blob);
                const downloadURL = await getDownloadURL(mediaRef);

                await updateDoc(postDocRef, { 
                    imageURL: downloadURL,
                    mediaType: mediaType
                });
                newPost.imageURL = downloadURL;
                newPost.mediaType = mediaType;
            } else {
                // Handle image upload
                //await updateDoc(userDocRef, { posts: arrayUnion(postDocRef.id) });
                //await uploadString(mediaRef, postSrc, "data_url");
                const proxyURL = "https://radiant-retreat-87579-dcc979ba57be.herokuapp.com?url=";
            
                const downloadURL = postSrc;
    
                await updateDoc(postDocRef, { imageURL: proxyURL + encodeURIComponent(downloadURL), mediaType: mediaType });
                //await updateDoc(postDocRef, { imageURL: proxyURL + encodeURIComponent(downloadURL), mediaType: mediaType });
    
    
                newPost.imageURL = proxyURL + encodeURIComponent(downloadURL);
                //newPost.imageURL = proxyURL + encodeURIComponent(downloadURL);
                newPost.mediaType = mediaType;
            }

            if (authUser) {
                await updateDoc(userDocRef, { posts: arrayUnion(postDocRef.id) });
                createPost({ ...newPost, id: postDocRef.id });
                addPost({ ...newPost, id: postDocRef.id });
            }

            //showToast("Success", "Post created successfully", "success");
        } catch (error) {
            showToast("Error", error.message, "error");
        } finally {
            setIsLoading(false);
        }
    };

    return { isLoading, handleCreatePost };
};

export default useCreatePost;
