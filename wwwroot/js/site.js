// Global Cart Badge Update
document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
});

async function updateCartBadge() {
    try {
        const response = await fetch('/Cart/GetCartCount');
        if (response.ok) {
            const data = await response.json();
            const totalItems = data.count;
            const badges = document.querySelectorAll('.cart-badge');
            badges.forEach(badge => {
                badge.innerText = totalItems;
                badge.style.display = totalItems > 0 ? 'flex' : 'none';
            });
        }
    } catch (error) {
        console.error('Error updating cart badge from server:', error);
        // Fallback to local storage count if server request fails
        const cart = JSON.parse(localStorage.getItem('glowcare_cart')) || [];
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const badges = document.querySelectorAll('.cart-badge');
        badges.forEach(badge => {
            badge.innerText = totalItems;
            badge.style.display = totalItems > 0 ? 'flex' : 'none';
        });
    }
}
