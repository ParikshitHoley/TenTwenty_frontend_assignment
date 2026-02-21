"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@gmail.com");
  const [password, setPassword] = useState("admin");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
        return;
      }

      if (result?.ok) {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Left Side */}
      <div
        style={{
          padding: "2rem",
          display: "flex",
          width: "50%",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#fff",
          paddingLeft: "2rem",
          paddingRight: "2rem",
        }}
      >
        <div style={{ width: "100%", maxWidth: "28rem" }}>
          <h3
            style={{
              marginBottom: "1rem",
              fontSize: "2.25rem",
              fontWeight: "bold",
              color: "#111827",
            }}
          >
            Welcome Back
          </h3>

          {error && (
            <div
              style={{
                marginBottom: "1rem",
                color: "#dc2626",
                backgroundColor: "#fee2e2",
                padding: "0.75rem 1rem",
                borderRadius: "0.375rem",
              }}
            >
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
          >
            <div>
              <label
                htmlFor="email"
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                }}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
                style={{
                  marginTop: "0.5rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.375rem",
                  padding: "0.5rem 1rem",
                  width: "90%",
                  outline: "none",
                }}
              />
            </div>

            <div style={{ marginTop: "1rem" }}>
              <label
                htmlFor="password"
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  color: "#374151",
                }}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                style={{
                  marginTop: "0.5rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.375rem",
                  padding: "0.5rem 1rem",
                  width: "90%",
                  outline: "none",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                marginTop: "1.5rem",
                width: "90%",
                backgroundColor: "#1c64f2",
                color: "#fff",
                padding: "0.75rem 1.5rem",
                border: "none",
                borderRadius: "0.375rem",
                cursor: isLoading ? "not-allowed" : "pointer",
              }}
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>

      {/* Right Side */}
      <div
        style={{
          backgroundColor: "#1c64f2",
          color: "#fff",
          display: "flex",
          width: "50%",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          paddingLeft: "2rem",
          paddingRight: "2rem",
        }}
      >
        <div style={{ textAlign: "left" }}>
          <h2
            style={{
              marginBottom: "1rem",
              fontSize: "3rem",
              fontWeight: "bold",
            }}
          >
            Ticktock
          </h2>
          <p style={{ fontSize: "1.125rem" }}>
            Manage your timesheet efficiently with our intuitive platform.
          </p>
          <p
            style={{
              marginTop: "1rem",
              fontSize: "0.875rem",
              color: "#dbeafe",
            }}
          >
            Track your hours, monitor progress, and stay organized with
            Ticktock.
          </p>
        </div>
      </div>
    </div>
  );
}
