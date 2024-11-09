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
import ACHPaymentForm from "./ACHPaymentForm";

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
            }
    
            const filteredPurchases = purchases.filter((purchase) => {
                const purchaseDate = new Date(purchase.date);
                const isAfterStart = startDate ? purchaseDate >= new Date(startDate) : true;
                const isBeforeEnd = endDate ? purchaseDate <= new Date(`${endDate}T23:59:59`) : true;
                return isAfterStart && isBeforeEnd;
            });
    
            setFilteredPurchases(filteredPurchases);
    
            const breakdown = {};
            let categoryGrossTotal = 0;
            let categoryNetTotal = 0;
            const spendByDate = {};
    
            filteredPurchases.sort((a, b) => new Date(a.date) - new Date(b.date));
    
            filteredPurchases.forEach((purchase) => {
                const type = purchase.purchaseType;
                const date = new Date(purchase.date).toLocaleDateString('en-CA');
    
                if (!spendByDate[date]) {
                    spendByDate[date] = {};
                }
    
                spendByDate[date][type] = (spendByDate[date][type] || 0) + purchase.gross;
    
                if (breakdown[type]) {
                    breakdown[type].gross += purchase.gross;
                    breakdown[type].net += purchase.net;
                } else {
                    breakdown[type] = {
                        gross: purchase.gross,
                        net: purchase.net,
                    };
                }
    
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
    
            const todayDate = new Date().toISOString().split("T")[0];
            const endDateData = new Date(endDate) <= new Date(todayDate) ? new Date(endDate) : new Date(todayDate);
    
            const allDates = getAllDates(startDate, endDateData.toISOString().split("T")[0]);
    
            const cumulativeTotals = {}; // Track cumulative totals for each category
    
            const graphData = allDates.map(date => {
                const dateStr = date.toLocaleDateString('en-CA');
                const dataPoint = { date: dateStr };
    
                allCategories.forEach(category => {
                    // If there's no data for this date, carry over the last cumulative value
                    const previousTotal = cumulativeTotals[category] || 0;
                    const currentTotal = (spendByDate[dateStr]?.[category] || 0) + previousTotal;
    
                    cumulativeTotals[category] = currentTotal; // Update cumulative total
                    dataPoint[category] = currentTotal;
                });
    
                return dataPoint;
            });
    
            setSpendData(graphData);
    
            const purchaserTotals = {};
            let purchaserGrossTotal = 0;
            let purchaserNetTotal = 0;
    
            const descendingFilteredPurchases = filteredPurchases.sort((b, a) => new Date(a.date) - new Date(b.date));
    
            descendingFilteredPurchases.forEach((purchase) => {
                const purchaser = purchase.purchasedByUsername || "Unknown";
                const profilePicURL = purchase.purchaserProfilePicURL || null;
    
                if (purchaserTotals[purchaser]) {
                    purchaserTotals[purchaser].gross += purchase.gross;
                    purchaserTotals[purchaser].net += purchase.net;
                    if (!purchaserTotals[purchaser].profilePicURL) {
                        purchaserTotals[purchaser].profilePicURL = profilePicURL;
                    }
                } else {
                    purchaserTotals[purchaser] = {
                        gross: purchase.gross,
                        net: purchase.net,
                        profilePicURL: profilePicURL
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
                        onChange={(e) => {
                            const selectedValue = e.target.value;
                            setUseStartDate(selectedValue);

                            // Convert selected value to local date
                            const userDate = new Date(`${selectedValue}T00:00:00`);
                            
                            // Ensure createdAt is a Date object
                            const createdAtDate = new Date(createdAt);

                            // Compare dates
                            if (userDate >= createdAtDate) {
                                // Set startDate directly in local time (YYYY-MM-DD format)
                                setStartDate(userDate.toISOString().split("T")[0]);
                                console.log("startDate:", userDate.toISOString().split("T")[0]);
                            }
                        }}
                        placeholder="Start Date"
                    />

                    <Input
                        type="date"
                        value={useEndDate}
                        onChange={(e) => {
                            const selectedValue = e.target.value;
                            setUseEndDate(selectedValue);
                            
                            // Convert selected value to local date
                            const userDate = new Date(`${selectedValue}T00:00:00`);
                            
                            // Get current date for comparison in local time
                            const currentDate = new Date();
                            
                            // Compare dates
                            if (userDate <= currentDate) {
                                // Set endDate directly in local time (YYYY-MM-DD format)
                                setEndDate(userDate.toISOString().split("T")[0]);
                                console.log("Selected end date:", userDate.toISOString().split("T")[0]);
                            } else {
                                console.log("Selected date is in the future.");
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
                                        <Flex alignItems={"center"} gap={3}>
                                        <Box  display="flex" alignItems="center" justifyContent="center">
                                        <Avatar 
                                            size="sm"
                                            src={purchaser.profilePicURL || undefined}
                                            name={purchaser.purchaser}
                                        />
                                        </Box>
                                        <Box display="flex" alignItems="center" justifyContent="center">
                                        {purchaser.purchaser}
                                        </Box>
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
                    <ACHPaymentForm />
                </ModalBody>
                <ModalFooter>
                    <Button onClick={onClose} colorScheme="blue">Close</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default CreatorModal;
