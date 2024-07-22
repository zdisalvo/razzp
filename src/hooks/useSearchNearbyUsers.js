import { useState } from "react";
import useShowToast from "./useShowToast";
import { collection, query, where, getDocs } from "firebase/firestore";
import { firestore } from "../firebase/firebase";
import * as geofireCommon from 'geofire-common';

const useSearchNearbyUsers = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const showToast = useShowToast();

  const getUserProfiles = async (searchQuery, latitude, longitude, radiusInMeters) => {
    setIsLoading(true);
    setUsers([]);
    try {
      const center = [latitude, longitude];
      const radiusInKm = radiusInMeters / 1000; // Convert radius to kilometers

      const centerGeohash = geofireCommon.geohashForLocation(center);
      const radiusInRadians = radiusInKm / 6371; // Earth's radius in kilometers

      const EARTH_RADIUS_KM = 6371; // Earth's radius in kilometers

      // Calculate latitude and longitude degrees for a given radius in kilometers
      const latitudeDegrees = (radiusInKm) => (radiusInKm / EARTH_RADIUS_KM) * (180 / Math.PI);
      const longitudeDegrees = (radiusInKm, latitude) => {
        const radians = latitude * Math.PI / 180;
        return (radiusInKm / EARTH_RADIUS_KM) * (180 / Math.PI) / Math.cos(radians);
      };

      const latDegrees = latitudeDegrees(radiusInKm);
      const lonDegrees = longitudeDegrees(radiusInKm, latitude);

      // Define the boundaries for querying nearby geohashes
      const queryBounds = {
        minLat: center[0] - latDegrees,
        maxLat: center[0] + latDegrees,
        minLon: center[1] - lonDegrees,
        maxLon: center[1] + lonDegrees
      };

      const usersCollection = collection(firestore, "users");
      const q = query(
        usersCollection,
        where('location', '>=', [queryBounds.minLat, queryBounds.minLon]),
        where('location', '<=', [queryBounds.maxLat, queryBounds.maxLon])
      );

      const nearbyUsersSnapshot = await getDocs(q);

      const nearbyUsers = [];
      nearbyUsersSnapshot.forEach(doc => {
        const userData = doc.data();
        const userLocation = userData.location; // Assuming 'location' field holds [latitude, longitude]
        
        // Calculate distance (optional, depending on your needs)
        const distance = geofireCommon.distanceBetween(center, userLocation);
        const distanceMiles = distance * 0.62137; // Convert km to miles

        nearbyUsers.push(userData); // Add only userData
      });

      // Filter users by search query
      const lowerCaseQuery = searchQuery.toLowerCase();
      const filteredUsers = nearbyUsers.filter(user =>
        user.username.toLowerCase().startsWith(lowerCaseQuery) ||
        user.fullName.toLowerCase().startsWith(lowerCaseQuery)
      );

      setUsers(filteredUsers);
    } catch (error) {
      showToast("Error", error.message, "error");
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, getUserProfiles, users };
};

export default useSearchNearbyUsers;
