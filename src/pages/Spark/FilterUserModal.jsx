import { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Box,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Flex,
  Text,
  Checkbox,
  VStack
} from "@chakra-ui/react";
import { firestore } from "../../firebase/firebase"; // Import your Firestore instance
import { doc, updateDoc } from "firebase/firestore";
import useAuthStore from "../../store/authStore"; // Import your auth store

const heightOptions = Array.from({ length: 19 }, (_, i) => 60 + i);
const openToOptions = ["Exploring", "Casual Dating", "Monogamous Relationship", "Open Relationship", "Long Term", "Marriage"];
const ethnicityOptions = ["Asian", "Black", "Indian", "Jewish", "Latin", "Middle Eastern", "Pacific Islander", "Persian", "White"];
const exerciseOptions = ["Active", "Sometimes", "Rarely"];
const drinkingOptions = ["Often", "Socially", "On Special Occasion", "Never"];
const cannabisOptions = ["Often", "Socially", "On Special Occasion", "Never"];
const haveKidsOptions = ["Have one", "Have kids", "Don't have kids"];
const familyPlansOptions = ["Don't want kids", "Open to kids", "Want kids", "Not sure"];
const politicsOptions = ["Apolitical", "Liberal", "Moderate", "Conservative"];
const religionOptions = ["Agnostic", "Atheist", "Buddhist", "Catholic", "Christian", "Hindu", "Jain", "Jewish", "Mormon", "Latter-day Saint", "Muslim", "Zoroastrian", "Sikh", "Spiritual", "Other"];

