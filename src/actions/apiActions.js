import axios from "axios";

const baseURL = `${process.env.REACT_APP_API_URL}api`;

const instance = axios.create({
    baseURL: baseURL,
    withCredentials: true,
});

export async function login(email, password) {
    try {
        const response = await instance.post("/auth/adminLogin", {
            email,
            password
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}

export async function logout() {
    try {
        const response = await instance.post("/auth/logout");
        return response.data;
    } catch (error) {
        throw error;
    }
}

export async function getAllCategories() {
    try {
        console.log('instance', baseURL);
        const response = await instance.get("/categories");
        return response.data;
    } catch (error) {
        throw error;
    }
}

export async function updateCategory(selectedCategoryId, formDataForBackend) {
    try {
        const response = await instance.put(`/categories/${selectedCategoryId}`, formDataForBackend);

        console.log('newResponse:', response.data); // Check the response
        return response.data;
    } catch (error) {
        throw error; // Handle error as needed in your component
    }
}

export async function getAllProducts(category, search, page, limit) {
    try {
        const response = await instance.get("/products", {
            params: {
                category: category,
                search: search,
                page: page,
                limit: limit
            }
        });
        return response.data;
    } catch (error) {
        console.error("API Error in getAllProducts:", error);
        throw error;
    }
}

export async function createProduct(newProduct) {
    try {
        const response = await instance.post("/products", newProduct);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export async function deleteProduct(id) {
    try {
        const response = await instance.delete(`/products/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export async function updateProduct(selectedProductId, formData) {
    try {
        const response = await instance.put(`/products/${selectedProductId}`, formData, {
            // headers: {
            //     'Content-Type': 'multipart/form-data', // Ensure you're sending FormData
            // },
        });
        return response.data;
    } catch (error) {
        throw error; // Handle error as needed in your component
    }
}

export async function getAllInquiries() {
    try {
        const response = await instance.get("/inquiry/all");
        return response.data;
    } catch (error) {
        throw error;
    }
}

// FETCH: Get all orders globally (Admin only)
// FETCH: Get all orders globally with filters
export const getAdminAllOrders = async (page = 1, limit = 10, filters = {}) => {
    try {
        const params = {
            page,
            limit,
            search: filters.search || undefined, // undefined prevents empty strings from cluttering the URL
            startDate: filters.startDate || undefined,
            endDate: filters.endDate || undefined
        };

        const response = await instance.get('/order/adminallorders', { params });
        return response;
    } catch (error) {
        console.error("Admin API Error [getAdminAllOrders]:", error.response?.data || error.message);
        throw error;
    }
};

// FETCH: Get ALL orders without pagination for Excel
export const getAdminExportAllOrders = async () => {
    try {
        // We pass a very high limit to get everything in one go
        const params = { limit: 10000, page: 1 };
        const response = await instance.get('/order/adminallorders', { params });
        return response;
    } catch (error) {
        console.error("Export Error:", error.response?.data || error.message);
        throw error;
    }
};

// UPDATE: Change the status of a specific order (Admin only)
export const updateOrderStatus = async (id, statusData) => {
    try {
        // statusData should be an object like { status: "shipped" }
        const response = await instance.put(`/order/admin/order/${id}`, statusData);
        return response;
    } catch (error) {
        console.error("Admin API Error [updateOrderStatus]:", error.response?.data || error.message);
        throw error;
    }
};

// dashboard api's
// Fetch aggregated stats (Revenue, Counts, Inventory Alerts)
export const getDashboardData = async () => {
    try {
        const response = await instance.get('/v1/admin/dashboard-stats');
        return response;
    } catch (error) {
        console.error("Dashboard API Error:", error.response?.data || error.message);
        throw error;
    }
};


// coupon section api's
// 1. Create a New Coupon
// 1. Create a New Coupon
export const createCoupon = async (couponData) => {
    try {
        // Removed /v1 to match your adminRoutes.js
        const { data } = await instance.post('/v1/coupons/new', couponData);
        return data;
    } catch (error) {
        throw error.response?.data?.message || "Error creating coupon";
    }
};

// 2. Get All Coupons
export const getAllCoupons = async () => {
    try {
        // Removed /v1
        const { data } = await instance.get('/v1/coupons/all');
        return data.coupons;
    } catch (error) {
        throw error.response?.data?.message || "Error fetching coupons";
    }
};

// 3. Update a Coupon
export const updateCoupon = async (id, updatedData) => {
    try {
        // Removed /v1
        const { data } = await instance.put(`/v1/coupons/${id}`, updatedData);
        return data;
    } catch (error) {
        throw error.response?.data?.message || "Error updating coupon";
    }
};

// 4. Delete a Coupon
export const deleteCoupon = async (id) => {
    try {
        // Removed /v1
        const { data } = await instance.delete(`/v1/coupons/${id}`);
        return data;
    } catch (error) {
        throw error.response?.data?.message || "Error deleting coupon";
    }
};