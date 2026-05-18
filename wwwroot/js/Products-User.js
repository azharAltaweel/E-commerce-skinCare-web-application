console.log("JS Loaded");
document.addEventListener("DOMContentLoaded", function () {

    const wishlistButtons =
        document.querySelectorAll(".wishlist-btn");

    let wishlist =
        JSON.parse(localStorage.getItem("wishlist")) || [];

    wishlistButtons.forEach(button => {

        const productId =
            button.dataset.productId;

        const icon =
            button.querySelector("i");

        const exists =
            wishlist.some(x => x.id === productId);

        // load saved state
        if (exists) {

            icon.classList.remove("bi-heart");
            icon.classList.add("bi-heart-fill");

            button.classList.add("active");
        }

        button.addEventListener("click", function () {

            toggleWishlist(button);

        });

    });

});


function toggleWishlist(button) {

    const icon = button.querySelector("i");

    const product = {

        id: button.dataset.productId,
        name: button.dataset.productName,
        price: button.dataset.productPrice,
        image: button.dataset.productImage
    };

    let wishlist =
        JSON.parse(localStorage.getItem("wishlist")) || [];

    const exists =
        wishlist.find(x => x.id === product.id);

    if (exists) {

        wishlist =
            wishlist.filter(x => x.id !== product.id);

        icon.classList.remove("bi-heart-fill");
        icon.classList.add("bi-heart");

        button.classList.remove("active");

    }
    else {

        wishlist.push(product);

        icon.classList.remove("bi-heart");
        icon.classList.add("bi-heart-fill");

        button.classList.add("active");
    }

    localStorage.setItem(
        "wishlist",
        JSON.stringify(wishlist)
    );

    updateWishlistCounter();
}
