import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  Select as ChakraSelect,
  Stack,
  Image,
  Heading,
  Text,
  Center,
  Spinner,
  Flex,
  CloseButton,
  useBreakpointValue,
  Textarea,
} from "@chakra-ui/react";
import useAuthStore from "../../store/authStore";
import useCreateSparkProfile from "../../hooks/useCreateSparkProfile";
import useGetSparkProfileById from "../../hooks/useGetSparkProfileById";
import useGetUserPostsById from "../../hooks/useGetUserPostsById";
import Select from "react-select";
import languagesData from "../../../json-files/languages.json";
import heightsData from "../../../json-files/heights.json";
import citiesData from "../../../json-files/worldcities2.json";
import countryCodeToFlagEmoji from 'country-code-to-flag-emoji';
import ReCAPTCHA from "react-google-recaptcha";
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import CreateSparkPic from "./CreateSparkPic";
import useGetSparkImagesById from "../../hooks/useGetSparkImagesById";
import DeleteSparkPic from "./DeleteSparkPic";
import DragAndDropGrid from "./DragAndDropGrid";



const CreateSpark = () => {
  const authUser = useAuthStore((state) => state.user);
  if (!authUser) return;

  //console.log(authUser.uid);

  const scrollContainerRef = useRef(null);

  const scrollContainerRefUploads = useRef(null);

  
  const { isUpdating, editSparkProfile } = useCreateSparkProfile();
  const { sparkProfile } = useGetSparkProfileById(authUser.uid);

  const { userPosts, isLoading: postsLoading } = useGetUserPostsById(authUser.uid);


  const [sparkImages, setSparkImages] = useState([]);
  const [imagesLoading, setImagesLoading] = useState(false);
  
  //333333
  //const [profilePics, setProfilePics] = useState([]);
  const { sparkImages: fetchedImages, isLoading: imagesLoadingFromHook } = useGetSparkImagesById(authUser.uid);
 // const { profilePics: fetchedProfilePics, isLoading: profilePicsLoadingFromHook } = useGetSparkImagesById(authUser.uid);

  

  //const{ sparkImages, isLoading: imagesLoading } = useGetSparkImagesById(authUser.uid);

  const isMobile = useBreakpointValue({ base: true, md: false });
  
  useEffect(() => {
    if (fetchedImages) {
      setSparkImages(fetchedImages);
    // if (fetchedImages)
    //   setProfilePics([...fetchedImages, ...formData.selectedImages]);
    }
  }, [fetchedImages]);



  

  // useEffect(() => {
  //   if (fetchedProfilePics) {
  //     setProfilePics(fetchedProfilePics); // Initialize profilePics with sparkImages
  //     console.log("test");
  //   }
  // }, [fetchedProfilePics]);

  const handleImageUpload = (newImage) => {
    setSparkImages([...sparkImages, newImage]);
  };

  const handleDeleteImage = (imageId) => {

    setSparkImages(sparkImages.filter(image => image.id !== imageId));
  };

  
  
  //if (postsLoading) return <Spinner size="xl" />; // Adjust this based on your needs

  //const [selectedImages, setSelectedImages] = useState([]);

  //console.log(userPosts.length);
  
    const [formData, setFormData] = useState({
        name: "",
        bio: "",
        birthday: "",
        work: "",
        school: "",
        gender: "",
        interested_in: [],
        location: "",
        hometown: "",
        ethnicity: [],
        height: "",
        exercise: "",
        education_level: "",
        drinking: "",
        smoking: "",
        cannabis: "",
        looking_for: [],
        family_plans: "",
        have_kids: "",
        star_sign: "",
        politics: "",
        religion: "",
        pronouns: [],
        languages: [],
        interests: [],
        profilePics: [],
        selectedImages: [],
        uploadedImages: [],
      });

    
      // useEffect to update formData when sparkProfile changes
      useEffect(() => {
        if (sparkProfile) {
          setFormData((prevFormData) => ({
            ...prevFormData,
            name: sparkProfile.name || "",
            bio: sparkProfile.bio || "",
            birthday: sparkProfile.birthday || "",
            work: sparkProfile.work || "",
            school: sparkProfile.school || "",
            gender: sparkProfile.gender || "",
            interested_in: sparkProfile.interested_in || [],
            location: sparkProfile.location || "",
            hometown: sparkProfile.hometown || "",
            ethnicity: sparkProfile.ethnicity || [],
            height: sparkProfile.height || "",
            exercise: sparkProfile.exercise || "",
            education_level: sparkProfile.education_level || "",
            drinking: sparkProfile.drinking || "",
            smoking: sparkProfile.smoking || "",
            cannabis: sparkProfile.cannabis || "",
            looking_for: sparkProfile.looking_for || [],
            family_plans: sparkProfile.family_plans || "",
            have_kids: sparkProfile.have_kids || "",
            star_sign: sparkProfile.star_sign || "",
            politics: sparkProfile.politics || "",
            religion: sparkProfile.religion || "",
            pronouns: sparkProfile.pronouns || [],
            languages: sparkProfile.languages || [],
            interests: sparkProfile.interests || [],
            profilePics: sparkProfile.profilePics || [],
            selectedImages: sparkProfile.selectedImages || [],
            uploadedImages: sparkProfile.uploadedImages || [],
          }));
          //setSelectedImages(sparkProfile.selectedImages || []);
        }
      }, [sparkProfile]);

  const [preview, setPreview] = useState(null);


  //stripping images from posts

  useEffect(() => {
  if (sparkProfile && formData ) {
    const selectedImagesRaw = formData.selectedImages.map((post) => ({ id: post.id, imageURL: post.imageURL }));
    const sparkImagesRaw = sparkImages.map((image) => ({ id: image.id, imageURL: image.imageURL }));
    const allImages = [...sparkImagesRaw, ...selectedImagesRaw];
    
    // Only update if the profilePics are different
    if (!sparkProfile.profilePics && formData.profilePics.length === 0) {
      setFormData((prevState) => {
        const updatedFormData = {
          ...prevState,
          profilePics: allImages,
        };

        // Call editSparkProfile to update the profile
        editSparkProfile(updatedFormData);

        return updatedFormData;
      });
    } else if (formData.profilePics.length < allImages.length) {
        const newImages = allImages.filter(image => !formData.profilePics.some(pic => pic.id === image.id));
        setFormData((prevState) => {
          const updatedFormData = {
            ...prevState,
            profilePics: [...prevState.profilePics, ...newImages],
          };

          // Call editSparkProfile to update the profile
          editSparkProfile(updatedFormData);

          return updatedFormData;
        });
      } else if (formData.profilePics.length > allImages.length) {
        const removedImages = formData.profilePics.filter(pic => !allImages.some(img => img.id === pic.id));

        setFormData((prevState) => {
          const updatedFormData = {
            ...prevState,
            profilePics: prevState.profilePics.filter(pic => !removedImages.some(removed => removed.id === pic.id)),
          };

          // Call editSparkProfile to update the profile
          editSparkProfile(updatedFormData);

          return updatedFormData;
        });
      }

    
  }
}, [sparkImages, formData.selectedImages, sparkProfile, editSparkProfile]);



const handleDragEnd = (reorderedImages) => {
  // Ensure reorderedImages is an array of images
  if (Array.isArray(reorderedImages)) {
    // Update formData with the reordered images
    setFormData((prevState) => {
      const updatedFormData = {
        ...prevState,
        profilePics: reorderedImages, // Set profilePics to the reordered list
      };

      // Call editSparkProfile to persist the changes
      editSparkProfile(updatedFormData);

      return updatedFormData;
    });
  } else {
    console.error("Invalid reordered images data.");
  }
};

  ///HANDLE SUBMIT

  const handleSubmit = async (e) => {
    e.preventDefault();
    await editSparkProfile(formData);
    //console.log("Profile updated", formData);
  };
  

  const handleChange = (e) => {
    const { name, value } = e.target;

    const capitalizedValue = value.charAt(0).toUpperCase() + value.slice(1);

    setFormData((prevState) => ({
      ...prevState,
      [name]: capitalizedValue,
    }));
  };

  
  
//PREVIOUS HANDLE IMAGE CLICK WITHOUT AUTO RENDERING

  // const handleImageClick = (id) => {
  //   setFormData((prevState) => {
      
  //     const currentSelectedImages = [...prevState.selectedImages];
  //     if (currentSelectedImages.includes(id)) {

  //       return { ...prevState, selectedImages: currentSelectedImages.filter((p) => p !== id) };
  //     } else if (currentSelectedImages.length < 5) {
        
  //       return { ...prevState, selectedImages: [...currentSelectedImages, id] };
  //     } else {
  //       return prevState; 
  //     }
  //   });
  // };

  //handling selectedImages update on change

  const handleImageClick = (id, imageURL) => {
    setFormData((prevState) => {
      const currentSelectedImages = [...prevState.selectedImages];
      
      // Check if the id already exists in the selectedImages
      const imageIndex = currentSelectedImages.findIndex((image) => image.id === id);
      
      let newSelectedImages;
      
      if (imageIndex > -1) {
        // If the image is already selected, remove it
        newSelectedImages = currentSelectedImages.filter((image) => image.id !== id);
      } else if (currentSelectedImages.length < 5) {
        // If the image is not selected and we have less than 5 images, add it
        newSelectedImages = [...currentSelectedImages, { id, imageURL }];
      } else {
        // If 5 images are already selected, do nothing
        return prevState;
      }
      
      // Update the formData
      const updatedFormData = {
        ...prevState,
        selectedImages: newSelectedImages,
      };
      
      // Call editSparkProfile to update the profile
      editSparkProfile(updatedFormData);
      
      return updatedFormData;
    });
  };
  



  
  //const [selectedImages, setSelectedImages] = useState([]);

  // const handleImageClick = (id) => {
  //   setSelectedImages((prevSelectedImages) => {
  //     if (prevSelectedImages.includes(id)) {
  //       // Remove the image if it's already selected
  //       return prevSelectedImages.filter((imgId) => imgId !== id);
  //     } else if (prevSelectedImages.length < 5) {
  //       // Add the image if less than 5 are selected
  //       return [...prevSelectedImages, id];
  //     } else {
  //       return prevSelectedImages; // Do nothing if already 5 are selected
  //     }
  //   });
  // };

  
  //const scrollContainerRef = useRef(null);

  // Function to handle image upload
  // const handleImageUpload = (newImage) => {
  //   setSparkImages([...sparkImages, newImage]);
  // };

  // // Function to handle image deletion
  // const handleDeleteImage = (imageId) => {
  //   setSparkImages(sparkImages.filter(image => image.id !== imageId));
  // };

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -110 : 110,
        behavior: 'smooth',
      });
    }
  };

  const scrollUploads = (direction) => {
    if (scrollContainerRefUploads.current) {
      scrollContainerRefUploads.current.scrollBy({
        left: direction === 'left' ? -110 : 110,
        behavior: 'smooth',
      });
    }
  };

  // const handleFileChange = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     const reader = new FileReader();
  //     reader.onloadend = () => {
  //       setPreview(reader.result);
  //       setFormData((prevState) => ({
  //         ...prevState,
  //         profilePic: reader.result,
  //       }));
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // };


  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + formData.profilePic.length > 7) {
      alert("You can only upload up to 7 photos.");
      return;
    }
  
    const newPhotos = files.map(file => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      return new Promise((resolve) => {
        reader.onloadend = () => {
          resolve(reader.result);
        };
      });
    });


    Promise.all(newPhotos).then((profilePic) => {
      setFormData((prevState) => ({
        ...prevState,
        profilePic: [...prevState.profilePic, ...profilePic],
      }));
    });
  };



