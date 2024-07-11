import React from 'react';
import { Box, Image, Text, SimpleGrid, VStack, Container, Button, Flex, Icon } from '@chakra-ui/react';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import WineBarRoundedIcon from '@mui/icons-material/WineBarRounded';
//import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCannabis, faBriefcase, faWineGlass, faRuler, faDumbbell, faGraduationCap, 
  faSmoking, faSchool, faHouseChimney, faBaby, faChildren, faStarAndCrescent, faScaleBalanced } from '@fortawesome/free-solid-svg-icons'; 


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
    politics && { value: politics },
    religion &&{ value: religion },
    //languages && { value: languages },
  ];


  const filteredAboutMeData = aboutMeData.filter(item => isNotEmpty(item.value));

    //Open to

    const openToData = [
      looking_for && { value: looking_for },
    ]

    const filteredOpenToData = openToData.filter(item => isNotEmpty(item.value));
  
    //LANGUAGES

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
    py: "10px",
    margin: '4px 2px',
    borderRadius: '7px',
    display: 'inline-block',
    userSelect: 'none',
    pointerEvents: 'none',
    _hover: { backgroundColor: "#1B2328" },
    _active: { backgroundColor: "#1B2328" },
  };

  const filteredProfileData = rawProfileData.filter(item => item.value && (Array.isArray(item.value) ? item.value.length > 0 : true));

  const profileData = [
    filteredAboutMeData.length > 0 && { label: 'About Me', data: filteredAboutMeData },
    filteredOpenToData.length > 0 && { label: 'Open to', data: filteredOpenToData },
    { label: 'Profile Details', data: filteredProfileData },
  ].filter(Boolean); // Filter out any falsy values

  //profilePics.map((pic, index) => (

  return (
    <Container width={{ base: "100vw", md: "auto" }} height={{ base: "auto", md: "100%" }} mb={{ base: "60px", md: "100px" }}>
      <Box>
        <Carousel showThumbs={false}>
          {profilePics.length > 0  &&
            <Box key={0}>
              <Image src={profilePics[0].imageURL} alt={`Profile picture ${1}`} />
            </Box>
          }
         

          <Box p={4}>
              {filteredBioData && filteredBioData.map((item, index) => (
                <Box key={index} mb={4}>
                <Text fontWeight="bold" fontSize='sm' textAlign="left" ml={3} mb={2}>Bio</Text>
                <Box key={index} mb={4}>
                  <Text fontSize="sm" fontWeight="medium" margin='4px 2px' padding="10px" borderRadius='7px' textAlign="left" justifyContent="center" fontFamily="system-ui"  backgroundColor="#1B2328" lineHeight="tall" whiteSpace="pre-wrap" overflowWrap="break-word">
                    {item.value}
                  </Text>
                </Box>
                </Box>
              ))}
            
            <Box mb={4}>
              
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
            <Box key={index} mb={4}>
              <Text fontWeight="bold" fontSize='sm' textAlign="left" ml={3} mb={2}>{section.label}</Text>
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
          {profilePics.length > 1 && profilePics.map((pic, index) => (
            <Box key={index}>
            <Image src={pic.imageURL} alt={`Profile picture ${index + 1}`} />
          </Box>
          ))}
          <Box p={4}>
            <VStack spacing={4} align="left">
              {profileData.slice(Math.ceil(profileData.length / 2)).map((data, index) => (
                <Box key={index} align="left">
                  <Text><strong>{data.label}</strong></Text>
                  {Array.isArray(data.value) ? (
                    data.value.map((item, subIndex) => (
                      <Button key={subIndex} size="sm" style={buttonStyle} m={1} display="flex"
                      alignItems="center"
                      justifyContent="center">
                        {item}
                      </Button>
                    ))
                  ) : (
                    <Button size="sm" style={buttonStyle} m={1} display="flex"
                      alignItems="center"
                      justifyContent="center"> 
                        {data.value}
                      </Button>
                  )}
                </Box>
              ))}
            </VStack>
          </Box>
        </Carousel>
        <Box bg="#1B2328" p={4} textAlign="center">
        <Flex align="center" justify="center" direction="row" wrap="wrap">
          <Text fontSize="xl" fontWeight="bold" mr={5}>{name}</Text>
          {filteredProfileData.find(item => item.label === 'Age') &&
          <Text fontSize="xl" fontWeight="bold">{filteredProfileData.find(item => item.label === 'Age').value}</Text>
            }
          </Flex>
        </Box>
      </Box>
    </Container>
  );
};

export default SparkProfile;
