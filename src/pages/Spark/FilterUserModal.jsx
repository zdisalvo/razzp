import React, { useState, useEffect } from "react";
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
    VStack,
    Collapse,
    useDisclosure,
} from "@chakra-ui/react";
import { Range } from "react-range";
import { firestore } from "../../firebase/firebase"; // Import your Firestore instance
import { doc, getDoc, updateDoc } from "firebase/firestore";
import useAuthStore from "../../store/authStore"; // Import your auth store
import { FaPlus, FaMinus } from "react-icons/fa";

const heightOptions = Array.from({ length: 19 }, (_, i) => 60 + i);
const openToOptions = [
  "Exploring",
  "Casual Dating",
  "Monogamous Relationship",
  "Open Relationship",
  "Long Term",
  "Marriage",
];
const ethnicityOptions = [
  "Asian",
  "Black",
  "Indian",
  "Jewish",
  "Latin",
  "Middle Eastern",
  "Pacific Islander",
  "Persian",
  "White",
];
const exerciseOptions = ["Active", "Sometimes", "Rarely"];
const drinkingOptions = ["Often", "Socially", "On Special Occasion", "Never"];
const cannabisOptions = ["Often", "Socially", "On Special Occasion", "Never"];
const haveKidsOptions = ["Have one", "Have kids", "Don't have kids"];
const familyPlansOptions = ["Don't want kids", "Open to kids", "Want kids", "Not sure"];
const politicsOptions = ["Apolitical", "Liberal", "Moderate", "Conservative"];
const religionOptions = [
  "Agnostic",
  "Atheist",
  "Buddhist",
  "Catholic",
  "Christian",
  "Hindu",
  "Jain",
  "Jewish",
  "Mormon",
  "Latter-day Saint",
  "Muslim",
  "Zoroastrian",
  "Sikh",
  "Spiritual",
  "Other",
];

