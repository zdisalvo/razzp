import { useState, useEffect } from "react";
import axios from "axios";

const useGetSparkLocationAndDistance = (lat, long, sparkUser) => {
  const [isLoading, setIsLoading] = useState(true); // Initial loading state
  const [location, setLocation] = useState({ city: "", state: "" });
  const [distance, setDistance] = useState(null);
  

  if (!sparkUser || !sparkUser.pin || sparkUser.pin.length < 2) {
    setIsLoading(false);
    return;
}

const userLat = sparkUser.pin[0]; // Replace with sparkUser's latitude
  const userLong = sparkUser.pin[1]; // Replace with sparkUser's longitude

  useEffect(() => {
    

    // Check if pin coordinates are available
    if (sparkUser && sparkUser.pin && sparkUser.pin.length > 0) {
      const fetchLocation = async () => {
        try {
          const response = await axios.get(
            `https://api.bigdatacloud.net/data/reverse-geocode-client`,
            {
              params: {
                latitude: lat,
                longitude: long,
                localityLanguage: "en",
              },
            }
          );
          const city = response.data.city || response.data.locality || "Unknown city";
          const state =
            response.data.principalSubdivision || "Unknown state";
          setLocation({ city, state });
          setIsLoading(false); // Update loading state after fetching location
        } catch (error) {
          console.error("Error fetching location:", error);
          setLocation({ city: "Unknown city", state: "Unknown state" });
          setIsLoading(false); // Update loading state on error
        }
      };

      const haversineDistance = (lat1, lon1, lat2, lon2) => {
        const toRadians = (degrees) => degrees * (Math.PI / 180);
        const R = 3958.8; // Radius of the Earth in miles
        const dLat = toRadians(lat2 - lat1);
        const dLon = toRadians(lon2 - lon1);
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(toRadians(lat1)) *
            Math.cos(toRadians(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        return distance;
      };

      if (!isLoading) {
        const distanceFromUser = haversineDistance(
          userLat,
          userLong,
          lat,
          long
        );
        setDistance(distanceFromUser);
      }

      fetchLocation();
    } else {
      setIsLoading(false); // No coordinates available, set loading to false
    }
  }, [lat, long, sparkUser]);

  return { city: location.city, state: location.state, distance, isLoading };
};

export default useGetSparkLocationAndDistance;
