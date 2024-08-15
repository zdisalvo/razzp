import { firestore } from '../firebase/firebase'; // Ensure this path is correct
import * as geofireCommon from 'geofire-common';
import { collection, doc, updateDoc } from "firebase/firestore";

const usersCollection = collection(firestore, 'spark'); // Assuming 'spark' is your Firestore collection

const storeSparkUserLocation = async (userId, latitude, longitude) => {
  const geohash = geofireCommon.geohashForLocation([latitude, longitude]);

  const userDocRef = doc(usersCollection, userId); // Assuming userId is passed from auth or context

  try {
    await updateDoc(userDocRef, {
      geohash: geohash,
      pin: [latitude, longitude] // Optionally store location for easier querying or display
    });
    //console.log("Geohash and location stored successfully.");
    return geohash; // Optionally return geohash for further processing
  } catch (error) {
    console.error("Error storing geohash and location:", error);
    throw error;
  }
};

export { storeSparkUserLocation };
