"use client";

import Link from "next/link";
import { useAuth } from "@/context/authContext";

export default function Navbar() {
  const { logout } = useAuth();

  return (
    <nav className="flex gap-5 bg-black text-white p-4 sticky top-0">
      <Link href="/">Home</Link>
      <Link href="/dashboard">Dashboard</Link>
      <Link href="/profile">Profile</Link>
      <button onClick={logout}>
        Logout
      </button>
    </nav>
  );
}