import { storeUserLocation } from './hooks/storeUserLocation';
import { queryNearbyUsers } from '../hooks/queryNearbyUsers';

// Example usage in your component or service
const updateUserLocationAndFindNearbyUsers = async (userId, latitude, longitude, radiusInMeters) => {
  try {
    // Store user location with geohash
    await storeUserLocation(userId, latitude, longitude);

    // Query nearby users
    const nearbyUsers = await queryNearbyUsers(latitude, longitude, radiusInMeters);
    console.log('Nearby users:', nearbyUsers);
    // Handle nearbyUsers data as needed
  } catch (error) {
    console.error('Error updating location or querying nearby users:', error);
    // Handle error appropriately
  }
};

