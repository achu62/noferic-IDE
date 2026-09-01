class IDEComponentApi {
  static notificationRootId = "ide-notification-root";

  static ensureNotificationRoot() {
    let root = document.getElementById(this.notificationRootId);

    if (!root) {
      root = document.createElement("div");
      root.id = this.notificationRootId;
      root.setAttribute("aria-live", "polite");
      root.setAttribute("aria-atomic", "true");
      document.body.appendChild(root);
    }

    return root;
  }

  static getIconMarkup(type = "normie") {
    const normalizedType = String(type ?? "normie").toLowerCase();

    if (normalizedType === "success") {
      return `
        <svg viewBox="0 0 24 24" class="ide-notification__svg" aria-hidden="true">
          <circle cx="12" cy="12" r="9"></circle>
          <path d="M8.2 12.5l2.5 2.6 5.1-6"></path>
        </svg>
      `;
    }

    if (normalizedType === "error") {
      return `
        <svg viewBox="0 0 24 24" class="ide-notification__svg" aria-hidden="true">
          <circle cx="12" cy="12" r="9"></circle>
          <path d="M8.5 8.5l7 7M15.5 8.5l-7 7"></path>
        </svg>
      `;
    }

    if (normalizedType === "warning") {
      return `
        <svg viewBox="0 0 24 24" class="ide-notification__svg" aria-hidden="true">
          <path d="M12 4.5l8.5 15H3.5L12 4.5z"></path>
          <path d="M12 9.2v4.5"></path>
          <circle cx="12" cy="16.6" r="0.8" fill="currentColor" stroke="none"></circle>
        </svg>
      `;
    }

    if (normalizedType === "info") {
      return `
        <svg viewBox="0 0 24 24" class="ide-notification__svg" aria-hidden="true">
          <circle cx="12" cy="12" r="9"></circle>
          <path d="M12 11v5"></path>
          <circle cx="12" cy="7.8" r="0.8" fill="currentColor" stroke="none"></circle>
        </svg>
      `;
    }

    return "";
  }

  static ShowNotification(message, options = {}) {
    const text = String(message ?? "");
    const duration = Number.isFinite(options.duration) ? options.duration : 900;
    const type = String(options.type ?? "normie").toLowerCase();
    const root = this.ensureNotificationRoot();

    const toast = document.createElement("div");
    const normalizedType = type === "info" ? "normie" : type;
    toast.className = `ide-notification ide-notification--${normalizedType}`;

    const iconMarkup = this.getIconMarkup(type);
    const closeButton = `
      <button type="button" class="ide-notification__close" aria-label="Close notification">
        ×
      </button>
    `;

    toast.innerHTML = `
      <div class="ide-notification__body">
        ${iconMarkup ? `<div class="ide-notification__icon-wrap">${iconMarkup}</div>` : ""}
        <div class="ide-notification__content">${text}</div>
        ${closeButton}
      </div>
    `;

    root.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add("ide-notification--visible");
    });

    const hide = () => {
      toast.classList.remove("ide-notification--visible");
      toast.classList.add("ide-notification--hidden");

      setTimeout(() => {
        toast.remove();
        if (!root.childElementCount) {
          root.remove();
        }
      }, 220);
    };

    const timer = setTimeout(hide, duration);

    const closeTrigger = toast.querySelector(".ide-notification__close");
    if (closeTrigger) {
      closeTrigger.addEventListener("click", (event) => {
        event.stopPropagation();
        clearTimeout(timer);
        hide();
      });
    }

    toast.addEventListener("click", () => {
      clearTimeout(timer);
      hide();
    });

    return {
      element: toast,
      close: () => {
        clearTimeout(timer);
        hide();
      },
    };
  }
}

export { IDEComponentApi };
