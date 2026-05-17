let activeDiscount = 0;
let appliedPromo = null;

document.addEventListener('DOMContentLoaded', () => {
    loadCart();
});

function loadCart() {
    let cart = JSON.parse(localStorage.getItem('glowcare_cart')) || [];
    
    // Seed some data if empty for testing
    if (cart.length === 0) {
        cart = [
            {
                id: 101,
                name: "Botanical Radiance Serum",
                price: 84.00,
                image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=400",
                size: "30ml",
                category: "Anti-Aging",
                quantity: 1
            },
            {
                id: 102,
                name: "Cloud Hydration Cream",
                price: 62.00,
                image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&q=80&w=400",
                size: "50ml",
                category: "Moisturizer",
                quantity: 1
            }
        ];
        localStorage.setItem('glowcare_cart', JSON.stringify(cart));
    }

    renderCart(cart);
}

function renderCart(cart) {
    const cartItemsContainer = document.getElementById('cart-items');
    const subtotalEl = document.getElementById('cart-subtotal');
    const taxEl = document.getElementById('cart-tax');
    const totalEl = document.getElementById('cart-total');
    
    if (!cartItemsContainer) return;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart animate-fade-in">
                <i class="bi bi-cart-x"></i>
                <h3>Your cart is empty</h3>
                <p class="text-muted">Explore our botanical rituals and find your glow.</p>
                <a href="/" class="continue-shopping">Back to Store</a>
            </div>
        `;
        subtotalEl.innerText = '$0.00';
        taxEl.innerText = '$0.00';
        totalEl.innerText = '$0.00';
        return;
    }

    let subtotal = 0;
    cartItemsContainer.innerHTML = '';

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        const itemHtml = `
            <div class="cart-card p-4 mb-4 animate-fade-in" style="animation-delay: ${index * 0.1}s">
                <div class="row align-items-center">
                    <div class="col-md-6 d-flex gap-4">
                        <img src="${item.image}" class="cart-item-img" alt="${item.name}">
                        <div class="d-flex flex-column justify-content-center">
                            <h6 class="item-title">${item.name}</h6>
                            <span class="item-meta">${item.size || 'Standard Size'} / ${item.category || 'Skincare'}</span>
                            <button class="remove-btn" onclick="removeItem(${item.id})">
                                <span class="material-symbols-outlined" style="font-size: 16px;">delete</span>
                                Remove
                            </button>
                        </div>
                    </div>
                    <div class="col-md-2 text-center">
                        <span class="text-muted d-block d-md-none">Price</span>
                        <span class="price-text">$${item.price}</span>
                    </div>
                    <div class="col-md-2 d-flex justify-content-center">
                        <div class="qty-control">
                            <button class="qty-btn" onclick="updateQty(${item.id}, -1)">-</button>
                            <span class="qty-val">${item.quantity}</span>
                            <button class="qty-btn" onclick="updateQty(${item.id}, 1)">+</button>
                        </div>
                    </div>
                    <div class="col-md-2 text-end">
                        <span class="text-muted d-block d-md-none">Subtotal</span>
                        <span class="price-text text-primary-custom">$${itemTotal.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        `;
        cartItemsContainer.insertAdjacentHTML('beforeend', itemHtml);
    });

    const tax = subtotal * 0.08; // 8% tax example
    const discountAmount = subtotal * activeDiscount;
    const total = subtotal + tax - discountAmount;

    subtotalEl.innerText = `$${subtotal.toFixed(2)}`;
    taxEl.innerText = `$${tax.toFixed(2)}`;
    totalEl.innerText = `$${total.toFixed(2)}`;

    // Update discount UI if applied
    const discountRow = document.getElementById('discount-row');
    const discountVal = document.getElementById('discount-val');
    if (discountRow && discountVal) {
        if (activeDiscount > 0) {
            discountRow.style.display = 'flex';
            discountVal.innerText = `-$${discountAmount.toFixed(2)} (${activeDiscount * 100}%)`;
        } else {
            discountRow.style.display = 'none';
        }
    }
}

function applyPromoCode() {
    const input = document.querySelector('.coupon-input');
    const code = input.value.trim().toLowerCase();

    if (code === 'skincare') {
        activeDiscount = 0.15; // 15% discount
        appliedPromo = 'skincare';
        alert('Promo code applied! You got a 15% discount.');
    } else {
        activeDiscount = 0;
        appliedPromo = null;
        alert('Invalid promo code.');
    }

    const cart = JSON.parse(localStorage.getItem('glowcare_cart')) || [];
    renderCart(cart);
}

function updateQty(productId, change) {
    let cart = JSON.parse(localStorage.getItem('glowcare_cart')) || [];
    const itemIndex = cart.findIndex(item => item.id === productId);

    if (itemIndex > -1) {
        cart[itemIndex].quantity += change;
        if (cart[itemIndex].quantity < 1) {
            removeItem(productId);
            return;
        }
    }

    localStorage.setItem('glowcare_cart', JSON.stringify(cart));
    renderCart(cart);
    if (typeof updateCartBadge === 'function') updateCartBadge();
}

function removeItem(productId) {
    let cart = JSON.parse(localStorage.getItem('glowcare_cart')) || [];
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('glowcare_cart', JSON.stringify(cart));
    renderCart(cart);
    if (typeof updateCartBadge === 'function') updateCartBadge();
}

// Checkout Handler
async function proceedToCheckout() {
    const cart = JSON.parse(localStorage.getItem('glowcare_cart')) || [];
    if (cart.length === 0) {
        alert('Your cart is empty.');
        return;
    }

    // Redirect to the checkout page
    window.location.href = '/Cart/Checkout';
}

// Helper to add items to cart (for testing or from product pages)
window.addToCart = function(product) {
    let cart = JSON.parse(localStorage.getItem('glowcare_cart')) || [];
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem('glowcare_cart', JSON.stringify(cart));
    updateCartBadge();
    
    // Optional: show a toast notification
    console.log('Added to cart:', product.name);
};
