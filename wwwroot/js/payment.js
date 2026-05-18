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
    
    // Check if express was chosen from localStorage or session fallback (default Free)
    // Standard is Free, Express is $15. 
    // We can check if express radio exists or compute based on the localStorage total vs subtotal
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
    
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Processing Payment...';

    try {
        const response = await fetch('/Cart/PlaceOrder', {
            method: 'POST'
        });

        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                if (typeof GlowAlert !== 'undefined') {
                    GlowAlert.success('Order Placed!', `Payment successful! Your order #${result.orderId} has been placed.<br><small class="text-muted">Transaction ID: ${result.transactionId}</small>`).then(() => {
                        localStorage.removeItem('glowcare_cart');
                        if (typeof updateCartBadge === 'function') updateCartBadge();
                        window.location.href = '/'; // Go home
                    });
                } else {
                    alert(`Payment successful! Your order #${result.orderId} has been placed. Transaction ID: ${result.transactionId}`);
                    localStorage.removeItem('glowcare_cart');
                    if (typeof updateCartBadge === 'function') updateCartBadge();
                    window.location.href = '/'; // Go home
                }
            } else {
                btn.disabled = false;
                btn.innerHTML = 'Complete Order <span class="material-symbols-outlined align-middle ms-2">check_circle</span>';
                if (typeof GlowAlert !== 'undefined') {
                    GlowAlert.error('Order Failed', result.message || 'An error occurred while placing the order.');
                } else {
                    alert(result.message || 'An error occurred.');
                }
            }
        } else {
            btn.disabled = false;
            btn.innerHTML = 'Complete Order <span class="material-symbols-outlined align-middle ms-2">check_circle</span>';
            if (typeof GlowAlert !== 'undefined') {
                GlowAlert.error('Order Failed', 'Failed to place the order due to a server error.');
            } else {
                alert('Failed to place the order due to a server error.');
            }
        }
    } catch (error) {
        btn.disabled = false;
        btn.innerHTML = 'Complete Order <span class="material-symbols-outlined align-middle ms-2">check_circle</span>';
        console.error('Error placing order:', error);
        if (typeof GlowAlert !== 'undefined') {
            GlowAlert.error('Connection Error', 'Could not connect to the server.');
        } else {
            alert('Could not connect to the server.');
        }
    }
}
