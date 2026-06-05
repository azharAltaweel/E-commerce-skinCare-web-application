document.addEventListener("DOMContentLoaded", function () {

    loadWishlist();

});


function loadWishlist() {

    const container =
        document.getElementById("wishlist-container");

    const emptyState =
        document.getElementById("empty-state");

    const count =
        document.getElementById("wishlist-count");

    const wishlist =
        JSON.parse(localStorage.getItem("wishlist")) || [];

    container.innerHTML = "";

    count.innerText =
        `${wishlist.length} Saved Items`;

    if (wishlist.length === 0) {

        emptyState.classList.remove("d-none");

        return;
    }

    emptyState.classList.add("d-none");

    wishlist.forEach(product => {
        container.innerHTML += `

<div class="wishlist-card">

    <div class="wishlist-image">

        <img src="${product.image}"
             alt="${product.name}" />

    </div>

    <div class="wishlist-info">

        <span class="wishlist-category">
            Skincare Favorite
        </span>

        <h4>
            ${product.name}
        </h4>

        <div class="wishlist-price">
            $${product.price}
        </div>

    </div>

    <div class="wishlist-actions">

        <button class="btn-remove"
                onclick="removeWishlist('${product.id}')">

            <i class="bi bi-trash"></i>

        </button>

    </div>

</div>
`;
    });
}


function removeWishlist(productId) {

    let wishlist =
        JSON.parse(localStorage.getItem("wishlist")) || [];

    wishlist =
        wishlist.filter(x => x.id !== productId);

    localStorage.setItem(
        "wishlist",
        JSON.stringify(wishlist)
    );

    loadWishlist();
}



document.addEventListener("DOMContentLoaded", function () {

    updateWishlistCounter();

});


function updateWishlistCounter() {

    const badge =
        document.getElementById("wishlist-badge");

    if (!badge) return;

    const wishlist =
        JSON.parse(localStorage.getItem("wishlist")) || [];

    const count =
        wishlist.length;

    badge.innerText = count;

    if (count > 0) {

        badge.classList.remove("d-none");

    }
    else {

        badge.classList.add("d-none");
    }
}