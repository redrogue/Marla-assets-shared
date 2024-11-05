
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

// Optional: Close modals if the user clicks anywhere outside of the modal content
window.onclick = function (event) {
    if (event.target.classList.contains('modalWindow')) {
        closeModal(event.target.id);
    }
}