//GENDER

  const genderOptions = ["Female", "Male", "Trans Female", "Trans Male", "Non-binary"];

  const handleGenderChange = (selectedOption) => {
    setFormData((prevState) => ({
      ...prevState,
      gender: selectedOption.value,
    }));
  };

  const handleGenderClick = (gender) => {
    setFormData((prevState) => ({
      ...prevState,
      gender: prevState.gender === gender ? "" : gender,
    }));
  };


  //INTERESTED IN

  const interestedInOptions = ["Women", "Men", "Trans Women", "Trans Men", "Non-binary"];

  const handleInterestedInClick = (interestedIn) => {
    setFormData((prevState) => {
      const currentInterestedIn = [...prevState.interested_in];
      if (currentInterestedIn.includes(interestedIn)) {
        // Remove the option if it's already selected
        return { ...prevState, interested_in: currentInterestedIn.filter((e) => e !== interestedIn) };
      } else {
        // Add the option if it's not already selected
        return { ...prevState, interested_in: [...currentInterestedIn, interestedIn] };
      }
    });
  };

  //LOCATION

  const [cities, setCities] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);
    
    const [isTyping, setIsTyping] = useState(false);
    

    useEffect(() => {
        const formattedCities = citiesData.cities.map(city => ({
            value: `${city.city}, ${city.state}, ${city.country}, ${countryCodeToFlagEmoji(city.iso2)}`,
            label: `${city.city}, ${city.state}, ${city.country}, ${countryCodeToFlagEmoji(city.iso2)}`
        }));
        setCities(formattedCities);
    }, []);




    const handleLocationChange = (selectedOption) => {
      setFormData((prevState) => ({
        ...prevState,
        location: selectedOption !== null ? selectedOption.value : "", // Single value
        
      }));
    };
  

    const filterCitiesLocation = (candidate, input) => {
      if (isTyping && input.length > 2) {
          return candidate.label.toLowerCase().startsWith(input.toLowerCase());
      }
      return null; // or handle non-typing state behavior
  };

      const handleKeyDown = (event) => {
        // Detecting if the key pressed is a delete key or backspace
        if (event.key === 'Delete' || event.key === 'Backspace') {
            setIsTyping(false); 
            
        } 
        else {
          setIsTyping(true);
        }
    };

    //HOMETOWN

    const [selectedHometown, setSelectedHometown] = useState(null);

    const handleHometownChange = (selectedOption) => {
      setSelectedHometown(selectedOption);
      setFormData({ ...formData, hometown: selectedOption ? selectedOption.value : '' });
  };

  const filterCitiesHometown = (candidate, input) => {
    if (isTyping && input.length > 2) {
        return candidate.label.toLowerCase().startsWith(input.toLowerCase());
    }
    return null; // or handle non-typing state behavior
};
  

    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            backgroundColor: 'black',
            color: 'grey',
            borderColor: state.isFocused ? 'sandybrown' : 'grey',
            boxShadow: 'none',
            '&:hover': {
                borderColor: 'sandybrown',
            },
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected ? '#333333' : 'black',
            color: state.isSelected ? 'sandybrown' : 'grey',
            '&:hover': {
                backgroundColor: '#333333',
                color: 'sandybrown',
            },
        }),
        input: (provided) => ({
            ...provided,
            color: 'grey',
        }),
        menu: (provided) => ({
            ...provided,
            backgroundColor: 'black',
            marginTop: 0,
            borderRadius: 0,
            boxShadow: 'none',
            borderWidth: 0,
        }),
        singleValue: (provided) => ({
            ...provided,
            color: 'white',
            backgroundColor: '#333333',
            width: 'auto',
            textAlign: 'left',
            paddingLeft: '1ch'
        }),
        clearIndicator: (provided) => ({
            ...provided,
            color: 'grey',
            padding: '0px',
            '&:hover': {
                color: 'sandybrown',
            },
        }),
    };


