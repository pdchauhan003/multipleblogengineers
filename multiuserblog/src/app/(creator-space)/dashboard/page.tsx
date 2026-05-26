'use client';

import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LogOut, LayoutDashboard, User as UserIcon, Shield } from "lucide-react";

export default function Dashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-pulse"></div>
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
        </div>
        <p className="text-gray-400 mt-6 font-medium animate-pulse tracking-wide text-sm">
          Loading dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white px-4 py-8 md:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-white/10 pb-6 mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600/10 border border-indigo-500/20 rounded-xl text-indigo-400">
              <LayoutDashboard size={24} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Creator Dashboard</h1>
              <p className="text-gray-400 text-sm mt-1">Manage your engineering blogs and dashboard settings</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600/10 hover:bg-red-600 border border-red-500/30 hover:border-transparent rounded-lg text-red-400 hover:text-white transition active:scale-[0.98] self-start"
          >
            <LogOut size={16} />
            <span className="font-medium text-sm">Log Out</span>
          </button>
        </header>

        {/* Profile Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <h2 className="text-lg font-semibold mb-4 text-gray-200">Account Details</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 bg-white/5 rounded-xl border border-white/5">
                <div className="p-2.5 bg-gray-800 rounded-lg text-gray-400">
                  <UserIcon size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Full Name</p>
                  <p className="text-sm font-medium text-white">{user.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 bg-white/5 rounded-xl border border-white/5">
                <div className="p-2.5 bg-gray-800 rounded-lg text-gray-400">
                  <UserIcon size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Email Address</p>
                  <p className="text-sm font-medium text-white">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 bg-white/5 rounded-xl border border-white/5">
                <div className="p-2.5 bg-gray-800 rounded-lg text-gray-400">
                  <Shield size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Access Role</p>
                  <p className="text-sm font-medium text-white capitalize">{user.role}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-semibold mb-2 text-gray-200">Workspace Status</h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                Welcome back! You have active access to the engineering platform. Start writing or managing articles inside the creator workspace.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10">
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping"></span>
                Connected
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}