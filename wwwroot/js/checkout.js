document.addEventListener('DOMContentLoaded', () => {
    loadCheckoutSummary();
});

async function loadCheckoutSummary() {
    let cart = [];
    try {
        const response = await fetch('/Cart/GetCartItems');
        if (response.ok) {
            cart = await response.json();
            localStorage.setItem('glowcare_cart', JSON.stringify(cart));
            if (typeof updateCartBadge === 'function') updateCartBadge();
        }
    } catch (error) {
        console.error('Error fetching dynamic checkout items from DB/Session:', error);
        cart = JSON.parse(localStorage.getItem('glowcare_cart')) || [];
    }

    const container = document.getElementById('checkout-items-list');
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

async function handleContinueToPayment() {
    const form = document.getElementById('checkout-form');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    // Get input elements
    const firstName = form.querySelector('input[placeholder="Elena"]').value.trim();
    const lastName = form.querySelector('input[placeholder="Vance"]').value.trim();
    const address = form.querySelector('input[placeholder="123 Street, Apt 4B"]').value.trim();
    const city = form.querySelector('input[placeholder="New York"]').value.trim();
    const postalCode = form.querySelector('input[placeholder="10001"]').value.trim();
    const phone = form.querySelector('input[placeholder="+1 (555) 000-0000"]').value.trim();
    const shippingMethod = form.querySelector('input[name="shippingMethod"]:checked').value;

    const data = {
        FirstName: firstName,
        LastName: lastName,
        Address: address,
        City: city,
        PostalCode: postalCode,
        Phone: phone,
        ShippingMethod: shippingMethod
    };

    try {
        const response = await fetch('/Cart/SaveCheckoutInfo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            window.location.href = '/Cart/Payment';
        } else {
            console.error('Failed to save checkout info');
            if (typeof GlowAlert !== 'undefined') {
                GlowAlert.error('Checkout Error', 'Failed to save checkout information.');
            } else {
                alert('Failed to save checkout information.');
            }
        }
    } catch (error) {
        console.error('Error saving checkout info:', error);
        if (typeof GlowAlert !== 'undefined') {
            GlowAlert.error('Connection Error', 'Could not connect to the server.');
        } else {
            alert('Could not connect to the server.');
        }
    }
}
