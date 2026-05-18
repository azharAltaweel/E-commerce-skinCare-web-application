let activeDiscount = 0;
let appliedPromo = null;

document.addEventListener('DOMContentLoaded', () => {
    loadCart();
});

async function loadCart() {
    try {
        const response = await fetch('/Cart/GetCartItems');
        if (response.ok) {
            const cart = await response.json();
            // Sync with local storage for compatibility with other layout views
            localStorage.setItem('glowcare_cart', JSON.stringify(cart));
            renderCart(cart);
            if (typeof updateCartBadge === 'function') updateCartBadge();
        } else {
            throw new Error('Failed to fetch cart items from server');
        }
    } catch (error) {
        console.error('Error fetching dynamic cart items from DB/Session:', error);
        // Fallback to local storage in case of server offline
        const cart = JSON.parse(localStorage.getItem('glowcare_cart')) || [];
        renderCart(cart);
    }
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
        if (typeof GlowAlert !== 'undefined') {
            GlowAlert.success('Success!', 'Promo code applied! You got a 15% discount.');
        } else {
            alert('Promo code applied! You got a 15% discount.');
        }
    } else {
        activeDiscount = 0;
        appliedPromo = null;
        if (typeof GlowAlert !== 'undefined') {
            GlowAlert.error('Invalid Code', 'The promo code you entered is invalid.');
        } else {
            alert('Invalid promo code.');
        }
    }

    const cart = JSON.parse(localStorage.getItem('glowcare_cart')) || [];
    renderCart(cart);
}

async function updateQty(productId, change) {
    try {
        const response = await fetch(`/Cart/UpdateQuantity?productId=${productId}&change=${change}`, {
            method: 'POST'
        });
        if (response.ok) {
            await loadCart();
        }
    } catch (error) {
        console.error('Error updating quantity:', error);
    }
}

function removeItem(productId) {
    if (typeof GlowAlert !== 'undefined') {
        GlowAlert.confirm('Remove Item?', 'Are you sure you want to remove this item from your ritual?').then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await fetch(`/Cart/RemoveFromCart?productId=${productId}`, {
                        method: 'POST'
                    });
                    if (response.ok) {
                        await loadCart();
                        GlowAlert.toast('Item removed from cart.');
                    }
                } catch (error) {
                    console.error('Error removing item:', error);
                }
            }
        });
    } else {
        confirmRemoveItemLegacy(productId);
    }
}

async function confirmRemoveItemLegacy(productId) {
    if (confirm('Are you sure you want to remove this item from your ritual?')) {
        try {
            const response = await fetch(`/Cart/RemoveFromCart?productId=${productId}`, {
                method: 'POST'
            });
            if (response.ok) {
                await loadCart();
            }
        } catch (error) {
            console.error('Error removing item:', error);
        }
    }
}

// Checkout Handler
async function proceedToCheckout() {
    const cart = JSON.parse(localStorage.getItem('glowcare_cart')) || [];
    if (cart.length === 0) {
        if (typeof GlowAlert !== 'undefined') {
            GlowAlert.error('Cart Empty', 'Your cart is empty. Add some rituals to your bag first.');
        } else {
            alert('Your cart is empty.');
        }
        return;
    }

    // Redirect to the checkout page
    window.location.href = '/Cart/Checkout';
}

// Helper to add items to cart (for testing or from product pages)
window.addToCart = async function(product) {
    try {
        const response = await fetch(`/Cart/AddToCart?productId=${product.id}&quantity=1`, {
            method: 'POST'
        });
        if (response.ok) {
            if (typeof updateCartBadge === 'function') updateCartBadge();
            if (typeof GlowAlert !== 'undefined') {
                GlowAlert.toast('Added ' + product.name + ' to cart!');
            } else {
                console.log('Added to cart:', product.name);
            }
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
    }
};
