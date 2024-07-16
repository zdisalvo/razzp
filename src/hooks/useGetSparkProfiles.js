import { useEffect, useState } from "react";
import useShowToast from "./useShowToast";
import useSparkProfileStore from "../store/sparkProfileStore";
import { collection, getDocs, query, where } from "firebase/firestore";
import { firestore } from "../firebase/firebase";
import useSparkStore from "../store/sparkStore";
import useAuthStore from "../store/authStore";
import useGetSparkProfileById from "./useGetSparkProfileById";
import * as geofireCommon from 'geofire-common';

const allDocsQuery = query(collection(firestore, "spark"), where("created", "==", true));

const queryNearbyUsers = async (latitude, longitude, radiusInMiles) => {
	const center = [latitude, longitude];
	const radiusInKm = Number(radiusInMiles) * 1.60934; // Convert radius to kilometers
  
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
	const queryBounds = {
	  minLat: center[0] - latDegrees,
	  maxLat: center[0] + latDegrees,
	  minLon: center[1] - lonDegrees,
	  maxLon: center[1] + lonDegrees
	};
  
	// Query Firestore for users within the geohash bounds
	const q = query(
	  allDocsQuery,
	  where('location', '>=', [queryBounds.minLat, queryBounds.minLon]),
	  where('location', '<=', [queryBounds.maxLat, queryBounds.maxLon])
	);
  
	try {
	  const querySnapshot = await getDocs(q);
	  const nearbyUsers = [];
	  querySnapshot.forEach((doc) => {
		nearbyUsers.push(doc.data());
	  });
	  return nearbyUsers;
	} catch (error) {
	  console.error("Error querying nearby users:", error);
	  throw error;
	}
  };

