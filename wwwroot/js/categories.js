function openAddModal() {
    document.getElementById('modalTitle').innerText = "Add New Category";
    document.getElementById('modalSubtitle').innerText = "Fill in the details to create a new category.";
    document.getElementById('submitBtn').innerHTML = '<i class="fa-solid fa-check me-1"></i> Save Category';
    document.getElementById('idDisplayGroup').style.display = 'none';
    document.getElementById('categoryForm').reset();
    document.getElementById('imgPreview').style.display = 'none';
    document.getElementById('previewPlaceholder').style.display = 'block';

    var myModal = new bootstrap.Modal(document.getElementById('categoryModal'));
    myModal.show();
}

function openEditModal(id, name, url) {
    document.getElementById('modalTitle').innerText = "Edit Category";
    document.getElementById('modalSubtitle').innerText = "Editing: " + name;
    document.getElementById('submitBtn').innerHTML = '<i class="fa-solid fa-check me-1"></i> Update Category';

    // Fill data
    document.getElementById('fieldId').value = id;
    document.getElementById('displayId').value = id;
    document.getElementById('idDisplayGroup').style.display = 'block';
    document.getElementById('fieldName').value = name;
    document.getElementById('fieldUrl').value = url;
    updatePreview(url);

    var myModal = new bootstrap.Modal(document.getElementById('categoryModal'));
    myModal.show();
}

function updatePreview(url) {
    const img = document.getElementById('imgPreview');
    const placeholder = document.getElementById('previewPlaceholder');
    if (url) {
        img.src = url;
        img.style.display = 'block';
        placeholder.style.display = 'none';
    }
}

    < !--Reusable logic file-- >
    <script src="~/js/site-functions.js"></script>
    
    <!--Page specific logic(modals, etc.)-- >
    <script src="~/js/admin/categories.js"></script>

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
    })
}