async function fetchProducts() {
  try {
    const response = await fetch('http://localhost:8001/api/v1/products');
    const data = await response.json();
    return data.data; // Adjusted to match the new data structure
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
}

async function fetchCarts() {
  try {
    const response = await fetch('http://localhost:8001/api/v1/carts');
    const data = await response.json();
    console.log(data.data);
    return data.data;
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
}

let category = "";
let myProducts = [];
let products = [];
let myCart = [];

async function renderProducts() {
  const productContainer = document.getElementById("product-container");

  // Clear existing products
  productContainer.innerHTML = "";

  products.forEach((product) => {
    // Find the product in the cart
    const cartItem = myCart.find(item => item.productId === product._id);
    const isInCart = cartItem !== undefined;
    const canAddMore = isInCart ? cartItem.count < product.stock : true;
    let buttonLabel = isInCart ? (canAddMore ? "Add More" : "Out of Stock") : "Add to Cart";
    const isButtonDisabled = !canAddMore;

    // Create a wrapper for each product
    const productCard = document.createElement("div");
    productCard.className = "group";

    // Create the image container
    const imgContainer = document.createElement("div");
    imgContainer.className =
      "aspect-h-1 aspect-w-1 w-full h-64 overflow-hidden rounded-lg bg-gray-200 xl:aspect-h-8 xl:aspect-w-7";
    const img = document.createElement("img");
    img.src = product.thumbnail;
    img.alt = `Image of ${product.title}`;
    img.className =
      "h-full w-full object-cover object-center group-hover:opacity-75";
    imgContainer.appendChild(img);

    // Create the text and button section
    const textContainer = document.createElement("div");
    textContainer.className = "w-full justify-between items-center";
    const title = document.createElement("h3");
    title.className =
      "mt-4 text-sm text-gray-700 text-xl font-sans font-semibold text-left";
    title.textContent = product.title;
    const priceAndQuantity = document.createElement("div");
    priceAndQuantity.className = "flex justify-between";
    const price = document.createElement("p");
    price.className = "mt-1 text-lg font-medium text-gray-900 font-mono";
    price.textContent = `Rs. ${product.price}`;
    const quantity = document.createElement("h5");
    quantity.className = "text-sm font-light mt-2 font-mono";
    quantity.textContent = `Qty: ${product.stock}`;
    priceAndQuantity.append(price, quantity);

    textContainer.append(title, priceAndQuantity);

    // Create the button
    const button = document.createElement("button");
    button.className =
      "w-full rounded-full bg-orange-400 mt-4 p-2 flex items-center justify-center space-x-2";
    button.innerHTML =
      `<img src="assets/Cart.png" alt="Cart" class="w-5 h-5"/><span class="mx-8 font-semibold">${buttonLabel}</span>`;
    button.onclick = () => addtoCart(product, button); // Pass the product and button to the function
    button.disabled = isButtonDisabled; // Disable button if count meets or exceeds stock

    // Append all elements to the product card
    productCard.append(imgContainer, textContainer, button);
    productContainer.appendChild(productCard);
  });
}

async function renderCategories() {
  const categories = ['beverage', 'snacks', 'chocolate'];
  const categoryButtonsContainer = document.getElementById("category-buttons");

  // Clear existing category buttons
  categoryButtonsContainer.innerHTML = "";

  // Create an "All Products" button
  const allButton = document.createElement("button");
  let isActive = category === ''
  allButton.className = `category-button ${!isActive ? "bg-gray-200" : "bg-orange-400"} rounded-full font-semibold py-2 px-4`;
  allButton.setAttribute("data-category", "");
  allButton.textContent = "All Products";
  allButton.onclick = () => sortByCat("");
  categoryButtonsContainer.appendChild(allButton);

  categories.forEach((cat) => {
    const button = document.createElement("button");
    const isActive = category === cat; // Compare the slug with the active category
    button.className = `category-button ${isActive ? "bg-orange-400" : "bg-gray-200"} rounded-full font-semibold py-2 px-4`;
    button.setAttribute("data-category", cat); // Use slug for comparison
    button.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    button.onclick = () => sortByCat(cat);
    categoryButtonsContainer.appendChild(button);
  });
}

async function initialize() {
  myProducts = await fetchProducts();
  myCart = await fetchCarts();
  console.log("myCart", myCart);
  products = myProducts;
  renderProducts();
  renderCategories();
  updateActiveButton(category); // Ensure the initial state is set
}

document.addEventListener("DOMContentLoaded", initialize);

function addtoCart(product, button) {
  // Play the "ting" sound
  const tingSound = document.getElementById('add-to-cart-sound');

  // Add-to-cart logic here
  try {
    fetch(`http://localhost:8001/api/v1/carts/${product._id}`, { // Use _id instead of id
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    })
      .then(res => res.json())
      .then(data => {
        console.log(data);
        tingSound.play();
        // Update the button dynamically
        updateButtonAfterAdd(product, button, data.count);
      });
  } catch (error) {
    console.log(error.message);
  }
}

function updateButtonAfterAdd(product, button, count) {
  if (count >= product.stock) {
    button.innerHTML = `<img src="assets/Cart.png" alt="Cart" class="w-5 h-5"/><span class="mx-8 font-semibold">Out of Stock</span>`;
    button.disabled = true;
  } else {
    button.innerHTML = `<img src="assets/Cart.png" alt="Cart" class="w-5 h-5"/><span class="mx-8 font-semibold">Add More</span>`;
    button.disabled = false;
  }
}

function sortByCat(mycategory) {
  category = mycategory;
  products = filterProducts(myProducts, category);
  renderProducts();

  // Update button styles
  updateActiveButton(category);
}

function filterProducts(products, category) {
  return category === ""
    ? products
    : products.filter((product) => product.category === category);
}

function updateActiveButton(activeCategory) {
  // Get all buttons
  const buttons = document.querySelectorAll(".category-button");

  buttons.forEach((button) => {
    // Get the category from the button's data attribute
    const buttonCategorySlug = button.getAttribute("data-category");

    // Update the button's background color based on the active category
    if (buttonCategorySlug === activeCategory) {
      button.classList.add("bg-orange-400");
      button.classList.remove("bg-gray-200");
    } else {
      button.classList.add("bg-gray-200");
      button.classList.remove("bg-orange-400");
    }
  });
}



