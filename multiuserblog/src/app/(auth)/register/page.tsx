/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from "react";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus, Mail, Lock, User } from "lucide-react";
import { RegisterSchema } from "@/services/zodeValidation";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const result = RegisterSchema.safeParse(formData);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          errors[issue.path[0] as string] = issue.message;
        }
      });
      setFieldErrors(errors);
      return;
    }

    try {
      const res = await register(formData);
      if (res.success) {
        router.push("/login");
      } else {
        setError(res.error || "Registration failed");
      }
    } catch (err: any) {
      setError(err.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 px-4">
      {/* Card */}
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white">Get Started</h2>
          <p className="text-gray-400 mt-2 text-sm">
            Create your account to access the dashboard
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div>
            <div className="relative">
              <User
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Full Name"
                className={`w-full pl-10 pr-4 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ${
                  fieldErrors.name
                    ? "border-red-500/60 focus:ring-red-500"
                    : "border-white/10 focus:ring-indigo-500"
                }`}
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: "" }));
                }}
                required
              />
            </div>
            {fieldErrors.name && (
              <p className="text-red-400 text-xs mt-1 animate-fadeIn">{fieldErrors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="email"
                placeholder="Email Address"
                className={`w-full pl-10 pr-4 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ${
                  fieldErrors.email
                    ? "border-red-500/60 focus:ring-red-500"
                    : "border-white/10 focus:ring-indigo-500"
                }`}
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: "" }));
                }}
                required
              />
            </div>
            {fieldErrors.email && (
              <p className="text-red-400 text-xs mt-1 animate-fadeIn">{fieldErrors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="password"
                placeholder="Password"
                className={`w-full pl-10 pr-4 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ${
                  fieldErrors.password
                    ? "border-red-500/60 focus:ring-red-500"
                    : "border-white/10 focus:ring-indigo-500"
                }`}
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: "" }));
                }}
                required
              />
            </div>
            {fieldErrors.password && (
              <p className="text-red-400 text-xs mt-1 animate-fadeIn">{fieldErrors.password}</p>
            )}
          </div>

          {/* Button */}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] transition text-white font-medium py-3 rounded-lg shadow-lg shadow-indigo-600/20"
          >
            <UserPlus size={18} />
            Register Now
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-gray-400 mt-6 text-sm">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-indigo-400 hover:text-indigo-300 font-medium"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
