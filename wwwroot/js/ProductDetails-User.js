// ================================
// PRODUCT DETAILS PAGE
// ================================

document.addEventListener("DOMContentLoaded", function () {

    // Load wishlist state
    initializeWishlist();

});


// ================================
// CHANGE MAIN IMAGE
// When user clicks thumbnail
// ================================

function changeMainImage(image) {

    const mainImage =
        document.getElementById(
            "mainProductImage"
        );

    mainImage.src =
        image.src;

    document
        .querySelectorAll(
            ".thumbnail-image"
        )
        .forEach(img => {

            img.classList.remove(
                "active-thumb"
            );
        });

    image.classList.add(
        "active-thumb"
    );
}


// ================================
// QUANTITY
// ================================

let quantity = 1;


// Increase quantity
function increaseQty() {

    quantity++;

    document.getElementById(
        "quantityValue"
    ).innerText = quantity;
}


// Decrease quantity
function decreaseQty() {

    // Prevent negative quantity
    if (quantity > 1) {

        quantity--;

        document.getElementById(
            "quantityValue"
        ).innerText = quantity;
    }
}


// ================================
// WISHLIST
// Same logic as products page
// ================================

function initializeWishlist() {

    const wishlistButton =
        document.querySelector(
            ".wishlist-btn"
        );

    // Stop if button missing
    if (!wishlistButton)
        return;

    const icon =
        wishlistButton.querySelector("i");

    // Get wishlist from localStorage
    let wishlist =
        JSON.parse(
            localStorage.getItem(
                "wishlist"
            )
        ) || [];

    // Product id
    const productId =
        wishlistButton.dataset.productId;

    // Check if already exists
    const exists =
        wishlist.some(
            x => x.id === productId
        );

    // Fill heart on load
    if (exists) {

        icon.classList.remove(
            "bi-heart"
        );

        icon.classList.add(
            "bi-heart-fill"
        );

        wishlistButton.classList.add(
            "active"
        );
    }

    // Click event
    wishlistButton.addEventListener(
        "click",
        function () {

            toggleWishlist(
                wishlistButton
            );

        });
}



// ================================
// TOGGLE WISHLIST
// Add / Remove Product
// ================================

function toggleWishlist(button) {

    const icon =
        button.querySelector("i");

    // Product object
    const product = {

        id:
            button.dataset.productId,

        name:
            button.dataset.productName,

        price:
            button.dataset.productPrice,

        image:
            button.dataset.productImage
    };

    // Get saved wishlist
    let wishlist =
        JSON.parse(
            localStorage.getItem(
                "wishlist"
            )
        ) || [];

    // Check if exists
    const exists =
        wishlist.find(
            x => x.id === product.id
        );

    // REMOVE
    if (exists) {

        wishlist =
            wishlist.filter(
                x => x.id !== product.id
            );

        icon.classList.remove(
            "bi-heart-fill"
        );

        icon.classList.add(
            "bi-heart"
        );

        button.classList.remove(
            "active"
        );
    }

    // ADD
    else {

        wishlist.push(product);

        icon.classList.remove(
            "bi-heart"
        );

        icon.classList.add(
            "bi-heart-fill"
        );

        button.classList.add(
            "active"
        );
    }

    // Save updated wishlist
    localStorage.setItem(
        "wishlist",
        JSON.stringify(
            wishlist
        )
    );

    // Update navbar badge
    updateWishlistCounter();
}


// ================================
// UPDATE WISHLIST BADGE
// Navbar Counter
// ================================

function updateWishlistCounter() {

    const badge =
        document.getElementById(
            "wishlist-badge"
        );

    if (!badge)
        return;

    const wishlist =
        JSON.parse(
            localStorage.getItem(
                "wishlist"
            )
        ) || [];

    const count =
        wishlist.length;

    badge.innerText =
        count;

    // Hide if empty
    if (count > 0) {

        badge.classList.remove(
            "d-none"
        );
    }
    else {

        badge.classList.add(
            "d-none"
        );
    }
}





// ================================
// INTERACTIVE STAR RATING
// ================================

function setRating(value) {

    document.getElementById(
        "rating"
    ).value = value;

    const stars =
        document.querySelectorAll(
            ".interactive-stars i"
        );

    stars.forEach(
        (star, index) => {

            if (index < value) {

                star.classList.add(
                    "active"
                );

                star.classList.remove(
                    "bi-star"
                );

                star.classList.add(
                    "bi-star-fill"
                );
            }
            else {

                star.classList.remove(
                    "active"
                );

                star.classList.remove(
                    "bi-star-fill"
                );

                star.classList.add(
                    "bi-star"
                );
            }
        });
}

// ================================
// ADD TO CART
// ================================
async function addToCart(button) {
    const productId = button.dataset.productId;

    try {
        const token = document.querySelector(
            'input[name="__RequestVerificationToken"]'
        )?.value;

        const response = await fetch('/User/AddToCart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `productId=${productId}&quantity=${quantity}&__RequestVerificationToken=${token}`
        });

        if (response.ok) {
            alert("Product added to cart!");
            updateCartCounter();
        } else {
            alert("Something went wrong.");
        }

    } catch (error) {
        console.error('Error:', error);
        alert("Something went wrong.");
    }
}