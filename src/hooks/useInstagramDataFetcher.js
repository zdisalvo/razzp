import { useState, useEffect } from 'react';
import { ApifyClient } from 'apify-client';
import useAuthStore from '../store/authStore';
import useCreatePost from './useCreatePost';
import { addDoc, collection, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { firestore, storage } from '../firebase/firebase';

const useInstagramDataFetcher = () => {
    const authUser = useAuthStore((state) => state.user);
    const [username, setUsername] = useState('');
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { handleCreatePost } = useCreatePost();
    const [progress, setProgress] = useState(0);
    

    const numDays = (dateString) => {
        const givenDate = new Date(dateString);

        // Get the current date
        const currentDate = new Date();

        // Calculate the difference in milliseconds
        const differenceInMillis = currentDate - givenDate;

        // Convert milliseconds to days
        const millisPerDay = 1000 * 60 * 60 * 24;
        const differenceInDays = Math.floor(differenceInMillis / millisPerDay);

        return differenceInDays + 1;
    }

    const handleFetchData = async () => {
        setLoading(true);
        setError(null);
        setItems([]);
        setProgress(0);

        const client = new ApifyClient({
            token: 'apify_api_UceiCMkSoRcXxDjyK0X9ENtt7trEs933AJsl', // Replace with your actual API token
        });

        //instagram scraper

        // const input = {
        //     "directUrls": [
        //         `https://www.instagram.com/${username}/`
        //     ],
        //     "resultsType": "posts",
        //     "resultsLimit": 100,
        //     "searchType": "hashtag",
        //     "searchLimit": 1,
        //     "addParentData": false
        // };

        //post scraper

        const input = {
            "username": [
                username
            ],
            //"onlyPostsNewerThan": "2024-10-05",
            "resultsLimit": 60
            
        };

        let progressInterval;

        const userDocRef = doc(firestore, "users", authUser.uid);

        try {
            
            progressInterval = setInterval(() => {
                setProgress(oldProgress => {
                    if (oldProgress < 100) return oldProgress + 1;
                    clearInterval(progressInterval);
                    return 100;
                });
            }, 4000);

            //post scraper
            //"nH2AHrwxeTRJoN5hX"

            //instagram scraper
            //"shu8hvrXbJbY3Eb9W"


            const run = await client.actor("nH2AHrwxeTRJoN5hX").call(input);
            const { items } = await client.dataset(run.defaultDatasetId).listItems();
            //console.log('Fetched items:', items); // Log the fetched items
            setItems(items);

            for (const item of items) {
                    let postSrc;
                    let caption;
                    let likes;
                    let score;
                    let createdAt;
                    let mediaType;

                if (item.type === "Sidecar") {
                    postSrc = item.childPosts[0].type === "Image" ? item.childPosts[0].displayUrl : item.childPosts[0].videoUrl;
                    caption = item.caption;
                    likes = Math.max(item.likesCount, 0) || 0;
                    score = likes;
                    createdAt = (new Date(item.timestamp)).getTime() || Date.now();
                    mediaType = item.childPosts[0].type === "Image" ? "image/jpeg" : "video/mp4";
                } else {
                // Ensure selectedFile is in the expected format
                    postSrc = item.type === "Image" ? item.displayUrl : item.videoUrl;
                    caption = item.caption;
                    likes = Math.max(item.likesCount, 0) || 0;
                    score = likes;
                    createdAt = (new Date(item.timestamp)).getTime() || Date.now();
                    mediaType = item.type === "Image" ? "image/jpeg" : "video/mp4";
                //await handleCreatePost(postSrc, caption, score, createdAt, mediaType);
                }

                try {
                    await handleCreatePost(postSrc, caption, score, createdAt, mediaType, username);
                } catch (createPostError) {
                    console.error('Error creating post:', createPostError);
                    // Continue with the next item despite the error
                }
            }


        } catch (err) {
            console.error('Error fetching data:', err);
            setError(err);
        } finally {
            await updateDoc(userDocRef, { 
                instagramImport: true,
                instagramUsername: username,
            });
            clearInterval(progressInterval);
            setLoading(false);
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (username) {
            handleFetchData();
        } else {
            setError({ message: "Please enter a valid Instagram username." });
        }
    };

    

    return {
        username,
        setUsername,
        items,
        loading,
        error,
        progress,
        handleSubmit,
    };
};

export default useInstagramDataFetcher;
