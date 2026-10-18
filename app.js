
import { fetchProducts } from "./api.js";

// Get HTML elements
const productGrid = document.getElementById("productGrid");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const sortFilter = document.getElementById("sortFilter");
const statusMessage = document.getElementById("status");
const cartCount = document.getElementById("cartCount");

// Store application data
let products = [];
let cart = [];

let searchText = "";
let selectedCategory = "all";
let sortOption = "default";

// Load saved cart safely
try {
  const savedCart = JSON.parse(
    localStorage.getItem("productCart") || "[]"
  );

  if (Array.isArray(savedCart)) {
    cart = savedCart.filter(
      item =>
        Number.isInteger(item.id) &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0
    );
  }
} catch {
  cart = [];
}

// Save cart and update counter
function updateCart() {
  const totalItems = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  cartCount.textContent = `Cart items: ${totalItems}`;

  try {
    localStorage.setItem("productCart", JSON.stringify(cart));
  } catch (error) {
    console.error("Could not save cart:", error);
  }
}

// Add product to cart
function addToCart(productId) {
  const existingItem = cart.find(
    item => item.id === productId
  );

  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push({ id: productId, quantity: 1 });
  }

  updateCart();
}

// Create category dropdown options
function setupCategories() {
  const categories = [
    ...new Set(products.map(product => product.category))
  ];

  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.append(option);
  });
}

// Search, filter, and sort products
function getVisibleProducts() {
  let result = products.filter(product => {
    const matchesSearch = product.title
      .toLowerCase()
      .includes(searchText.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" ||
      product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  if (sortOption === "low-high") {
    result.sort((a, b) => a.price - b.price);
  } else if (sortOption === "high-low") {
    result.sort((a, b) => b.price - a.price);
  } else if (sortOption === "name") {
    result.sort((a, b) => a.title.localeCompare(b.title));
  }

  return result;
}

// Display product cards
function renderProducts() {
  const visibleProducts = getVisibleProducts();

  productGrid.replaceChildren();

  if (visibleProducts.length === 0) {
    statusMessage.textContent = "No matching products found.";
    return;
  }

  statusMessage.textContent =
    `Showing ${visibleProducts.length} products`;

  visibleProducts.forEach(product => {
    const card = document.createElement("article");
    card.className = "product-card";

    const image = document.createElement("img");

image.src = product.image;
image.alt = product.title;
image.loading = "lazy";
image.decoding = "async";
image.width = 200;
image.height = 200;
image.style.objectFit = "contain";
    const title = document.createElement("h2");
    title.textContent = product.title;

    const category = document.createElement("p");
    category.textContent = product.category;

    const price = document.createElement("p");
    price.className = "price";
    price.textContent = `$${product.price.toFixed(2)}`;

    const button = document.createElement("button");
    button.textContent = "Add to Cart";
    button.addEventListener("click", () => {
      addToCart(product.id);
    });

    card.append(image, title, category, price, button);
    productGrid.append(card);
  });
}

// Load products from API
async function initializeApp() {
  statusMessage.textContent = "Loading products...";

  try {
    products = await fetchProducts();
    setupCategories();
    renderProducts();
  } catch (error) {
    console.error("Loading error:", error);

    statusMessage.textContent =
      "Unable to load products. Please try again later.";
  }

  updateCart();
}

// Listen for user interactions
searchInput.addEventListener("input", event => {
  searchText = event.target.value.trim();
  renderProducts();
});

categoryFilter.addEventListener("change", event => {
  selectedCategory = event.target.value;
  renderProducts();
});

sortFilter.addEventListener("change", event => {
  sortOption = event.target.value;
  renderProducts();
});

// Start the application
initializeApp();
