const CLOSE_MS = 500;

//function to lock the body scroll
function lockBodyScroll() {
  document.body.style.overflow = "hidden";
}

//function to unlock the body scroll
function unlockBodyScroll() {
  document.body.style.overflow = "auto";
}

function closeModal(dialog: HTMLDialogElement) {
  if (!dialog.open || dialog.classList.contains("modal--closing")) return;

  dialog.classList.add("modal--closing");
  window.setTimeout(() => {
    unlockBodyScroll();
    dialog.close();
    dialog.classList.remove("modal--closing");
  }, CLOSE_MS);
}

document.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;

  const closeButton = target.closest(".modal__close");
  if (closeButton) {
    const dialog = closeButton.closest("dialog.modal");
    if (dialog instanceof HTMLDialogElement) {
      event.preventDefault();
      closeModal(dialog);
    }
    return;
  }

  const opener = target.closest("[data-open-modal]");
  if (opener) {
    lockBodyScroll();
    const modalId = opener.getAttribute("data-open-modal");
    const dialog = modalId ? document.getElementById(modalId) : null;
    if (dialog instanceof HTMLDialogElement) {
      event.preventDefault();
      dialog.showModal();
    }
    return;
  }

  if (
    target instanceof HTMLDialogElement &&
    target.classList.contains("modal")
  ) {
    closeModal(target);
  }
});

document.addEventListener("cancel", (event) => {
  const dialog = event.target;
  if (
    !(dialog instanceof HTMLDialogElement) ||
    !dialog.classList.contains("modal")
  ) {
    return;
  }

  event.preventDefault();
  closeModal(dialog);
});
