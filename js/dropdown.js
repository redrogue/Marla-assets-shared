// assets/shared/dropdown.js
console.log("dropdown.js loaded successfully");

document.addEventListener("DOMContentLoaded", () => {
  const trigger = document.getElementById("contactTrigger");
  const menu = document.getElementById("contactDropdown");

  if (!trigger || !menu) return;

  let hideTimer;

  function showMenu() {
    clearTimeout(hideTimer);

    const rect = trigger.getBoundingClientRect();

    // Make visible before measuring width
    menu.classList.remove("hidden");

    const menuWidth = menu.offsetWidth;

    // Align right edges
    menu.style.top = `${rect.bottom + window.scrollY}px`;
    menu.style.left = `${rect.right - menuWidth + window.scrollX}px`;
  }

  function hideMenu() {
    // Delay hide slightly so user can move between button and menu
    hideTimer = setTimeout(() => {
      menu.classList.add("hidden");
    }, 150);
  }

  // Hover events (desktop)
  trigger.addEventListener("mouseenter", () => {
    if (window.innerWidth >= 1024) showMenu();
  });

  trigger.addEventListener("mouseleave", () => {
    if (window.innerWidth >= 1024) hideMenu();
  });

  menu.addEventListener("mouseenter", () => clearTimeout(hideTimer));
  menu.addEventListener("mouseleave", hideMenu);

  // Click toggle as backup for touch devices
  trigger.addEventListener("click", (e) => {
    e.preventDefault();
    if (menu.classList.contains("hidden")) {
      showMenu();
    } else {
      hideMenu();
    }
  });
});


