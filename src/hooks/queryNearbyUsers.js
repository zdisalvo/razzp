import { firestore } from '../firebase/firebase';
import * as geofireCommon from 'geofire-common';
import { collection, query, where, getDocs } from "firebase/firestore";

const usersCollection = collection(firestore, 'users'); // Assuming 'users' is your Firestore collection

const queryNearbyUsers = async (latitude, longitude, radiusInMeters) => {
  const center = [latitude, longitude];
  const radiusInKm = radiusInMeters / 1000; // Convert radius to kilometers

  console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);


  // Calculate geohashes for querying
  const centerGeohash = geofireCommon.geohashForLocation(center);
  const radiusInRadians = radiusInKm / 6371; // Earth's radius in kilometers

  const EARTH_RADIUS_KM = 6371; // Earth's radius in kilometers

// Calculate latitude and longitude degrees for a given radius in kilometers
const latitudeDegrees = (radiusInKm) => {
  return (radiusInKm / EARTH_RADIUS_KM) * (180 / Math.PI);
};

const longitudeDegrees = (radiusInKm, latitude) => {
  const radians = latitude * Math.PI / 180;
  return (radiusInKm / EARTH_RADIUS_KM) * (180 / Math.PI) / Math.cos(radians);
};

const latDegrees = latitudeDegrees(radiusInKm);
const lonDegrees = longitudeDegrees(radiusInKm, latitude);

  // Define the boundaries for querying nearby geohashes
//   const latitudeDegrees = geofireCommon.degreesLatitude(radiusInKm);
//   const longitudeDegrees = geofireCommon.degreesLongitude(radiusInKm, latitude);

  const queryBounds = {
    minLat: center[0] - latDegrees,
    maxLat: center[0] + latDegrees,
    minLon: center[1] - lonDegrees,
    maxLon: center[1] + lonDegrees
  };

  //console.log(`MinLat: ${queryBounds.minLat}, MinLong: ${queryBounds.minLon}`);

  //query(collection(firestore, "posts"), where("createdBy", "in", authUser.following));
  // Query Firestore for users within the geohash bounds

  const q = query(usersCollection, where('location', '>=', [queryBounds.minLat, queryBounds.minLon]),
  where('location', '<=', [queryBounds.maxLat, queryBounds.maxLon])
    );

    // const q = query(usersCollection, where('geohash', '>=', geofireCommon.geohashForLocation([queryBounds.minLat, queryBounds.minLon])),
    //     where('geohash', '>=', geofireCommon.geohashForLocation([queryBounds.maxLat, queryBounds.maxLon]))
    // );

    //   const q = await query(collection(firestore, "users"), where('geohash', '>=', geofireCommon.geohashForLocation([queryBounds.minLat, queryBounds.minLon]))
    //         && where('geohash', '>=', geofireCommon.geohashForLocation([queryBounds.maxLat, queryBounds.maxLon])));


    const nearbyUsersSnapshot = await getDocs(q);

    // const nearbyUsersSnapshot = await usersCollection
    // .where('geohash', '>=', geofireCommon.geohashForLocation([queryBounds.minLat, queryBounds.minLon]))
    // .where('geohash', '<=', geofireCommon.geohashForLocation([queryBounds.maxLat, queryBounds.maxLon]))
    // .get();

  const nearbyUsers = [];
  
  
  // Process the snapshot to extract nearby users
  nearbyUsersSnapshot.forEach(doc => {
    const userData = doc.data();
    const userLocation = userData.location; // Assuming 'location' field holds [latitude, longitude]
    
    // Calculate distance (optional, depending on your needs)
    const distance = geofireCommon.distanceBetween(center, userLocation);
    const distanceMiles = .62137 * distance;

    nearbyUsers.push({
      userId: doc.id,
      location: userLocation,
      distance: distanceMiles,
      userData: userData

    });
    
  });


  return nearbyUsers;
};

export {queryNearbyUsers};