const useGetSparkProfiles = (refreshKey) => {
    const authUser = useAuthStore((state) => state.user);
    const [isLoading, setIsLoading] = useState(true);
    const showToast = useShowToast();
    const { sparkProfile } = useGetSparkProfileById(authUser.uid);

    const { sparkProfiles, setSparkProfiles, isLoading: profilesLoading, error } = useSparkStore((state) => ({
        sparkProfiles: state.sparkProfiles,
        setSparkProfiles: state.setSparkProfiles,
        isLoading: state.isLoading,
        error: state.error,
    }));

    useEffect(() => {
        const getSparkProfiles = async () => {
            if (!sparkProfile) return;
            setIsLoading(true);
            setSparkProfiles([]);

            try {
				let allDocs = [];
				//console.log("test");
                //const allDocsQuery = query(collection(firestore, "spark"), where("created", "==", true));
                
				if (sparkProfile.location.length > 0) {
					allDocs = await queryNearbyUsers(sparkProfile.location[0], sparkProfile.location[1], sparkProfile.radiusInMiles);
				} else {
					allDocsSnapshot = await getDocs(allDocsQuery);
					allDocs = allDocsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
				}


                // Apply filters from sparkProfile
                const filteredDocs = allDocs.filter(doc => {
                    // Exclude profiles that are blocked, viewed 2x, or own profile
                    if (sparkProfile.blocked.includes(doc.uid)  ) {
                        return false;
                    }
					//REPLACE IN THE ABOVE IF STATEMENT
					//|| sparkProfile.viewed2x.includes(doc.uid) || sparkProfile.uid === doc.uid

                    // Get filters from sparkProfile
                    const filters = sparkProfile.filters || {}; // Adjust if the structure differs

                    // Check if the profile matches the filters
                    let matchesFilters = true;

                    // Height filter
                    if (filters.height) {
                        const { value, shorterThan, tallerThan } = filters.height;
                        const height = doc.height; // Assuming height is stored as a number

                        if (height !== undefined && height !== null && height !== "" && height !== 0) {
                            if (shorterThan && height >= value) {
                                matchesFilters = false;
                            }
                            if (tallerThan && height <= value) {
                                matchesFilters = false;
                            }
							
                        }
                    }

                    // Ethnicity filter
                    if (filters.ethnicity) {
                        if (filters.ethnicity.length > 0) {
                            if (doc.ethnicity === null || doc.ethnicity === undefined || doc.ethnicity === '') {
                                // If ethnicity is not set, it should pass the filter condition
                                matchesFilters = true;
                            } else if (!filters.ethnicity.includes(doc.ethnicity)) {
                                matchesFilters = false;
                            }
                        }
                    }

                    // Exercise filter
                    if (filters.exercise) {
                        if (filters.exercise.length > 0) {
                            if (doc.exercise === null || doc.exercise === undefined || doc.exercise === '') {
                                // If exercise is not set, it should pass the filter condition
                                matchesFilters = true;
                            } else if (!filters.exercise.includes(doc.exercise)) {
                                matchesFilters = false;
                            }
                        }
                    }

                    // Family Plans filter
                    if (filters.familyPlans) {
                        if (filters.familyPlans.length > 0) {
                            if (doc.familyPlans === null || doc.familyPlans === undefined || doc.familyPlans === '') {
                                // If familyPlans is not set, it should pass the filter condition
                                matchesFilters = true;
                            } else if (!filters.familyPlans.includes(doc.familyPlans)) {
                                matchesFilters = false;
                            }
                        }
                    }

                    // Drinking filter
                    if (filters.drinking) {
                        if (filters.drinking.length > 0) {
                            if (doc.drinking === null || doc.drinking === undefined || doc.drinking === '') {
                                // If drinking is not set, it should pass the filter condition
                                matchesFilters = true;
                            } else if (!filters.drinking.includes(doc.drinking)) {
                                matchesFilters = false;
                            }
                        }
                    }

                    // Cannabis filter
                    if (filters.cannabis) {
                        if (filters.cannabis.length > 0) {
                            if (doc.cannabis === null || doc.cannabis === undefined || doc.cannabis === '') {
                                // If cannabis is not set, it should pass the filter condition
                                matchesFilters = true;
                            } else if (!filters.cannabis.includes(doc.cannabis)) {
                                matchesFilters = false;
                            }
                        }
                    }

                    // Have Kids filter
                    if (filters.haveKids) {
                        if (filters.haveKids.length > 0) {
                            if (doc.haveKids === null || doc.haveKids === undefined || doc.haveKids === '') {
                                // If haveKids is not set, it should pass the filter condition
                                matchesFilters = true;
                            } else if (!filters.haveKids.includes(doc.haveKids)) {
                                matchesFilters = false;
                            }
                        }
                    }

                    // Open To filter
                    if (filters.openTo) {
                        if (filters.openTo.length > 0) {
                            if (doc.openTo === null || doc.openTo === undefined || doc.openTo === '') {
                                // If openTo is not set, it should pass the filter condition
                                matchesFilters = true;
                            } else if (!filters.openTo.includes(doc.openTo)) {
                                matchesFilters = false;
                            }
                        }
                    }

                    // Politics filter
                    if (filters.politics) {
                        if (filters.politics.length > 0) {
                            if (doc.politics === null || doc.politics === undefined || doc.politics === '') {
                                // If politics is not set, it should pass the filter condition
                                matchesFilters = true;
                            } else if (!filters.politics.includes(doc.politics)) {
                                matchesFilters = false;
                            }
                        }
                    }

                    // Religion filter
                    if (filters.religion) {
                        if (filters.religion.length > 0) {
                            if (doc.religion === null || doc.religion === undefined || doc.religion === '') {
                                // If religion is not set, it should pass the filter condition
                                matchesFilters = true;
                            } else if (!filters.religion.includes(doc.religion)) {
                                matchesFilters = false;
                            }
                        }
                    }

                    return matchesFilters;
                });

                setSparkProfiles(filteredDocs);
            } catch (error) {
                showToast("Error", error.message, "error");
                setSparkProfiles([]);
            } finally {
                setIsLoading(false);
            }
        };

        getSparkProfiles();
    }, [setSparkProfiles, sparkProfile, showToast, refreshKey]);

    return { isLoading, sparkProfiles };
};

export default useGetSparkProfiles;
