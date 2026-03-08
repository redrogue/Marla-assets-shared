// /assets-shared/js/enquiry-modal.js
console.log("enquiry-modal.js loaded");


// Open Modal Example:
// ----------------------------------------
//
// <a href="#!"
//    onclick="openModal('modal-enquiries', {
//      source: 'Flange Fittings Page',
//      title: 'Flange Product Enquiry',
//      preselectedBranch: 'south'
//    })">
//   Enquire (South Branch)
// </a>




export async function initContactModal(options = {}) {
  let modal = document.getElementById("modal-enquiries");

  // Only fetch and insert once
  if (!modal) {
    // Resolve modal URL from the main script (assets/index.js) so it works whether
    // served from project root, dist/, or nested routes (e.g. /products/foo.html).
    const scriptEl = document.querySelector('script[src*="index.js"]');
    const baseUrl = scriptEl ? scriptEl.src : window.location.href;
    const modalUrl = new URL("../_enquiry-modal.html", baseUrl).href;

    try {
      const res = await fetch(`${modalUrl}?v=${Date.now()}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed to load enquiry form (${res.status})`);
      const html = await res.text();
      document.body.insertAdjacentHTML("beforeend", html);
      modal = document.getElementById("modal-enquiries");
    } catch (err) {
      console.error("Enquiry modal load failed:", err);
      alert("Unable to load the contact form. Please refresh the page or try again later.");
      return;
    }
  }

  if (!modal) return;
  setupContactForm(modal, options);

  if (modal.showModal) modal.showModal();
  else modal.style.display = "block";
}

function setupContactForm(modal, options) {
  if (!modal) return;
  const form = modal.querySelector("#contactForm");
  if (!form) return;

  const thankYouPanel = modal.querySelector("#thanksMessage");
  const sourceField = modal.querySelector("#sourcePage");
  const subjectField = modal.querySelector("#subject"); // Hidden subject field (from branch data)
  const titleField = modal.querySelector("#enquiry_title"); // Visible title field (editable)
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
  // The script tag is inserted alongside the modal, so query from document
  const branchesDataEl = document.querySelector("#branches-data");
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
  // Accept both 'title' and 'subject' for backward compatibility
  const defaultTitle = options.title || options.subject || "General Enquiry";

  // Set the hidden subject field (from branch data, for email subject line)
  const setSubject = value => {
    if (!subjectField) return;
    const val = value || "";
    subjectField.value = val;
    subjectField.setAttribute("value", val);
  };

  // Set the title field (pre-populated but editable by user, for email body)
  const setTitle = value => {
    if (!titleField) return;
    const val = value || "";
    titleField.value = val;
  };

  // Reset form to initial state
  const resetForm = () => {
    // Reset form fields
    if (form) form.reset();
    
    // Reset UI state
    if (branchSection) branchSection.classList.remove("hidden");
    if (formSection) formSection.classList.add("hidden");
    if (formWrapper) formWrapper.classList.add("hidden");
    if (thankYouPanel) thankYouPanel.classList.add("hidden");
    
    // Clear branch-specific outputs
    if (branchOutput) branchOutput.textContent = "";
    if (contactBranchName) contactBranchName.textContent = "";
    if (emailOutput) {
      if (emailOutput.tagName && emailOutput.tagName.toLowerCase() === "a") {
        emailOutput.href = "";
        emailOutput.textContent = "";
      } else {
        emailOutput.textContent = "";
      }
    }
    if (phoneOutput) phoneOutput.textContent = "";
    
    // Reset form name
    setFormName("[DYNAMIC - SET BY JAVASCRIPT]");
    
    // Reset subject and title
    if (subjectField) {
      subjectField.value = "";
    }
    if (titleField) {
      titleField.value = "";
    }
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

  // Reset form to initial state first
  resetForm();
  
  // Then apply options
  if (sourceField) sourceField.value = options.source || "Website Enquiry";
  setTitle(defaultTitle);

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
      // Set hidden subject from branch data (for email subject line)
      setSubject(branch.subject || `${branch.label} Enquiry`);
      // Title: use branch title when link passed generic/no title, else keep link title
      const linkTitle = options.title || options.subject || "";
      const useBranchTitle = !linkTitle || linkTitle === "General Enquiry";
      setTitle(useBranchTitle ? (branch.title || `${branch.label} Enquiry`) : linkTitle);
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
    // Set hidden subject from branch data (for email subject line)
    setSubject(b.subject || `${b.label} Enquiry`);
    // Title: use branch title when link passed generic/no title, else keep link title
    const linkTitle = options.title || options.subject || "";
    const useBranchTitle = !linkTitle || linkTitle === "General Enquiry";
    setTitle(useBranchTitle ? (b.title || `${b.label} Enquiry`) : linkTitle);
  }

  // Store resetForm on modal for access from close handlers
  modal._resetForm = resetForm;

  // Bind close button - inline onclick doesn't work with dynamic HTML in modules
  const closeBtn = modal.querySelector(".modalClose");
  if (closeBtn && !closeBtn.dataset.bound) {
    closeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      resetForm();
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
      if (titleField) titleField.value = "";
    });
    backBtn.dataset.bound = "true";
  }

  // Bind thank you message close button
  const thanksCloseBtn = modal.querySelector("#thanksMessage button[onclick*='closeModal']");
  if (thanksCloseBtn && !thanksCloseBtn.dataset.bound) {
    thanksCloseBtn.addEventListener("click", (e) => {
      e.preventDefault();
      resetForm();
      window.closeModal('modal-enquiries');
    });
    // Remove inline onclick since we're handling it with addEventListener
    thanksCloseBtn.removeAttribute("onclick");
    thanksCloseBtn.dataset.bound = "true";
  }

  form.addEventListener("submit", async e => {
    if (form.dataset.submitting) return;
    e.preventDefault();

    form.dataset.submitting = "true";

    const formData = new FormData(form);
    try {
      const response = await fetch("/", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: new URLSearchParams(formData).toString(),
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
