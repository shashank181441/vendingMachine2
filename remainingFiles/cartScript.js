const products = [
    {
        id: 1,
        name: 'Earthen Bottle',
        href: '#',
        price: 48,
        imageSrc: 'https://tailwindui.com/img/ecommerce-images/category-page-04-image-card-01.jpg',
        imageAlt: 'Tall slender porcelain bottle with natural clay textured body and cork stopper.',
        quantity: 1
    },
    {
        id: 2,
        name: 'Nomad Tumbler',
        href: '#',
        price: 35,
        imageSrc: 'https://tailwindui.com/img/ecommerce-images/category-page-04-image-card-02.jpg',
        imageAlt: 'Olive drab green insulated bottle with flared screw lid and flat top.',
        quantity: 1
    }
];

let deletedProduct = {}
let timeout = 5000

function updateCart() {
    const cartItems = document.getElementById('cart-items');
    cartItems.innerHTML = ''; // Clear existing items

    let subtotal = 0;

    products.forEach(product => {
        subtotal += product.price * product.quantity;

        const li = document.createElement('li');
        li.className = 'flex py-6';
        li.innerHTML = `
            <div class="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                <img alt="${product.imageAlt}" src="${product.imageSrc}" class="h-full w-full object-cover object-center" />
            </div>
            <div class="ml-4 flex flex-1 flex-col">
                <div>
                    <div class="flex justify-between text-base font-medium text-gray-900">
                        <h3><a href="${product.href}">${product.name}</a></h3>
                        <p class="ml-4">Rs. ${product.quantity * product.price}</p>
                    </div>
                </div>
                <div class="flex flex-1 items-end justify-between text-sm">
                    <p class="text-gray-500">Qty ${product.quantity}</p>
                    <div class="flex pl-8">
                        <button class='cursor-pointer px-3 py-1 text-2xl rounded-full mx-3' onclick="changeQuantity(${product.id}, 1)">+</button>
                        <button class='cursor-pointer px-3 py-1 text-2xl rounded-full mx-3' onclick="changeQuantity(${product.id}, -1)">-</button>
                    </div>
                    <div class="flex">
                        <button type="button" class="font-medium text-indigo-600 hover:text-indigo-500" onclick="removeItem(${product.id})">
                            Remove
                        </button>
                    </div>
                </div>
            </div>
        `;
        cartItems.appendChild(li);
    });

    document.getElementById('subtotal').innerText = `Rs. ${subtotal}`;
}

function changeQuantity(productId, change) {
    const product = products.find(p => p.id === productId);
    if (product) {
        product.quantity += change;
        if (product.quantity < 1) product.quantity = 1; // Prevent negative quantity
        updateCart();
    }
}


const undoButton = document.getElementById("undo")

function removeItem(productId) {
    const productIndex = products.findIndex(p => p.id === productId);
    if (productIndex > -1) {
        deletedProduct = products.splice(productIndex, 1);
        console.log(deletedProduct[0])
        updateCart();
        undoButton.classList.add("block");
        undoButton.classList.remove("hidden");
        setTimeout(function(){
            undoButton.classList.add("hidden");
            undoButton.classList.remove("block");
        deletedProduct=[]
        }, 2000)
    }
}

function undoDelete(){
    products.push(deletedProduct[0])
    console.log(products)
    deletedProduct=[]
    undoButton.classList.add("hidden");
    undoButton.classList.remove("block");
    updateCart();
}

// Initial render
updateCart();

function checkout() {
    alert('Proceeding to checkout...');
}