const FilterUserModal = ({ isOpen, onClose, onFiltersApplied }) => {
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
  const [radiusInMiles, setRadiusInMiles] = useState(100); // Default distance
  const [ageRange, setAgeRange] = useState([18, 80]); // Default age range

  const { isOpen: isAdvancedFiltersOpen, onToggle: toggleAdvancedFilters } = useDisclosure();

  useEffect(() => {
    if (isOpen && authUser) {
      // Fetch filter values from Firestore when the modal opens
      const fetchFilters = async () => {
        const userDocRef = doc(firestore, "spark", authUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const filters = userDoc.data().filters || {};
          setSelectedHeight(filters.height?.value || 60);
          setShorterThan(filters.height?.shorterThan || false);
          setTallerThan(filters.height?.tallerThan || false);
          setSelectedOpenTo(filters.openTo || []);
          setSelectedEthnicity(filters.ethnicity || []);
          setSelectedExercise(filters.exercise || []);
          setSelectedDrinking(filters.drinking || []);
          setSelectedCannabis(filters.cannabis || []);
          setSelectedHaveKids(filters.haveKids || []);
          setSelectedFamilyPlans(filters.familyPlans || []);
          setSelectedPolitics(filters.politics || []);
          setSelectedReligion(filters.religion || []);
          setRadiusInMiles(filters.distance || 100); // Fetch the distance filter if available
          setAgeRange(filters.ageRange || [18, 80]); // Fetch the age range filter if available
        }
      };

      fetchFilters();
    }
  }, [isOpen, authUser]);

  const handleHeightChange = (value) => {
    setSelectedHeight(value);
  };

  const handleShorterThanClick = () => {
    setShorterThan((prev) => !prev);
    if (!shorterThan) setTallerThan(false); // Deselect "taller than" when "shorter than" is selected
  };

  const handleTallerThanClick = () => {
    setTallerThan((prev) => !prev);
    if (!tallerThan) setShorterThan(false); // Deselect "shorter than" when "taller than" is selected
  };

  const handleCheckboxChange = (option, setSelected) => {
    setSelected((prev) =>
      prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option]
    );
  };

  const formatHeight = (inches) => {
    const feet = Math.floor(inches / 12);
    const remainingInches = inches % 12;
    return `${feet}'${remainingInches}"`;
  };

  const handleDistanceChange = (value) => {
    setRadiusInMiles(value);
  };

  const handleAgeRangeChange = (values) => {
    setAgeRange(values);
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
    setRadiusInMiles(100); // Reset distance to default value
    setAgeRange([18, 80]); // Reset age range to default values

    if (!authUser) return; // Ensure the user is authenticated

    const userDocRef = doc(firestore, "spark", authUser.uid);

    try {
      await updateDoc(userDocRef, {
        filters: {
          height: {
            value: 60, // Default value
            shorterThan: false,
            tallerThan: false,
          },
          openTo: [],
          ethnicity: [],
          exercise: [],
          drinking: [],
          cannabis: [],
          haveKids: [],
          familyPlans: [],
          politics: [],
          religion: [],
          distance: 100, // Default distance
          ageRange: [18, 80], // Default age range
        },
      });
      onFiltersApplied();
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
          distance: radiusInMiles, // Save the distance filter value
          ageRange, // Save the age range filter values
        },
      });
      onFiltersApplied();
      onClose(); // Close the modal after saving filters
    } catch (error) {
      console.error("Error saving filters:", error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent bg={"black"} border={"1px solid gray"} maxW={{ base: "90vw", md: "400px" }} px={0}>
        <ModalHeader>Apply Filters</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
        <Box mb={4}>
            <Text mb={4} color="#eb7734">Age Range:</Text>
            <Flex alignItems="center" mb={4}>
              <Text fontSize="sm" mr={4}>{`${ageRange[0]} - ${ageRange[1]} years`}</Text>
              <Range
                values={ageRange}
                step={1}
                min={18}
                max={80}

                onChange={handleAgeRangeChange}
                renderTrack={({ props, children }) => (
                  <div
                    {...props}
                    style={{
                      ...props.style,
                      height: "7px",
                      width: "100%",
                      backgroundColor: "#ccc",
                      borderRadius: '8px',
                    }}
                  >
                    <div
                style={{
                  position: 'absolute',
                  height: '7px',
                  width: '100%',
                  backgroundColor: '#1A202C',
                  borderRadius: '8px',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  height: '7px',
                  backgroundColor: '#A0AEC0',
                  borderRadius: '8px',
                  left: `${((ageRange[0] - 18) / (62)) * 100}%`,
                  right: `${100 - ((ageRange[1] - 18) / (62)) * 100}%`,
                }}
              />
                    {children}
                  </div>
                )}
                renderThumb={({ index, props }) => (
                  <div
                    {...props}
                    style={{
                      ...props.style,
                      height: "20px",
                      width: "20px",
                      borderRadius: "50%",
                      backgroundColor: "#eb7734",
                    }}
                  />
                )}
              />
            </Flex>
          </Box>

          <Box mb={4}>
            <Text mb={1} color="#eb7734">Show people within:</Text>
            <Text mb={4} fontSize="sm" mr={3}>{radiusInMiles === 100 ? "Any Range" : `${radiusInMiles} miles`}</Text>
            <Flex alignItems="center" mb={4}>
              <Slider
                min={5}
                max={100}
                step={1}
                value={radiusInMiles}
                onChange={handleDistanceChange}
                width="100%"
              >
                <SliderTrack height="7px" borderRadius="8px" bg="gray.800">
                  <SliderFilledTrack bg="gray.400" />
                </SliderTrack>
                <SliderThumb boxSize={5} backgroundColor="#eb7734" />
              </Slider>
            </Flex>
          </Box>


          <Box mb={4}>
            <Text mb={4} color="#eb7734">Filter by Height:</Text>
            <Flex justifyContent="space-between" alignItems="center" mb={4}>
              <Button
                colorScheme={shorterThan ? "orange" : "gray"}
                bg={shorterThan ? "#eb7734" : "gray.800"}
                _active={{ bg: shorterThan ? "#eb7734" : "gray.800" }}
                onClick={handleShorterThanClick}
                size="sm"
              >
                Shorter Than
              </Button>
              <Text mx={4}>{formatHeight(selectedHeight)}</Text>
              <Button
                colorScheme={tallerThan ? "orange" : "gray"}
                bg={tallerThan ? "#eb7734" : "gray.800"}
                _active={{ bg: tallerThan ? "#eb7734" : "gray.800" }}
                onClick={handleTallerThanClick}
                size="sm"
              >
                Taller Than
              </Button>
            </Flex>
            <Slider
              min={60}
              max={78}
              step={1}
              value={selectedHeight}
              onChange={handleHeightChange}
            >
              <SliderTrack height="7px" borderRadius="8px" bg={shorterThan ? "gray.800" :  "gray.400"}>
              <SliderFilledTrack bg={shorterThan ? "gray.400" : (tallerThan ? "gray.800" : "gray.400")} />
              </SliderTrack>
              <SliderThumb boxSize={5} backgroundColor="#eb7734" />
            </Slider>
          </Box>

          

          

          <Button onClick={toggleAdvancedFilters} leftIcon={isAdvancedFiltersOpen ? <FaMinus /> : <FaPlus />}>
            Advanced Filters
          </Button>
          <Collapse in={isAdvancedFiltersOpen} animateOpacity>
            <VStack align="start" spacing={4} mt={4}>
              <Box>
                <Text mb={2}>Open To:</Text>
                {openToOptions.map((option) => (
                  <Checkbox
                    key={option}
                    isChecked={selectedOpenTo.includes(option)}
                    onChange={() => handleCheckboxChange(option, setSelectedOpenTo)}
                  >
                    {option}
                  </Checkbox>
                ))}
              </Box>
              <Box>
                <Text mb={2}>Ethnicity:</Text>
                {ethnicityOptions.map((option) => (
                  <Checkbox
                    key={option}
                    isChecked={selectedEthnicity.includes(option)}
                    onChange={() => handleCheckboxChange(option, setSelectedEthnicity)}
                  >
                    {option}
                  </Checkbox>
                ))}
              </Box>
              <Box>
                <Text mb={2}>Exercise:</Text>
                {exerciseOptions.map((option) => (
                  <Checkbox
                    key={option}
                    isChecked={selectedExercise.includes(option)}
                    onChange={() => handleCheckboxChange(option, setSelectedExercise)}
                  >
                    {option}
                  </Checkbox>
                ))}
              </Box>
              <Box>
                <Text mb={2}>Drinking:</Text>
                {drinkingOptions.map((option) => (
                  <Checkbox
                    key={option}
                    isChecked={selectedDrinking.includes(option)}
                    onChange={() => handleCheckboxChange(option, setSelectedDrinking)}
                  >
                    {option}
                  </Checkbox>
                ))}
              </Box>
              <Box>
                <Text mb={2}>Cannabis:</Text>
                {cannabisOptions.map((option) => (
                  <Checkbox
                    key={option}
                    isChecked={selectedCannabis.includes(option)}
                    onChange={() => handleCheckboxChange(option, setSelectedCannabis)}
                  >
                    {option}
                  </Checkbox>
                ))}
              </Box>
              <Box>
                <Text mb={2}>Have Kids:</Text>
                {haveKidsOptions.map((option) => (
                  <Checkbox
                    key={option}
                    isChecked={selectedHaveKids.includes(option)}
                    onChange={() => handleCheckboxChange(option, setSelectedHaveKids)}
                  >
                    {option}
                  </Checkbox>
                ))}
              </Box>
              <Box>
                <Text mb={2}>Family Plans:</Text>
                {familyPlansOptions.map((option) => (
                  <Checkbox
                    key={option}
                    isChecked={selectedFamilyPlans.includes(option)}
                    onChange={() => handleCheckboxChange(option, setSelectedFamilyPlans)}
                  >
                    {option}
                  </Checkbox>
                ))}
              </Box>
              <Box>
                <Text mb={2}>Politics:</Text>
                {politicsOptions.map((option) => (
                  <Checkbox
                    key={option}
                    isChecked={selectedPolitics.includes(option)}
                    onChange={() => handleCheckboxChange(option, setSelectedPolitics)}
                  >
                    {option}
                  </Checkbox>
                ))}
              </Box>
              <Box>
                <Text mb={2}>Religion:</Text>
                {religionOptions.map((option) => (
                  <Checkbox
                    key={option}
                    isChecked={selectedReligion.includes(option)}
                    onChange={() => handleCheckboxChange(option, setSelectedReligion)}
                  >
                    {option}
                  </Checkbox>
                ))}
              </Box>
            </VStack>
          </Collapse>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button backgroundColor="#eb7734" textShadow="2px 2px 4px rgba(0, 0, 0, 0.5)" mr={3} onClick={resetFilters}>
            Clear
          </Button>
          <Button backgroundColor="#eb7734" textShadow="2px 2px 4px rgba(0, 0, 0, 0.5)" onClick={saveFilters}>
            Apply
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default FilterUserModal;
