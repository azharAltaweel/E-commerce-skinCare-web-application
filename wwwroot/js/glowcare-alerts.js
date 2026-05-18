/**
 * GlowCare Rituals - Premium SweetAlert2 Global Integration
 */

// Initialize SweetAlert2 brand config globally
window.GlowAlert = {
    fire: function(options) {
        let defaults = {
            customClass: {
                popup: 'glowcare-swal-popup',
                title: 'glowcare-swal-title',
                htmlContainer: 'glowcare-swal-html',
                confirmButton: 'swal2-confirm glowcare-swal-confirm',
                cancelButton: 'swal2-cancel glowcare-swal-cancel'
            },
            buttonsStyling: false
        };
        return Swal.fire(Object.assign({}, defaults, options));
    },
    success: function(title, text) {
        return this.fire({ icon: 'success', title: title, text: text });
    },
    error: function(title, text) {
        return this.fire({ icon: 'error', title: title, text: text });
    },
    warning: function(title, text) {
        return this.fire({ icon: 'warning', title: title, text: text });
    },
    info: function(title, text) {
        return this.fire({ icon: 'info', title: title, text: text });
    },
    confirm: function(title, text, confirmBtnText = 'Yes, Proceed') {
        return this.fire({
            title: title,
            text: text,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: confirmBtnText,
            cancelButtonText: 'Cancel'
        });
    },
    toast: function(message, icon = 'success') {
        return Swal.fire({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3500,
            timerProgressBar: true,
            icon: icon,
            title: message,
            customClass: {
                popup: 'glowcare-swal-toast'
            }
        });
    }
};

// Auto-intercept standard confirmation links and buttons
document.addEventListener('DOMContentLoaded', () => {
    // 1. Listen for global clicks on elements that have a data-confirm attribute
    document.body.addEventListener('click', function(e) {
        let target = e.target.closest('[data-confirm]');
        if (target) {
            // Check if we already confirmed this action
            if (target.dataset.glowConfirmed === 'true') {
                return; // Let the normal click bubble and trigger
            }

            e.preventDefault();
            e.stopPropagation();

            let message = target.getAttribute('data-confirm') || 'Are you sure you want to perform this action?';
            let title = target.getAttribute('data-confirm-title') || 'Confirm Action';
            let actionText = target.getAttribute('data-confirm-action') || 'Yes, proceed';
            let isDelete = message.toLowerCase().includes('delete') || actionText.toLowerCase().includes('delete') || target.classList.contains('btn-danger');

            GlowAlert.fire({
                title: title,
                text: message,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: actionText,
                cancelButtonText: 'Cancel',
                confirmButtonColor: isDelete ? '#dc3545' : '#635f40'
            }).then((result) => {
                if (result.isConfirmed) {
                    target.dataset.glowConfirmed = 'true';
                    // Re-trigger the click event asynchronously
                    if (target.tagName === 'BUTTON' && target.type === 'submit') {
                        let form = target.closest('form');
                        if (form) {
                            // If it's a submit button, submit its parent form directly
                            if (typeof form.requestSubmit === 'function') {
                                form.requestSubmit(target);
                            } else {
                                form.submit();
                            }
                        }
                    } else {
                        target.click();
                    }
                    // Reset confirm state after click triggers
                    setTimeout(() => {
                        delete target.dataset.glowConfirmed;
                    }, 500);
                }
            });
        }
    });

    // 2. Automatically intercept any forms using classic onsubmit="return confirm('...')"
    // We do this by scanning forms and upgrading their submit handler
    document.querySelectorAll('form[onsubmit*="confirm("]').forEach(form => {
        let onsubmitAttr = form.getAttribute('onsubmit');
        // Extract the message from confirm('...')
        let match = onsubmitAttr.match(/confirm\(['"](.*)['"]\)/);
        let confirmMessage = match ? match[1] : 'Are you sure?';

        // Remove the inline handler to prevent dual popups
        form.removeAttribute('onsubmit');

        form.addEventListener('submit', function(e) {
            if (form.dataset.glowConfirmed === 'true') {
                return;
            }

            e.preventDefault();

            let isDelete = confirmMessage.toLowerCase().includes('delete') || form.action.toLowerCase().includes('delete');

            GlowAlert.fire({
                title: isDelete ? 'Delete Item?' : 'Confirm Action',
                text: confirmMessage,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: isDelete ? 'Yes, Delete' : 'Confirm',
                cancelButtonText: 'Cancel',
                confirmButtonColor: isDelete ? '#dc3545' : '#635f40'
            }).then((result) => {
                if (result.isConfirmed) {
                    form.dataset.glowConfirmed = 'true';
                    form.submit();
                }
            });
        });
    });
});
