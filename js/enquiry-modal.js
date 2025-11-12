// /assets-shared/js/enquiry-modal.js
console.log("enquiry-modal.js loaded");


// Open Modal Example:
// ----------------------------------------
//
// <a href="#!"
//    onclick="openModal('modal-enquiries', {
//      source: 'Flange Fittings Page',
//      subject: 'Flange Product Enquiry',
//      preselectedBranch: 'south'
//    })">
//   Enquire (South Branch)
// </a>




export async function initContactModal(options = {}) {
  let modal = document.getElementById("modal-enquiries");

  // Only fetch and insert once
  if (!modal) {
    // Build the correct relative path to _enquiry-modal.html
    const modalUrl = `${window.location.pathname.replace(/[^/]*$/, "")}_enquiry-modal.html`;

    // 🔸 Fetch fresh each time during development to avoid caching issues
    const html = await (await fetch(`${modalUrl}?v=${Date.now()}`, { cache: "no-store" })).text();

    // Insert into the DOM
    document.body.insertAdjacentHTML("beforeend", html);

    // Re-query for the newly inserted element
    modal = document.getElementById("modal-enquiries");
  }

  setupContactForm(modal, options);

  if (modal.showModal) modal.showModal();
  else modal.style.display = "block";
}

function setupContactForm(modal, options) {
  const form = modal.querySelector("#contactForm");
  if (!form) return;

  const thankYouPanel = modal.querySelector("#thanksMessage");
  const sourceField = modal.querySelector("#sourcePage");
  const subjectField = modal.querySelector("#subject");
  const sendToField = modal.querySelector("#sendTo");
  const branchOutput = modal.querySelector("#branchOutput");
  const contactBranchName = modal.querySelector("#contactBranchName");
  const emailOutput = modal.querySelector("#emailOutput");
  const phoneOutput = modal.querySelector("#phoneOutput");
  const branchContainer = modal.querySelector("#branchOptions");
  const branchTemplate = modal.querySelector("#branchOptionTemplate");
  const formWrapper = modal.querySelector("#formWrapper");
  const branchSection = modal.querySelector("#branchSection");
  const formSection = modal.querySelector("#formSection");

  // Load site-specific branch data from HTML
  const branchesDataEl = modal.querySelector("#branches-data");
  if (!branchesDataEl) {
    console.error("Branch data not found in modal HTML. Please add a <script type='application/json' id='branches-data'> element.");
    return;
  }
  
  let BRANCHES;
  try {
    BRANCHES = JSON.parse(branchesDataEl.textContent);
  } catch (e) {
    console.error("Failed to parse branch data:", e);
    return;
  }

  // Apply metadata (guard if fields are missing)
  const defaultSubject = options.subject || "General Enquiry";

  const setSubject = value => {
    if (!subjectField) return;
    const val = value || "";
    subjectField.value = val;
    subjectField.setAttribute("value", val);
  };

  // Function to update form name dynamically
  // Updates both the form's name attribute AND the hidden form-name input's value
  const setFormName = (formName) => {
    if (!form) return;
    const formNameInput = form.querySelector('input[name="form-name"]');
    if (formNameInput) {
      formNameInput.value = formName;
      formNameInput.setAttribute("value", formName);
    }
    form.name = formName;
    form.setAttribute("name", formName);
  };

  if (sourceField) sourceField.value = options.source || "Website Enquiry";
  setSubject(defaultSubject);

  // Rebuild branch cards
  branchContainer.innerHTML = "";
  Object.entries(BRANCHES).forEach(([key, data]) => {
    const node = branchTemplate.content.cloneNode(true);
    const card = node.querySelector(".branch-card");
    card.dataset.branch = key;
    card.querySelector(".branch-name").textContent = data.label;
    branchContainer.appendChild(node);
  });

  // Click handler
  branchContainer.querySelectorAll(".option").forEach(btn => {
    btn.addEventListener("click", e => {
      const branchKey = e.currentTarget.dataset.branch;
      const branch = BRANCHES[branchKey];
      if (!branch) return;

      if (branchSection) branchSection.classList.add("hidden");
      if (formSection) formSection.classList.remove("hidden");
      if (formWrapper) formWrapper.classList.remove("hidden");

      // Update form name to branch-specific form name
      setFormName(branch.formName);

      if (sendToField) sendToField.value = branch.email;
      if (branchOutput) branchOutput.textContent = `${branch.label}`;
      if (contactBranchName) contactBranchName.textContent = `${branch.label}`;
      if (emailOutput) {
        if (emailOutput.tagName && emailOutput.tagName.toLowerCase() === "a") {
          emailOutput.href = `mailto:${branch.email}`;
          emailOutput.textContent = `${branch.email}`;
        } else {
          emailOutput.textContent = `${branch.email}`;
        }
      }
      if (phoneOutput) phoneOutput.textContent = `${branch.phone}`;
      setSubject(options.subject || `${branch.label} Enquiry`);
    });
  });

  // Preselected branch option
  if (options.preselectedBranch && BRANCHES[options.preselectedBranch]) {
    const b = BRANCHES[options.preselectedBranch];
    if (branchSection) branchSection.classList.add("hidden");
    if (formSection) formSection.classList.remove("hidden");
    if (formWrapper) formWrapper.classList.remove("hidden");
    
    // Update form name to branch-specific form name
    setFormName(b.formName);
    
    if (sendToField) sendToField.value = b.email;
    if (branchOutput) branchOutput.textContent = `${b.label}`;
    if (contactBranchName) contactBranchName.textContent = `${b.label}`;
    if (emailOutput) {
      if (emailOutput.tagName && emailOutput.tagName.toLowerCase() === "a") {
        emailOutput.href = `mailto:${b.email}`;
        emailOutput.textContent = `${b.email}`;
      } else {
        emailOutput.textContent = `${b.email}`;
      }
    }
    if (phoneOutput) phoneOutput.textContent = `${b.phone}`;
    setSubject(options.subject || `${b.label} Enquiry`);
  }

  // Bind close button - inline onclick doesn't work with dynamic HTML in modules
  const closeBtn = modal.querySelector(".modalClose");
  if (closeBtn && !closeBtn.dataset.bound) {
    closeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.closeModal('modal-enquiries');
    });
    closeBtn.dataset.bound = "true";
  }

  // Bind back button to return to branch options
  const backBtn = modal.querySelector("#backToBranches");
  if (backBtn && !backBtn.dataset.bound) {
    backBtn.addEventListener("click", (e) => {
      e.preventDefault();
      // Show branch section, hide form section
      if (branchSection) branchSection.classList.remove("hidden");
      if (formSection) formSection.classList.add("hidden");
      if (formWrapper) formWrapper.classList.add("hidden");
      // Reset fields to defaults
      if (sendToField) sendToField.value = "";
      if (branchOutput) branchOutput.textContent = "";
      if (contactBranchName) contactBranchName.textContent = "";
      if (emailOutput) {
        if (emailOutput.tagName && emailOutput.tagName.toLowerCase() === "a") {
          emailOutput.removeAttribute("href");
          emailOutput.textContent = "";
        } else {
          emailOutput.textContent = "";
        }
      }
      if (phoneOutput) phoneOutput.textContent = "";
      if (thankYouPanel) thankYouPanel.classList.add("hidden");
      setSubject(defaultSubject);
    });
    backBtn.dataset.bound = "true";
  }

  form.addEventListener("submit", async e => {
    if (form.dataset.submitting) return;
    e.preventDefault();

    form.dataset.submitting = "true";

    const formData = new FormData(form);
    try {
      const response = await fetch("/", {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        // Hide form wrapper, show thank you message
        if (formWrapper) formWrapper.classList.add("hidden");
        if (thankYouPanel) thankYouPanel.classList.remove("hidden");
      } else {
        console.error("Form submission failed:", await response.text());
        alert("Sorry, something went wrong. Please try again.");
      }
    } catch (err) {
      console.error("Form submission failed", err);
      alert("Sorry, something went wrong. Please try again.");
    } finally {
      delete form.dataset.submitting;
    }
  });
}
