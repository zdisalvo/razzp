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

const categoryColors = {
    post: "#FF5733",       // Red
    message: "#33FF57",    // Green
    subscription: "#3357FF" // Blue
};

const CreatorModal = ({ isOpen, onClose }) => {
    const authUser = useAuthStore((state) => state.user);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState(""); // Initialize endDate
    const [grossEarnings, setGrossEarnings] = useState(0);
    const [netEarnings, setNetEarnings] = useState(0);
    const [payments, setPayments] = useState(0);
    const [filteredPurchases, setFilteredPurchases] = useState([]);
    const [categoryBreakdown, setCategoryBreakdown] = useState([]);
    const [topPurchasers, setTopPurchasers] = useState([]);
    const [categoryTotals, setCategoryTotals] = useState({ gross: 0, net: 0 });
    const [purchaserTotals, setPurchaserTotals] = useState({ gross: 0, net: 0 });
    const [spendData, setSpendData] = useState([]);

    useEffect(() => {
        if (isOpen) {
            const today = new Date();
            const todayStr = today.toISOString().split("T")[0]; // Format to YYYY-MM-DD
            const twoDaysLater = new Date(today);
            twoDaysLater.setDate(today.getDate() + 2); // Set to two days later
            const twoDaysLaterStr = twoDaysLater.toISOString().split("T")[0]; // Format to YYYY-MM-DD
            setStartDate(todayStr); // Set default start date to today
            setEndDate(twoDaysLaterStr); // Set default end date to two days later
            fetchCreatorData();
        }
    }, [isOpen]);

    const fetchCreatorData = async () => {
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
                
                // Set default start date to userData.createdAt
                if (userData.createdAt) {
                    setStartDate(new Date(userData.createdAt).toISOString().split("T")[0]);
                }
            }

            const filteredPurchases = purchases.filter((purchase) => {
                const purchaseDate = new Date(purchase.date);
                const isAfterStart = startDate ? purchaseDate >= new Date(startDate) : true;
                const isBeforeEnd = endDate ? purchaseDate <= new Date(endDate) : true;
                return isAfterStart && isBeforeEnd;
            });

            setFilteredPurchases(filteredPurchases);

            const breakdown = {};
            let categoryGrossTotal = 0;
            let categoryNetTotal = 0;
            const spendByDate = {};

            filteredPurchases.forEach((purchase) => {
                const type = purchase.purchaseType;
                const date = new Date(purchase.date).toLocaleDateString();

                // Initialize spend by date if not already done
                if (!spendByDate[date]) {
                    spendByDate[date] = {};
                }
                if (!spendByDate[date][type]) {
                    spendByDate[date][type] = 0;
                }
                spendByDate[date][type] += purchase.gross;

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
            const allDates = getAllDates(startDate, new Date()); // Only get dates until today
            const graphData = allDates.map(date => {
                const dateStr = date.toLocaleDateString();
                const dataPoint = { date: dateStr };

                // Include all categories and ensure "post" is represented
                allCategories.forEach(category => {
                    dataPoint[category] = spendByDate[dateStr] && spendByDate[dateStr][category] ? spendByDate[dateStr][category] : 0;
                });

                // Explicitly ensure all categories have a data point
                allCategories.forEach(category => {
                    if (!dataPoint[category]) {
                        dataPoint[category] = 0; // Set 0 if category is undefined for that date
                    }
                });

                return dataPoint;
            });

            setSpendData(graphData);

            const purchaserTotals = {};
            let purchaserGrossTotal = 0;
            let purchaserNetTotal = 0;
            filteredPurchases.forEach((purchase) => {
                const purchaser = purchase.purchasedByUsername || "Unknown";
                if (purchaserTotals[purchaser]) {
                    purchaserTotals[purchaser].gross += purchase.gross;
                    purchaserTotals[purchaser].net += purchase.net;
                } else {
                    purchaserTotals[purchaser] = {
                        gross: purchase.gross,
                        net: purchase.net,
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
                }))
                .sort((a, b) => b.gross - a.gross);

            setTopPurchasers(sortedPurchasers);
            setPurchaserTotals({ gross: purchaserGrossTotal, net: purchaserNetTotal });
        } catch (error) {
            console.error("Failed to fetch creator data:", error);
        }
    };

    const getAllDates = (startDateStr, endDate) => {
        const startDateObj = new Date(startDateStr);
        const endDateObj = new Date(endDate);
        const dates = [];

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
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            placeholder="Start Date"
                        />
                        <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            placeholder="End Date"
                        />
                        <Button onClick={fetchCreatorData} colorScheme="teal">
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
                                        <Td>{purchaser.purchaser}</Td>
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
