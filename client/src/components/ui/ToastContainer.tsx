import { useUiStore } from "../../store/uiStore";

export const ToastContainer = () => {
  const { toasts, removeToast } = useUiStore();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`px-4 py-3 rounded-lg text-sm font-medium shadow-lg flex items-center gap-3 cursor-pointer transition-all ${
            toast.type === "success"
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : toast.type === "error"
                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
          }`}
          onClick={() => removeToast(toast.id)}
        >
          {toast.type === "success" ? "✓" : toast.type === "error" ? "✕" : "ℹ"}
          {toast.message}
        </div>
      ))}
    </div>
  );
};
