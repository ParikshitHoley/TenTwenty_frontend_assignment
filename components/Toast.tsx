"use client";

import { useEffect, useState } from "react";

export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
  duration?: number;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (
    message: string,
    type: "success" | "error" | "info" = "info",
    duration = 3000,
  ) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }

    return id;
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return { toasts, addToast, removeToast };
}

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: "1rem",
        right: "1rem",
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
      }}
    >
      {toasts.map((toast) => {
        const bgColor =
          toast.type === "success"
            ? "#22c55e"
            : toast.type === "error"
              ? "#ef4444"
              : "#3b82f6";
        return (
          <div
            key={toast.id}
            style={{
              borderRadius: "0.5rem",
              paddingLeft: "1rem",
              paddingRight: "1rem",
              paddingTop: "1rem",
              paddingBottom: "1rem",
              color: "#fff",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
              backgroundColor: bgColor,
              animation: "slideInRight 0.3s ease-out",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span>{toast.message}</span>
              <button
                onClick={() => onRemove(toast.id)}
                style={{
                  marginLeft: "0.5rem",
                  fontSize: "1.125rem",
                  fontWeight: "bold",
                  backgroundColor: "transparent",
                  border: "none",
                  color: "#fff",
                  cursor: "pointer",
                  padding: 0,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#e5e7eb")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#fff")}
              >
                ×
              </button>
            </div>
          </div>
        );
      })}
      <style>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
