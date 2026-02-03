// import React, { useEffect, useState } from "react";
// import {
//     Box, Table, Thead, Tbody, Tr, Th, Td, Badge, Select,
//     useToast, Heading, Spinner, Text, Container,
//     Center, VStack, Button, HStack, Divider,
//     Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
//     useDisclosure
// } from "@chakra-ui/react";
// import { getAdminAllOrders, updateOrderStatus } from "../actions/apiActions";

// const AdminOrders = () => {
//     const [orders, setOrders] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [selectedOrder, setSelectedOrder] = useState(null);
//     const { isOpen, onOpen, onClose } = useDisclosure();
//     const toast = useToast();

//     // Helper: Convert UTC to IST for Ahmedabad business hours
//     const formatToIST = (dateString) => {
//         if (!dateString) return "N/A";
//         return new Date(dateString).toLocaleString("en-IN", {
//             timeZone: "Asia/Kolkata",
//             day: "2-digit",
//             month: "short",
//             hour: "2-digit",
//             minute: "2-digit",
//             hour12: true,
//         });
//     };

//     const loadData = async () => {
//         try {
//             const { data } = await getAdminAllOrders();
//             if (data.success) setOrders(data.orders);
//         } catch (err) {
//             toast({ title: "Failed to fetch orders", status: "error" });
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => { loadData(); }, []);

//     const handleStatusChange = async (id, newStatus) => {
//         try {
//             const { data } = await updateOrderStatus(id, { status: newStatus });
//             if (data.success) {
//                 toast({ title: "Status Updated", status: "success" });
//                 loadData();
//             }
//         } catch (err) {
//             toast({ title: "Update Failed", status: "error" });
//         }
//     };

//     const handleOpenDetails = (order) => {
//         setSelectedOrder(order);
//         onOpen();
//     };

//     if (loading) return <Center h="60vh"><Spinner color="#A22B21" /></Center>;

//     return (
//         <Container maxW="container.xl" py={10}>
//             <Heading size="lg" mb={8} color="#A22B21" fontFamily="'Playfair Display', serif">
//                 Order Management
//             </Heading>

//             <Box bg="white" shadow="sm" borderRadius="lg" overflowX="auto">
//                 <Table variant="simple" size="sm">
//                     <Thead bg="gray.100">
//                         <Tr>
//                             <Th>Order Info</Th>
//                             <Th>Customer</Th>
//                             <Th>Products & Qty</Th>
//                             <Th>Amount</Th>
//                             <Th>Payment</Th>
//                             <Th>Order Status</Th>
//                             <Th>Action</Th>
//                         </Tr>
//                     </Thead>
//                     <Tbody>
//                         {orders.map((order) => (
//                             <Tr key={order._id}>
//                                 <Td>
//                                     <Text fontWeight="bold" fontSize="xs">{order.razorpayOrderId}</Text>
//                                     <Text fontSize="xs" color="gray.500">{formatToIST(order.createdAt)}</Text>
//                                 </Td>
//                                 <Td>
//                                     <Text fontWeight="bold" fontSize="sm">{order.user?.name || order.shippingInfo.name}</Text>
//                                     <Text fontSize="xs" color="blue.600">{order.user?.email || order.shippingInfo.email}</Text>
//                                 </Td>
//                                 <Td>
//                                     {order.items.map((item, i) => (
//                                         <Text key={i} fontSize="xs">
//                                             {item.product?.name} <Badge ml={1}>x{item.quantity}</Badge>
//                                         </Text>
//                                     ))}
//                                 </Td>
//                                 <Td fontWeight="bold">₹{order.totalAmount}</Td>
//                                 <Td>
//                                     <VStack align="start" spacing={0}>
//                                         <Badge colorScheme="green">PAID</Badge>
//                                         <Text fontSize="10px" color="gray.400">{order.paymentDetails?.razorpayPaymentId}</Text>
//                                     </VStack>
//                                 </Td>
//                                 <Td>
//                                     <Select
//                                         size="xs"
//                                         value={order.status}
//                                         onChange={(e) => handleStatusChange(order._id, e.target.value)}
//                                         bg={order.status === 'delivered' ? 'green.50' : 'blue.50'}
//                                     >
//                                         {/* <option value="rejected">Rejected</option> */}
//                                         <option value="paid">Paid</option>
//                                         <option value="shipped">Shipped</option>
//                                         <option value="delivered">Delivered</option>
//                                     </Select>
//                                 </Td>
//                                 <Td>
//                                     <Button size="xs" variant="outline" colorScheme="blue" onClick={() => handleOpenDetails(order)}>
//                                         View Details
//                                     </Button>
//                                 </Td>
//                             </Tr>
//                         ))}
//                     </Tbody>
//                 </Table>
//             </Box>

