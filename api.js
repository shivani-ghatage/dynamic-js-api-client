
const API_URL = "https://fakestoreapi.com/products";

export async function fetchProducts() {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }

    const products = await response.json();

    if (!Array.isArray(products)) {
      throw new Error("Invalid product data received");
    }

    return products;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}
