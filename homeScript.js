async function fetchProducts() {
  try {
    const response = await fetch("http://localhost:8001/api/v1/products");
    const data = await response.json();
    return data.data; // Adjusted to match the new data structure
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
}
// document.addEventListener("
// contextmenu", (event) => {
//   event.preventDefault();
// });

async function fetchCarts() {
  try {
    const response = await fetch("http://localhost:8001/api/v1/carts");
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
    const cartItem = myCart.find((item) => item.productId === product._id);
    const isInCart = cartItem !== undefined;
    const canAddMore = isInCart ? cartItem.count < product.stock : true;
    let buttonLabel = isInCart
      ? canAddMore
        ? "Add More"
        : "Out of Stock"
      : "Add to Cart";
    const isButtonDisabled = !canAddMore;

    // Create a wrapper for each product
    const productCard = document.createElement("div");
    productCard.className = "group";

    // Create the image container
    const imgContainer = document.createElement("div");
    imgContainer.className =
      "relative aspect-h-1 aspect-w-1 w-full h-64 overflow-hidden rounded-lg bg-gray-200 xl:aspect-h-8 xl:aspect-w-7";
    const img = document.createElement("img");
    img.src = product.thumbnail;
    img.alt = `Image of ${product.title}`;
    img.className =
      "h-full w-full object-cover object-center group-hover:opacity-75";
    imgContainer.appendChild(img);

    // Create the product number element
    const productNum = document.createElement("div");
    productNum.className =
      "absolute top-2 left-2 w-8 h-8 flex items-center justify-center rounded-full bg-gray-700 text-white text-sm font-semibold";
    productNum.textContent = product.productNumber;
    imgContainer.appendChild(productNum);

    // Create the text and button section
    const textContainer = document.createElement("div");
    textContainer.className = "w-full justify-between items-center";
    const title = document.createElement("h3");
    title.className =
      "mt-4 text-md text-gray-700 text-xl font-sans font-semibold text-left";
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
      "w-full rounded-full bg-orange-400 mt-4 p-2 flex items-center justify-center space-x-2 disabled:bg-orange-200";
    button.innerHTML = `<img src="assets/Cart1.png" alt="Cart" class="w-5 h-5"/><span class="mx-8 font-semibold">${buttonLabel}</span>`;
    button.onclick = async () => {
      button.disabled = true; // Disable the button before starting the operation
      await addtoCart(product, button).finally(() => {
        button.disabled = false; // Re-enable the button after the operation is complete
      }); // Wait for the async operation to complete
    };

    button.disabled = isButtonDisabled; // Disable button if count meets or exceeds stock

    // Append all elements to the product card
    productCard.append(imgContainer, textContainer, button);
    productContainer.appendChild(productCard);
  });
}

async function renderCategories() {
  const categories = ["beverage", "snacks", "chocolate"];
  const categoryButtonsContainer = document.getElementById("category-buttons");

  // Clear existing category buttons
  categoryButtonsContainer.innerHTML = "";

  // Create an "All Products" button
  const allButton = document.createElement("button");
  let isActive = category === "";
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
  const tingSound = document.getElementById("add-to-cart-sound");

  // Add-to-cart logic here
  try {
    fetch(`http://localhost:8001/api/v1/carts/${product._id}`, {
      // Use _id instead of id
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        tingSound.play();

        // Update the button dynamically
        updateButtonAfterAdd(product, button, data.count);

        // Decrease the stock value of the product by 1
        const productToUpdate = products.find((p) => p._id === product._id);
        if (productToUpdate && productToUpdate.stock) {
          productToUpdate.stock -= 1;
          renderProducts();
        } else {
          console.log("No stock left for this product.");
        }
      });
  } catch (error) {
    console.log(error.message);
  }
}

function updateButtonAfterAdd(product, button, count) {
  if (product.stock !== 0) {
    button.innerHTML = `<img src="assets/Cart1.png" alt="Cart" class="w-5 h-5"/><span class="mx-8 font-semibold">Out of Stock</span>`;
    button.disabled = true;
  } else {
    button.innerHTML = `<img src="assets/Cart1.png" alt="Cart" class="w-5 h-5"/><span class="mx-8 font-semibold">Add More</span>`;
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

// Keypad

function openKeypad() {
  const keypadModal = document.getElementById("keypadModal");
  keypadModal.classList.remove("translate-y-full");
  keypadModal.classList.add("translate-y-0");
}

function closeKeypad() {
  const keypadModal = document.getElementById("keypadModal");
  keypadModal.classList.remove("translate-y-0");
  keypadModal.classList.add("translate-y-full");
}

// Initialize keypad
document.addEventListener("DOMContentLoaded", function () {
  const keypadContainer = document.getElementById("keypadContainer");
  const inputBar = document.getElementById("inputBar");
  const closeKeypadButton = document.getElementById("closeKeypad");

  // Create buttons for the keypad
  for (let i = 1; i <= 9; i++) {
    createButton(i);
  }
  createButton(""); // Placeholder for alignment
  createButton(0);
  createDeleteButton(); // Add delete button

  function createButton(number) {
    const button = document.createElement("button");
    button.className =
      "bg-blue-500 text-white py-2 px-4 rounded-full text-xl h-16 w-16 flex items-center justify-center";
    if (number === "") {
      button.classList.add("visibility-none");
    }
    button.textContent = number;
    button.onclick = () => {
      if (number !== "") {
        inputBar.value += number;
        filterProductsByProductNumber(inputBar.value); // Filter products on each keystroke
      }
    };
    keypadContainer.appendChild(button);
  }

  function createDeleteButton() {
    const button = document.createElement("button");
    button.className =
      "bg-red-500 text-white py-2 px-4 rounded-full text-xl h-16 w-16 flex items-center justify-center";
    button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>`;
    button.onclick = () => {
      inputBar.value = inputBar.value.slice(0, -1);
      filterProductsByProductNumber(inputBar.value); // Filter products on each delete
    };
    keypadContainer.appendChild(button);
  }

  closeKeypadButton.onclick = closeKeypad;
});

// Function to filter products based on productNumber field
function filterProductsByProductNumber(number) {
  // Check if myProducts is populated
  if (!Array.isArray(myProducts)) {
    console.error("myProducts is not an array or is not initialized.");
    return;
  }

  // Check if the products array is being updated
  products = myProducts.filter((product) =>
    product.productNumber.toString().includes(number),
  );

  // Debug filtered products
  console.log("Filtered products:", products);

  renderProducts();
}
