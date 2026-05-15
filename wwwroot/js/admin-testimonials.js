// ═══ TESTIMONIALS & REVIEWS PAGE JS ═══

// ─── TESTIMONIALS ───

function approveTestimonial(id) {
    fetch('/Admin/ApproveTestimonial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `id=${id}`
    })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                const badge = document.getElementById(`testimonial-badge-${id}`);
                const btn = document.getElementById(`testimonial-btn-${id}`);
                const row = document.getElementById(`testimonial-row-${id}`);

                if (data.approved) {
                    badge.className = 'badge badge-shipped';
                    badge.textContent = 'Approved';
                    btn.className = 'btn btn-sm btn-secondary';
                    btn.textContent = 'Revoke';
                    row.dataset.status = 'approved';
                    showToast('Testimonial approved', 'success');
                } else {
                    badge.className = 'badge badge-pending';
                    badge.textContent = 'Pending';
                    btn.className = 'btn btn-sm btn-primary';
                    btn.textContent = 'Approve';
                    row.dataset.status = 'pending';
                    showToast('Testimonial revoked', 'info');
                }
            }
        })
        .catch(() => showToast('Action failed', 'error'));
}

function deleteTestimonial(id) {
    if (!confirm('Delete this testimonial? This cannot be undone.')) return;

    fetch('/Admin/DeleteTestimonial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `id=${id}`
    })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                const row = document.getElementById(`testimonial-row-${id}`);
                if (row) {
                    row.style.transition = 'opacity 0.3s';
                    row.style.opacity = '0';
                    setTimeout(() => row.remove(), 300);
                }
                showToast('Testimonial deleted', 'success');
            }
        })
        .catch(() => showToast('Delete failed', 'error'));
}

// ─── REVIEWS ───

function approveReview(id) {
    fetch('/Admin/ApproveReview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `id=${id}`
    })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                const badge = document.getElementById(`review-badge-${id}`);
                const btn = document.getElementById(`review-btn-${id}`);
                const row = document.getElementById(`review-row-${id}`);

                if (data.approved) {
                    badge.className = 'badge badge-shipped';
                    badge.textContent = 'Approved';
                    btn.className = 'btn btn-sm btn-secondary';
                    btn.textContent = 'Revoke';
                    row.dataset.status = 'approved';
                    showToast('Review approved', 'success');
                } else {
                    badge.className = 'badge badge-pending';
                    badge.textContent = 'Pending';
                    btn.className = 'btn btn-sm btn-primary';
                    btn.textContent = 'Approve';
                    row.dataset.status = 'pending';
                    showToast('Review revoked', 'info');
                }
            }
        })
        .catch(() => showToast('Action failed', 'error'));
}

function deleteReview(id) {
    if (!confirm('Delete this review? This cannot be undone.')) return;

    fetch('/Admin/DeleteReview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `id=${id}`
    })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                const row = document.getElementById(`review-row-${id}`);
                if (row) {
                    row.style.transition = 'opacity 0.3s';
                    row.style.opacity = '0';
                    setTimeout(() => row.remove(), 300);
                }
                showToast('Review deleted', 'success');
            }
        })
        .catch(() => showToast('Delete failed', 'error'));
}

// ─── TESTIMONIAL FILTERS ───

document.getElementById('testimonialSearch')?.addEventListener('input', filterTestimonials);
document.getElementById('testimonialStatusFilter')?.addEventListener('change', filterTestimonials);

function filterTestimonials() {
    const search = document.getElementById('testimonialSearch').value.toLowerCase();
    const status = document.getElementById('testimonialStatusFilter').value;

    document.querySelectorAll('#testimonialsTable tbody tr').forEach(row => {
        const user = row.dataset.user || '';
        const rowStatus = row.dataset.status || '';
        let visible = true;
        if (search && !user.includes(search)) visible = false;
        if (status && rowStatus !== status) visible = false;
        row.style.display = visible ? '' : 'none';
    });
}

function clearTestimonialFilters() {
    document.getElementById('testimonialSearch').value = '';
    document.getElementById('testimonialStatusFilter').value = '';
    filterTestimonials();
}

// ─── REVIEW FILTERS ───

document.getElementById('reviewSearch')?.addEventListener('input', filterReviews);
document.getElementById('reviewStatusFilter')?.addEventListener('change', filterReviews);
document.getElementById('reviewRatingFilter')?.addEventListener('change', filterReviews);

function filterReviews() {
    const search = document.getElementById('reviewSearch').value.toLowerCase();
    const status = document.getElementById('reviewStatusFilter').value;
    const rating = document.getElementById('reviewRatingFilter').value;

    document.querySelectorAll('#reviewsTable tbody tr').forEach(row => {
        const user = row.dataset.user || '';
        const product = row.dataset.product || '';
        const rowStatus = row.dataset.status || '';
        const rowRating = row.dataset.rating || '';
        let visible = true;
        if (search && !user.includes(search) && !product.includes(search)) visible = false;
        if (status && rowStatus !== status) visible = false;
        if (rating && rowRating !== rating) visible = false;
        row.style.display = visible ? '' : 'none';
    });
}

function clearReviewFilters() {
    document.getElementById('reviewSearch').value = '';
    document.getElementById('reviewStatusFilter').value = '';
    document.getElementById('reviewRatingFilter').value = '';
    filterReviews();
}

// ─── TOAST ───
function showToast(message, type) {
    const existing = document.getElementById('adminToast');
    if (existing) existing.remove();

    const colors = { success: 'var(--olive)', error: '#c0392b', info: 'var(--muted)' };
    const icons = { success: 'fa-check-circle', error: 'fa-circle-xmark', info: 'fa-info-circle' };

    const toast = document.createElement('div');
    toast.id = 'adminToast';
    toast.innerHTML = `<i class="fa-solid ${icons[type] || icons.success} me-2"></i>${message}`;
    Object.assign(toast.style, {
        position: 'fixed', bottom: '24px', right: '24px', zIndex: '9999',
        background: colors[type] || colors.success, color: '#fff',
        padding: '12px 20px', borderRadius: '8px', fontSize: '13px',
        fontWeight: '500', boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
        transition: 'opacity 0.3s', display: 'flex', alignItems: 'center'
    });
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 3000);
}