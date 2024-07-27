import { useState, useEffect } from "react";
import axios from "axios";
import useAuthStore from "../store/authStore";

import { updateDoc, doc, getDoc } from "firebase/firestore";
import { firestore } from '../firebase/firebase';


// Define your geocoding API endpoint
const GEOCODING_API_URL = "https://api.bigdatacloud.net/data/reverse-geocode-client";

// Define a mapping of state names to their 2-letter abbreviations
const STATE_ABBREVIATIONS = {
    "Alabama": "AL",
    "Alaska": "AK",
    "Arizona": "AZ",
    "Arkansas": "AR",
    "California": "CA",
    "Colorado": "CO",
    "Connecticut": "CT",
    "Delaware": "DE",
    "Florida": "FL",
    "Georgia": "GA",
    "Hawaii": "HI",
    "Idaho": "ID",
    "Illinois": "IL",
    "Indiana": "IN",
    "Iowa": "IA",
    "Kansas": "KS",
    "Kentucky": "KY",
    "Louisiana": "LA",
    "Maine": "ME",
    "Maryland": "MD",
    "Massachusetts": "MA",
    "Michigan": "MI",
    "Minnesota": "MN",
    "Mississippi": "MS",
    "Missouri": "MO",
    "Montana": "MT",
    "Nebraska": "NE",
    "Nevada": "NV",
    "New Hampshire": "NH",
    "New Jersey": "NJ",
    "New Mexico": "NM",
    "New York": "NY",
    "North Carolina": "NC",
    "North Dakota": "ND",
    "Ohio": "OH",
    "Oklahoma": "OK",
    "Oregon": "OR",
    "Pennsylvania": "PA",
    "Rhode Island": "RI",
    "South Carolina": "SC",
    "South Dakota": "SD",
    "Tennessee": "TN",
    "Texas": "TX",
    "Utah": "UT",
    "Vermont": "VT",
    "Virginia": "VA",
    "Washington": "WA",
    "West Virginia": "WV",
    "Wisconsin": "WI",
    "Wyoming": "WY",
};

const useUserLocation = (lat, long) => {
    const authUser = useAuthStore((state) => state.user)
    const [location, setLocation] = useState({ city: "", state: "" });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!lat || !long) {
            setIsLoading(false);
            return;
        }

        const fetchLocation = async () => {
            try {
                const response = await axios.get(GEOCODING_API_URL, {
                    params: {
                        latitude: lat,
                        longitude: long,
                        localityLanguage: "en",
                    },
                });

                const city = response.data.city || response.data.locality || "Unknown city";
                const stateName = response.data.principalSubdivision || "Unknown state";
                const countryName = response.data.countryName || "Unknown country";

                // Check if the country is the US
                let state;
                if (countryName === "United States of America (the)") {
                    state = STATE_ABBREVIATIONS[stateName] || stateName;
                } else {
                    console.log(countryName);
                    state = countryName; // Use country name as state
                }

                try {
                    const userDocRef = doc(firestore, `users/${authUser.uid}`);
                    const userDoc = await getDoc(userDocRef);

                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        await updateDoc(userDocRef, { city: city, state: state });
                    }
                    
                    } catch (error) {
                        console.error("Error updating user location:", error);
                    }

                setLocation({ city, state });
            } catch (error) {
                console.error("Error fetching location:", error);
                setError("Failed to fetch location");
            } finally {
                setIsLoading(false);
            }
        };

        fetchLocation();
    }, [lat, long]);

    return { location, isLoading, error };
};

export default useUserLocation;
