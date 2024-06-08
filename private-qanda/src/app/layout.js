"use client";

import "../styles/globals.css";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RootLayout({ children }) {
  const router = useRouter();

  useEffect(() => {
    const loggedInUser = localStorage.getItem("user");
    if (!loggedInUser && window.location.pathname !== "/login") {
      router.push("/login");
    }
  }, [router]);

  return (
    <html lang='ja'>
      <body>{children}</body>
    </html>
  );
}
