import {
  navigate,
  type TransitionBeforeSwapEvent,
} from "astro:transitions/client";

const NAV_OVERLAY_ID = "nav-overlay";
let pendingModalNavigation = false;

function showNavOverlay() {
  document.getElementById(NAV_OVERLAY_ID)?.classList.add("is-visible");
}

function hideNavOverlay() {
  document.getElementById(NAV_OVERLAY_ID)?.classList.remove("is-visible");
}

function finishModalNavigation() {
  pendingModalNavigation = false;
  hideNavOverlay();
}

function syncHeaderVisibility() {
  const header = document.querySelector<HTMLElement>(".site-header");
  header?.classList.toggle(
    "site-header--hidden",
    window.location.pathname === "/",
  );
}

document.addEventListener("astro:after-swap", () => {
  syncHeaderVisibility();
});

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

  let swapSeen = false;
  const handleBeforeSwap = (event: TransitionBeforeSwapEvent) => {
    if (!pendingModalNavigation) return;
    swapSeen = true;

    void event.viewTransition.finished.then(finishModalNavigation);
  };

  document.addEventListener("astro:before-swap", handleBeforeSwap, {
    once: true,
  });

  void navigate(href)
    .then(() => {
      // Failsafe: navigation resolved without a view transition (e.g. aborted
      // or unsupported), so the overlay would otherwise stay stuck on screen.
      if (pendingModalNavigation && !swapSeen) finishModalNavigation();
    })
    .catch(finishModalNavigation);
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
