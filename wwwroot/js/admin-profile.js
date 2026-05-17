// ═══ PROFILE MODAL JS ═══

// Open profile modal — call this from the topbar avatar click
function openProfile() {
    const modalEl = document.getElementById('profileModal');
    if (!modalEl) return;

    const body = document.getElementById('profileModalBody');
    body.innerHTML = `
        <div class="text-center py-4">
            <div class="spinner-border" style="color:var(--olive);" role="status"></div>
        </div>`;

    const modal = new bootstrap.Modal(modalEl);
    modal.show();

    fetch('/Admin/Profile')
        .then(r => r.text())
        .then(html => { body.innerHTML = html; })
        .catch(() => {
            body.innerHTML = `<div class="alert alert-danger m-3">Failed to load profile.</div>`;
        });
}

// Save profile changes
function saveProfile() {
    const fullName = document.getElementById('profileFullName')?.value?.trim();
    const email = document.getElementById('profileEmail')?.value?.trim();
    const newPassword = document.getElementById('profileNewPassword')?.value;
    const alertEl = document.getElementById('profileAlert');

    if (!fullName || !email) {
        showProfileAlert('Name and email are required.', 'danger');
        return;
    }

    const params = new URLSearchParams({ fullName, email });
    if (newPassword) params.append('newPassword', newPassword);

    fetch('/Admin/UpdateProfile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
    })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                showProfileAlert('Profile updated successfully!', 'success');
                // Update topbar name if present
                const nameEl = document.querySelector('.topbar-user-info .name');
                if (nameEl) nameEl.textContent = fullName;
                const avatar = document.querySelector('.topbar-user .avatar');
                if (avatar) avatar.textContent = fullName.charAt(0).toUpperCase();
            } else {
                showProfileAlert('Update failed. Please try again.', 'danger');
            }
        })
        .catch(() => showProfileAlert('An error occurred.', 'danger'));
}

function showProfileAlert(message, type) {
    if (type === 'success') {
        GlowAlert.toast(message, 'success');
    } else {
        GlowAlert.error('Error', message);
    }
}

// Toggle password visibility
function togglePassword(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const isText = input.type === 'text';
    input.type = isText ? 'password' : 'text';
    btn.innerHTML = isText
        ? '<i class="fa-regular fa-eye"></i>'
        : '<i class="fa-regular fa-eye-slash"></i>';
}