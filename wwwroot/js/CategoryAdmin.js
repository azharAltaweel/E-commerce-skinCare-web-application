// Category Administration JS

function openEditModal(id, name, imageUrl) {
    document.getElementById("fieldId").value = id;
    document.getElementById("displayId").value = id;
    document.getElementById("idDisplayGroup").style.display = "block";
    document.getElementById("fieldName").value = name;
    
    var modal = new bootstrap.Modal(
        document.getElementById('editCategoryModal')
    );
    modal.show();
}

function confirmDelete(id) {
    // Step 1: Admin Approval Message
    Swal.fire({
        title: 'Are you sure?',
        text: "This action requires Admin approval. Do you want to proceed?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            // Step 2: Send Request to Controller
            $.ajax({
                type: "POST",
                url: '/Admin/DeleteCategory', // Ensure this matches your route
                data: { id: id },
                success: function (data) {
                    if (data.success) {
                        // Step 3: Display Success Toast
                        Swal.fire({
                            title: 'Deleted!',
                            text: data.message,
                            icon: 'success',
                            timer: 2000,
                            showConfirmButton: false
                        });
                            
                        // Refresh page or remove row from table
                        setTimeout(() => { location.reload(); }, 2000);
                    } else {
                        Swal.fire('Error', data.message, 'error');
                    }
                }
            });
        }
    });
}

function filterCategories() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const sortValue = document.getElementById('sortSelect').value;
    const tableBody = document.querySelector('#catTable tbody');
    if (!tableBody) return;
    const rows = Array.from(tableBody.querySelectorAll('tr'));

    // 1. Search Logic
    rows.forEach(row => {
        // We look at the 3rd column (index 2) which is the Name
        const categoryName = row.cells[2].innerText.toLowerCase();
        if (categoryName.includes(searchInput)) {
            row.style.display = ""; // Show
        } else {
            row.style.display = "none"; // Hide
        }
    });

    // 2. Sorting Logic
    const visibleRows = rows.filter(row => row.style.display !== "none");

    visibleRows.sort((a, b) => {
        if (sortValue === "id") {
            // Extracts the number after the # symbol
            const idA = parseInt(a.cells[0].innerText.replace('#', ''));
            const idB = parseInt(b.cells[0].innerText.replace('#', ''));
            return idA - idB;
        }
        else if (sortValue === "name") {
            const nameA = a.cells[2].innerText.toLowerCase().trim();
            const nameB = b.cells[2].innerText.toLowerCase().trim();
            return nameA.localeCompare(nameB);
        }
        else if (sortValue === "products") {
            // Extracts the number from "X products" text
            const prodA = parseInt(a.cells[3].innerText) || 0;
            const prodB = parseInt(b.cells[3].innerText) || 0;
            return prodB - prodA; // Descending (Most products first)
        }
    });

    // 3. Re-append sorted rows to the table
    visibleRows.forEach(row => tableBody.appendChild(row));

    // 4. Update the Count Pill dynamically
    updateCountPill(visibleRows.length);
}

function updateCountPill(count) {
    const pill = document.getElementById('countPill');
    if (!pill) return;
    const text = count === 1 ? "category" : "categories";
    pill.innerText = `${count} ${text}`;
}