/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from "react";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn, Mail, Lock, } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { useGoogleLogin } from "@react-oauth/google";


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, googleLogin, forgot } = useAuth();
  const router = useRouter();

  const handleGoogleSuccess = async (tokenResponse: any) => {
    setError("");
    try {
      const res = await googleLogin(tokenResponse.access_token);
      if (!res.success) {
        setError(res.error || "Google Sign-In failed");
      }
    } catch (err: any) {
      setError(err.message || "Google Sign-In failed");
    }
  };

  const handleGoogleError = () => {
    setError("Google Sign-In failed. Please try again.");
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: handleGoogleError,
  });

  const handleGoogleClick = () => {
    if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
      setError("Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID in your .env.local file to enable Google Sign-In.");
      return;
    }
    loginWithGoogle();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await login(email, password);
      if (res.success) {
        router.push("/");
      } else {
        setError(res.error || "Login failed");
      }
    } catch (err: any) {
      setError(err.message || "Login failed");
    }
  };

  const forgotPassword = async() => {
    router.push(`/otpforgot?${email}`);
  }

  return (
    <div suppressHydrationWarning className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 px-4">
      {/* Card */}
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
          <p className="text-gray-400 mt-2 text-sm">
            Sign in to continue to your account
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
          {/* Email */}
          <div className="relative">
            <Mail
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="email"
              placeholder="Email address"
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
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
                className={`w-full pl-10 pr-4 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition ${forgot
                  ? "border-red-500/60 focus:ring-red-500"
                  : "border-white/10 focus:ring-indigo-500"
                  }`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Forgot password — shown only after a wrong password attempt */}
            <div
              className={`overflow-hidden transition-all duration-300 ${forgot ? "max-h-10 opacity-100 mt-2 text-right" : "max-h-0 opacity-0"
                }`}
            >
              <button
                onClick={forgotPassword}
                className="text-sm text-purple-600 mt-3 hover:underline"
              >
                Forgot Password?
              </button>
            </div>
          </div>

          {/* Button */}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] transition text-white font-medium py-3 rounded-lg shadow-lg shadow-indigo-600/20"
          >
            <LogIn size={18} />
            Sign In
          </button>

          {/* Button */}
          <button
            type="button"
            onClick={handleGoogleClick}
            className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 active:scale-[0.99] border border-white/10 transition text-white font-medium py-3 rounded-lg shadow-lg shadow-black/10"
          >
            {/* <LogIn size={18} /> */}
            <FcGoogle size={22} />
            Google
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-gray-400 mt-6 text-sm">
          Don’t have an account?{" "}
          <Link
            href="/register"
            className="text-indigo-400 hover:text-indigo-300 font-medium"
          >
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
