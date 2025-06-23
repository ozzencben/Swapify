import api from "./api";

export const getProducts = async (params = {}) => {
  const response = await api.get("products/items/", { params });
  return response.data;
};

export const getProductById = async (id) => {
  const response = await api.get(`products/items/${id}/`);
  return response.data;
};

export const getMyProducts = () => api.get("/products/items/myproducts/");

export const createProduct = async (productData) => {
  const response = await api.post("products/items/", productData);
  return response.data;
};

export const updateProduct = async (id, productData) => {
  const response = await api.put(`products/items/${id}/`, productData);
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await api.delete(`products/items/${id}/`);
  return response.data;
};

export const uploadProductImage = async (productId, imageUri) => {
  const formData = new FormData();
  formData.append("image", {
    uri: imageUri,
    name: `image-${Date.now()}.jpg`,
    type: "image/jpeg",
  });

  const response = await api.post(
    `products/items/${productId}/upload_image/`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

export const getCategories = async () => {
  const response = await api.get("products/categories/");
  return response.data;
};
