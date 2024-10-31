import React, { useEffect, useState } from "react";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { firestore } from "../../firebase/firebase";
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    Box,
    Flex,
    Avatar,
    Text,
    HStack,
    Input,
    Button,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
} from "@chakra-ui/react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import useAuthStore from "../../store/authStore";
import { ja } from "date-fns/locale";

const categoryColors = {
    post: "#FF5733",       // Red
    message: "#33FF57",    // Green
    subscription: "#3357FF" // Blue
};

const CreatorModal = ({ isOpen, onClose }) => {
    const authUser = useAuthStore((state) => state.user);
    const [startDate, setStartDate] = useState("");
    const [useStartDate, setUseStartDate] = useState(""); 
    const [endDate, setEndDate] = useState(""); // Initialize endDate
    const [useEndDate, setUseEndDate] = useState(""); 
    const [grossEarnings, setGrossEarnings] = useState(0);
    const [netEarnings, setNetEarnings] = useState(0);
    const [payments, setPayments] = useState(0);
    const [filteredPurchases, setFilteredPurchases] = useState([]);
    const [categoryBreakdown, setCategoryBreakdown] = useState([]);
    const [topPurchasers, setTopPurchasers] = useState([]);
    const [categoryTotals, setCategoryTotals] = useState({ gross: 0, net: 0 });
    const [purchaserTotals, setPurchaserTotals] = useState({ gross: 0, net: 0 });
    const [spendData, setSpendData] = useState([]);
    const [isInitialized, setIsInitialized] = useState(false);
    const [createdAt, setCreatedAt] = useState(authUser?.createdAt);
    const [todayDate, setTodayDate] = useState(new Date(Date.now() + new Date().getTimezoneOffset() * 60000));

    useEffect(() => {
        //console.log(isInitialized);
        console.log(todayDate);
        if (isOpen && authUser && !isInitialized) {
            //console.log(authUser);
            const today = new Date();
            const todayStr = today.toLocaleDateString('en-CA').split("T")[0]; // Format to YYYY-MM-DD
            setUseEndDate(todayStr);
            //setTodayDate(new Date(todayDate.getTime() + todayDate.getTimezoneOffset() * 60000));
            
            // const twoDaysLater = new Date(today);
            // twoDaysLater.setDate(today.getDate() + 2); // Set to two days later
            // const twoDaysLaterStr = twoDaysLater.toISOString().split("T")[0]; // Format to YYYY-MM-DD
            //setTodayDate(twoDaysLaterStr);
            setStartDate(new Date(createdAt).toISOString().split("T")[0]); // Set default start date to today
            setUseStartDate(new Date(createdAt).toLocaleDateString('en-CA').split("T")[0]);
            setEndDate(todayDate.toISOString().split("T")[0]); // Set default end date to two days later
            // console.log(new Date(authUser?.createdAt).toISOString().split("T")[0]);
            // console.log(twoDaysLaterStr);
            //fetchCreatorData(startDate, endDate);
            fetchCreatorData(new Date(createdAt).toISOString().split("T")[0], todayDate.toISOString().split("T")[0]);
            
        } 
        // else if (isOpen && isInitialized ) {
        //     fetchCreatorData();
        // }
    }, [isOpen]);

    const fetchCreatorData = async (startDate, endDate) => {
        if (!authUser) return;

        console.log(startDate );

        try {
            const bonusRef = collection(firestore, "bonus", authUser.uid, "creator");
            const querySnapshot = await getDocs(bonusRef);
            const purchases = querySnapshot.docs.map((doc) => ({
                ...doc.data(),
                id: doc.id,
            }));

            const userRef = doc(collection(firestore, "users"), authUser.uid);
            const userDocSnap = await getDoc(userRef);
            if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                setGrossEarnings(userData.creatorGross || 0);
                setNetEarnings(userData.creatorNet || 0);
                setPayments(userData.creatorPayments || 0);
                
                // Set default start date to userData.createdAt
                // if (userData.createdAt) {
                //     setStartDate(new Date(userData.createdAt).toISOString().split("T")[0]);
                // }
            }

            const filteredPurchases = purchases.filter((purchase) => {
                const purchaseDate = new Date(purchase.date);
                const isAfterStart = startDate ? purchaseDate >= new Date(`${startDate}T00:00:00Z`) : true; // Adjusted for UTC start time
                const isBeforeEnd = endDate ? purchaseDate <= new Date(`${endDate}T23:59:59Z`) : true; // Adjusted for UTC end time
                return isAfterStart && isBeforeEnd;
            });
            
            setFilteredPurchases(filteredPurchases);
            
            const breakdown = {};
            let categoryGrossTotal = 0;
            let categoryNetTotal = 0;
            const spendByDate = {};
            
            // Sort filtered purchases in ascending order based on UTC date
            filteredPurchases.sort((a, b) => new Date(a.date) - new Date(b.date));
            
            // Step 2: Initialize spend by date after sorting
            filteredPurchases.forEach((purchase) => {
                const type = purchase.purchaseType;
                const date = new Date(purchase.date).toISOString().split('T')[0]; // Get date in YYYY-MM-DD format
            
                // Initialize spend by date if not already done
                if (!spendByDate[date]) {
                    spendByDate[date] = {};
                }
            
                // Initialize category total from the previous day if available, otherwise from zero
                if (!spendByDate[date][type]) {
                    const previousDate = new Date(purchase.date);
                    previousDate.setUTCDate(previousDate.getUTCDate() - 1); // Use UTC to get the previous date
                    const previousDateString = previousDate.toISOString().split('T')[0]; // Get previous date in YYYY-MM-DD format
            
                    spendByDate[date][type] = spendByDate[previousDateString]?.[type] || 0;
                }
            
                // Add the current purchase amount to the cumulative total for the date
                spendByDate[date][type] = (spendByDate[date][type] || 0) + purchase.gross; // Initialize to 0 if undefined
            
                // Log the cumulative spend for the date and type
                console.log(`Date: ${date}, Type: ${type}, Cumulative Spend: ${spendByDate[date][type]}`);
            
                // Prepare breakdown
                if (breakdown[type]) {
                    breakdown[type].gross += purchase.gross;
                    breakdown[type].net += purchase.net;
                } else {
                    breakdown[type] = {
                        gross: purchase.gross,
                        net: purchase.net,
                    };
                }
            
                // Update category totals
                categoryGrossTotal += purchase.gross;
                categoryNetTotal += purchase.net;
            });
            
            setCategoryBreakdown(Object.entries(breakdown).map(([type, totals]) => ({
                type,
                gross: totals.gross,
                net: totals.net,
            })));
            setCategoryTotals({ gross: categoryGrossTotal, net: categoryNetTotal });
            
            const allCategories = Object.keys(breakdown);
            console.log("startDate:" + startDate);
            console.log("endDate:" + endDate);
            
            let endDateData;
            if (new Date(endDate) <= todayDate) {
                endDateData = new Date(endDate);
            } else {
                endDateData = new Date(todayDate);
            }
            console.log(endDate);
            
            // Use the adjusted getAllDates function to get all dates in the specified range
            const allDates = getAllDates(startDate, endDate); // Only get dates until today
            
            const graphData = allDates.map(date => {
                const dateStr = date.toISOString().split('T')[0]; // Get date in YYYY-MM-DD format
                const dataPoint = { date: dateStr };
            
                allCategories.forEach(category => {
                    dataPoint[category] = spendByDate[dateStr] && spendByDate[dateStr][category] ? spendByDate[dateStr][category] : 0;
                });
            
                return dataPoint;
            });
            
            setSpendData(graphData);
            
            const purchaserTotals = {};
            let purchaserGrossTotal = 0;
            let purchaserNetTotal = 0;
            filteredPurchases.forEach((purchase) => {
                const purchaser = purchase.purchasedByUsername || "Unknown";
                const profilePicURL = purchase.purchaserProfilePicURL || "undefined";
                if (purchaserTotals[purchaser]) {
                    purchaserTotals[purchaser].gross += purchase.gross;
                    purchaserTotals[purchaser].net += purchase.net;
                } else {
                    purchaserTotals[purchaser] = {
                        gross: purchase.gross,
                        net: purchase.net,
                        profilePicURL,
                    };
                }
                purchaserGrossTotal += purchase.gross;
                purchaserNetTotal += purchase.net;
            });

            const sortedPurchasers = Object.entries(purchaserTotals)
                .map(([purchaser, totals]) => ({
                    purchaser,
                    gross: totals.gross,
                    net: totals.net,
                    profilePicURL: totals.profilePicURL,
                }))
                .sort((a, b) => b.gross - a.gross);

            setTopPurchasers(sortedPurchasers);
            setPurchaserTotals({ gross: purchaserGrossTotal, net: purchaserNetTotal });
        } catch (error) {
            console.error("Failed to fetch creator data:", error);
        }
        setIsInitialized(true);
    };

    const getAllDates = (startDate, endDate) => {
        const startDateObj = new Date(`${startDate}T00:00:00Z`);
        const endDateObj = new Date(`${endDate}T23:59:59Z`);
        const dates = [];

        //console.log(startDate);

        for (let dt = startDateObj; dt <= endDateObj; dt.setDate(dt.getDate() + 1)) {
            dates.push(new Date(dt));
        }

        return dates;
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Creator Earnings Summary</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Box mb={4}>
                        <Text fontWeight="bold">Earnings Summary</Text>
                        <Text>Gross Earnings: ${grossEarnings.toFixed(2)}</Text>
                        <Text>Net Earnings: ${netEarnings.toFixed(2)}</Text>
                        <Text>Payments: ${payments.toFixed(2)}</Text>
                        <Text>Balance: ${(netEarnings - payments).toFixed(2)}</Text>
                    </Box>

                    <HStack spacing={3} mb={4}>
                        <Input
                            type="date"
                            value={useStartDate}
                            //min="2024-01-01"
                            //onChange={(e) => setStartDate(e.target.value)}
                            onChange={(e) => {
                                
                                setUseStartDate(e.target.value);
                                //const timezoneOffset = new Date(useStartDate + "T00:00:00").toLocaleString().getTimezoneOffset();

                                const currentDate = new Date(); 
                                const timezoneOffset = currentDate.getTimezoneOffset(); // e.g., -420 for PDT (UTC-7)
                                const userDate = new Date(`${useStartDate}T00:00:00`);

                                const userDateUTC = new Date(userDate.getTime() - timezoneOffset * 60000);
                                console.log(e.target.value);
                                if (userDate > new Date(createdAt).toLocaleDateString()) {
                                    const selectedDate = new Date(e.target.value);
                                    selectedDate.setDate(selectedDate.getTime() + timezoneOffset * 60000); // Add 2 days
                                    setStartDate(userDateUTC.toISOString().split("T")[0]); // Update endDate state
                                    console.log(startDate);
                                }
                            }}
                            placeholder="Start Date"
                        />
                        <Input
                            type="date"
                            value={useEndDate}
                            //max="2025-12-31"
                            onChange={(e) => {
                                setUseEndDate(e.target.value);
                                const currentDate = new Date(); 
                                const timezoneOffset = currentDate.getTimezoneOffset(); // e.g., -420 for PDT (UTC-7)
                                const userDate = new Date(`${useEndDate}T00:00:00`);

                                const userDateUTC = new Date(userDate.getTime() - timezoneOffset * 60000);
                                if (userDate <= new Date().toLocaleDateString) {
                                    console.log("test");
                                    const selectedDate = new Date(e.target.value);
                                    selectedDate.setDate(selectedDate.getTime() + timezoneOffset * 60000);
                                    //setEndDate(selectedDate.toISOString().split("T")[0]); // Update endDate state
                                    setEndDate(userDateUTC.toISOString().split("T")[0]);
                                    console.log(endDate);
                                } 
                            }}
                            placeholder="End Date"
                        />
                        <Button onClick={() => fetchCreatorData(startDate, endDate)} colorScheme="teal">
                            Search
                        </Button>
                    </HStack>

                    {/* Line Chart for Total Spend by Category by Date */}
                    <Box mb={4} height="300px">
                        <Text fontWeight="bold">Total Spend by Category</Text>
                        <ResponsiveContainer>
                            <LineChart data={spendData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                {categoryBreakdown.map((category) => (
                                    <Line
                                        key={category.type}
                                        type="monotone"
                                        dataKey={category.type}
                                        stroke={categoryColors[category.type] || "#000"}
                                        activeDot={{ r: 8 }}
                                    />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </Box>

                    {/* Category Breakdown Table */}
                    <Table variant="simple">
                        <Thead>
                            <Tr>
                                <Th>Category</Th>
                                <Th isNumeric>Gross Earnings</Th>
                                <Th isNumeric>Net Earnings</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {categoryBreakdown.map((category) => (
                                <Tr key={category.type}>
                                    <Td>{category.type}</Td>
                                    <Td isNumeric>${category.gross.toFixed(2)}</Td>
                                    <Td isNumeric>${category.net.toFixed(2)}</Td>
                                </Tr>
                            ))}
                            <Tr fontWeight="bold">
                                <Td>Total</Td>
                                <Td isNumeric>${categoryTotals.gross.toFixed(2)}</Td>
                                <Td isNumeric>${categoryTotals.net.toFixed(2)}</Td>
                            </Tr>
                        </Tbody>
                    </Table>

                    {/* Top Purchasers Table */}
                    <Box mt={4}>
                        <Text fontWeight="bold">Top Purchasers</Text>
                        <Table variant="simple">
                            <Thead>
                                <Tr>
                                    <Th>Purchaser</Th>
                                    <Th isNumeric>Gross</Th>
                                    <Th isNumeric>Net</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {topPurchasers.map((purchaser) => (
                                    <Tr key={purchaser.purchaser}>
                                        <Td>
                                        <Flex align="baseline" gap={3}>
                                        <Avatar
                                            size="sm"
                                            src={purchaser.purchaserProfilePicURL || undefined}
                                            name={purchaser.purchaser}
                                        />
                                        {purchaser.purchaser}
                                        </Flex>
                                        </Td>
                                        <Td isNumeric>${purchaser.gross.toFixed(2)}</Td>
                                        <Td isNumeric>${purchaser.net.toFixed(2)}</Td>
                                    </Tr>
                                ))}
                                <Tr fontWeight="bold">
                                    
                                    <Td>Total</Td>
                                    <Td isNumeric>${purchaserTotals.gross.toFixed(2)}</Td>
                                    <Td isNumeric>${purchaserTotals.net.toFixed(2)}</Td>
                                </Tr>
                            </Tbody>
                        </Table>
                    </Box>
                </ModalBody>
                <ModalFooter>
                    <Button onClick={onClose} colorScheme="blue">Close</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default CreatorModal;
