import React, { useState } from 'react';
import { ApifyClient } from 'apify-client';

const InstagramDataFetcher = () => {
    const [username, setUsername] = useState('');
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFetchData = async () => {
        setLoading(true);
        setError(null);
        setItems([]);

        const client = new ApifyClient({
            token: '<YOUR_API_TOKEN>',
        });

        const input = {
            "directUrls": [
                `https://www.instagram.com/${username}/`
            ],
            "resultsType": "posts",
            "resultsLimit": 200,
            "searchType": "hashtag",
            "searchLimit": 1,
            "addParentData": false
        };

        try {
            const run = await client.actor("shu8hvrXbJbY3Eb9W").call(input);
            const { items } = await client.dataset(run.defaultDatasetId).listItems();
            setItems(items);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError(err);
        } finally {
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

    return (
        <div>
            <h1>Instagram Data Fetcher</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter Instagram username"
                />
                <button type="submit">Fetch Data</button>
            </form>

            {loading && <div>Loading...</div>}
            {error && <div>Error: {error.message}</div>}

            {items.length > 0 && (
                <div>
                    <h2>Results for @{username}</h2>
                    <ul>
                        {items.map((item, index) => (
                            <li key={index}>
                                <pre>{JSON.stringify(item, null, 2)}</pre>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default InstagramDataFetcher;
