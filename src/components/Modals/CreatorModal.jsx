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
    IconButton,
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
import { format } from 'date-fns';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChartLine} from '@fortawesome/free-solid-svg-icons'; 
import { useNavigate, useParams, Link } from 'react-router-dom';


const categoryColors = {
    Posts: "#32CD32",       // Lime
    Messages: "#D5006D",    // Pink
    Subscriptions: "#FFD700", // Blue
    Referrals: "#3357FF",
};

const CustomTooltip = ({ payload, label, active }) => {
    console.log(payload);
    if (active && payload && payload.length) {
        // Format the label (date) to show only MM/dd
        const formattedDate = format(new Date(label), 'MM/dd');

        return (
            <div className="custom-tooltip" style={{ backgroundColor: 'white', padding: '10px', border: '1px solid #ccc' }}>
                <p className="label">{`Date: ${formattedDate}`}</p>
                {payload.map((data, index) => (
                    <p key={index} style={{ color: data.stroke }}>
                        {data.name}: {data.value}
                    </p>
                ))}
            </div>
        );
    }

    return null;
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
    //const [todayDate, setTodayDate] = useState(new Date(Date.now() - new Date().getTimezoneOffset() * 60000));
    const [todayDate, setTodayDate] = useState(new Date(Date.now()));
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const navigate = useNavigate();

    const handlePayoutSuccess = (payoutAmount) => {
        setPayments(prevPayments => prevPayments + payoutAmount);
    };

    const handlePayoutRequest = () => {
        setShowPaymentForm(prevState => !prevState);
    };

    const handleAvatarClick = (purchaser) => {
        onClose();
        navigate(`/${purchaser.purchaser}`);
    };

    // useEffect(() => {
    //     console.log('Tooltip Payload:', payload);
    // }, [payload]);

    useEffect(() => {
        //console.log(isInitialized);
        //console.log(todayDate);
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

        //console.log(startDate);
    
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
    
            //const todayDate = new Date().toISOString().split("T")[0];
            const todayDate = new Date().toLocaleDateString('en-CA');
            //const endDateData = new Date(endDate) <= new Date(todayDate) ? new Date(endDate) : new Date(todayDate);
    
            const allDates = getAllDates(startDate, endDate);
    
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

        // for (let dt = startDateObj; dt <= endDateObj; dt.setDate(dt.getDate() + 1)) {
        //     dates.push(new Date(dt));
        //     console.log(new Date(dt));
        // }

        for (let dt = startDateObj; dt <= endDateObj; dt.setUTCDate(dt.getUTCDate() + 1)) {
            dates.push(new Date(Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate())));
            //console.log(new Date(Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate())));
        }

        return dates;
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
            <ModalOverlay />
            <ModalContent
                border={"1px solid gray"} 
                maxW={{ base: "100vw", md: "400px" }}  
                //px={{ base: "4px", md: "4px" }} 
                pt={3} 
                pb={4}
            >
                <ModalHeader>Creator Earnings Summary</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                <Box mb={4} mx={4}>
                    {/* <Text fontWeight="bold" mb={2} ml={-3}>Earnings Summary</Text> */}
                    
                    <Flex justifyContent="space-between">
                        <Text>Gross Earnings:</Text>
                        <Text>${grossEarnings.toFixed(2)}</Text>
                    </Flex>
                    
                    <Flex justifyContent="space-between">
                        <Text>Net Earnings:</Text>
                        <Text>${netEarnings.toFixed(2)}</Text>
                    </Flex>
                    
                    <Flex justifyContent="space-between">
                        <Text>Payouts:</Text>
                        <Text>${payments.toFixed(2)}</Text>
                    </Flex>
                    
                    <Flex justifyContent="space-between" alignItems="center" mb={1}>
                        <Text>Balance:</Text>
                        <Button size="sm" onClick={handlePayoutRequest} mx={2}>
                            Request Payout
                        </Button>
                        <Text>${(netEarnings - payments).toFixed(2)}</Text>
                    </Flex>
                    {showPaymentForm && (
                    <Box mt={4}>
                        <ACHPaymentForm 
                        balance={(netEarnings - payments).toFixed(2)} 
                        onPayoutSuccess={handlePayoutSuccess}
                        />
                    </Box>
                    )}
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
                                //setStartDate(userDate.toISOString().split("T")[0]);
                                setStartDate(userDate.toLocaleDateString('en-CA'));
                                console.log("startDate:", userDate.toISOString().split("T")[0]);
                            } else {
                                setStartDate(createdAtDate.toISOString().split("T")[0]);
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
                                //setEndDate(userDate.toISOString().split("T")[0]);
                                const nextDay = new Date(userDate);
                                nextDay.setDate(nextDay.getDate() + 1);
                                setEndDate(nextDay.toISOString().split("T")[0]);
                                console.log("Selected end date:", userDate.toISOString().split("T")[0]);
                            } else {
                                //setEndDate(currentDate.toISOString().split("T")[0]);
                                const nextDay = new Date(currentDate);
                                nextDay.setDate(nextDay.getDate() + 1);
                                setEndDate(nextDay.toISOString().split("T")[0]);
                                console.log("End Date: today's date:", nextDay.toISOString().split("T")[0]);
                            }
                        }}
                        placeholder="End Date"
                    />

                        {/* <Button onClick={() => fetchCreatorData(startDate, endDate)} colorScheme="teal">
                            Search
                        </Button> */}
                        <IconButton
							icon={<FontAwesomeIcon icon={faChartLine} />}
							size={{ base: "sm", md: "sm" }}
							onClick={() => fetchCreatorData(startDate, endDate)}
							backgroundColor="white"
							color="black"
							_hover={{ bg: "whiteAlpha.800" }}
							aria-label="Settings"
						/>
                    </HStack>

                    {/* Line Chart for Total Spend by Category by Date */}
                    <Box mb={4} mt={2} ml={-4} mr={4} height="300px" >
                        <Text fontWeight="bold">Total Spend by Category</Text>
                        <ResponsiveContainer>
                            <LineChart data={spendData} >
                                {/* <CartesianGrid strokeDasharray="3 3" /> */}
                                <XAxis dataKey="date" tickFormatter={(tick) => format(new Date(tick), 'MM/dd')}/>
                                {/* <XAxis
                                dataKey="date"
                                tickFormatter={(tick) => new Date(tick).toLocaleDateString('en-US', {
                                    month: '2-digit',
                                    day: '2-digit',
                                })}
                                /> */}
                                <YAxis />
                                {/* <Tooltip content={<CustomTooltip />} /> */}
                                <Tooltip />
                                {/* <Legend /> */}
                                {categoryBreakdown.map((category) => (
                                    <Line
                                        key={category.type}
                                        type="monotone"
                                        dataKey={category.type}
                                        stroke={categoryColors[category.type] || "#000"}
                                        dot={false}
                                        //activeDot={{ r: 8 }}
                                    />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </Box>

                    {/* Category Breakdown Table */}
                    <Box mt={4} maxW="100%" overflowX="auto">
                    <Table variant="simple" size="sm">
                        <Thead>
                            <Tr>
                                <Th>Category</Th>
                                <Th isNumeric>Gross</Th>
                                <Th isNumeric>Net</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {categoryBreakdown.map((category) => (
                                <Tr key={category.type}>
                                    <Td style={{ color: categoryColors[category.type] || 'black' }}>
                                    {category.type}
                                </Td>
                                    <Td isNumeric style={{ color: categoryColors[category.type] || 'black' }}>${category.gross.toFixed(2)}</Td>
                                    <Td isNumeric style={{ color: categoryColors[category.type] || 'black' }}>${category.net.toFixed(2)}</Td>
                                </Tr>
                            ))}
                            <Tr fontWeight="bold">
                                <Td>Total</Td>
                                <Td isNumeric>${categoryTotals.gross.toFixed(2)}</Td>
                                <Td isNumeric>${categoryTotals.net.toFixed(2)}</Td>
                            </Tr>
                        </Tbody>
                    </Table>
                    </Box>

                    {/* Top Purchasers Table */}
                    <Box mt={4} maxW="100%" overflowX="auto">
                        <Text fontWeight="bold">Top Earners</Text>
                        <Table variant="simple" size="sm">
                            <Thead>
                                <Tr>
                                    <Th textAlign="center">User</Th>
                                    <Th isNumeric>Gross</Th>
                                    <Th isNumeric>Net</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {topPurchasers.map((purchaser, index) => (
                                    <Tr key={purchaser.purchaser}>
                                        
                                        <Td>
                                        <Flex alignItems={"center"} gap={3}>
                                        <Box  display="flex" alignItems="center" justifyContent="center">
                                            {index + 1}
                                        </Box>
                                        <Box  display="flex" alignItems="center" justifyContent="center">
                                        <Avatar 
                                            size="sm"
                                            src={purchaser.profilePicURL || undefined}
                                            name={purchaser.purchaser}
                                            onClick={() => handleAvatarClick(purchaser)}
                                            cursor="pointer"
                                        />
                                        </Box>
                                        <Box display="flex" alignItems="center" justifyContent="center"
                                            onClick={() => handleAvatarClick(purchaser)}
                                            cursor="pointer"
                                        >
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
                    {/* <ACHPaymentForm /> */}
                </ModalBody>
                <ModalFooter>
                    <Button onClick={onClose} colorScheme="blue">Close</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default CreatorModal;
