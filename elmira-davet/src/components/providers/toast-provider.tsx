"use client";

import { Toaster } from "react-hot-toast";

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: "#2A2A2A",
          color: "#FAFAFA",
          border: "1px solid #3A3A3A",
          borderRadius: "8px",
          fontSize: "14px",
        },
        success: {
          iconTheme: {
            primary: "#22C55E",
            secondary: "#FAFAFA",
          },
        },
        error: {
          iconTheme: {
            primary: "#EF4444",
            secondary: "#FAFAFA",
          },
        },
      }}
    />
  );
}
