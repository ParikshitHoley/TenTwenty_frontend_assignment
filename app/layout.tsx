import type { Metadata } from "next";
import { AuthProvider } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ticktock - Timesheet Manager",
  description: "Manage your timesheet with ease",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: "#f9fafb" }}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
