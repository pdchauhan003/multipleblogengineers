"use client";

import Link from "next/link";
import { useAuth } from "@/context/authContext";

export default function Navbar() {
  const { logout,user } = useAuth();

  return (
    <nav className="flex gap-5 bg-black text-white p-4 sticky top-0">
      <Link href="/blog">Home</Link>
      {
        user?.role == 'creator' && <Link href="/dashboard">Dashboard</Link>
      }
      <Link href={`/profile/${user?.name}`}>Profile</Link>
      <button onClick={logout}>
        Logout
      </button>
    </nav>
  );
}