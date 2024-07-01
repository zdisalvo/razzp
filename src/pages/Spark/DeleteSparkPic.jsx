import {
	Avatar,
	Button,
	Divider,
	Flex,
	GridItem,
	Image,
	Text,
	VStack,
    CloseButton
  } from "@chakra-ui/react";
  

  import useSparkProfileStore from "../../store/sparkProfileStore";
  import useAuthStore from "../../store/authStore";
  import useShowToast from "../../hooks/useShowToast";
  import { useState } from "react";
  import { deleteObject, ref } from "firebase/storage";
  import { firestore, storage } from "../../firebase/firebase";
  import { arrayRemove, deleteDoc, doc, updateDoc } from "firebase/firestore";
  import useSparkImageStore from "../../store/sparkImageStore";

  
  const DeleteSparkPic = ({ pic, onDelete}) => {
	const sparkProfile = useSparkProfileStore((state) => state.sparkProfile);
	const authUser = useAuthStore((state) => state.user);
	const showToast = useShowToast();
	const [isDeleting, setIsDeleting] = useState(false);
	const deletePic = useSparkImageStore((state) => state.deletePic);
	const decrementPicsCount = useSparkProfileStore((state) => state.deletePic);
  
	const handleDeletePic = async () => {
	  if (!window.confirm("Are you sure you want to delete this pic?")) return;
	  if (isDeleting) return;
  
	  try {
		const imageRef = ref(storage, `pics/${pic.id}`);
		await deleteObject(imageRef);
		const userRef = doc(firestore, "spark", sparkProfile.uid);
		await deleteDoc(doc(firestore, "pics", pic.id));
  
		await updateDoc(userRef, {
		  pics: arrayRemove(pic.id),
		});
  
		deletePic(pic.id);
		decrementPicsCount(pic.id);
        onDelete(pic.id); 
		showToast("Success", "Pic deleted successfully", "success");
	  } catch (error) {
		showToast("Error", error.message, "error");
	  } finally {
		setIsDeleting(false);
	  }
	};
  
	return (
        <CloseButton
        size="sm"
        position="absolute"
        top={1}
        right={1}
        onClick={() => handleDeletePic(pic.id)}
        bg="orange.300"
        color="black"
        _hover={{
        bg: "orange.400"
        }}
        _active={{
        bg: "orange.500"
        }}
      />
	);
  };
  
  export default DeleteSparkPic;
  