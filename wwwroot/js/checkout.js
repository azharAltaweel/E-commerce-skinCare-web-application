document.addEventListener('DOMContentLoaded', () => {
    loadCheckoutSummary();
});

function loadCheckoutSummary() {
    let cart = JSON.parse(localStorage.getItem('glowcare_cart')) || [];
    const container = document.getElementById('checkout-items-list');
    
    // Seed some data if empty for testing checkout
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

    if (!container) return;
    
    container.innerHTML = '';
    let subtotal = 0;

    cart.forEach(item => {
        subtotal += item.price * item.quantity;
        const html = `
            <div class="d-flex mb-3 align-items-center">
                <div class="position-relative">
                    <img src="${item.image}" class="checkout-item-img me-3" alt="${item.name}">
                    <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-secondary" style="font-size: 10px;">
                        ${item.quantity}
                    </span>
                </div>
                <div class="flex-grow-1">
                    <h6 class="mb-0 text-truncate" style="max-width: 180px;">${item.name}</h6>
                    <small class="text-muted">${item.category || 'Skincare'}</small>
                </div>
                <div class="text-end">
                    <span class="fw-medium">$${(item.price * item.quantity).toFixed(2)}</span>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', html);
    });

    updateTotal();
}

function updateTotal() {
    const cart = JSON.parse(localStorage.getItem('glowcare_cart')) || [];
    let subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const shippingRadio = document.querySelector('input[name="shippingMethod"]:checked');
    const shippingCost = shippingRadio ? parseFloat(shippingRadio.value) : 0;
    const tax = subtotal * 0.08;
    const total = subtotal + shippingCost + tax;

    const subtotalEl = document.getElementById('summary-subtotal');
    const taxEl = document.getElementById('summary-tax');
    const shippingEl = document.getElementById('summary-shipping');
    const totalEl = document.getElementById('summary-total');

    if (subtotalEl) subtotalEl.innerText = `$${subtotal.toFixed(2)}`;
    if (taxEl) taxEl.innerText = `$${tax.toFixed(2)}`;
    if (shippingEl) {
        shippingEl.innerText = shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`;
        shippingEl.className = shippingCost === 0 ? 'text-success fw-medium' : 'fw-medium';
    }
    if (totalEl) totalEl.innerText = `$${total.toFixed(2)}`;
}

function handleContinueToPayment() {
    const form = document.getElementById('checkout-form');
    if (form.checkValidity()) {
        window.location.href = '/Cart/Payment';
    } else {
        form.reportValidity();
    }
}
