// ProductPage.js
import React, { useState, useEffect } from 'react';
import { Box, Heading, Table, Thead, Tbody, Tr, Th, Td, Spinner, Image, HStack, VStack, IconButton, ButtonGroup, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, Stack, FormControl, FormLabel, Input, Select } from '@chakra-ui/react';
import { EditIcon, DeleteIcon } from '@chakra-ui/icons'
import axios from 'axios';
import { getAllCategories, updateCategory } from '../actions/apiActions';

const Category = () => {
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState([]);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [imageList, setImageList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: null, // ONLY for new upload
  });


  const fetchCategories = async () => {
    try {
      // const response = await axios.get('http://localhost:5000/api/categories');
      const response = await getAllCategories();
      setCategory(response);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    const urls = files.map((file) => URL.createObjectURL(file));
    setImageList((prevImages) => [...prevImages, ...urls]);

    // Use functional update to correctly update the image array
    setFormData((prevFormData) => ({ ...prevFormData, image: [...(prevFormData.image || []), ...files] }));

    // Log the values directly from state
    console.log('imageList:', [...imageList, ...urls]);
    console.log('formData:', { ...formData, image: [...(formData.image || []), ...files] });
  };



  const removeImage = (index) => {
    const newImageList = [...imageList];
    newImageList.splice(index, 1);
    setImageList(newImageList);

    const newFiles = [...formData.image];
    newFiles.splice(index, 1);
    setFormData({ ...formData, image: newFiles });
  };

  const openEditModal = (category) => {
    setEditModalOpen(true);
    setSelectedCategory(category);

    setFormData({
      name: category.name,
      description: category.description,
      image: null, // user hasn't selected new image yet
    });
  };


  const closeEditModal = () => {
    setEditModalOpen(false);
    setSelectedCategory(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
      const formDataForBackend = new FormData();

      formDataForBackend.append("name", formData.name);
      formDataForBackend.append("description", formData.description);

      // ONLY send image if user selected a new one
      if (formData.image) {
        formDataForBackend.append("image", formData.image);
      }

      await updateCategory(selectedCategory._id, formDataForBackend);

      closeEditModal();
      fetchCategories();
    } catch (error) {
      console.error("Error updating category:", error);
    }
  };


  // const fetchCategory = async () => {
  //   try {
  //     const response = await axios.get('http://localhost:4000/admin/category' 
  //       // ,{
  //       //   withCredentials: true,
  //       // }
  //     );

  //     setCategory(response.data);
  //     console.log(response.data)
  //     setLoading(false);
  //   } catch (error) {
  //     console.error('Error fetching products:', error);
  //     setLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   fetchCategory();
  // }, []);

  const openAddModal = () => {
    setAddModalOpen(true);
    // Clear the form data when opening the add modal
    setFormData({
      name: '',
      image: '',
      description: ''
    });
  };


  const closeAddModal = () => {
    setAddModalOpen(false);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();

    try {
      const formDataForBackend = new FormData();
      for (const key in formData) {
        if (key === 'image') {
          // Append each image separately to the FormData
          formData[key].forEach((image) => {
            formDataForBackend.append('image', image);
          });
        } else {
          formDataForBackend.append(key, formData[key]);
        }
      }
      console.log('FormData for Backend:', formDataForBackend);
      const response = await axios.post('http://localhost:5000/api/categories', formDataForBackend, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log(response.data); // You can handle the response as needed

      // After successful submission, close the modal and fetch updated product list
      closeAddModal();
      fetchCategories();
    } catch (error) {
      console.error('Error adding category:', error);
      // Handle the error, e.g., show an error message
    }
  };

  const handleCategorytDelete = async (categoryId) => {
    try {
      const response = await fetch(`http://localhost:4000/admin/deletecategory/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Product deleted successfully
        setCategory(category.filter(category => category._id !== categoryId));
      } else {
        const data = await response.json();
        console.error(data.message);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  return (
    <Box p={4}>
      <Box display={'flex'} justifyContent={'space-between'}>
        <Heading mb={4}>Category Management</Heading>
        <Button color={'blueviolet'} onClick={() => openAddModal()}><EditIcon />Add Category</Button>
      </Box>

      {loading ? (
        <Spinner size="xl" />
      ) : (
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Sr.No.</Th>
              <Th>Name</Th>
              <Th>Preview</Th>
              <Th>Description</Th>
              <Th>Function</Th>

              {/* Add more columns as needed */}
            </Tr>
          </Thead>
          <Tbody>
            {category.map((category, index) => (
              <Tr key={category._id}>
                <Td>{index + 1}</Td>
                <Td>{category.name}</Td>
                <Td><Image borderRadius={5} src={`http://localhost:5000/uploads${category.image[0]}`} height={'60px'} width={'80px'} /></Td>
                <Td>{category.description}</Td>
                <Td>
                  <ButtonGroup>
                    <Button color={'blueviolet'} onClick={() => openEditModal(category)}><EditIcon /></Button>
                    <Button color={'red'} onClick={() => handleCategorytDelete(category._id)}><DeleteIcon /></Button>
                  </ButtonGroup>
                </Td>
                {/* Add more columns as needed */}
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}



      {/* Add Modal */}
      {isAddModalOpen && (
        <Modal isOpen={isAddModalOpen} onClose={closeAddModal}>
          <ModalOverlay />
          <ModalContent width="50%">
            <ModalHeader>Add Product</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <form onSubmit={handleAddSubmit}>
                <Stack spacing={4}>
                  {/* Add input fields for adding product details */}
                  <FormControl>
                    <FormLabel>Name</FormLabel>
                    <Input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Description</FormLabel>
                    <Input
                      type="text"
                      name="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </FormControl>


                  <FormControl>
                    <FormLabel>Images</FormLabel>
                    <Input type="file" name="image" onChange={handleImageChange} multiple />
                  </FormControl>

                  <HStack spacing={4} mt={4}>
                    {imageList.map((image, index) => (
                      <VStack key={index} spacing={3}>
                        <Image src={image} boxSize="70px" objectFit="cover" borderRadius="lg" />
                        <IconButton
                          size="xs"
                          variant="outline"
                          colorScheme="red"
                          icon={<DeleteIcon />}
                          onClick={() => removeImage(index)}
                        />
                      </VStack>
                    ))}
                  </HStack>

                  <Button type="submit">Add Category</Button>
                </Stack>
              </form>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}

      {/* Edit Modal */}
      {/* Edit Modal */}
      {isEditModalOpen && (
        <Modal isOpen={isEditModalOpen} onClose={closeEditModal}>
          <ModalOverlay />
          <ModalContent width="50%">
            <ModalHeader>Edit Category</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <form onSubmit={handleEditSubmit}>
                <Stack spacing={4}>
                  <FormControl>
                    <FormLabel>Name</FormLabel>
                    <Input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Description</FormLabel>
                    <Input
                      type="text"
                      name="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </FormControl>

                  <FormControl>
                    {/* <FormLabel>Current Image</FormLabel> */}
                    {selectedCategory?.image?.length > 0 && (
                      <Image
                        src={`http://localhost:5000/uploads${selectedCategory.image[0]}`}
                        boxSize="100px"
                        objectFit="cover"
                        borderRadius="md"
                        mb={3}
                      />
                    )}
                  </FormControl>

                  <FormControl>
                    <FormLabel>Replace Image</FormLabel>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setFormData({ ...formData, image: e.target.files[0] })
                      }
                    />
                  </FormControl>


                  <Button type="submit">Update Category</Button>
                </Stack>
              </form>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}




    </Box>
  );
};

export default Category;
