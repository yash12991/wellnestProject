// src/utils/toast.js
import { toast } from "sonner";

export const showToast = {
  success: (msg) =>
    toast.success(msg, {
      duration: 2500,
      style: {
        background: "linear-gradient(90deg, #10B981, #34D399)",
        color: "white",
        borderRadius: "12px",
        fontWeight: "600",
        boxShadow: "0 4px 12px rgba(16, 185, 129, 0.4)",
      },
    }),

  error: (msg) =>
    toast.error(msg, {
      duration: 2500,
      style: {
        background: "linear-gradient(90deg, #EF4444, #F87171)",
        color: "white",
        borderRadius: "12px",
        fontWeight: "600",
        boxShadow: "0 4px 12px rgba(239, 68, 68, 0.4)",
      },
    }),

  info: (msg) =>
    toast(msg, {
      duration: 2500,
      style: {
        background: "linear-gradient(90deg, #3B82F6, #60A5FA)",
        color: "white",
        borderRadius: "12px",
        fontWeight: "600",
        boxShadow: "0 4px 12px rgba(59, 130, 246, 0.4)",
      },
    }),
};