//ETHNICITY

    const ethnicityOptions = ["Asian", "Black", "Indian", "Jewish", "Latin", "Middle Eastern", "Pacific Islander", "Persian", "White"];

    const handleEthnicityClick = (ethnicitySelection) => {
      setFormData((prevState) => {
        const currentEthnicities = [...prevState.ethnicity];
        if (currentEthnicities.includes(ethnicitySelection)) {
          // Remove the ethnicity if it's already selected
          return { ...prevState, ethnicity: currentEthnicities.filter((e) => e !== ethnicitySelection) };
        } else if (currentEthnicities.length < 5) {
          // Add the ethnicity if less than 5 are selected
          return { ...prevState, ethnicity: [...currentEthnicities, ethnicitySelection] };
        } else {
          return prevState; // Do nothing if already 7 are selected
        }
      });
    };

//HEIGHT

    // const predefinedHeights = heightsData.map((height) => ({
    //     label: height,
    //     value: height,
    //     }));  
    const predefinedHeights = heightsData;


        const handleHeightChange = (selectedOption) => {
          setFormData((prevState) => ({
            ...prevState,
            height: selectedOption ? selectedOption.value : null, // Single value
          }));
        };
        
          const filterHeights = (candidate, input) => {
            return candidate.label.toLowerCase().startsWith(input.toLowerCase());
          };

//EXERCISE

const exerciseOptions = ["Active", "Sometimes", "Rarely"];


const handleExerciseClick = (exercise) => {
  setFormData((prevState) => ({
    ...prevState,
    exercise: prevState.exercise === exercise ? "" : exercise,
  }));
};

//EDUCATION LEVEL

const educationOptions = ["High School", "Trade/Tech School", "In College", "Undergraduate Degree", "In Grad School", "Graduate Degree", "PhD", "MD"];
        
const handleEducationClick = (education_level) => {
  setFormData((prevState) => ({
    ...prevState,
    education_level: prevState.education_level === education_level ? "" : education_level,
  }));
};

//DRINKING

const drinkingOptions = ["Often", "Socially", "On Special Occasion", "Never"];

const handleDrinkingClick = (drinking) => {
  setFormData((prevState) => ({
    ...prevState,
    drinking: prevState.drinking === drinking ? "" : drinking,
  }));
};

//SMOKING

const smokingOptions = ["Often", "Socially", "On Special Occasion", "Never"];

const handleSmokingClick = (smoking) => {
  setFormData((prevState) => ({
    ...prevState,
    smoking: prevState.smoking === smoking ? "" : smoking,
  }));
};


//CANNABIS

const cannabisOptions = ["Often", "Socially", "On Special Occasion", "Never"];

const handleCannabisClick = (cannabis) => {
  setFormData((prevState) => ({
    ...prevState,
    cannabis: prevState.cannabis === cannabis ? "" : cannabis,
  }));
};

//LOOKING FOR

const lookingForOptions = ["Exploring", "Casual Dating", "Monogamous Relationship", "Open Relationship", "Long Term", "Marriage"];

const handleLookingForClick = (lookingForSelection) => {
  setFormData((prevState) => {
    const currentLookingFor = [...prevState.looking_for];
    if (currentLookingFor.includes(lookingForSelection)) {

      return { ...prevState, looking_for: currentLookingFor.filter((e) => e !== lookingForSelection) };
    } else if (currentLookingFor.length < 3) {
 
      return { ...prevState, looking_for: [...currentLookingFor, lookingForSelection] };
    } else {
      return prevState; 
    }
  });
};

//FAMILY PLANS

const familyPlansOptions = ["Don't want kids", "Open to kids", "Want kids", "Not sure"];

const handleFamilyPlansClick = (family_plans) => {
  setFormData((prevState) => ({
    ...prevState,
    family_plans: prevState.family_plans === family_plans ? "" : family_plans,
  }));
};

//HAVE KIDS

const haveKidsOptions = ["Have one", "Have kids", "Don't have kids"];

const handleHaveKidsClick = (have_kids) => {
  setFormData((prevState) => ({
    ...prevState,
    have_kids: prevState.have_kids === have_kids ? "" : have_kids,
  }));
};

//STAR SIGN

const starSignOptions = ["Aquarius", "Pisces", "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn"];

const handleStarSignClick = (star_sign) => {
  setFormData((prevState) => ({
    ...prevState,
    star_sign: prevState.star_sign === star_sign ? "" : star_sign,
  }));
};

//POLITICS

const politicsOptions = ["Apolitical", "Liberal", "Moderate", "Conservative"];

const handlePoliticsClick = (politics) => {
  setFormData((prevState) => ({
    ...prevState,
    politics: prevState.politics === politics ? "" : politics,
  }));
};

//RELIGION

const religionOptions = ["Agnostic", "Atheist", "Buddhist", "Catholic", "Christian", "Hindu", "Jain", "Jewish", "Mormon", "Latter-day Saint", "Muslim", "Zoroastrian", "Sikh", "Spiritual", "Other"];

const handleReligionClick = (religion) => {
  setFormData((prevState) => ({
    ...prevState,
    religion: prevState.religion === religion ? "" : religion,
  }));
};

//PRONOUNS

const pronounsOptions = ["she/her", "he/him", "they/them", "she/they", "he/they", "ze/zir", "xe/xim", "co/co", "ey/em", "ve/ver", "per/per"];

const handlePronounsClick = (pronouns) => {
  setFormData((prevState) => ({
    ...prevState,
    pronouns: prevState.pronouns === pronouns ? "" : pronouns,
  }));
};


