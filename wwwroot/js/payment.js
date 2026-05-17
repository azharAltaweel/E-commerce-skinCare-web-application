const publishableKey = 'pk_test_51TXlPuKs1tpkaT7W4SZUqUDWee1K5WnNfGCvvtcLqkcVlbbjLdxZmI5gUE5jOw8tKdNKehE4g27nd8ZHc5M32GZh00PXXTvVuA';

document.addEventListener('DOMContentLoaded', () => {
    loadPaymentSummary();
});

function loadPaymentSummary() {
    const cart = JSON.parse(localStorage.getItem('glowcare_cart')) || [];
    if (cart.length === 0) {
        window.location.href = '/Cart';
        return;
    }

    let subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Assume default shipping if not specified (Standard is Free)
    const shippingCost = 0; 
    const tax = subtotal * 0.08;
    const total = subtotal + shippingCost + tax;

    const subtotalEl = document.getElementById('payment-subtotal');
    const shippingEl = document.getElementById('payment-shipping');
    const taxEl = document.getElementById('payment-tax');
    const totalEl = document.getElementById('payment-total');

    if (subtotalEl) subtotalEl.innerText = `$${subtotal.toFixed(2)}`;
    if (shippingEl) shippingEl.innerText = shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`;
    if (taxEl) taxEl.innerText = `$${tax.toFixed(2)}`;
    if (totalEl) totalEl.innerText = `$${total.toFixed(2)}`;
}

async function handleCompleteOrder() {
    const btn = document.querySelector('.complete-btn');
    if (!btn) return;
    
    const originalText = btn.innerHTML;
    
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Processing...';

    // Simulate Payment Processing
    setTimeout(() => {
        alert('Payment successful! Your order has been placed.');
        localStorage.removeItem('glowcare_cart');
        window.location.href = '/'; // Go home
    }, 2000);
}
