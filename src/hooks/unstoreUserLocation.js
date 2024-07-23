import { firestore } from '../firebase/firebase';
import * as geofireCommon from 'geofire-common';
import { collection, doc, updateDoc} from "firebase/firestore";


//const usersCollection = collection(firestore, 'users'); // Assuming 'users' is your Firestore collection

const unstoreUserLocation = async (userId) => {
  

  const userDocRef = doc(firestore, `users/${userId}`); // Assuming userId is passed from auth or context
  
//   return userDocRef.update({
//   geohash: geohash,
//   location: [latitude, longitude] // Optionally store location for easier querying or display
// })

  return updateDoc(userDocRef, {
    geohash: "",
    location: [] // Optionally store location for easier querying or display
  })
  .catch((error) => {
    console.error("Error storing geohash and location:", error);
    throw error;
  });
};

export {unstoreUserLocation};