const FilterUserModal = ({ isOpen, onClose }) => {
  const authUser = useAuthStore((state) => state.user);
  const [selectedHeight, setSelectedHeight] = useState(60);
  const [shorterThan, setShorterThan] = useState(false);
  const [tallerThan, setTallerThan] = useState(false);
  const [selectedOpenTo, setSelectedOpenTo] = useState([]);
  const [selectedEthnicity, setSelectedEthnicity] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState([]);
  const [selectedDrinking, setSelectedDrinking] = useState([]);
  const [selectedCannabis, setSelectedCannabis] = useState([]);
  const [selectedHaveKids, setSelectedHaveKids] = useState([]);
  const [selectedFamilyPlans, setSelectedFamilyPlans] = useState([]);
  const [selectedPolitics, setSelectedPolitics] = useState([]);
  const [selectedReligion, setSelectedReligion] = useState([]);

  const handleHeightChange = (value) => {
    setSelectedHeight(value);
  };

  const handleShorterThanClick = () => {
    setShorterThan(prev => !prev);
    if (!shorterThan) setTallerThan(false); // Deselect "taller than" when "shorter than" is selected
  };

  const handleTallerThanClick = () => {
    setTallerThan(prev => !prev);
    if (!tallerThan) setShorterThan(false); // Deselect "shorter than" when "taller than" is selected
  };

  const handleCheckboxChange = (option, setSelected) => {
    setSelected(prev =>
      prev.includes(option) ? prev.filter(item => item !== option) : [...prev, option]
    );
  };

  const formatHeight = (inches) => {
    const feet = Math.floor(inches / 12);
    const remainingInches = inches % 12;
    return `${feet}'${remainingInches}"`;
  };

  const resetFilters = async () => {
    setSelectedHeight(60); // Reset to default value
    setShorterThan(false);
    setTallerThan(false);
    setSelectedOpenTo([]);
    setSelectedEthnicity([]);
    setSelectedExercise([]);
    setSelectedDrinking([]);
    setSelectedCannabis([]);
    setSelectedHaveKids([]);
    setSelectedFamilyPlans([]);
    setSelectedPolitics([]);
    setSelectedReligion([]);

    if (!authUser) return; // Ensure the user is authenticated

    const userDocRef = doc(firestore, "spark", authUser.uid);

    try {
      await updateDoc(userDocRef, {
        filters: {
          height: {
            value: selectedHeight,
            shorterThan,
            tallerThan,
          },
          openTo: selectedOpenTo,
          ethnicity: selectedEthnicity,
          exercise: selectedExercise,
          drinking: selectedDrinking,
          cannabis: selectedCannabis,
          haveKids: selectedHaveKids,
          familyPlans: selectedFamilyPlans,
          politics: selectedPolitics,
          religion: selectedReligion,
        },
      });
      onClose(); // Close the modal after saving filters
    } catch (error) {
      console.error("Error saving filters:", error);
    }
  };
  

  const saveFilters = async () => {
    if (!authUser) return; // Ensure the user is authenticated

    const userDocRef = doc(firestore, "spark", authUser.uid);

    try {
      await updateDoc(userDocRef, {
        filters: {
          height: {
            value: selectedHeight,
            shorterThan,
            tallerThan,
          },
          openTo: selectedOpenTo,
          ethnicity: selectedEthnicity,
          exercise: selectedExercise,
          drinking: selectedDrinking,
          cannabis: selectedCannabis,
          haveKids: selectedHaveKids,
          familyPlans: selectedFamilyPlans,
          politics: selectedPolitics,
          religion: selectedReligion,
        },
      });
      onClose(); // Close the modal after saving filters
    } catch (error) {
      console.error("Error saving filters:", error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Filter Users</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box mb={4}>
            <Text mb={4}>Filter by Height:</Text>
            <Flex justifyContent="space-between" alignItems="center" mb={4}>
              <Button
                colorScheme={shorterThan ? "blue" : "gray"}
                onClick={handleShorterThanClick}
              >
                Shorter Than
              </Button>
              <Text mx={4}>{formatHeight(selectedHeight)}</Text>
              <Button
                colorScheme={tallerThan ? "blue" : "gray"}
                onClick={handleTallerThanClick}
              >
                Taller Than
              </Button>
            </Flex>
            <Slider
              min={60}
              max={78}
              value={selectedHeight}
              onChange={handleHeightChange}
            >
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb />
            </Slider>
          </Box>
          <Box mb={4}>
            <Text mb={4}>Open to:</Text>
            <VStack align="start">
              {openToOptions.map((option) => (
                <Checkbox
                  key={option}
                  isChecked={selectedOpenTo.includes(option)}
                  onChange={() => handleCheckboxChange(option, setSelectedOpenTo)}
                >
                  {option}
                </Checkbox>
              ))}
            </VStack>
          </Box>
          <Box mb={4}>
            <Text mb={4}>Ethnicity:</Text>
            <VStack align="start">
              {ethnicityOptions.map((option) => (
                <Checkbox
                  key={option}
                  isChecked={selectedEthnicity.includes(option)}
                  onChange={() => handleCheckboxChange(option, setSelectedEthnicity)}
                >
                  {option}
                </Checkbox>
              ))}
            </VStack>
          </Box>
          <Box mb={4}>
            <Text mb={4}>Exercise:</Text>
            <VStack align="start">
              {exerciseOptions.map((option) => (
                <Checkbox
                  key={option}
                  isChecked={selectedExercise.includes(option)}
                  onChange={() => handleCheckboxChange(option, setSelectedExercise)}
                >
                  {option}
                </Checkbox>
              ))}
            </VStack>
          </Box>
          <Box mb={4}>
            <Text mb={4}>Drinking:</Text>
            <VStack align="start">
              {drinkingOptions.map((option) => (
                <Checkbox
                  key={option}
                  isChecked={selectedDrinking.includes(option)}
                  onChange={() => handleCheckboxChange(option, setSelectedDrinking)}
                >
                  {option}
                </Checkbox>
              ))}
            </VStack>
          </Box>
          <Box mb={4}>
            <Text mb={4}>Cannabis:</Text>
            <VStack align="start">
              {cannabisOptions.map((option) => (
                <Checkbox
                  key={option}
                  isChecked={selectedCannabis.includes(option)}
                  onChange={() => handleCheckboxChange(option, setSelectedCannabis)}
                >
                  {option}
                </Checkbox>
              ))}
            </VStack>
          </Box>
          <Box mb={4}>
            <Text mb={4}>Have Kids:</Text>
            <VStack align="start">
              {haveKidsOptions.map((option) => (
                <Checkbox
                  key={option}
                  isChecked={selectedHaveKids.includes(option)}
                  onChange={() => handleCheckboxChange(option, setSelectedHaveKids)}
                >
                  {option}
                </Checkbox>
              ))}
            </VStack>
          </Box>
          <Box mb={4}>
            <Text mb={4}>Family Plans:</Text>
            <VStack align="start">
              {familyPlansOptions.map((option) => (
                <Checkbox
                  key={option}
                  isChecked={selectedFamilyPlans.includes(option)}
                  onChange={() => handleCheckboxChange(option, setSelectedFamilyPlans)}
                >
                  {option}
                </Checkbox>
              ))}
            </VStack>
          </Box>
          <Box mb={4}>
            <Text mb={4}>Politics:</Text>
            <VStack align="start">
              {politicsOptions.map((option) => (
                <Checkbox
                  key={option}
                  isChecked={selectedPolitics.includes(option)}
                  onChange={() => handleCheckboxChange(option, setSelectedPolitics)}
                >
                  {option}
                </Checkbox>
              ))}
            </VStack>
          </Box>
          <Box mb={4}>
            <Text mb={4}>Religion:</Text>
            <VStack align="start">
              {religionOptions.map((option) => (
                <Checkbox
                  key={option}
                  isChecked={selectedReligion.includes(option)}
                  onChange={() => handleCheckboxChange(option, setSelectedReligion)}
                >
                  {option}
                </Checkbox>
              ))}
            </VStack>
          </Box>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={saveFilters}>
            Apply Filters
          </Button>
          <Button colorScheme="red" mr={3} onClick={resetFilters}>
            Remove Filters
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default FilterUserModal;
