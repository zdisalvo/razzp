import React from 'react';
import { Box, Image, Text, SimpleGrid, VStack, Container, Button, Flex, Icon } from '@chakra-ui/react';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import WineBarRoundedIcon from '@mui/icons-material/WineBarRounded';
//import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCannabis, faBriefcase, faWineGlass, faRuler, faDumbbell, faGraduationCap, 
  faSmoking, faSchool, faHouseChimney, faBaby, faChildren, faStarAndCrescent, faScaleBalanced, faBook, faGlobe } from '@fortawesome/free-solid-svg-icons'; 
//import "../Spark/carousel.css"
import SparkLike from './SparkLike';
import SparkCrown from './SparkCrown';


const calculateAge = (birthday) => {
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    
    // Adjust age if the current month is before the birth month or if it's the birth month but the current day is before the birth day
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
  
    return age;
  };


const SparkProfile = ({ sparkProfile }) => {
  const {
    name,
    birthday,
    bio,
    work,
    school,
    gender,
    location,
    hometown,
    ethnicity,
    height,
    exercise,
    education_level,
    drinking,
    smoking,
    cannabis,
    looking_for,
    family_plans,
    have_kids,
    star_sign,
    politics,
    religion,
    pronouns,
    languages,
    interests,
    profilePics,
  } = sparkProfile;

  const isNotEmpty = (value) => {
    if (typeof value === 'string') {
      return value.trim().length > 0;
    }
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    if (React.isValidElement(value)) {
      return true; // React elements are considered non-empty
    }
    return Boolean(value); // Handles non-empty objects or other values
  };



  //Bio

  const bioData = [
    bio && { value: bio}
  ]

  const filteredBioData = bioData.filter(item => isNotEmpty(item.value));

  //Essentials

  const essentialsData = [
    work && { value: (
      <Flex align="center">
        <FontAwesomeIcon icon={faBriefcase} style={{ marginRight: '8px' }} /> {work}
      </Flex>
    )},
    school && { value: (
      <Flex align="center">
        <FontAwesomeIcon icon={faSchool} style={{ marginRight: '8px' }} /> {school}
      </Flex>
    )},
    location && { value: (
      <Flex align="center">
        <FontAwesomeIcon icon={faHouseChimney} style={{ marginRight: '8px' }} /> {location}
      </Flex>
    )},
  ]

  const filteredEssentialsData = essentialsData.filter(item => isNotEmpty(item.value));



  //About Me

  const aboutMeData = [
    gender && { value: gender },
    height && { value: (
        <Flex align="center">
          <FontAwesomeIcon icon={faRuler} style={{ marginRight: '8px' }} /> {height}
        </Flex>
      )},
    exercise && { value: (
        <Flex align="center">
          <FontAwesomeIcon icon={faDumbbell} style={{ marginRight: '8px' }} /> {exercise}
        </Flex>
      )},
    education_level && { value: (
        <Flex align="center">
          <FontAwesomeIcon icon={faGraduationCap} style={{ marginRight: '8px' }} /> {education_level}
        </Flex>
      )},
    drinking && { value: (
        <Flex align="center">
          <FontAwesomeIcon icon={faWineGlass} style={{ marginRight: '8px' }} /> {drinking}
        </Flex>
      )},
    smoking && { value: (
        <Flex align="center">
          <FontAwesomeIcon icon={faSmoking} style={{ marginRight: '8px' }} /> {smoking}
        </Flex>
      )},
    cannabis && { value: (
        <Flex align="center">
          <FontAwesomeIcon icon={faCannabis} style={{ marginRight: '8px' }} /> {cannabis}
        </Flex>
      )},
    //{ value: looking_for },
    family_plans && { value: (
      <Flex align="center">
        <FontAwesomeIcon icon={faBaby} style={{ marginRight: '8px' }} /> {family_plans}
      </Flex>
    )},
    have_kids && { value: (
      <Flex align="center">
        <FontAwesomeIcon icon={faChildren} style={{ marginRight: '8px' }} /> {have_kids}
      </Flex>
    )},
    star_sign && { value: (
      <Flex align="center">
        <FontAwesomeIcon icon={faStarAndCrescent} style={{ marginRight: '8px' }} /> {star_sign}
      </Flex>
    )},
    politics && { value: (
      <Flex align="center">
        <FontAwesomeIcon icon={faScaleBalanced} style={{ marginRight: '8px' }} /> {politics}
      </Flex>
    )},
    religion && { value: (
      <Flex align="center">
        <FontAwesomeIcon icon={faBook} style={{ marginRight: '8px' }} /> {religion}
      </Flex>
    )},
    //languages && { value: languages },
  ];


  const filteredAboutMeData = aboutMeData.filter(item => isNotEmpty(item.value));

    //Open to

    const openToData = looking_for && looking_for.map((looking, index) => ({ value: looking }));

    const filteredOpenToData = openToData.filter(item => isNotEmpty(item.value));
  
    //LANGUAGES

    const languagesData = languages && languages.map((language, index) => ({ value: language }));

    const filteredLanguagesData = languagesData.filter(item => isNotEmpty(item.value));

   


    //INTERESTS

    const interestsData = interests && interests.map((interest, index) => ({ value: interest }));

    const filteredInterestsData = interestsData.filter(item => isNotEmpty(item.value));

    //HOMETOWN

    const hometownData = [
      hometown && { value: hometown },
    ]

    const filteredHometownData = hometownData.filter(item => isNotEmpty(item.value));

  const rawProfileData = [
    { label: 'Age', value: calculateAge(birthday) },
    { label: 'Bio', value: bio },
    { label: 'Work', value: (
        <Flex align="center">
          <FontAwesomeIcon icon={faBriefcase} style={{ marginRight: '8px' }} /> {work}
        </Flex>
      )},
    
    { label: 'School', value: school },
    { label: 'Gender', value: gender },
    { label: 'Location', value: location },
    { label: 'Hometown', value: hometown },
    { label: 'Ethnicity', value: ethnicity },
    { label: 'Height', value: (
        <Flex align="center">
          <FontAwesomeIcon icon={faRuler} style={{ marginRight: '8px' }} /> {height}
        </Flex>
      )},
      { label: 'Exercise', value: (
        <Flex align="center">
          <FontAwesomeIcon icon={faDumbbell} style={{ marginRight: '8px' }} /> {exercise}
        </Flex>
      )},
      { label: 'Education Level', value: (
        <Flex align="center">
          <FontAwesomeIcon icon={faGraduationCap} style={{ marginRight: '8px' }} /> {education_level}
        </Flex>
      )},
    { label: 'Drinking', value: (
        <Flex align="center">
          <FontAwesomeIcon icon={faWineGlass} style={{ marginRight: '8px' }} /> {drinking}
        </Flex>
      )},
      { label: 'Smoking', value: (
        <Flex align="center">
          <FontAwesomeIcon icon={faSmoking} style={{ marginRight: '8px' }} /> {smoking}
        </Flex>
      )},
    { label: 'Cannabis', value: (
        <Flex align="center">
          <FontAwesomeIcon icon={faCannabis} style={{ marginRight: '8px' }} /> {cannabis}
        </Flex>
      )},
    { label: 'Looking for', value: looking_for },
    { label: 'Family Plans', value: family_plans },
    { label: 'Have Kids', value: have_kids },
    { label: 'Star Sign', value: star_sign },
    { label: 'Politics', value: politics },
    { label: 'Religion', value: religion },
    { label: 'Pronouns', value: pronouns },
    { label: 'Languages', value: languages },
    { label: 'Interests', value: interests },
  ];

  const buttonStyle = {
    backgroundColor: "#1B2328",
    color: 'white',
    py: "0px",
    margin: '2px 2px',
    borderRadius: '10px',
    display: 'inline-block',
    userSelect: 'none',
    pointerEvents: 'none',
    _hover: { backgroundColor: "#1B2328" },
    _active: { backgroundColor: "#1B2328" },
  };

  const filteredProfileData = rawProfileData.filter(item => item.value && (Array.isArray(item.value) ? item.value.length > 0 : true));

  const profileData = [
    filteredAboutMeData.length > 0 && { label: 'About Me', data: filteredAboutMeData },
    //{ label: 'Profile Details', data: filteredProfileData },
  ].filter(Boolean); // Filter out any falsy values

  const lastPage = [
    filteredOpenToData.length > 0 && { label: 'Open to', data: filteredOpenToData },
    filteredLanguagesData.length > 0 && { label: 'Languages', data: filteredLanguagesData },
    filteredInterestsData.length > 0 && { label: 'Interests', data: filteredInterestsData },
    filteredHometownData.length > 0 && { label: 'From', data: filteredHometownData },
  ].filter(Boolean); // Filter out any falsy values
  

  //profilePics.map((pic, index) => (

  return (
    <Container width={{ base: "100vw", md: "auto" }} height={{ base: "auto", md: "100%" }} mb={{ base: "60px", md: "100px" }} px={0} mx={0}>
      <Box >
      <Carousel
      
          showThumbs={false}
          showArrows={true}
          showStatus={false}
          showIndicators={false}
          infiniteLoop={false}
          useKeyboardArrows={true}
          renderArrowPrev={(onClickHandler, hasPrev, label) =>
            hasPrev && (
              <button
                type="button"
                onClick={onClickHandler}
                title={label}
                style={{
                  position: 'absolute',
                  zIndex: 2,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  left: 0,
                  width: '150px', // Adjust the width as needed
                  height: '100%', // Ensure it covers the full height of the carousel
                  background: 'transparent', // Make the background transparent
                  border: 'none',
                  opacity: 0, // Hide the button but keep it clickable
                  cursor: 'pointer',
                }}
                className="control-prev control-arrow"
              >
                &lt;
              </button>
            )
          }
          renderArrowNext={(onClickHandler, hasNext, label) =>
            hasNext && (
              <button
                type="button"
                onClick={onClickHandler}
                title={label}
                style={{
                  position: 'absolute',
                  zIndex: 2,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  right: 0,
                  width: '150px', // Adjust the width as needed
                  height: '100%', // Ensure it covers the full height of the carousel
                  background: 'transparent', // Make the background transparent
                  border: 'none',
                  opacity: 0, // Hide the button but keep it clickable
                  cursor: 'pointer',
                }}
                className="control-next control-arrow"
              >
                &gt;
              </button>
            )
          }
        >
          {profilePics.length > 0  &&
            <Box key={0} mx={1} >
              <Image src={profilePics[0].imageURL} alt={`Profile picture ${1}`} />
            </Box>
          }
         
            
          <Box p={3}>
              {filteredBioData && filteredBioData.map((item, index) => (
                <Box key={index} mb={3}>
                <Text fontWeight="bold" fontSize='sm' color="#eb7734" textAlign="left" ml={3} mb={2}>Bio</Text>
                <Box key={index} mb={3} >
                  <Text fontSize="sm" fontWeight="medium" margin='4px 2px' padding="3px 10px" borderRadius='10px' textAlign="left" justifyContent="center" fontFamily="system-ui"  backgroundColor="#1B2328" lineHeight="tall" whiteSpace="pre-wrap" overflowWrap="break-word">
                    {item.value}
                  </Text>
                </Box>
                </Box>
              ))}
            
            <Box mb={3}>
              
              <Flex wrap="wrap">
                {filteredEssentialsData.map((dataItem, idx) => ( 
                  <Button key={idx} size="sm" style={buttonStyle} m={1} display="flex" alignItems="center" justifyContent="center">
                    {dataItem.icon && <FontAwesomeIcon icon={dataItem.icon} style={{ marginRight: '8px' }} />}
                    <Text>{dataItem.value}</Text>
                  </Button>
                
                ))}
              </Flex>
            </Box>
          
          {profileData.map((section, index) => (
            <Box key={index} mb={3}>
              <Text fontWeight="bold" fontSize='sm' color="#eb7734" textAlign="left" ml={3} mb={2}>{section.label}</Text>
              <Flex wrap="wrap">
                {section.data.map((dataItem, idx) => ( 
                  <Button key={idx} size="sm" style={buttonStyle} m={1} display="flex" alignItems="center" justifyContent="center">
                    {dataItem.icon && <FontAwesomeIcon icon={dataItem.icon} style={{ marginRight: '8px' }} />}
                    <Text>{dataItem.value}</Text>
                  </Button>
                
                ))}
              </Flex>
            </Box>
          ))}
        </Box>
          {profilePics.length > 1 && profilePics.slice(1).map((pic, index) => (
            <Box key={index} mx={1}>
            <Image src={pic.imageURL} alt={`Profile picture ${index + 2}`} />
          </Box>
          ))}
          {lastPage.length > 0 &&
          <Box p={3}>
          {lastPage.map((section, index) => (
            <Box key={index} mb={3}>
              <Text fontWeight="bold" fontSize='sm' color="#eb7734" textAlign="left" ml={3} mb={2}>{section.label}</Text>
              <Flex wrap="wrap">
                {section.data.map((dataItem, idx) => ( 
                  <Button key={idx} size="sm" style={buttonStyle} m={1} display="flex" alignItems="center" justifyContent="center">
                    {dataItem.icon && <FontAwesomeIcon icon={dataItem.icon} style={{ marginRight: '8px' }} />}
                    <Text>{dataItem.value}</Text>
                  </Button>
                
                ))}
              </Flex>
            </Box>
          ))}
          </Box>
        }
        </Carousel>
        <Box bg="#eb7734" p={2} textAlign="center" mx={1} borderBottomRadius="3px" alignItems="baseline">
        <Flex align="center" justify="center" direction="row" wrap="nowrap" >
          
          
          <SparkLike sparkProfile={sparkProfile}/>
          <SparkCrown sparkProfile={sparkProfile} />
          <Box width="80%" display="flex" justifyContent="center">
          <Flex alignItems="center" justify="center" direction="row" wrap="nowrap" textAlign="center">
          <Text fontSize="xl" fontWeight="bold" textShadow="2px 2px 4px rgba(0, 0, 0, 0.5)" mr={5}>{name}</Text>
          {filteredProfileData.find(item => item.label === 'Age') &&
          <Text fontSize="xl" fontWeight="bold" textShadow="2px 2px 4px rgba(0, 0, 0, 0.5)" mr={5} >{filteredProfileData.find(item => item.label === 'Age').value}</Text>
            }
            {filteredProfileData.find(item => item.label === 'Pronouns') &&
          <Text fontSize="xl" fontWeight="bold" textShadow="2px 2px 4px rgba(0, 0, 0, 0.5)">({filteredProfileData.find(item => item.label === 'Pronouns').value})</Text>
            }
            </Flex>
            </Box>
          </Flex>
        </Box>
      </Box>
    </Container>
  );
};

export default SparkProfile;
