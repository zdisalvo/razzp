import { useEffect, useState } from "react";
import useShowToast from "./useShowToast";
import useSparkProfileStore from "../store/sparkProfileStore";

import { collection, getDocs, query, where } from "firebase/firestore";
import { firestore } from "../firebase/firebase";
import useSparkStore from "../store/sparkStore";
import useAuthStore from "../store/authStore";
import useGetSparkProfileById from "./useGetSparkProfileById";

const useGetSparkProfiles = () => {
    const authUser = useAuthStore((state) => state.user);
	const [isLoading, setIsLoading] = useState(true);
	//const { sparkProfiles, setSparkProfiles } = useSparkProfileStore();
	const showToast = useShowToast();
	const {sparkProfile} = useGetSparkProfileById(authUser.uid);

    
    const { sparkProfiles, setSparkProfiles, isLoading: profilesLoading, error } = useSparkStore((state) => ({
        sparkProfiles: state.sparkProfiles,
        setSparkProfiles: state.setSparkProfiles,
        isLoading: state.isLoading,
        error: state.error,
      }));
      
        // useEffect(() => {
        //   fetchAllSparkProfiles();
        // }, [fetchAllSparkProfiles]);

    //console.log(sparkProfile);

	useEffect(() => {
		const getSparkProfiles = async () => {
			if (!sparkProfile) return;
			setIsLoading(true);
			setSparkProfiles([]);

			try {
				const allDocsQuery = query(collection(firestore, "spark"), where("created", "==", true));

				const allDocsSnapshot = await getDocs(allDocsQuery);

                const allDocs = allDocsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                const filteredDocs = allDocs.filter(
                    doc => !sparkProfile.blocked.includes(doc.uid) && !sparkProfile.viewed2x.includes(doc.uid)
							

                    ///UNCOMMENT SO IT DOESN'T SHOW USER'S OWN PROFILE
                            //&& sparkProfile.uid !== doc.uid
							|| sparkProfile.liked.includes(doc.uid) || sparkProfile.matched.includes(doc.uid)
                  );

				const sparkProfiles = [];
                filteredDocs.forEach((doc) => {
					sparkProfiles.push({ ...doc, id: doc.id });
				});

                //const randomizedProfiles = sparkProfiles.sort(() => Math.random() - 0.5);

				//posts.sort((a, b) => b.createdAt - a.createdAt);


				setSparkProfiles(sparkProfiles);
			} catch (error) {
				showToast("Error", error.message, "error");
				setSparkProfiles([]);
			} finally {
				setIsLoading(false);
			}
		};

		getSparkProfiles();
	}, [setSparkProfiles, sparkProfile, showToast]);

	return { isLoading, sparkProfiles };
};

export default useGetSparkProfiles;
