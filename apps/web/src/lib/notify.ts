import { toast } from "sonner";

const PENDING_KEY = "vefy-pending-toast";

type ToastType = "success" | "error";

/** Status feedback for API actions; validation errors stay inline in the forms */
export const notify = {
  success: (message: string) => toast.success(message),
  error: (message: string) => toast.error(message),
  /** For actions that end in a full page reload, which would drop a toast shown right away */
  afterReload: (type: ToastType, message: string) => {
    try {
      sessionStorage.setItem(PENDING_KEY, JSON.stringify({ type, message }));
    } catch {
      // Storage blocked (private mode): the toast is simply skipped
    }
  },
};

/** Shows the toast queued by notify.afterReload, once */
export function flushPendingToast() {
  try {
    const raw = sessionStorage.getItem(PENDING_KEY);
    if (!raw) return;
    sessionStorage.removeItem(PENDING_KEY);
    const { type, message } = JSON.parse(raw) as { type: ToastType; message: string };
    notify[type](message);
  } catch {
    // Unreadable or blocked storage: nothing to show
  }
}
