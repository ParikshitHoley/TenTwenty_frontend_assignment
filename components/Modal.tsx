"use client";

import { useState } from "react";

interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  children: React.ReactNode;
  submitLabel?: string;
  isLoading?: boolean;
}

export default function Modal({
  isOpen,
  title,
  onClose,
  onSubmit,
  children,
  submitLabel = "Save",
  isLoading = false,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "28rem",
          borderRadius: "0.5rem",
          backgroundColor: "#fff",
          paddingLeft: "1.5rem",
          paddingRight: "1.5rem",
          paddingTop: "1.5rem",
          paddingBottom: "1.5rem",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h2
          style={{
            marginBottom: "1rem",
            fontSize: "1.25rem",
            fontWeight: "bold",
          }}
        >
          {title}
        </h2>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await onSubmit(new FormData(e.currentTarget));
            onClose();
          }}
        >
          {children}
          <div
            style={{
              marginTop: "1.5rem",
              display: "flex",
              gap: "0.75rem",
              justifyContent: "flex-end",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                borderRadius: "0.375rem",
                backgroundColor: "#e5e7eb",
                color: "#374151",
                paddingLeft: "1rem",
                paddingRight: "1rem",
                paddingTop: "0.5rem",
                paddingBottom: "0.5rem",
                transition: "all",
                cursor: "pointer",
                border: "none",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#d1d5db")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#e5e7eb")
              }
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                borderRadius: "0.375rem",
                backgroundColor: "#3b82f6",
                color: "#fff",
                paddingLeft: "1rem",
                paddingRight: "1rem",
                paddingTop: "0.5rem",
                paddingBottom: "0.5rem",
                transition: "all",
                cursor: isLoading ? "not-allowed" : "pointer",
                border: "none",
                opacity: isLoading ? 0.6 : 1,
              }}
              onMouseEnter={(e) =>
                !isLoading &&
                (e.currentTarget.style.backgroundColor = "#2563eb")
              }
              onMouseLeave={(e) =>
                !isLoading &&
                (e.currentTarget.style.backgroundColor = "#3b82f6")
              }
            >
              {isLoading ? "Saving..." : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