//             {/* --- ADMIN VIEW DETAILS MODAL --- */}
//             <Modal isOpen={isOpen} onClose={onClose} size="xl">
//                 <ModalOverlay />
//                 <ModalContent>
//                     <ModalHeader>Full Order Details</ModalHeader>
//                     <ModalCloseButton />
//                     <ModalBody pb={6}>
//                         {selectedOrder && (
//                             <VStack align="stretch" spacing={4}>
//                                 <Box bg="gray.50" p={3} borderRadius="md">
//                                     <Text fontWeight="bold" fontSize="sm" mb={2}>Shipping Information</Text>
//                                     <Text fontSize="sm">{selectedOrder.shippingInfo.address}, {selectedOrder.shippingInfo.city}</Text>
//                                     <Text fontSize="sm">Phone: {selectedOrder.shippingInfo.phone}</Text>
//                                 </Box>

//                                 <Box>
//                                     <Text fontWeight="bold" fontSize="sm" mb={2}>Status History & Audit Trail</Text>
//                                     {selectedOrder.statusHistory?.map((log, i) => (
//                                         <HStack key={i} justify="space-between" fontSize="xs" py={1} borderBottom="1px solid" borderColor="gray.50">
//                                             <VStack align="start" spacing={0}>
//                                                 <Badge variant="solid" colorScheme="blue">{log.status.toUpperCase()}</Badge>
//                                                 <Text fontSize="10px" color="gray.400">By: {log.updatedBy || "System"}</Text>
//                                             </VStack>
//                                             <Text color="gray.500">{formatToIST(log.timestamp)}</Text>
//                                         </HStack>
//                                     ))}
//                                 </Box>

//                                 <Divider />
//                                 <Text fontSize="xs" color="gray.400">Database ID: {selectedOrder._id}</Text>
//                             </VStack>
//                         )}
//                     </ModalBody>
//                 </ModalContent>
//             </Modal>
//         </Container>
//     );
// };

// export default AdminOrders;

