async function fetchProducts() {
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

let products = [];
let deletedProduct = {};
const timeout = 5000;
const undoButton = document.getElementById("undo");

// Function to format price to two decimal places
function formatPrice(price) {
    return price.toFixed(2);
}


// Update cart display
async function updateCart() {
    const cartItems = document.getElementById('cart-items');
    cartItems.innerHTML = ''; // Clear existing items

    let subtotal = 0;

    products.forEach(product => {
        const itemTotal = product.productDetails.price * product.count;
        subtotal += itemTotal;

        const li = document.createElement('li');
        li.className = 'flex py-6';
        li.innerHTML = `
            <div class="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                <img alt="${product.productDetails.title}" src="${product.productDetails.thumbnail}" class="h-full w-full object-cover object-center" />
            </div>
            <div class="ml-4 flex flex-1 flex-col">
                <div>
                    <div class="flex justify-between text-base font-medium text-gray-900">
                        <h3><a href="#">${product.productDetails.title}</a></h3>
                        <p class="ml-4">Rs. ${formatPrice(itemTotal)}</p>
                    </div>
                </div>
                <div class="flex flex-1 items-end justify-between text-sm">
                    <p class="text-gray-500">Qty ${product.count}</p>
                    <div class="flex pl-8">
                        <button class='cursor-pointer px-3 py-1 text-2xl rounded-full mx-3' onclick="changeQuantity('${product._id}', 1)">+</button>
                        <button class='cursor-pointer px-3 py-1 text-2xl rounded-full mx-3' onclick="changeQuantity('${product._id}', -1)">-</button>
                    </div>
                    <div class="flex">
                        <button type="button" class="font-medium text-indigo-600 hover:text-indigo-500" onclick="removeItem('${product._id}')">
                            Remove
                        </button>
                    </div>
                </div>
            </div>
        `;
        cartItems.appendChild(li);
    });

    document.getElementById('subtotal').innerText = `Rs. ${formatPrice(subtotal)}`;
}

// Change the quantity of a product
function changeQuantity(productId, change) {
    const product = products.find(p => p._id === productId);
    if (product) {
        product.count += change;
        if (product.count < 1) product.count = 1; // Prevent negative quantity
        updateCart();
    }
}

// Remove a product from the cart
function removeItem(cartId) {
    fetch(`http://localhost:8001/api/v1/carts/${cartId}`, {
      method: "DELETE",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    })
    .then((res) => res.json())
    .then(console.log)
    .then(() => {
      const productIndex = products.findIndex(p => p._id === cartId);
      if (productIndex > -1) {
        deletedProduct = products.splice(productIndex, 1)[0]; // Correctly assign removed product
        console.log(deletedProduct);
        updateCart();
        // showUndoButton();
      }
    })
    .catch(error => console.error("Failed to remove product:", error));
  }
  
  
      

// Initialize the cart
async function initializeCart() {
    products = await fetchProducts();
    updateCart();
    const checkoutButton = document.getElementById("checkoutButton")
      if(products?.length == 0){
          checkoutButton.disabled = true
      }
}

// Setup event listeners and initialize
document.addEventListener("DOMContentLoaded", () => {
    initializeCart();
    undoButton.addEventListener("click", undoDelete);
});

function checkout() {
    window.location.href = 'checkout.html';
}

