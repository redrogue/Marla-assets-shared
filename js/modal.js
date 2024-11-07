
// Ensure the file runs as expected in a module context
console.log("modal.js loaded");

function openModal(modalId) {
    // Close any currently open modals
    var modals = document.getElementsByClassName('modalWindow');
    for (var i = 0; i < modals.length; i++) {
        modals[i].style.display = "none";
    }

    // Open the requested modal
    document.getElementById(modalId).style.display = "block";
    document.body.classList.add('overflow-hidden'); // Prevent scrolling on body
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = "none";
    document.body.classList.remove('overflow-hidden'); // Re-enable scrolling on body
}

// Attach functions to window object to make them accessible globally
window.openModal = openModal;
window.closeModal = closeModal;

// Optional: Close modals if the user clicks anywhere outside of the modal content
window.onclick = function (event) {
    if (event.target.classList.contains('modalWindow')) {
        closeModal(event.target.id);
    }
}