import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx"; // Import xlsx
import {
    Box, Table, Thead, Tbody, Tr, Th, Td, Badge, Select,
    useToast, Heading, Spinner, Text, Container,
    Center, VStack, Button, HStack, Divider,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
    useDisclosure, Input, InputGroup, InputLeftElement, Stack, Menu, MenuButton, MenuList, MenuItem,
    Flex
} from "@chakra-ui/react";
import { SearchIcon, ChevronDownIcon, DownloadIcon } from "@chakra-ui/icons";
import { getAdminAllOrders, updateOrderStatus, getAdminExportAllOrders } from "../actions/apiActions";

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [exportLoading, setExportLoading] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();

    const [searchTerm, setSearchTerm] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalOrders: 0, limit: 10 });

    const formatToIST = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            day: "2-digit", month: "short", year: "numeric",
            hour: "2-digit", minute: "2-digit", hour12: true,
        });
    };

    const loadData = async (page = 1) => {
        setLoading(true);
        try {
            const filters = { search: searchTerm, startDate, endDate };
            const { data } = await getAdminAllOrders(page, 10, filters);
            if (data.success) {
                setOrders(data.orders);
                setPagination(data.pagination);
            }
        } catch (err) {
            toast({ title: "Failed to fetch orders", status: "error" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(1); }, []);

    // --- EXCEL DOWNLOAD LOGIC ---
    const prepareDataForExcel = (data) => {
        return data.map((order, index) => ({
            "Sr No.": index + 1,
            "Order ID": order.razorpayOrderId,
            "Date": formatToIST(order.createdAt),
            "Customer Name": order.shippingInfo.name,
            "Shipping Email": order.shippingInfo.email,
            "Account Email": order.user?.email || "N/A",
            "Phone": order.shippingInfo.phone,
            "Address": `${order.shippingInfo.address}, ${order.shippingInfo.city}, ${order.shippingInfo.pincode}`,
            "Products": order.items.map(i => `${i.product?.name} (x${i.quantity})`).join(", "),
            "Total Amount": order.totalAmount,
            "Payment ID": order.paymentDetails?.razorpayPaymentId || "N/A",
            "Status": order.status.toUpperCase()
        }));
    };

    const downloadExcel = (data, filename) => {
        const worksheet = XLSX.utils.json_to_sheet(prepareDataForExcel(data));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
        XLSX.writeFile(workbook, `${filename}.xlsx`);
    };

    const handleDownloadCurrent = () => {
        if (orders.length === 0) return toast({ title: "No data to download", status: "warning" });
        downloadExcel(orders, `Orders_Page_${pagination.currentPage}`);
    };

    const handleDownloadAll = async () => {
        setExportLoading(true);
        try {
            const { data } = await getAdminExportAllOrders();
            if (data.success) {
                downloadExcel(data.orders, "All_Orders_Full_Report");
                toast({ title: "Export Successful", status: "success" });
            }
        } catch (err) {
            toast({ title: "Export Failed", status: "error" });
        } finally {
            setExportLoading(false);
        }
    };

    // ... handleStatusChange, handleOpenDetails, serialNumberOffset logic same as before ...
    const handleStatusChange = async (id, newStatus) => {
        try {
            const { data } = await updateOrderStatus(id, { status: newStatus });
            if (data.success) {
                toast({ title: "Status Updated", status: "success" });
                loadData(pagination.currentPage);
            }
        } catch (err) {
            toast({ title: "Update Failed", status: "error" });
        }
    };

    const handleOpenDetails = (order) => {
        setSelectedOrder(order);
        onOpen();
    };

    const serialNumberOffset = (pagination.currentPage - 1) * pagination.limit;

    return (
        <Container maxW="container.xl" py={10}>
            <Stack direction={{ base: "column", lg: "row" }} justify="space-between" align="flex-end" mb={8} spacing={4}>
                <VStack align="start" spacing={0}>
                    <Heading size="lg" color="#A22B21" fontFamily="'Playfair Display', serif">Order Management</Heading>
                </VStack>

                <HStack spacing={3} flexWrap="wrap" justify="flex-end">
                    <InputGroup maxW="180px" size="sm">
                        <InputLeftElement children={<SearchIcon color="gray.300" />} />
                        <Input
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && loadData(1)}
                        />
                    </InputGroup>
                    <HStack align="start" spacing={0}>
                        <Text fontSize="9px" fontWeight="bold">FROM</Text>
                        <Input type="date" size="sm" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    </HStack>
                    <HStack align="start" spacing={0}>
                        <Text fontSize="9px" fontWeight="bold">TO</Text>
                        <Input type="date" size="sm" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    </HStack>
                    <Button size="sm" colorScheme="blue" onClick={() => loadData(1)}><SearchIcon /></Button>
                    <Button size="sm" variant="ghost" onClick={() => { setSearchTerm(""); setStartDate(""); setEndDate(""); loadData(1); }}>Reset</Button>
                </HStack>
            </Stack>

            <Flex alignItems={'flex-end'} justifyContent={'flex-end'} mb={2}>

                <HStack>
                    <Text fontSize="xs" color="gray.500">Total: {pagination.totalOrders}</Text>
                    <Divider orientation="vertical" h="10px" />
                    {/* Download Menu */}
                    <Menu>
                        <MenuButton as={Button} size="xs" colorScheme="green" leftIcon={<DownloadIcon />} isLoading={exportLoading}>
                            Export Data <ChevronDownIcon />
                        </MenuButton>
                        <MenuList fontSize="sm">
                            <MenuItem onClick={handleDownloadCurrent}>Download Current View</MenuItem>
                            <MenuItem onClick={handleDownloadAll}>Download All Data (Full DB)</MenuItem>
                        </MenuList>
                    </Menu>
                </HStack>
            </Flex>

            {loading ? (
                <Center h="40vh"><Spinner size="xl" color="#A22B21" /></Center>
            ) : (
                <Box bg="white" shadow="sm" borderRadius="lg" overflowX="auto" border="1px solid" borderColor="gray.100">
                    <Table variant="simple" size="sm">
                        <Thead bg="gray.50">
                            <Tr>
                                <Th>Sr.</Th>
                                <Th>Order Info</Th>
                                <Th>Customer & Account</Th>
                                <Th>Products</Th>
                                <Th>Amount</Th>
                                <Th>Payment</Th>
                                <Th>Status</Th>
                                <Th>Action</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {orders.map((order, index) => (
                                <Tr key={order._id}>
                                    <Td fontWeight="bold">{serialNumberOffset + index + 1}</Td>
                                    <Td>
                                        <Text fontWeight="bold" fontSize="xs">{order.razorpayOrderId}</Text>
                                        <Text fontSize="10px" color="gray.400">{formatToIST(order.createdAt)}</Text>
                                    </Td>
                                    <Td>
                                        <Text fontWeight="bold" fontSize="sm" noOfLines={1}>{order.shippingInfo.name}</Text>
                                        <VStack align="start" spacing={0}>
                                            <Text fontSize="10px" color="blue.600">Ship: {order.shippingInfo.email}</Text>
                                            <Text fontSize="10px" color="purple.600">Acc: {order.user?.email}</Text>
                                        </VStack>
                                    </Td>
                                    <Td>
                                        {order.items.map((item, i) => (
                                            <Text key={i} fontSize="xs" noOfLines={1}>
                                                {item.product?.name} <Badge ml={1}>x{item.quantity}</Badge>
                                            </Text>
                                        ))}
                                    </Td>
                                    <Td fontWeight="bold">₹{order.totalAmount}</Td>
                                    <Td>
                                        <Badge colorScheme="green">PAID</Badge>
                                        <Text fontSize="9px" color="gray.400" noOfLines={1}>{order.paymentDetails?.razorpayPaymentId}</Text>
                                    </Td>
                                    <Td>
                                        <Select
                                            size="xs" value={order.status}
                                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                            bg={order.status === 'delivered' ? 'green.50' : 'blue.50'}
                                        >
                                            <option value="paid">Paid</option>
                                            <option value="shipped">Shipped</option>
                                            <option value="delivered">Delivered</option>
                                            <option value="failed">Failed</option>
                                            <option value="rejected">Rejected</option>
                                        </Select>
                                    </Td>
                                    <Td>
                                        <Button size="xs" variant="outline" colorScheme="blue" onClick={() => handleOpenDetails(order)}>View</Button>
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </Box>
            )}

            {/* Pagination Controls */}
            {!loading && (
                <HStack justify="center" mt={8} spacing={4}>
                    <Button size="sm" onClick={() => loadData(pagination.currentPage - 1)} isDisabled={pagination.currentPage === 1}>Prev</Button>
                    <Text fontSize="sm">Page {pagination.currentPage} of {pagination.totalPages}</Text>
                    <Button size="sm" onClick={() => loadData(pagination.currentPage + 1)} isDisabled={pagination.currentPage === pagination.totalPages}>Next</Button>
                </HStack>
            )}

            {/* Modal Restored */}
            <Modal isOpen={isOpen} onClose={onClose} size="xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader borderBottom="1px solid" borderColor="gray.100">Full Order Details</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        {selectedOrder && (
                            <VStack align="stretch" spacing={5} pt={4}>
                                <Box bg="gray.50" p={3} borderRadius="md">
                                    <Text fontWeight="bold" fontSize="sm" mb={2}>Shipping Information</Text>
                                    <Text fontSize="sm">{selectedOrder.shippingInfo.address}, {selectedOrder.shippingInfo.city}, {selectedOrder.shippingInfo.state} - {selectedOrder.shippingInfo.pincode}</Text>
                                    <Text fontSize="sm" fontWeight="bold">Phone: {selectedOrder.shippingInfo.phone}</Text>
                                </Box>
                                <Box>
                                    <Text fontWeight="bold" fontSize="sm" mb={2}>Status History & Audit Trail</Text>
                                    {selectedOrder.statusHistory?.map((log, i) => (
                                        <HStack key={i} justify="space-between" fontSize="xs" py={1.5} borderBottom="1px solid" borderColor="gray.100">
                                            <VStack align="start" spacing={0}>
                                                <Badge variant="subtle" colorScheme="blue">{log.status.toUpperCase()}</Badge>
                                                <Text fontSize="10px" color="gray.400">By: {log.updatedBy || "System"}</Text>
                                            </VStack>
                                            <Text color="gray.500">{formatToIST(log.timestamp)}</Text>
                                        </HStack>
                                    ))}
                                </Box>
                                <Divider />
                                <VStack align="start" spacing={1}>
                                    <Text fontSize="10px" color="gray.400">Database ID: {selectedOrder._id}</Text>
                                    <Text fontSize="10px" color="gray.400">Razorpay Order: {selectedOrder.razorpayOrderId}</Text>
                                </VStack>
                            </VStack>
                        )}
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Container>
    );
};

export default AdminOrders;