import React, { useState, useEffect } from 'react';
import {
  Box, Button, ButtonGroup, Table, Tbody, Td, Th, Thead, Tr, Image,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody,
  FormControl, FormLabel, Input, Select, Stack, Badge, HStack, Text,
  IconButton
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { createProduct, deleteProduct, getAllCategories, getAllProducts, updateProduct } from '../actions/apiActions';

const ProductManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  // 1. Add these new states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const limit = 10; // Items per page
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    price: '',
    weight: '',
    unit: 'g',
    stock: '',
    description: '',
    tags: [],
    tagInput: '',
    images: []
  });

  const [existingImages, setExistingImages] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filter, setFilter] = useState('');

  // 2. Update useEffect to trigger on page or search change
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [filter, page, searchTerm]);


  // 3. Update the fetch function to handle the new params
  const fetchProducts = async () => {
    try {
      // Pass params as an object (ensure your apiActions.getAllProducts handles this)
      const response = await getAllProducts(filter, searchTerm, page, limit);
      console.log('admin product', response);
      setProducts(response.products);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await getAllCategories();
      setCategories(response);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setNewProduct({
      name: '', category: '', price: '', weight: '', unit: 'g',
      stock: '', description: '', tags: [], tagInput: '', images: []
    });
    setExistingImages([]);
    setRemovedImages([]);
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      category: product.category._id,
      price: product.price,
      weight: product.weight,
      unit: product.unit || 'g',
      stock: product.stock,
      description: product.description,
      tags: product.tags,
      tagInput: '',
      images: [] // New files to upload
    });
    setExistingImages(product.images);
    setRemovedImages([]);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({ ...newProduct, [name]: value });
  };

  const handleAddTag = () => {
    if (newProduct.tagInput.trim()) {
      setNewProduct({
        ...newProduct,
        tags: [...newProduct.tags, newProduct.tagInput.trim()],
        tagInput: '',
      });
    }
  };

  const handleRemoveTag = (index) => {
    setNewProduct({
      ...newProduct,
      tags: newProduct.tags.filter((_, i) => i !== index),
    });
  };

  // Add a state for previews at the top of your component
  const [newImagePreviews, setNewImagePreviews] = useState([]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    // 1. Accumulate the actual File objects for the backend
    setNewProduct(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));

    // 2. Accumulate preview URLs for the UI
    const newUrls = files.map(file => URL.createObjectURL(file));
    setNewImagePreviews(prev => [...prev, ...newUrls]);
  };

  // Function to remove a NEWLY selected image before uploading
  const removeNewImage = (index) => {
    setNewProduct(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = (index) => {
    const imageToRemove = existingImages[index];
    setRemovedImages([...removedImages, imageToRemove]);
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    // Standard Fields
    formData.append('name', newProduct.name);
    formData.append('category', newProduct.category);
    formData.append('description', newProduct.description);
    formData.append('price', newProduct.price);
    formData.append('weight', newProduct.weight);
    formData.append('unit', newProduct.unit);
    formData.append('stock', newProduct.stock);

    // JSON Fields
    formData.append('tags', JSON.stringify(newProduct.tags));
    formData.append('existingImages', JSON.stringify(existingImages));
    formData.append('removedImages', JSON.stringify(removedImages));

    // New Image Files
    for (const image of newProduct.images) {
      formData.append('images', image);
    }

    try {
      if (editingProduct) {
        await updateProduct(editingProduct._id, formData);
      } else {
        await createProduct(formData);
      }
      // --- THE FIX: RESET LOCAL STATES ---
      setNewImagePreviews([]); // Clears the "New" tag previews
      setNewProduct(prev => ({ ...prev, images: [] })); // Clears the file buffer
      fetchProducts();
      closeModal();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(id);
        fetchProducts();
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  return (
    <Box p={5}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={5}>
        <Text fontSize="2xl" fontWeight="bold">Dry Fruit Management</Text>

        <HStack spacing={4}>
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            w="300px"
          />
          <Select
            placeholder="All Categories"
            onChange={(e) => { setFilter(e.target.value); setPage(1); }}
            w="200px"
          >
            {categories?.map((cat) => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </Select>
          <Button colorScheme="teal" onClick={openAddModal}>Add Product</Button>
        </HStack>
      </Box>

      <Table variant="simple" bg="white" shadow="sm" borderRadius="lg">
        <Thead>
          <Tr>
            <Th>Product</Th>
            <Th>Category</Th>
            <Th>Weight & Price</Th>
            <Th>Stock</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {products.map((product) => (
            <Tr key={product._id}>
              <Td>
                <HStack>
                  <Image
                    src={`${process.env.REACT_APP_API_URL}uploads${product.images[0]}`}
                    boxSize="50px" objectFit="cover" borderRadius="md"
                    fallbackSrc="https://via.placeholder.com/50"
                  />
                  <Box>
                    <Text fontWeight="bold">{product.name}</Text>
                    <Text fontSize="xs" color="gray.500">{product.tags.join(', ')}</Text>
                  </Box>
                </HStack>
              </Td>
              <Td>{product.category?.name}</Td>
              <Td>
                <Badge colorScheme="purple">{product.weight} {product.unit}</Badge>
                <Text fontWeight="bold" mt={1}>₹{product.price}</Text>
              </Td>
              <Td>
                <Badge colorScheme={product.stock > 10 ? "green" : "red"}>
                  {product.stock} units
                </Badge>
              </Td>
              <Td>
                <ButtonGroup size="sm" isAttached variant="outline">
                  <Button onClick={() => openEditModal(product)}><EditIcon color="blue.500" /></Button>
                  <Button onClick={() => handleDelete(product._id)}><DeleteIcon color="red.500" /></Button>
                </ButtonGroup>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <HStack justifyContent="center" mt={6} pb={10}>
        <Button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          isDisabled={page === 1}
        >
          Previous
        </Button>
        <Text>Page {page} of {totalPages}</Text>
        <Button
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          isDisabled={page === totalPages}
        >
          Next
        </Button>
      </HStack>

      <Modal isOpen={isModalOpen} onClose={closeModal} size="xl">
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={handleSubmitProduct}>
            <ModalHeader>{editingProduct ? "Update Product" : "New Dry Fruit Pack"}</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <Stack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Product Name</FormLabel>
                  <Input name="name" value={newProduct.name} onChange={handleInputChange} placeholder="e.g. Premium Cashews" />
                </FormControl>

                <HStack>
                  <FormControl isRequired>
                    <FormLabel>Category</FormLabel>
                    <Select name="category" value={newProduct.category} onChange={handleInputChange} placeholder="Select">
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Price (₹)</FormLabel>
                    <Input name="price" type="number" value={newProduct.price} onChange={handleInputChange} />
                  </FormControl>
                </HStack>

                <HStack>
                  <FormControl isRequired>
                    <FormLabel>Weight</FormLabel>
                    <Input name="weight" type="number" value={newProduct.weight} onChange={handleInputChange} />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Unit</FormLabel>
                    <Select name="unit" value={newProduct.unit} onChange={handleInputChange}>
                      <option value="g">Grams (g)</option>
                      <option value="kg">Kilograms (kg)</option>
                    </Select>
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Stock</FormLabel>
                    <Input name="stock" type="number" value={newProduct.stock} onChange={handleInputChange} />
                  </FormControl>
                </HStack>

                <FormControl>
                  <FormLabel>Description</FormLabel>
                  <Input name="description" value={newProduct.description} onChange={handleInputChange} />
                </FormControl>

                <FormControl>
                  <FormLabel>Tags</FormLabel>
                  <HStack>
                    <Input value={newProduct.tagInput} onChange={(e) => setNewProduct({ ...newProduct, tagInput: e.target.value })} placeholder="Health, Keto, Roasted" />
                    <Button onClick={handleAddTag} colorScheme="blue">Add</Button>
                  </HStack>
                  <HStack mt={2} flexWrap="wrap">
                    {newProduct.tags.map((tag, i) => (
                      <Badge key={i} colorScheme="teal" display="flex" alignItems="center" px={2} py={1}>
                        {tag} <Box as="span" ml={2} cursor="pointer" onClick={() => handleRemoveTag(i)}>&times;</Box>
                      </Badge>
                    ))}
                  </HStack>
                </FormControl>

                <FormControl>
                  <FormLabel>Manage Images (Existing + New)</FormLabel>
                  <HStack spacing={4} mb={4} flexWrap="wrap">

                    {/* --- SECTION 1: EXISTING IMAGES (From Server) --- */}
                    {existingImages.map((img, i) => (
                      <Box key={`existing-${i}`} position="relative" border="1px solid #E2E8F0" p={1} borderRadius="md">
                        <Image
                          src={`${process.env.REACT_APP_API_URL}uploads${img}`}
                          boxSize="80px" objectFit="cover" borderRadius="md"
                        />
                        <IconButton
                          size="xs" colorScheme="red" icon={<DeleteIcon />}
                          position="absolute" top="-2" right="-2" borderRadius="full"
                          onClick={() => handleRemoveExistingImage(i)}
                          aria-label="Remove existing image"
                        />
                        <Text fontSize="10px" textAlign="center" color="gray.500">Existing</Text>
                      </Box>
                    ))}

                    {/* --- SECTION 2: NEW IMAGES (Local Previews) --- */}
                    {newImagePreviews.map((url, i) => (
                      <Box key={`new-${i}`} position="relative" border="2px dashed #319795" p={1} borderRadius="md">
                        <Image
                          src={url}
                          boxSize="80px" objectFit="cover" borderRadius="md"
                        />
                        <IconButton
                          size="xs" colorScheme="orange" icon={<DeleteIcon />}
                          position="absolute" top="-2" right="-2" borderRadius="full"
                          onClick={() => removeNewImage(i)}
                          aria-label="Remove new image"
                        />
                        <Text fontSize="10px" textAlign="center" color="teal.500">New</Text>
                      </Box>
                    ))}
                  </HStack>

                  <Input type="file" multiple onChange={handleFileChange} accept="image/*" />
                  <Text fontSize="xs" mt={2} color="gray.500">
                    Total images after save: {existingImages.length + newProduct.images.length}
                  </Text>
                </FormControl>

                <Button colorScheme="teal" type="submit" width="full">
                  {editingProduct ? "Save Changes" : "Create Product"}
                </Button>
              </Stack>
            </ModalBody>
          </form>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ProductManagement;