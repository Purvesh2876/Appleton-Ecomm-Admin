import React, { useState, useEffect } from 'react';
import {
    Box, Button, Container, Flex, Heading, HStack, Input, Table, Tbody, Td, Th, Thead, Tr,
    Text, Badge, Spinner, Center, VStack, Select, useDisclosure, Modal, ModalOverlay,
    ModalContent, ModalHeader, ModalBody, ModalCloseButton, FormControl, FormLabel,
    Checkbox, Stack, IconButton, useToast, InputGroup
} from "@chakra-ui/react";
import { SearchIcon, DeleteIcon, AddIcon, EditIcon } from "@chakra-ui/icons";
import { getAllCoupons, createCoupon, deleteCoupon, updateCoupon, getAllCategories, getAllProducts } from '../actions/apiActions';

const Coupon = () => {
    const [coupons, setCoupons] = useState([]);
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [editId, setEditId] = useState(null); // To track if we are editing

    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [formData, setFormData] = useState({
        code: '',
        description: '',
        type: 'percentage',
        value: '',
        minCartValue: 0,
        maxDiscount: null,
        minCartValue: 0,
        usageLimit: 100,
        userLimit: 1,
        expiryDate: '',
        category: null,
        applicableProducts: [],
        isPublic: true,
        isActive: true // Added active state
    });

    const getData = async () => {
        setLoading(true);
        try {
            const couponData = await getAllCoupons();
            const catData = await getAllCategories();
            const prodData = await getAllProducts();

            setCoupons(couponData.coupons || couponData);
            setCategories(catData.categories || catData);
            setProducts(prodData.products || prodData);
        } catch (err) {
            toast({ title: "Error", description: "Could not fetch data", status: "error" });
        }
        setLoading(false);
    };

    useEffect(() => {
        getData();
    }, []);

    const handleInput = (e) => {
        const { name, value, type, checked } = e.target;
        if (name === "category") {
            setFormData({ ...formData, category: value === "" ? null : value, applicableProducts: [] });
        } else if (name === "applicableProducts") {
            setFormData({ ...formData, applicableProducts: value === "" ? [] : [value], category: null });
        } else {
            setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
        }
    };

    // Open Modal for Editing
    const openEditModal = (coupon) => {
        setEditId(coupon._id);
        setFormData({
            code: coupon.code,
            description: coupon.description,
            type: coupon.type,
            value: coupon.value,
            minCartValue: coupon.minCartValue,
            maxDiscount: coupon.maxDiscount ?? null,
            minCartValue: coupon.minCartValue ?? 0,
            usageLimit: coupon.usageLimit ?? 100,
            userLimit: coupon.userLimit ?? 1,
            expiryDate: coupon.expiryDate.split('T')[0], // Format date for input
            category: coupon.category?._id || coupon.category || null,
            applicableProducts: coupon.applicableProducts || [],
            isPublic: coupon.isPublic,
            isActive: coupon.isActive
        });
        onOpen();
    };

    // Toggle Active/Pause quickly from table
    const toggleStatus = async (id, currentStatus) => {
        try {
            await updateCoupon(id, { isActive: !currentStatus });
            toast({ title: "Status Updated", status: "success", duration: 2000 });
            getData();
        } catch (err) {
            toast({ title: "Update Failed", status: "error" });
        }
    };

    const submitForm = async (e) => {
        e.preventDefault();
        try {
            if (editId) {
                await updateCoupon(editId, formData);
                toast({ title: "Coupon Updated", status: "success" });
            } else {
                await createCoupon(formData);
                toast({ title: "Coupon Created", status: "success" });
            }
            handleClose();
            getData();
        } catch (err) {
            toast({ title: "Failed", description: err, status: "error" });
        }
    };

    const handleClose = () => {
        setEditId(null);
        setFormData({ code: '', description: '', type: 'percentage', value: '', minCartValue: 0, expiryDate: '', category: null, applicableProducts: [], isPublic: true, isActive: true });
        onClose();
    };

    const removeCoupon = async (id) => {
        if (window.confirm("Delete this coupon?")) {
            try {
                await deleteCoupon(id);
                getData();
            } catch (err) {
                toast({ title: "Error", status: "error" });
            }
        }
    };

    return (
        <Container maxW="container.xl" py={10}>
            <Stack direction="row" justify="space-between" align="center" mb={8}>
                <VStack align="start" spacing={0}>
                    <Heading size="lg" color="#A22B21" fontFamily="'Playfair Display', serif">Coupon Management</Heading>
                </VStack>

                <HStack>
                    <InputGroup size="sm" w="200px">
                        <Input placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </InputGroup>
                    <Button size="sm" colorScheme="blue" onClick={getData}><SearchIcon /></Button>
                    <Button size="sm" colorScheme="green" leftIcon={<AddIcon />} onClick={onOpen}>Add New</Button>
                </HStack>
            </Stack>

            {loading ? (
                <Center h="40vh"><Spinner color="#A22B21" /></Center>
            ) : (
                <Box bg="white" shadow="sm" borderRadius="lg" border="1px solid" borderColor="gray.100" overflowX="auto">
                    <Table variant="simple" size="sm">
                        <Thead bg="gray.50">
                            <Tr>
                                <Th>Code</Th>
                                <Th>Target</Th>
                                <Th>Discount</Th>
                                <Th>Max Discount</Th>
                                <Th>Min. Order Value</Th>
                                <Th>Usage Limit</Th>
                                <Th>User Limit</Th>
                                <Th>Status</Th>
                                <Th>Visibility</Th>
                                <Th>Action</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {coupons.filter(c => c.code.toLowerCase().includes(searchTerm.toLowerCase())).map((c) => (
                                <Tr key={c._id}>
                                    <Td fontWeight="bold" color="blue.600">{c.code}</Td>
                                    <Td>
                                        <Badge fontSize="10px">
                                            {c.category ? `Category: ${c.category.name || 'Selected'}` : c.applicableProducts.length > 0 ? "Single Product" : "All Products"}
                                        </Badge>
                                    </Td>
                                    <Td fontSize="xs">{c.type === 'percentage' ? `${c.value}%` : `₹${c.value}`}</Td>
                                    <Td fontSize="xs">{`${c.maxDiscount}`}</Td>
                                    <Td fontSize="xs">{`${c.minCartValue}`}</Td>
                                    <Td fontSize="xs">{`${c.usageLimit}`}</Td>
                                    <Td fontSize="xs">{`${c.userLimit}`}</Td>
                                    <Td>
                                        <Badge
                                            cursor="pointer"
                                            colorScheme={c.isActive ? "green" : "red"}
                                            onClick={() => toggleStatus(c._id, c.isActive)}
                                        >
                                            {c.isActive ? "Active" : "Paused"}
                                        </Badge>
                                    </Td>
                                    <Td>
                                        <Badge colorScheme={c.isPublic ? "blue" : "gray"}>{c.isPublic ? "Visible" : "Hidden"}</Badge>
                                    </Td>
                                    <Td>
                                        <HStack spacing={1}>
                                            <IconButton size="xs" icon={<EditIcon />} colorScheme="yellow" onClick={() => openEditModal(c)} />
                                            <IconButton size="xs" icon={<DeleteIcon />} colorScheme="red" onClick={() => removeCoupon(c._id)} />
                                        </HStack>
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </Box>
            )}

            <Modal isOpen={isOpen} onClose={handleClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader color="#A22B21">{editId ? "Update Coupon" : "Create Coupon"}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <form onSubmit={submitForm}>
                            <VStack spacing={4}>
                                <FormControl isRequired>
                                    <FormLabel fontSize="xs">Code</FormLabel>
                                    <Input name="code" value={formData.code} size="sm" onChange={handleInput} />
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel fontSize="xs">Description</FormLabel>
                                    <Input name="description" value={formData.description} size="sm" onChange={handleInput} />
                                </FormControl>
                                <HStack w="full">
                                    <FormControl isRequired>
                                        <FormLabel fontSize="xs">Type</FormLabel>
                                        <Select name="type" value={formData.type} size="sm" onChange={handleInput}>
                                            <option value="percentage">Percentage %</option>
                                            <option value="fixed">Fixed ₹</option>
                                        </Select>
                                    </FormControl>
                                    <FormControl isRequired>
                                        <FormLabel fontSize="xs">Value</FormLabel>
                                        <Input name="value" value={formData.value} type="number" size="sm" onChange={handleInput} />
                                    </FormControl>
                                    {formData.type === "percentage" && (
                                        <FormControl>
                                            <FormLabel fontSize="xs">Max Discount (₹)</FormLabel>
                                            <Input
                                                name="maxDiscount"
                                                type="number"
                                                size="sm"
                                                value={formData.maxDiscount || ""}
                                                onChange={handleInput}
                                            />
                                        </FormControl>
                                    )}
                                </HStack>
                                <FormControl>
                                    <FormLabel fontSize="xs">Minimum Cart Value (₹)</FormLabel>
                                    <Input
                                        name="minCartValue"
                                        type="number"
                                        size="sm"
                                        value={formData.minCartValue}
                                        onChange={handleInput}
                                        placeholder="0 = No minimum"
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="xs">Total Usage Limit</FormLabel>
                                    <Input
                                        name="usageLimit"
                                        type="number"
                                        size="sm"
                                        value={formData.usageLimit}
                                        onChange={handleInput}
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="xs">Usage Per User</FormLabel>
                                    <Input
                                        name="userLimit"
                                        type="number"
                                        size="sm"
                                        value={formData.userLimit}
                                        onChange={handleInput}
                                    />
                                </FormControl>
                                <FormControl>
                                    <FormLabel fontSize="xs">Category (Targeting)</FormLabel>
                                    <Select name="category" value={formData.category || ""} size="sm" placeholder="All Categories" onChange={handleInput} isDisabled={formData.applicableProducts.length > 0}>
                                        {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                                    </Select>
                                </FormControl>
                                <FormControl>
                                    <FormLabel fontSize="xs">Product (Targeting)</FormLabel>
                                    <Select name="applicableProducts" value={formData.applicableProducts[0] || ""} size="sm" placeholder="All Products" onChange={handleInput} isDisabled={formData.category !== null}>
                                        {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                                    </Select>
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel fontSize="xs">Expiry Date</FormLabel>
                                    <Input name="expiryDate" value={formData.expiryDate} type="date" size="sm" onChange={handleInput} />
                                </FormControl>
                                <Stack direction="row" spacing={4} w="full">
                                    <Checkbox name="isPublic" isChecked={formData.isPublic} onChange={handleInput} size="sm">Show on website</Checkbox>
                                    <Checkbox name="isActive" isChecked={formData.isActive} onChange={handleInput} size="sm">Active</Checkbox>
                                </Stack>
                                <Button type="submit" colorScheme="green" w="full">{editId ? "Update" : "Save"} Coupon</Button>
                            </VStack>
                        </form>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Container>
    );
};

export default Coupon;