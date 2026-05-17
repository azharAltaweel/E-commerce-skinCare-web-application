// ═══ ORDERS PAGE JS ═══

// View order details in modal
function viewOrderDetails(orderId) {
    const modal = new bootstrap.Modal(document.getElementById('orderDetailsModal'));
    document.getElementById('orderDetailsBody').innerHTML = `
        <div class="text-center py-4">
            <div class="spinner-border" style="color:var(--olive);" role="status"></div>
        </div>`;
    modal.show();

    fetch(`/Admin/OrderDetails/${orderId}`)
        .then(res => res.text())
        .then(html => {
            document.getElementById('orderDetailsBody').innerHTML = html;
        })
        .catch(() => {
            document.getElementById('orderDetailsBody').innerHTML =
                `<div class="alert alert-danger m-3">Failed to load order details.</div>`;
        });
}

// Update order status
function updateStatus(orderId, status) {
    fetch('/Admin/UpdateOrderStatus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `orderId=${orderId}&status=${status}`
    })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                const badge = document.querySelector(`.status-label[data-order-id="${orderId}"]`);
                if (badge) {
                    badge.textContent = status;
                    badge.className = 'badge status-label';
                    badge.dataset.orderId = orderId;
                    const cls = { Processing: 'badge-processing', Completed: 'badge-shipped', Cancelled: 'badge-cancelled' };
                    badge.classList.add(cls[status] || 'badge-pending');
                }

                const row = badge?.closest('tr');
                if (row) row.dataset.status = status;

                showToast(`Order #${orderId} marked as ${status}`, 'success');
            }
        })
        .catch(() => showToast('Failed to update status', 'error'));
}

// Delete order
function deleteOrder(orderId) {
    GlowAlert.fire({
        title: 'Delete Order?',
        text: `Are you sure you want to delete Order #${orderId}? This action cannot be undone.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#eae3db',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch('/Admin/DeleteOrder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `orderId=${orderId}`
            })
                .then(r => r.json())
                .then(data => {
                    if (data.success) {
                        const row = document.querySelector(`tr[data-id="${orderId}"]`);
                        if (row) {
                            row.style.transition = 'opacity 0.3s';
                            row.style.opacity = '0';
                            setTimeout(() => row.remove(), 300);
                        }
                        showToast(`Order #${orderId} deleted`, 'success');
                    }
                })
                .catch(() => showToast('Failed to delete order', 'error'));
        }
    });
}

// ─── FILTERS ───

document.getElementById('searchInput')?.addEventListener('input', applyFilters);
document.getElementById('statusFilter')?.addEventListener('change', applyFilters);
document.getElementById('dateFilter')?.addEventListener('change', applyFilters);

function applyFilters() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const status = document.getElementById('statusFilter').value;
    const dateRange = document.getElementById('dateFilter').value;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    document.querySelectorAll('#ordersTable tbody tr').forEach(row => {
        const customer = row.dataset.customer || '';
        const id = row.dataset.id || '';
        const rowStatus = row.dataset.status || '';
        const rowDate = new Date(row.dataset.date);

        let visible = true;

        if (search && !customer.includes(search) && !id.includes(search)) visible = false;
        if (status && rowStatus !== status) visible = false;

        if (dateRange === 'today') {
            const d = new Date(rowDate); d.setHours(0, 0, 0, 0);
            if (d.getTime() !== today.getTime()) visible = false;
        } else if (dateRange === 'week') {
            const weekAgo = new Date(today); weekAgo.setDate(today.getDate() - 7);
            if (rowDate < weekAgo) visible = false;
        } else if (dateRange === 'month') {
            const monthAgo = new Date(today); monthAgo.setMonth(today.getMonth() - 1);
            if (rowDate < monthAgo) visible = false;
        }

        row.style.display = visible ? '' : 'none';
    });
}

function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('statusFilter').value = '';
    document.getElementById('dateFilter').value = '';
    applyFilters();
}

// ─── TOAST ───
function showToast(message, type) {
    let icon = type === 'success' ? 'success' : type === 'error' ? 'error' : 'info';
    GlowAlert.toast(message, icon);
}