"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      setIsLoading(false);
    }
  }, [status, router]);

  if (isLoading || status === "loading") {
    return (
      <div
        style={{
          display: "flex",
          height: "100vh",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f9fafb",
        }}
      >
        <p style={{ color: "#6b7280" }}>Loading...</p>
      </div>
    );
  }

  return <>{children}</>;
}