//LANGUAGES

    const predefinedLanguages = languagesData.map((language) => ({
    label: language.name,
    value: language.name,
    }));


  const handleLanguageChange = (selectedOptions) => {
    setFormData((prevState) => ({
      ...prevState,
      languages: selectedOptions.map((option) => option.value),
    }));
  };

  const filterLanguages = (candidate, input) => {
    return candidate.label.toLowerCase().startsWith(input.toLowerCase());
  };

  //INTEREST EMOJIS

  const emojiCategories = {
    "Creativity": [
      "🖌️ Art", "🎨 Painting", "📸 Photography", 
      "🎹 Piano", "🎸 Guitar", "🎷 Saxophone", "🎭 Theatre", "🎺 Trumpet", "🎻 Violin", "📝 Writing"
    ],
    "Date Ideas": [
      "🎡 Amusement Park", "🏹 Archery", "🖼️ Art Gallery", "🏖️ Beach Day", "🎳 Bowling", "🎧 Concert", "🚴 Cycling",    
      "🍽️ Dinner", "🧩 Escape Room", "🎤 Karaoke", "🎬 Movie Night", "🏛️ Museum", "🏞️ Nature Walk", "🎨 Painting Class", "🌅 Sunsets", 
      "🎭 Theatre"
    ],
    "Diet": [
      "🍱 Bento", "🍔 Burgers", "🥩 Carnivore", "🍫 Chocolate", "🍪 Cookies", "🍩 Donuts", "🍟 Fries",    
      "🌭 Hot Dogs", "🍝 Pasta", "🥙 Pita", "🍕 Pizza","🌱 Plant-based", "🍿 Popcorn", "🍜 Ramen", "🥪 Sandwiches", "🍣 Sushi",
      "🌮 Tacos", "🥦 Vegan", "🥗 Vegetarian"
    ],
    "Fitness": [
      "🚴 Cycling", "🤸 Gymnastics", "🤾 Handball",  
      "🧗 Climbing", "🥋 Martial Arts", "🏃 Running", "🚣 Rowing",  
      "⛷️ Skiing", "🏊 Swimming", "🏋️ Weightlifting", "🧘 Yoga", 
    ],
    "Hobbies": [
      "🕹️ Arcade Games", "🍰 Baking", "♟️ Chess", "🎯 Darts", "🎣 Fishing", "🌱 Gardening", "⛰️ Hiking", "🎧 Listening to Music",  
      "🎨 Painting", "💻 Programming", "🧩 Puzzles", "📚 Reading", 
      "🧵 Sewing", "🎤 Singing", "🎭 Theatre", "🎮 Video Games", 
    ],
    "Night In": [
      "🎲 Board Games", "👩‍🍳 Cooking", "🎥 Movies",   
      "📚 Reading", "🎮 Video Games", "🍷 Wine", 
    ],
    "Going Out": [
      "🍺 Beer", "☕ Cafes", "🥂 Champagne", "🎛️ Clubs", "🍸 Cocktails", "💃 Dancing",
      "🎪 Festivals", "🎭 Improv", "🎤 Karaoke", "🎉 Parties", "🎤 Stand-up Comedy",
      "🥃 Whiskey",
    ],
    "Pets": [
      "🐦 Birds", "🐱 Cats", "🐶 Dogs", "🐠 Fish", "🐸 Frogs", "🐹 Hamsters", "🐭 Mice", "🐵 Monkeys", "🐰 Rabbits",
      "🦎 Reptiles", "🐢 Turtles"
    ],
    "Self-care": [
      "🛁 Bubble Baths", "📝 Journaling", "💆 Massage", "🧘‍♀️ Meditation",
      "🧖 Sauna", "🧘 Yoga"
    ],
    "Sports": [
      "🏈 American Football", "⚾️ Baseball", "🏀 Basketball", "🚴 Cycling", "⛳ Golf", "🏇 Horse Racing",   
      "🏒 Ice Hockey", "⛸️ Ice Skating", "🏓 Ping Pong", "🏉 Rugby", "⛷️ Skiing",
      "⚽ Soccer", "🏂 Snowboarding", "🏄 Surfing", "🏊 Swimming", "🎾 Tennis", "🏐 Volleyball", 
    ],
    "Travel": [
      "🎒 Backpacking", "🏖️ Beaches", "🏕️ Camping", "🚢 Cruise", "🏜️ Desert", "🎪 Festivals", "🏝️ Islands", "⛰️ Mountains", "🏞️ National Parks", "✈️ New Cities", 
      "🚗 Road Trips", "🧖‍♀️ Spa Weekend", "🌌 Space" 
    ]
  };

  const handleEmojiClick = (emoji) => {
    setFormData((prevState) => {
      const currentInterests = [...prevState.interests];
      if (currentInterests.includes(emoji)) {
        // Remove the emoji if it's already selected
        return { ...prevState, interests: currentInterests.filter((e) => e !== emoji) };
      } else if (currentInterests.length < 6) {
        // Add the emoji if less than 7 are selected
        return { ...prevState, interests: [...currentInterests, emoji] };
      } else {
        return prevState; // Do nothing if already 7 are selected
      }
    });
  };

  
  const sortedImages = sparkImages.sort((a, b) => b.createdAt - a.createdAt);


  const textBoxStyle = {
    backgroundColor: 'black',
    color: 'grey',
    border: '1px solid grey',
    boxShadow: 'none',
    padding: '8px', // Adjust padding as needed
    outline: 'none', // Remove default outline
    transition: 'border-color 0.2s ease',
    // Define the event handlers
    onFocus: (e) => e.target.style.borderColor = 'sandybrown',
    onBlur: (e) => e.target.style.borderColor = 'grey',
    onMouseEnter: (e) => e.target.style.borderColor = 'sandybrown',
    onMouseLeave: (e) => e.target.style.borderColor = 'grey'
  };
  
  
  return (
    <Container maxW="container.md" mt={{ base: "5vh", md: "30px" }} mb={{ base: "10vh", md: "60px" }}>
      <Heading as="h1" textAlign="center" mb={4} >
        Spark Dating Profile
      </Heading>
      <Box as="form" onSubmit={handleSubmit} p={4} boxShadow="md" borderRadius="md">
        <Stack spacing={4}>
          <FormControl id="name" mb={4}>
            <FormLabel>Name</FormLabel>
            <Input
              type="text"
              name="name"
              style={{...textBoxStyle}}
              onFocus={textBoxStyle.onFocus}
              onBlur={textBoxStyle.onBlur}
              onMouseEnter={textBoxStyle.onMouseEnter}
              onMouseLeave={textBoxStyle.onMouseLeave}
              //value={formData.name || "" || (sparkProfile ? sparkProfile.name : "")}
              value={formData.name}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl id="bio" mb={4}>
            <FormLabel>Bio</FormLabel>
            <Textarea
              name="bio"
              rows={5}
              maxLength={200}
              style={{ ...textBoxStyle }}
              onFocus={textBoxStyle.onFocus}
              onBlur={textBoxStyle.onBlur}
              onMouseEnter={textBoxStyle.onMouseEnter}
              onMouseLeave={textBoxStyle.onMouseLeave}
              //value={formData.name || "" || (sparkProfile ? sparkProfile.name : "")}
              value={formData.bio}
              onChange={handleChange}
            />
          </FormControl>

          {/* <FormControl id="profile-pic">
            <FormLabel>Profile Picture</FormLabel>
            <Input type="file" accept="image/*" onChange={handleFileChange} />
            {preview && (
              <Image src={preview} alt="Profile Picture Preview" boxSize="150px" mt={2} />
            )}
            </FormControl> */}

            <FormControl id="uploadedImages" mb={4}>
            <Stack direction="row" align="baseline">
            <FormLabel>Upload Pictures</FormLabel>
            <Text fontSize="sm" color="gray.500">
            (Select up to 7)
          </Text>
          </Stack>
            <Box
        position="relative"
        overflow="hidden"
        //height="310x" // Ensure this height accommodates exactly 2 rows
        //border="1px solid #ccc"
        //borderRadius="md"

        style={{...textBoxStyle}}
              onFocus={textBoxStyle.onFocus}
              onBlur={textBoxStyle.onBlur}
              onMouseEnter={textBoxStyle.onMouseEnter}
              onMouseLeave={textBoxStyle.onMouseLeave}
      >
        {!isMobile &&
        <Button
          position="absolute"
          top="50%"
          left="0"
          transform="translateY(-50%)"
          onClick={() => scrollUploads('left')}
          zIndex="1"
        >
          <ChevronLeftIcon />
        </Button> }
        <Box
          ref={scrollContainerRefUploads}
          display="flex"
          flexWrap="nowrap"
          //display="grid"
          //gridTemplateColumns="repeat(auto-fill, minmax(150px, 1fr))"
          //gridTemplateRows="repeat(2, 110px)"
          //maxHeight={{base: "23vw", md: "300px"}}


          //scrollBehavior="smooth"
          height="100%"
          gap={2}
          style={{
          WebkitOverflowScrolling: 'touch'
          }}
          overflowX="scroll"
          overflowY="hidden"
          //whiteSpace="nowrap"
          p={2}
          px={2}
          mx={{base: 0, md: 10}}
          border="none"
          borderRadius="md"
         
        >
          
          <Flex p={0} m={0}
          
          >
            {sparkImages.length < 7 &&
            <Box 
            cursor="pointer" 
            width={{base: "20px", md: "20px"}} 
            aspectRatio="1"
            display="flex"
            alignItems="center"
            justifyContent="center"
            //mx={0}
            px={{base: "18px", md: "25px"}}
            mx={{base: "18px", md: "25px"}}
            >
          <CreateSparkPic onUpload={handleImageUpload}/>
          </Box>}
          {!imagesLoadingFromHook && sortedImages.map((pic) => (
            // <Button
            //   key={post.id}
            //   onClick={() => handleImageClick(post.id)}
            // >
            <Box
              key={pic.id}
              //onClick={() => handleImageClick(post.id)}
              //cursor="pointer"
              mx={2}
              display="inline-block"
              //alignItems="baseline"
              position="relative"
              
            >
              
              <Image
                src={pic.imageURL}
                //alt={`Post ${index + 1}`}
                maxWidth={{base: "40vw", md: "150px"}}
                maxHeight={{base: "40vh", md: "auto"}}
                width={{base: "40vw", md: "auto"}}
                aspectRatio={1}
                borderRadius="md"
                //objectFit="cover"


                //border={formData.selectedImages.includes(post.id) ? "2px solid orange" : "none"}
              />
              {/* <CloseButton
                  position="absolute"
                  top={1}
                  right={1}
                  onClick={() => handleDeleteImage(pic.id)}
                /> */}
                <DeleteSparkPic pic={pic} key={pic.id} id={pic.id} onDelete={handleDeleteImage}/>
                
            </Box>
            //</Button>
          ))}
          </Flex>
        </Box>
        {!isMobile &&
        <Button
          position="absolute"
          top="50%"
          right="0"
          transform="translateY(-50%)"
          onClick={() => scrollUploads('right')}
          zIndex="1"
        >
          <ChevronRightIcon />
        </Button> }
      </Box>
            
            </FormControl>
            
          
          <FormControl id="selectedImages" mb={4}>
          <Stack direction="row" align="baseline">
            <FormLabel>Select from Razzp Profile</FormLabel>
            <Text fontSize="sm" color="gray.500">
            (Select up to 5)
          </Text>
          </Stack>
            <Box
        position="relative"
        overflow="hidden"
        //height="310x" // Ensure this height accommodates exactly 2 rows
        // border="1px solid #ccc"
        // borderRadius="md"

        style={{...textBoxStyle}}
              onFocus={textBoxStyle.onFocus}
              onBlur={textBoxStyle.onBlur}
              onMouseEnter={textBoxStyle.onMouseEnter}
              onMouseLeave={textBoxStyle.onMouseLeave}
      >
      
        {!isMobile &&
        <Button
          position="absolute"
          top="50%"
          left="0"
          transform="translateY(-50%)"
          onClick={() => scroll('left')}
          zIndex="1"
        >
          <ChevronLeftIcon />
        </Button> }
        <Box
          ref={scrollContainerRef}
          display="flex"
          flexWrap="nowrap"
          //display="grid"
          //gridTemplateColumns="repeat(auto-fill, minmax(150px, 1fr))"
          //gridTemplateRows="repeat(2, 110px)"
          //maxHeight={{base: "23vw", md: "300px"}}
          scrollBehavior="smooth"
          height="100%"
          gap={2}

          style={{
          WebkitOverflowScrolling: 'touch'
          }}
          overflowX="scroll"
          overflowY="hidden"
          //whiteSpace="nowrap"
          p={2}
          px={2}
          mx={{base: 0, md: 10}}
          border="none"
          borderRadius="md"
         
        >
          {!postsLoading && userPosts.map((post) => (
            // <Button
            //   key={post.id}
            //   onClick={() => handleImageClick(post.id)}
            // >
            <Box
              key={post.id}
              onClick={() => handleImageClick(post.id, post.imageURL)}
              cursor="pointer"
              mx={2}
              display="inline-block"
              //alignItems="baseline"
            >
              <Image
                src={post.imageURL}
                //alt={`Post ${index + 1}`}
                maxWidth={{base: "40vw", md: "150px"}}
                maxHeight={{base: "auto", md: "auto"}}
                width={{base: "40vw", md: "auto"}}
                //height={{base: "auto", md: "300px"}}
                aspectRatio={1}
                borderRadius="md"
                border={formData.selectedImages.some((image) => image.id === post.id ) ? "2px solid orange" : "none"}
              />
            </Box>
            //</Button>
          ))}
        </Box>
        {!isMobile &&
        <Button
          position="absolute"
          top="50%"
          right="0"
          transform="translateY(-50%)"
          onClick={() => scroll('right')}
          zIndex="1"
        >
          <ChevronRightIcon />
        </Button> }
      </Box>
          </FormControl>

          
          <FormControl id="profilePics">
            <FormLabel>Profile Pics</FormLabel>
            {!imagesLoadingFromHook && (
            <DragAndDropGrid images={formData.profilePics} onDragEnd={handleDragEnd}/>
            )}
            </FormControl>
          
          

          <FormControl id="birthday">
            <FormLabel>Birthday</FormLabel>
            <Input
              type="date"
              name="birthday"
              value={formData.birthday}
              onChange={handleChange}
              style={{...textBoxStyle}}
              onFocus={textBoxStyle.onFocus}
              onBlur={textBoxStyle.onBlur}
              onMouseEnter={textBoxStyle.onMouseEnter}
              onMouseLeave={textBoxStyle.onMouseLeave}
            />
          </FormControl>

          <FormControl id="work" >
            <FormLabel>Work</FormLabel>
            <Input
              type="text"
              name="work"
              value={formData.work}
              onChange={handleChange}
              style={{...textBoxStyle}}
              onFocus={textBoxStyle.onFocus}
              onBlur={textBoxStyle.onBlur}
              onMouseEnter={textBoxStyle.onMouseEnter}
              onMouseLeave={textBoxStyle.onMouseLeave}
            />
          </FormControl>

          <FormControl id="school" mb={4}>
            <FormLabel>School</FormLabel>
            <Input
              type="text"
              name="school"
              value={formData.school}
              onChange={handleChange}
              style={{...textBoxStyle}}
              onFocus={textBoxStyle.onFocus}
              onBlur={textBoxStyle.onBlur}
              onMouseEnter={textBoxStyle.onMouseEnter}
              onMouseLeave={textBoxStyle.onMouseLeave}
            />
          </FormControl>

          <FormControl id="gender" mb={4}>
        <FormLabel>Gender</FormLabel>
        <Box display="flex" flexWrap="wrap">
          {genderOptions.map((gender) => (
            <Button
              key={gender}
              onClick={() => handleGenderClick(gender)}
              variant="solid"
              bg={formData.gender === gender ? "darkorange" : "#1B2328"}
              color={formData.gender === gender ? "black" : "white"}
              _hover={{
                bg: {base: formData.gender === gender ? "darkorange" : "#1B2328", md: formData.gender === gender ? "orange" : "orange"},
              }}
              // sx={{
              //   '@media (max-width: 48em)': { // Mobile breakpoint
              //     _hover: {
              //       bg: 'initial', // No hover effect on mobile
              //     },
              //   },
              // }}
              size="sm"
              m={1}
            >
              {gender}
            </Button>
          ))}
        </Box>
      </FormControl>

          <FormControl id="interested_in" mb={4}>
          <Stack direction="row" align="baseline">
          <FormLabel>Interested In</FormLabel>
          <Text fontSize="sm" color="gray.500">
            (Won't show on profile)
          </Text>
          </Stack>
            <Box display="flex" flexWrap="wrap">
              {interestedInOptions.map((interestedIn) => (
                <Button
                  key={interestedIn}
                  onClick={() => handleInterestedInClick(interestedIn)}
                  variant="solid"
                  bg={formData.interested_in.includes(interestedIn) ? "darkorange" : "#1B2328"}
                  color={formData.interested_in.includes(interestedIn) ? "black" : "white"}
                  _hover={{
                    bg: {base: formData.interested_in.includes(interestedIn) ? "darkorange" : "#1B2328", md: formData.interested_in.includes(interestedIn) ? "orange" : "orange"},
                  }}
                  size="sm"
                  m={1}
                >
                  {interestedIn}
                </Button>
              ))}
            </Box>
          </FormControl>

          <FormControl id="location" mb={4}>
            <FormLabel>Location</FormLabel>
            <Select
                name="location"
                isClearable
                styles={customStyles}
                options={cities}
                //value={selectedLocation}
                value={cities.find((city) => city.value === formData.location)}
                onChange={handleLocationChange}
                filterOption={filterCitiesLocation}
                onKeyDown={handleKeyDown}
                placeholder="Type and select your location..."
            />
        </FormControl>

          <FormControl id="hometown" mb={4}>
            <FormLabel>Hometown</FormLabel>
            <Select
                name="location"
                isClearable
                styles={customStyles}
                options={cities}
                //value={selectedHometown}
                value={cities.find((city) => city.value === formData.hometown)}
                onChange={handleHometownChange}
                filterOption={filterCitiesHometown}
                onKeyDown={handleKeyDown}
                placeholder="Type and select your hometown..."
            />
          </FormControl>

          <FormControl id="languages" mb={4}>
  <FormLabel>Languages</FormLabel>
  <Select
    isMulti
    name="languages"
    styles={{
      control: (provided, state) => ({
        ...provided,
        backgroundColor: 'black', // Background color of the select box
        color: 'grey', // Text color of the select box
        borderColor: state.isFocused ? 'sandybrown' : 'grey', // Border color when focused or hovered
        boxShadow: 'none', // Removing box shadow
        '&:hover': {
          borderColor: 'sandybrown', // Border color on hover
        },
      }),
      clearIndicator: (provided) => ({
        ...provided,
        //color: 'white', // Change color to white
        '&:hover': {
              color: 'sandybrown', // Change color to orange on hover
            },
      }),
      multiValue: provided => ({
        ...provided,
        backgroundColor: '#333333', // Background color of selected value
        color: 'white', // Text color of selected value
      }),
      multiValueLabel: provided => ({
        ...provided,
        color: 'white', // Text color of label in selected value
      }),
      multiValueRemove: (provided, state) => ({
        ...provided,
        color: 'white', // Color of remove icon in selected value
        '&:hover': {
          backgroundColor: '#333333', // Background color on hover for remove icon
          color: 'sandybrown', // Text color on hover for remove icon
        },
      }),
      option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected ? '#333333' : 'black', // Customizing option background color for selected state
        
        color: state.isSelected ? 'sandybrown' : 'grey', // Customizing option text color
        //fontWeight: state.isSelected ? 'bold' : 'normal', // Setting font weight when selected
        '&:hover': {
          backgroundColor: '#333333', // Background color on hover
          color: 'sandybrown', // Text color on hover
          //fontWeight: 'bold',
        },
      }),
      input: (provided) => ({
        ...provided,
        color: 'grey', // Customizing input text color
      }),
      menu: (provided) => ({
        ...provided,
        backgroundColor: 'black', // Background color of the dropdown menu
        marginTop: 0, // Removing the default margin-top
        borderRadius: 0, // Removing default border radius
        boxShadow: 'none', // Removing box shadow
        borderWidth: 0, // Removing border width
      }),
      singleValue: (provided) => ({
        ...provided,
        color: 'grey', // Color of the single selected value
        backgroundColor: '#333333'
      }),
    }}
    options={predefinedLanguages}
    value={(formData.languages).map((lang) => ({ label: lang, value: lang }))}
    onChange={handleLanguageChange}
    filterOption={filterLanguages}
    placeholder="Type or select languages..."
  />
