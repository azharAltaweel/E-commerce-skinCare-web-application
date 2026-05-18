function filterProducts() {

    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const sortValue = document.getElementById('sortSelect').value;

    const tableBody = document.querySelector('table tbody');
    const rows = Array.from(tableBody.querySelectorAll('tr'));

    // 1. SEARCH
    rows.forEach(row => {

        const productName = row.cells[2].innerText.toLowerCase(); // Product column
        const categoryName = row.cells[3].innerText.toLowerCase(); // Category column

        if (productName.includes(searchInput) || categoryName.includes(searchInput)) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }
    });

    // 2. SORT (only visible rows)
    const visibleRows = rows.filter(row => row.style.display !== "none");

    visibleRows.sort((a, b) => {

        if (sortValue === "id") {
            const idA = parseInt(a.cells[0].innerText);
            const idB = parseInt(b.cells[0].innerText);
            return idA - idB;
        }

        else if (sortValue === "name") {
            const nameA = a.cells[2].innerText.toLowerCase().trim();
            const nameB = b.cells[2].innerText.toLowerCase().trim();
            return nameA.localeCompare(nameB);
        }

        else if (sortValue === "price") {
            const priceA = parseFloat(a.cells[4].innerText.replace('$', '')) || 0;
            const priceB = parseFloat(b.cells[4].innerText.replace('$', '')) || 0;
            return priceA - priceB;
        }

        else if (sortValue === "stock") {
            const stockA = parseInt(a.cells[6].innerText) || 0;
            const stockB = parseInt(b.cells[6].innerText) || 0;
            return stockB - stockA;
        }
    });

    // 3. re-append
    visibleRows.forEach(row => tableBody.appendChild(row));

    // 4. update count
    document.getElementById('countPill').innerText =
        `${visibleRows.length} products`;
}





function confirmDelete(productId) {

    Swal.fire({
        title: 'Are you sure?',
        text: "This product will be permanently deleted.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {

        if (!result.isConfirmed) return;

        $.ajax({
            type: "POST",
            url: '/Admin/DeleteProduct',
            data: { id: productId },

            success: function (response) {

                if (response.success) {

                    Swal.fire({
                        title: 'Deleted!',
                        text: response.message,
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false
                    });

                    // remove row
                    $(`button[onclick="confirmDelete(${productId})"]`)
                        .closest('tr')
                        .fadeOut(200, function () {
                            $(this).remove();

                            updateCount();
                        });

                } else {
                    Swal.fire('Error', response.message, 'error');
                }
            }
        });
    });
}



//when deleting a product in the table
function updateCount() {
    let rows = document.querySelectorAll("tbody tr").length;
    document.getElementById("countPill").innerText = rows + " products";
}




//in product details page when click on other image for the same product 

function changeMainImage(imageUrl) {
    document.getElementById("mainImage").src = imageUrl;
}

function deleteImage(imageId) {
    Swal.fire({
        title: 'Delete Image?',
        text: 'This image will be removed.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33'
    }).then((result) => {

        if (!result.isConfirmed)
            return;

        $.ajax({
            type: "POST",
            url: '/Admin/DeleteProductImage',
            data: { imageId: imageId },

            success: function (response) {
                if (response.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Deleted!',
                        timer: 1200,
                        showConfirmButton: false
                    });

                    location.reload();
                }
            }
        });

    });
}


           