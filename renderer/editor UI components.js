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

  static ShowNotification(message, options = {}) {
    const text = String(message ?? "");
    const duration = options.duration ?? 900;
    const type = options.type ?? "info";
    const root = this.ensureNotificationRoot();

    const toast = document.createElement("div");
    toast.className = `ide-notification ide-notification--${type}`;
    toast.innerHTML = `
      <div class="ide-notification__content">
        ${text}
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

globalThis.IDEComponentApi = IDEComponentApi;
window.IDEComponentApi = IDEComponentApi;

export { IDEComponentApi };