</FormControl>

          <FormControl id="ethnicity" mb={4}>
          <Stack direction="row" align="baseline">
            <FormLabel>Ethnicity</FormLabel>
            <Text fontSize="sm" color="gray.500">
            (Select up to 5)
          </Text>
          </Stack>
            <Box display="flex" flexWrap="wrap">
              {ethnicityOptions.map((ethnicitySelection) => (
                <Button
                  key={ethnicitySelection}
                  onClick={() => handleEthnicityClick(ethnicitySelection)}
                  variant="solid"
                  bg={formData.ethnicity.includes(ethnicitySelection) ? "darkorange" : "#1B2328"}
                  color={formData.ethnicity.includes(ethnicitySelection) ? "black" : "white"}
                  _hover={{
                    bg: {base: formData.ethnicity.includes(ethnicitySelection) ? "darkorange" : "#1B2328", md: formData.ethnicity.includes(ethnicitySelection) ? "orange" : "orange"}, 
                  }}
                  size="sm"
                  m={1}
                >
                  {ethnicitySelection}
                </Button>
              ))}
            </Box>
          </FormControl>

          <FormControl id="height" mb={4}>
            <FormLabel>Height</FormLabel>
            <Select
             
            name="height"
            isClearable
            styles={{
            control: (provided, state) => ({
                ...provided,
                backgroundColor: 'black', // Background color of the select box
                color: 'grey', // Text color of the select box
                borderColor: state.isFocused ? 'sandybrown' : 'grey', // Border color when focused or hovered
                boxShadow: 'none', // Removing box shadow
                '&:hover': {
                borderColor: 'sandybrown', // Border color on hover
                },
            }),
            //   clearIndicator: (provided) => ({
            //     ...provided,
            //     color: 'white', // Change color to white
            //   }),
            
            option: (provided, state) => ({
                ...provided,
                backgroundColor: state.isSelected ? '#333333' : 'black', // Customizing option background color for selected state
                
                color: state.isSelected ? 'sandybrown' : 'grey', // Customizing option text color
                //fontWeight: state.isSelected ? 'bold' : 'normal', // Setting font weight when selected
                '&:hover': {
                backgroundColor: '#333333', // Background color on hover
                color: 'sandybrown', // Text color on hover
                //fontWeight: 'bold',
                },
            }),
            input: (provided) => ({
                ...provided,
                color: 'grey', // Customizing input text color
            }),
            menu: (provided) => ({
                ...provided,
                backgroundColor: 'black', // Background color of the dropdown menu
                marginTop: 0, // Removing the default margin-top
                borderRadius: 0, // Removing default border radius
                boxShadow: 'none', // Removing box shadow
                borderWidth: 0, // Removing border width
            }),
            singleValue: (provided) => ({
                ...provided,
                color: 'white', // Color of the single selected value
                backgroundColor: '#333333',
                width: '10ch', // Width to fit 10 characters
                textAlign: 'center', // Center the text
              }),
              clearIndicator: (provided) => ({
                ...provided,
                color: 'grey', // Color of the clear indicator
                position: 'absolute', // Absolute positioning
                left: '11ch', // Positioning to the right of the control box
                padding: '0px', // Removing padding to fit in smaller box
                '&:hover': {
                color: 'sandybrown', // Change color to orange on hover
                },
              }),
            }}
            options={predefinedHeights}
            value={predefinedHeights.find((height) => height.value === formData.height)}
            onChange={handleHeightChange}
            filterOption={filterHeights}
            placeholder="Type or select your height..."
        />
          </FormControl>

          <FormControl id="exercise" mb={4}>
            <FormLabel>Exercise</FormLabel>
            <Box display="flex" flexWrap="wrap">
          {exerciseOptions.map((exercise) => (
            <Button
              key={exercise}
              onClick={() => handleExerciseClick(exercise)}
              variant="solid"
              bg={formData.exercise === exercise ? "darkorange" : "#1B2328"}
              color={formData.exercise === exercise ? "black" : "white"}
              _hover={{
                bg: {base: formData.exercise === exercise ? "darkorange" : "#1B2328", md: formData.exercise === exercise ? "orange" : "orange"},
              }}
              size="sm"
              m={1}
            >
              {exercise}
            </Button>
          ))}
        </Box>
          </FormControl>

          <FormControl id="education_level" mb={4}>
            <FormLabel>Education Level</FormLabel>
            <Box display="flex" flexWrap="wrap">
          {educationOptions.map((education_level) => (
            <Button
              key={education_level}
              onClick={() => handleEducationClick(education_level)}
              variant="solid"
              bg={formData.education_level === education_level ? "darkorange" : "#1B2328"}
              color={formData.education_level === education_level ? "black" : "white"}
              _hover={{
                bg: {base: formData.education_level === education_level ? "darkorange" : "#1B2328", md: formData.education_level === education_level ? "orange" : "orange"},
              }}
              size="sm"
              m={1}
            >
              {education_level}
            </Button>
          ))}
        </Box>
          </FormControl>

          <FormControl id="drinking" mb={4}>
            <FormLabel>Drinking</FormLabel>
            <Box display="flex" flexWrap="wrap">
          {drinkingOptions.map((drinking) => (
            <Button
              key={drinking}
              onClick={() => handleDrinkingClick(drinking)}
              variant="solid"
              bg={formData.drinking === drinking ? "darkorange" : "#1B2328"}
              color={formData.drinking === drinking ? "black" : "white"}
              _hover={{
                bg: {base: formData.drinking === drinking ? "darkorange" : "#1B2328", md: formData.drinking === drinking ? "orange" : "orange"},
              }}
              size="sm"
              m={1}
            >
              {drinking}
            </Button>
          ))}
        </Box>
          </FormControl>

          <FormControl id="smoking" mb={4}>
            <FormLabel>Smoking</FormLabel>
            <Box display="flex" flexWrap="wrap">
          {smokingOptions.map((smoking) => (
            <Button
              key={smoking}
              onClick={() => handleSmokingClick(smoking)}
              variant="solid"
              bg={formData.smoking === smoking ? "darkorange" : "#1B2328"}
              color={formData.smoking === smoking ? "black" : "white"}
              _hover={{
                bg: {base: formData.smoking === smoking ? "darkorange" : "#1B2328", md: formData.smoking === smoking ? "orange" : "orange"},
              }}
              size="sm"
              m={1}
            >
              {smoking}
            </Button>
          ))}
        </Box>
          </FormControl>

          <FormControl id="cannabis" mb={4}>
            <FormLabel>Cannabis</FormLabel>
            <Box display="flex" flexWrap="wrap">
          {cannabisOptions.map((cannabis) => (
            <Button
              key={cannabis}
              onClick={() => handleCannabisClick(cannabis)}
              variant="solid"
              bg={formData.cannabis === cannabis ? "darkorange" : "#1B2328"}
              color={formData.cannabis === cannabis ? "black" : "white"}
              _hover={{
                bg: {base: formData.cannabis === cannabis ? "darkorange" : "#1B2328", md: formData.cannabis === cannabis ? "orange" : "orange"},
              }}
              size="sm"
              m={1}
            >
              {cannabis}
            </Button>
          ))}
        </Box>
          </FormControl>

          <FormControl id="looking_for" mb={4}>
          <Stack direction="row" align="baseline">
            <FormLabel>Open To</FormLabel>
            <Text fontSize="sm" color="gray.500">
            (Select up to 3)
          </Text>
          </Stack>
            <Box display="flex" flexWrap="wrap">
              {lookingForOptions.map((lookingForSelection) => (
                <Button
                  key={lookingForSelection}
                  onClick={() => handleLookingForClick(lookingForSelection)}
                  variant="solid"
                  bg={formData.looking_for.includes(lookingForSelection) ? "darkorange" : "#1B2328"}
                  color={formData.looking_for.includes(lookingForSelection) ? "black" : "white"}
                  _hover={{
                    bg: {base: formData.looking_for.includes(lookingForSelection) ? "darkorange" : "#1B2328", md: formData.looking_for.includes(lookingForSelection) ? "orange" : "orange"},
                  }}
                  size="sm"
                  m={1}
                >
                  {lookingForSelection}
                </Button>
              ))}
            </Box>
          </FormControl>

          <FormControl id="family_plans" mb={4}>
            <FormLabel>Family Plans</FormLabel>
            <Box display="flex" flexWrap="wrap">
          {familyPlansOptions.map((family_plans) => (
            <Button
              key={family_plans}
              onClick={() => handleFamilyPlansClick(family_plans)}
              variant="solid"
              bg={formData.family_plans === family_plans ? "darkorange" : "#1B2328"}
              color={formData.family_plans === family_plans ? "black" : "white"}
              _hover={{
                bg: {base: formData.family_plans === family_plans ? "darkorange" : "#1B2328", md: formData.family_plans === family_plans ? "orange" : "orange"},
              }}
              size="sm"
              m={1}
            >
              {family_plans}
            </Button>
          ))}
        </Box>
          </FormControl>

          <FormControl id="have_kids" mb={4}>
            <FormLabel>Have Kids</FormLabel>
            <Box display="flex" flexWrap="wrap">
          {haveKidsOptions.map((have_kids) => (
            <Button
              key={have_kids}
              onClick={() => handleHaveKidsClick(have_kids)}
              variant="solid"
              bg={formData.have_kids === have_kids ? "darkorange" : "#1B2328"}
              color={formData.have_kids === have_kids ? "black" : "white"}
              _hover={{
                bg: {base: formData.have_kids === have_kids ? "darkorange" : "#1B2328", md: formData.have_kids === have_kids ? "orange" : "orange"},
              }}
              size="sm"
              m={1}
            >
              {have_kids}
            </Button>
          ))}
        </Box>
          </FormControl>

          <FormControl id="star_sign" mb={4}>
            <FormLabel>Zodiac Sign</FormLabel>
            <Box display="flex" flexWrap="wrap">
          {starSignOptions.map((star_sign) => (
            <Button
              key={star_sign}
              onClick={() => handleStarSignClick(star_sign)}
              variant="solid"
              bg={formData.star_sign === star_sign ? "darkorange" : "#1B2328"}
              color={formData.star_sign === star_sign ? "black" : "white"}
              _hover={{
                bg: {base: formData.star_sign === star_sign ? "darkorange" : "#1B2328", md: formData.star_sign === star_sign ? "orange" : "orange"},
              }}
              size="sm"
              m={1}
            >
              {star_sign}
            </Button>
          ))}
        </Box>
          </FormControl>

          <FormControl id="politics" mb={4}>
            <FormLabel>Politics</FormLabel>
            <Box display="flex" flexWrap="wrap">
          {politicsOptions.map((politics) => (
            <Button
              key={politics}
              onClick={() => handlePoliticsClick(politics)}
              variant="solid"
              bg={formData.politics === politics ? "darkorange" : "#1B2328"}
              color={formData.politics === politics ? "black" : "white"}
              _hover={{
                bg: {base: formData.politics === politics ? "darkorange" : "#1B2328", md: formData.politics === politics ? "orange" : "orange"},
              }}
              size="sm"
              m={1}
            >
              {politics}
            </Button>
          ))}
        </Box>
          </FormControl>

          <FormControl id="religion" mb={4}>
            <FormLabel>Religion</FormLabel>
            <Box display="flex" flexWrap="wrap">
          {religionOptions.map((religion) => (
            <Button
              key={religion}
              onClick={() => handleReligionClick(religion)}
              variant="solid"
              bg={formData.religion === religion ? "darkorange" : "#1B2328"}
              color={formData.religion === religion ? "black" : "white"}
              _hover={{
                bg: {base: formData.religion === religion ? "darkorange" : "#1B2328", md: formData.religion === religion ? "orange" : "orange"},
              }}
              size="sm"
              m={1}
            >
              {religion}
            </Button>
          ))}
        </Box>
          </FormControl>

          <FormControl id="pronouns" mb={4}>
            <FormLabel>Pronouns</FormLabel>
            <Box display="flex" flexWrap="wrap">
          {pronounsOptions.map((pronouns) => (
            <Button
              key={pronouns}
              onClick={() => handlePronounsClick(pronouns)}
              variant="solid"
              bg={formData.pronouns === pronouns ? "darkorange" : "#1B2328"}
              color={formData.pronouns === pronouns ? "black" : "white"}
              _hover={{
                bg: {base: formData.pronouns === pronouns ? "darkorange" : "#1B2328", md: formData.pronouns === pronouns ? "orange" : "orange"},
              }}
              size="sm"
              m={1}
            >
              {pronouns}
            </Button>
          ))}
        </Box>
          </FormControl>

          


          <FormControl id="interests" mb={2}>
          <Stack direction="row" align="baseline">
            <FormLabel>Interests</FormLabel>
            <Text fontSize="sm" color="gray.500">
            (Select up to 6)
          </Text>
          </Stack>
            <Box>
      {Object.entries(emojiCategories).map(([category, emojis]) => (
        <Box key={category} mb={8}>
          <Center>
          <FormLabel fontSize="sm">{category}</FormLabel>
          </Center>
          <Box>
            {emojis.map((emoji) => (
              <Button
                key={emoji}
                onClick={() => handleEmojiClick(emoji)}
                variant="solid"
                bg={formData.interests.includes(emoji) ? "darkorange" : "#1B2328"}
                color={formData.interests.includes(emoji) ? "black" : "white"}
                _hover={{
                  bg: {base: formData.interests.includes(emoji) ? "darkorange" : "#1B2328", md: formData.interests.includes(emoji) ? "orange" : "orange"},
                }}
                size="sm"
                m={1}
              >
                {emoji}
              </Button>
            ))}
          </Box>
        </Box>
      ))}
    </Box>
          </FormControl>

          <Button
          type="submit"
          bg="darkorange" // Background color
          color="black" // Text color
          isLoading={isUpdating}
          mb={8}
          _hover={{ bg: "orange" }} // Hover state background color
        >
          Save Profile
        </Button>
        </Stack>
      </Box>
    </Container>
  );
};

export default CreateSpark;
