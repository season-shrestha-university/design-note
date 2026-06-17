import {
  isTransitionBeforeSwapEvent,
  navigate,
} from "astro:transitions/client";

const NAV_OVERLAY_ID = "nav-overlay";
let pendingModalNavigation = false;

function showNavOverlay() {
  document.getElementById(NAV_OVERLAY_ID)?.classList.add("is-visible");
}

function hideNavOverlay() {
  document.getElementById(NAV_OVERLAY_ID)?.classList.remove("is-visible");
}

function endModalNavigation() {
  hideNavOverlay();
}

function closeModal(dialog: HTMLDialogElement) {
  if (!dialog.open) return;

  dialog.close();
}

function navigateFromModal(link: HTMLAnchorElement, dialog: HTMLDialogElement) {
  const href = link.getAttribute("href");
  if (!href) return;

  pendingModalNavigation = true;
  showNavOverlay();
  closeModal(dialog);

  const handleBeforeSwap = (event: Event) => {
    if (!pendingModalNavigation || !isTransitionBeforeSwapEvent(event)) return;

    void event.viewTransition.finished.then(() => {
      pendingModalNavigation = false;
      endModalNavigation();
    });
  };

  document.addEventListener("astro:before-swap", handleBeforeSwap, { once: true });

  void navigate(href).catch(() => {
    pendingModalNavigation = false;
    endModalNavigation();
  });
}

document.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;

  const navLink = target.closest(".modal a[href]");
  if (navLink instanceof HTMLAnchorElement) {
    const dialog = navLink.closest("dialog.modal");
    if (dialog instanceof HTMLDialogElement && dialog.open) {
      event.preventDefault();
      navigateFromModal(navLink, dialog);
    }
    return;
  }

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
