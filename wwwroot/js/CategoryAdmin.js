
  /* ─── SAMPLE DATA ─── */
    let categories = [
    {id: 1, name: "Serums & Essences",   imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&q=80", products: 14 },
    {id: 2, name: "Cleansers",           imageUrl: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&q=80", products: 9  },
    {id: 3, name: "Moisturizers",        imageUrl: "https://images.unsplash.com/photo-1570194065650-d99fb4ee0170?w=400&q=80", products: 11 },
    {id: 4, name: "Eye Care",            imageUrl: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=400&q=80", products: 6  },
    {id: 5, name: "Sun Protection",      imageUrl: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400&q=80", products: 8  },
    {id: 6, name: "Face Masks",          imageUrl: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400&q=80", products: 7  },
    ];
    let nextId = 7;
    let editingId = null;
    let deletingId = null;
    let currentView = 'list';

    /* ─── RENDER ─── */
    function getFiltered() {
    const q = document.getElementById('searchInput').value.toLowerCase();
    const sort = document.getElementById('sortSelect').value;
    let list = categories.filter(c => c.name.toLowerCase().includes(q));
    if (sort === 'name') list.sort((a,b) => a.name.localeCompare(b.name));
    else if (sort === 'products') list.sort((a,b) => b.products - a.products);
    else list.sort((a,b) => a.id - b.id);
    return list;
  }

    function render() {
    const list = getFiltered();
    document.getElementById('countPill').textContent = list.length + ' categor' + (list.length === 1 ? 'y' : 'ies');
    renderGrid(list);
    renderTable(list);
  }

    function renderGrid(list) {
    const grid = document.getElementById('catGrid');
    if (!list.length) {
        grid.innerHTML = `<div class="empty-state">
        <i class="fa-solid fa-tags"></i>
        <p>No categories found</p>
        <span>Try a different search or add a new category.</span>
      </div>`;
    return;
    }
    grid.innerHTML = list.map(c => `
    <div class="cat-card" id="card-${c.id}">
        <div style="position:relative;">
            ${c.imageUrl
                ? `<img src="${c.imageUrl}" alt="${c.name}" class="cat-card-img" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/>
               <div class="cat-card-img-placeholder" style="display:none;"><i class="fa-solid fa-image"></i></div>`
                : `<div class="cat-card-img-placeholder"><i class="fa-solid fa-image"></i></div>`}
            <div class="cat-img-overlay"></div>
            <span class="cat-id-badge">#${c.id}</span>
        </div>
        <div class="cat-card-body">
            <div class="cat-card-name">${c.name}</div>
            <div class="cat-card-meta">
                <span class="meta-chip products"><i class="fa-solid fa-box"></i> ${c.products} products</span>
            </div>
            <div class="cat-card-url">
                <i class="fa-solid fa-link"></i>
                <span title="${c.imageUrl}">${c.imageUrl || '—'}</span>
            </div>
            <div class="cat-card-actions">
                <button class="btn btn-secondary btn-sm" style="flex:1;" onclick="openEditModal(${c.id})">
                    <i class="fa-regular fa-pen-to-square"></i> Edit
                </button>
                <button class="btn-icon danger btn" onclick="openDeleteModal(${c.id})" title="Delete category">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        </div>
    </div>
    `).join('');
  }

    function renderTable(list) {
    const tbody = document.getElementById('catTableBody');
    if (!list.length) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--muted);">
        <i class="fa-solid fa-tags" style="font-size:28px;color:var(--border);display:block;margin-bottom:10px;"></i>
        No categories found.</td></tr>`;
    return;
    }
    tbody.innerHTML = list.map(c => `
    <tr>
        <td style="color:var(--muted);font-weight:600;font-size:12px;">#${c.id}</td>
        <td>
            <div style="position:relative;width:48px;height:48px;">
                ${c.imageUrl
                    ? `<img src="${c.imageUrl}" class="tbl-img" style="width:48px;height:48px;" alt="${c.name}"
                   onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/>
                 <div class="tbl-img-placeholder" style="display:none;width:48px;height:48px;"><i class="fa-solid fa-image"></i></div>`
                    : `<div class="tbl-img-placeholder" style="width:48px;height:48px;"><i class="fa-solid fa-image"></i></div>`}
            </div>
        </td>
        <td>
            <div style="font-weight:500;font-size:14px;color:var(--charcoal);">${c.name}</div>
            <div style="font-size:11px;color:var(--muted);margin-top:2px;">StringLength: ${c.name.length}/100</div>
        </td>
        <td>
            <div style="display:flex;align-items:center;gap:8px;max-width:260px;">
                <span style="font-size:12px;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;"
                    title="${c.imageUrl}">${c.imageUrl || '—'}</span>
                ${c.imageUrl ? `<button onclick="copyUrl('${c.imageUrl.replace(/'/g, "\\'")}',this)"
              style="flex-shrink:0;background:var(--cream);border:1px solid var(--border);border-radius:6px;
                     padding:3px 8px;font-size:11px;cursor:pointer;color:var(--muted);font-family:'DM Sans',sans-serif;
                     display:flex;align-items:center;gap:4px;transition:all 0.15s;"
              onmouseenter="this.style.background='var(--cream-dark)'"
              onmouseleave="this.style.background='var(--cream)'">
              <i class="fa-regular fa-copy"></i> Copy
            </button>` : ''}
            </div>
        </td>
        <td>
            <span style="display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:500;
            color:var(--olive-dark);background:var(--green-badge);border-radius:20px;padding:4px 10px;">
                <i class="fa-solid fa-box" style="font-size:10px;"></i> ${c.products} product${c.products !== 1 ? 's' : ''}
            </span>
        </td>
        <td>
            <div style="display:flex;gap:6px;">
                <button class="btn btn-secondary btn-sm" onclick="openEditModal(${c.id})" title="Edit category"
                    style="display:inline-flex;align-items:center;gap:5px;">
                    <i class="fa-regular fa-pen-to-square"></i> Edit
                </button>
                <button class="btn-icon danger btn" onclick="openDeleteModal(${c.id})" title="Delete category">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        </td>
    </tr>
    `).join('');
  }

    /* ─── VIEW TOGGLE ─── */
    function setView(v) {
        currentView = v;
    document.getElementById('catGrid').classList.toggle('hidden', v !== 'grid');
    document.getElementById('catTable').classList.toggle('active', v === 'list');
    document.getElementById('gridViewBtn').classList.toggle('active', v === 'grid');
    document.getElementById('listViewBtn').classList.toggle('active', v === 'list');
  }

    function filterCategories() {render(); }

    /* ─── MODAL ─── */
    function openModal(id) {document.getElementById(id).classList.add('open'); }
    function closeModal(id) {document.getElementById(id).classList.remove('open'); }

    function openAddModal() {
        editingId = null;
    document.getElementById('modalTitle').textContent = 'Add New Category';
    document.getElementById('modalSubtitle').textContent = 'Fill in the details to create a new category.';
    document.getElementById('modalSaveBtn').innerHTML = '<i class="fa-solid fa-check"></i> Save Category';
    document.getElementById('idGroup').style.display = 'none';
    document.getElementById('fieldName').value = '';
    document.getElementById('fieldUrl').value = '';
    document.getElementById('charCount').textContent = '0';
    resetPreview();
    clearAllErrors();
    openModal('catModal');
    setTimeout(() => document.getElementById('fieldName').focus(), 200);
  }

    function openEditModal(id) {
    const cat = categories.find(c => c.id === id);
    if (!cat) return;
    editingId = id;
    document.getElementById('modalTitle').textContent = 'Edit Category';
    document.getElementById('modalSubtitle').textContent = `Editing: ${cat.name}`;
    document.getElementById('modalSaveBtn').innerHTML = '<i class="fa-solid fa-check"></i> Update Category';
    document.getElementById('idGroup').style.display = 'block';
    document.getElementById('fieldId').value = cat.id;
    document.getElementById('fieldName').value = cat.name;
    document.getElementById('fieldUrl').value = cat.imageUrl;
    document.getElementById('charCount').textContent = cat.name.length;
    previewImage();
    clearAllErrors();
    openModal('catModal');
  }

    function openDeleteModal(id) {
    const cat = categories.find(c => c.id === id);
    if (!cat) return;
    deletingId = id;
    document.getElementById('delCatName').textContent = `"${cat.name}"`;
    openModal('deleteModal');
  }

    /* ─── SAVE ─── */
    function saveCategory() {
    const name = document.getElementById('fieldName').value.trim();
    const url  = document.getElementById('fieldUrl').value.trim();
    let valid = true;

    if (!name || name.length > 100) {
        document.getElementById('fieldName').classList.add('error');
    valid = false;
    }
    if (!url) {
        document.getElementById('fieldUrl').classList.add('error');
    valid = false;
    }
    if (!valid) return;

    if (editingId) {
      const cat = categories.find(c => c.id === editingId);
    cat.name = name;
    cat.imageUrl = url;
    showToast('success', 'Category updated successfully.');
    } else {
        categories.push({ id: nextId++, name, imageUrl: url, products: 0 });
    showToast('success', 'New category added successfully.');
    }

    closeModal('catModal');
    render();
  }

    function confirmDelete() {
        categories = categories.filter(c => c.id !== deletingId);
    closeModal('deleteModal');
    showToast('error', 'Category deleted.');
    render();
  }

    /* ─── IMAGE PREVIEW ─── */
    function previewImage() {
    const url = document.getElementById('fieldUrl').value.trim();
    const img = document.getElementById('imgPreview');
    const hint = document.getElementById('uploadHint');
    if (url) {
        img.src = url;
    img.style.display = 'block';
    hint.style.display = 'none';
      img.onerror = () => {img.style.display = 'none'; hint.style.display = 'flex'; };
    } else {
        resetPreview();
    }
  }

    function resetPreview() {
        document.getElementById('imgPreview').style.display = 'none';
    document.getElementById('imgPreview').src = '';
    document.getElementById('uploadHint').style.display = 'flex';
  }

    /* ─── HELPERS ─── */
    function updateCharCount() {
        document.getElementById('charCount').textContent = document.getElementById('fieldName').value.length;
  }
    function clearError(id) {document.getElementById(id).classList.remove('error'); }
    function clearAllErrors() {
        ['fieldName', 'fieldUrl'].forEach(id => document.getElementById(id).classList.remove('error'));
  }

    function showToast(type, msg) {
    const icon = type === 'success' ? 'fa-circle-check' : type === 'error' ? 'fa-circle-xmark' : 'fa-circle-info';
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.innerHTML = `<i class="fa-solid ${icon}"></i> ${msg}`;
    document.getElementById('toastContainer').appendChild(t);
    setTimeout(() => t.remove(), 3500);
  }

    function copyUrl(url, btn) {
        navigator.clipboard.writeText(url).then(() => {
            btn.innerHTML = '<i class="fa-solid fa-check"></i> Copied';
            btn.style.color = 'var(--olive-dark)';
            btn.style.background = 'var(--green-badge)';
            setTimeout(() => {
                btn.innerHTML = '<i class="fa-regular fa-copy"></i> Copy';
                btn.style.color = 'var(--muted)';
                btn.style.background = 'var(--cream)';
            }, 1800);
        });
  }
  document.querySelectorAll('.modal-backdrop').forEach(b => {
        b.addEventListener('click', e => { if (e.target === b) b.classList.remove('open'); });
  });

    /* ─── INIT ─── */
    setView('list');
render();

//for edit category modul
function openEditModal(id, name, imageUrl) {

    document.getElementById("editId").value = id;
    document.getElementById("editName").value = name;
    document.getElementById("editImage").value = imageUrl;

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
    })
}


function filterCategories() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const sortValue = document.getElementById('sortSelect').value;
    const tableBody = document.querySelector('#catTable tbody');
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
    const text = count === 1 ? "category" : "categories";
    pill.innerText = `${count} ${text}`;
}